import sys
import os

# fix import path so 'app' module is found
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mcp.server.fastmcp import FastMCP
from app.models import (
    add_task, get_pending_tasks,
    mark_done, delete_task
)

mcp = FastMCP("thinkflow-tasks")

@mcp.tool()
def add_task_tool(text: str) -> str:
    """Add a new task to today's list"""
    return add_task(text)

@mcp.tool()
def get_pending_tasks_tool() -> str:
    """Get all pending tasks for today"""
    return get_pending_tasks()

@mcp.tool()
def mark_done_tool(task_id: int) -> str:
    """Mark a task as completed"""
    return mark_done(task_id)

@mcp.tool()
def delete_task_tool(task_id: int) -> str:
    """Delete a task"""
    return delete_task(task_id)

if __name__ == "__main__":
    mcp.run(transport="stdio")