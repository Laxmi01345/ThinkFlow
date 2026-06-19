import os
import json
from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from cerebras.cloud.sdk import Cerebras
from supabase import create_client
from app.config import CEREBRAS_API_KEY, CEREBRAS_MODEL, SUPABASE_URL, SUPABASE_KEY
from app.auth import require_auth
from app.models import (
    add_task,
    get_all_tasks,
    get_pending_tasks,
    mark_done,
    set_done,
    delete_task,
)
from app.stt import transcribe_audio

# ── setup ─────────────────────────────────────────
app = FastAPI(title="ThinkFlow API")

app.add_middleware(CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"])

cerebras = Cerebras(api_key=CEREBRAS_API_KEY)
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

SYSTEM = """You are ThinkFlow's assistant.
Read the user's message and the provided task context, then return ONLY JSON.

Use this schema:
{"mode": "task", "tool": "add_task", "tasks": ["task 1", "task 2"], "reply": "optional short reply"}
{"mode": "task", "tool": "get_pending_tasks", "reply": "optional short reply"}
{"mode": "task", "tool": "mark_done", "task_id": 1, "reply": "optional short reply"}
{"mode": "task", "tool": "delete_task", "task_id": 1, "reply": "optional short reply"}
{"mode": "chat", "reply": "direct answer to the user's question"}

If the user asks for insights, progress, summaries, status, or asks a general question, use mode chat.
When answering progress questions, use the task context to mention completed count, pending count, and any useful observations.
If the user asks to add, complete, delete, or check tasks, use mode task.
Return ONLY valid JSON. No markdown. No explanation."""


def build_task_context(user_id: str):
    tasks = get_all_tasks(user_id)
    completed = sum(1 for task in tasks if task["done"])
    pending = len(tasks) - completed
    pending_titles = [task["text"] for task in tasks if not task["done"]]

    return {
        "total": len(tasks),
        "completed": completed,
        "pending": pending,
        "tasks": tasks,
        "pending_titles": pending_titles,
    }


def parse_llm_json(raw_text: str):
    cleaned = raw_text.strip().replace("```json", "").replace("```", "").strip()
    return json.loads(cleaned)

class TaskDoneUpdate(BaseModel):
    done: bool

class AuthRequest(BaseModel):
    email: str
    password: str

# ── auth routes ───────────────────────────────────
@app.post("/auth/signup")
def signup(payload: AuthRequest):
    try:
        result = supabase.auth.sign_up({"email": payload.email, "password": payload.password})
        if result.user:
            return {
                "token": result.session.access_token if result.session else None,
                "user": {"id": result.user.id, "email": result.user.email},
            }
        return JSONResponse(status_code=400, content={"detail": "Signup failed"})
    except Exception as e:
        return JSONResponse(status_code=400, content={"detail": str(e)})

@app.post("/auth/login")
def login(payload: AuthRequest):
    try:
        result = supabase.auth.sign_in_with_password({"email": payload.email, "password": payload.password})
        if result.user and result.session:
            return {
                "token": result.session.access_token,
                "user": {"id": result.user.id, "email": result.user.email},
            }
        return JSONResponse(status_code=401, content={"detail": "Invalid credentials"})
    except Exception as e:
        return JSONResponse(status_code=401, content={"detail": str(e)})

@app.get("/auth/me")
def get_me(user=Depends(require_auth)):
    return {"user": {"id": user.id, "email": user.email}}

# ── protected routes ──────────────────────────────
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
async def process_audio(audio: UploadFile = File(...), user=Depends(require_auth)):
    print(f"upload-audio received: filename={audio.filename}, content_type={audio.content_type}")
    try:
        # Step 1 — transcribe voice
        transcript = await transcribe_audio(audio)
        print("transcript : ", transcript)

        task_context = build_task_context(user.id)

        # Step 2 — cerebras decides whether this is chat or a task action
        response = cerebras.chat.completions.create(
            model=CEREBRAS_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM},
                {
                    "role": "user",
                    "content": (
                        f"Task context: {json.dumps(task_context)}\n"
                        f"User message: {transcript}"
                    ),
                },
            ]
        )
        raw = response.choices[0].message.content.strip()
        print("raw :", raw)

        # Step 3 — parse decision
        tool_call = parse_llm_json(raw)
        mode = tool_call.get("mode")
        tool_name = tool_call.get("tool")
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

    if mode == "chat":
        reply = tool_call.get("reply") or "I can help with your progress or tasks if you want to ask about them."
        return {
            "transcript": transcript,
            "reply": reply,
            "mode": "chat",
        }

    # Step 4 — execute the selected task action directly
    results = []
    try:
        if tool_name == "add_task":
            for task in tool_call.get("tasks", []):
                results.append(add_task(task, user.id))

            reply_text = tool_call.get("reply") or ("Task added successfully." if len(tool_call.get("tasks", [])) == 1 else "Tasks added successfully.")
            return {
                "transcript": transcript,
                "reply": reply_text,
                "mode": "task",
                "tool_result": "\n".join(results)
            }

        if tool_name == "get_pending_tasks":
            results.append(get_pending_tasks(user.id))

        elif tool_name == "mark_done":
            results.append(mark_done(tool_call["task_id"], user.id))

        elif tool_name == "delete_task":
            results.append(delete_task(tool_call["task_id"], user.id))

        else:
            raise ValueError(f"Unsupported tool: {tool_name}")

    except Exception as exc:
        print("upload-audio failed during tool call:", exc)
        return JSONResponse(
            status_code=503,
            content={"detail": "Task storage failed on the server.", "reply": "Processing failed. Please try again."}
        )

    tool_result = "\n".join(results)
    reply_text = tool_call.get("reply")

    if not reply_text:
        if tool_name == "get_pending_tasks":
            reply_text = tool_result or "You have no pending tasks right now."
        elif tool_name == "mark_done":
            reply_text = tool_result or "Task updated successfully."
        elif tool_name == "delete_task":
            reply_text = tool_result or "Task deleted successfully."
        else:
            reply_text = "Task updated successfully."

    return {
        "transcript": transcript,
        "reply": reply_text,
        "mode": "task",
        "tool_result": tool_result,
    }

@app.get("/tasks")
def fetch_tasks(user=Depends(require_auth)):
    try:
        return {"tasks": get_all_tasks(user.id)}
    except Exception as e:
        # Log error and return empty tasks so frontend can still function in dev
        print("Error fetching tasks:", e)
        return {"tasks": []}

@app.patch("/tasks/{task_id}/done")
def complete_task(task_id: int, payload: TaskDoneUpdate, user=Depends(require_auth)):
    return {"message": set_done(task_id, payload.done, user.id)}

@app.delete("/tasks/{task_id}")
def remove_task(task_id: int, user=Depends(require_auth)):
    return {"message": delete_task(task_id, user.id)}

# yR7OzaALdUOZImeB