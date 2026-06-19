from app.db import get_conn


def add_task(text: str, user_id: str) -> str:
    with get_conn() as conn:
        conn.cursor().execute(
            "INSERT INTO tasks (text, user_id) VALUES (%s, %s)", (text, user_id))
    return f"Added: {text}"


def get_pending_tasks(user_id: str) -> str:
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, text FROM tasks "
            "WHERE is_done=false "
            "AND user_id=%s "
            "AND created_at=CURRENT_DATE", (user_id,))
        rows = cur.fetchall()
    if not rows:
        return "No pending tasks!"
    return "\n".join([f"{r[0]}. {r[1]}" for r in rows])


def get_all_tasks(user_id: str) -> list:
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, text, is_done, created_at FROM tasks "
            "WHERE user_id=%s "
            "ORDER BY id", (user_id,))
        rows = cur.fetchall()
    return [{
                "id": r[0],
                "text": r[1],
                "done": r[2],
                "created_at": r[3].isoformat() if hasattr(r[3], "isoformat") else r[3],
            }
            for r in rows]


def mark_done(task_id: int, user_id: str) -> str:
    with get_conn() as conn:
        conn.cursor().execute(
            "UPDATE tasks SET is_done=true WHERE id=%s AND user_id=%s",
            (task_id, user_id))
    return f"Task {task_id} marked done!"


def set_done(task_id: int, done: bool, user_id: str) -> str:
    with get_conn() as conn:
        conn.cursor().execute(
            "UPDATE tasks SET is_done=%s WHERE id=%s AND user_id=%s",
            (done, task_id, user_id))
    status = "done" if done else "pending"
    return f"Task {task_id} set to {status}!"


def delete_task(task_id: int, user_id: str) -> str:
    with get_conn() as conn:
        conn.cursor().execute(
            "DELETE FROM tasks WHERE id=%s AND user_id=%s",
            (task_id, user_id))
    return f"Task {task_id} deleted!"