import os
import sys
import json
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from cerebras.cloud.sdk import Cerebras
from fastmcp import Client
from fastmcp.client.transports import StdioTransport
from app.config import CEREBRAS_API_KEY, CEREBRAS_MODEL
from app.models import get_all_tasks, mark_done, set_done, delete_task
from app.stt import transcribe_audio, get_model

# ── setup ─────────────────────────────────────────
app = FastAPI(title="ThinkFlow API")

app.add_middleware(CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"])


@app.on_event("startup")
def warm_whisper_model():
    print("Warming Whisper model at startup...")
    try:
        get_model()
        print("Whisper model ready.")
    except Exception as exc:
        print("Whisper warmup failed:", exc)

cerebras = Cerebras(api_key=CEREBRAS_API_KEY)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MCP_SERVER = os.path.join(BASE_DIR, "app", "mcp_server.py")
PYTHON = sys.executable

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
    print(f"upload-audio received: filename={audio.filename}, content_type={audio.content_type}")
    try:
        # Step 1 — transcribe voice
        transcript = await transcribe_audio(audio)
        print("transcript : ", transcript)

        # Step 2 — cerebras decides tool
        response = cerebras.chat.completions.create(
            model=CEREBRAS_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM},
                {"role": "user", "content": transcript}
            ]
        )
        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        print("raw :", raw)

        # Step 3 — parse decision
        tool_call = json.loads(raw)
        tool_name = tool_call["tool"]
    except RuntimeError as exc:
        return JSONResponse(
            status_code=422,
            content={"detail": str(exc), "reply": "Audio was not clear enough. Please try again."}
        )
    except Exception as exc:
        print("upload-audio failed during parse:", exc)
        return JSONResponse(
            status_code=503,
            content={"detail": "Voice processing failed on the server.", "reply": "Processing failed. Please try again."}
        )

    # Step 4 — call MCP tool
    results = []
    try:
        async with get_mcp_client() as mcp:

            if tool_name == "add_task":
                for task in tool_call.get("tasks", []):
                    result = await mcp.call_tool(
                        "add_task_tool", {"text": task})
                    results.append(result.content[0].text)

                reply_text = "Task added successfully." if len(tool_call.get("tasks", [])) == 1 else "Tasks added successfully."
                return {
                    "transcript": transcript,
                    "reply": reply_text,
                    "tool_result": "\n".join(results)
                }

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

    except Exception as exc:
        print("upload-audio failed during tool call:", exc)
        return JSONResponse(
            status_code=503,
            content={"detail": "Task storage failed on the server.", "reply": "Processing failed. Please try again."}
        )

    tool_result = "\n".join(results)

    # Step 5 — natural reply
    try:
        final = cerebras.chat.completions.create(
            model=CEREBRAS_MODEL,
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
    except Exception as exc:
        print("upload-audio failed during reply:", exc)
        return JSONResponse(
            status_code=503,
            content={"detail": "Reply generation failed on the server.", "reply": "Task saved, but I could not generate a summary."}
        )

@app.get("/tasks")
def fetch_tasks():
    try:
        return {"tasks": get_all_tasks()}
    except Exception as e:
        # Log error and return empty tasks so frontend can still function in dev
        print("Error fetching tasks:", e)
        return {"tasks": []}

@app.patch("/tasks/{task_id}/done")
def complete_task(task_id: int, payload: TaskDoneUpdate):
    return {"message": set_done(task_id, payload.done)}

@app.delete("/tasks/{task_id}")
def remove_task(task_id: int):
    return {"message": delete_task(task_id)}

# yR7OzaALdUOZImeB