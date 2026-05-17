import os
import json
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from cerebras.cloud.sdk import Cerebras
from fastmcp import Client
from fastmcp.client.transports import StdioTransport
from app.config import CEREBRAS_API_KEY
from app.models import get_all_tasks, mark_done, set_done, delete_task
from app.stt import transcribe_audio

# ── setup ─────────────────────────────────────────
app = FastAPI(title="ThinkFlow API")

app.add_middleware(CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"])

cerebras = Cerebras(api_key=CEREBRAS_API_KEY)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MCP_SERVER = os.path.join(BASE_DIR, "app", "mcp_server.py")
PYTHON = os.path.join(BASE_DIR, "venv", "Scripts", "python.exe")

SYSTEM = """You are a task extraction assistant.
Extract what the user wants and return ONLY JSON.

Adding tasks:
{"tool": "add_task", "tasks": ["task 1", "task 2"]}

Checking pending:
{"tool": "get_pending_tasks", "tasks": []}

Marking done:
{"tool": "mark_done", "tasks": [], "task_id": 1}

Deleting:
{"tool": "delete_task", "tasks": [], "task_id": 1}

Return ONLY valid JSON. No markdown. No explanation."""

def get_mcp_client():
    return Client(StdioTransport(
        command=PYTHON,
        args=[MCP_SERVER]
    ))

class TaskDoneUpdate(BaseModel):
    done: bool

# ── routes ────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "ThinkFlow API running!"}


# @app.post("/audio")
# async def upload_audio(audio: UploadFile = File(...)):

#     contents = await audio.read()

#     with open(audio.filename, "wb") as f:
#         f.write(contents)
    
#     print("Audio uPLOADED"),
#     return {
        
#         "message": "Audio uploaded"
#     }

@app.post("/upload-audio")
async def process_audio(audio: UploadFile = File(...)):

    # Step 1 — transcribe voice
    transcript = await transcribe_audio(audio)
    print("transcript : ",transcript)

    

    # Step 2 — cerebras decides tool
    response = cerebras.chat.completions.create(
        model="llama3.1-8b",
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": transcript}
        ]
    )
    raw = response.choices[0].message.content.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()
    print("raw :",raw)
    # Step 3 — parse decision
    try:
        tool_call = json.loads(raw)
        tool_name = tool_call["tool"]
    except Exception:
        return {
            "transcript": transcript,
            "reply": "Sorry, please try again."
        }

    # Step 4 — call MCP tool
    results = []
    async with get_mcp_client() as mcp:

        if tool_name == "add_task":
            for task in tool_call.get("tasks", []):
                result = await mcp.call_tool(
                    "add_task_tool", {"text": task})
                results.append(result.content[0].text)

        elif tool_name == "get_pending_tasks":
            result = await mcp.call_tool(
                "get_pending_tasks_tool", {})
            results.append(result.content[0].text)

        elif tool_name == "mark_done":
            result = await mcp.call_tool(
                "mark_done_tool",
                {"task_id": tool_call["task_id"]})
            results.append(result.content[0].text)

        elif tool_name == "delete_task":
            result = await mcp.call_tool(
                "delete_task_tool",
                {"task_id": tool_call["task_id"]})
            results.append(result.content[0].text)

    tool_result = "\n".join(results)

    # Step 5 — natural reply
    final = cerebras.chat.completions.create(
        model="llama3.1-8b",
        messages=[
            {"role": "system", "content": "You are a friendly task manager. Summarize in 1-2 short sentences."},
            {"role": "user", "content": transcript},
            {"role": "user", "content": f"Tool result: {tool_result}"}
        ]
    )

    return {
        "transcript": transcript,
        "reply": final.choices[0].message.content
    }

@app.get("/tasks")
def fetch_tasks():
    return {"tasks": get_all_tasks()}

@app.patch("/tasks/{task_id}/done")
def complete_task(task_id: int, payload: TaskDoneUpdate):
    return {"message": set_done(task_id, payload.done)}

@app.delete("/tasks/{task_id}")
def remove_task(task_id: int):
    return {"message": delete_task(task_id)}