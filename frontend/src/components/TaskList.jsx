import { CheckCircle2, Circle } from "lucide-react";

function getRelativeDayLabel(createdAt) {
  if (!createdAt) return "";

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";

  const created = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((today - created) / dayMs);

  if (diffDays === 0) return "Today";
  if (diffDays === -1) return "Tomorrow";
  if (diffDays > 0) return `${diffDays} day${diffDays === 1 ? "" : "s"} old`;
  return `In ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"}`;
}

export default function TaskList({
  tasks = [],
  setTasks,
  setCounts,
  setError,
  isLoading = false,
}) {

  const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

  const updateCounts = (nextTasks) => {
    if (!setCounts) return;
    setCounts({
      total: nextTasks.length,
      completed: nextTasks.filter((t) => t.done).length,
      pending: nextTasks.filter((t) => !t.done).length,
    });
  };

  const deleteTask = async (id) => {
    if (!setTasks) return;

    const optimisticTasks = tasks.filter((task) => task.id !== id);

    setTasks(optimisticTasks);
    updateCounts(optimisticTasks);

    try {
      const response = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
    } catch (error) {
      setTasks(tasks);
      updateCounts(tasks);
      console.error(error);
      if (setError) setError('Failed to delete task — backend may be down.');
    }
  };

  const handleTaskSelect = (task) => {
    deleteTask(task.id);
  };

  const groupedTasks = tasks.reduce((groups, task) => {
    const label = getRelativeDayLabel(task.created_at) || "No date";
    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label).push(task);
    return groups;
  }, new Map());

  return (

    <div className="rounded-3xl bg-[#2a2a2a] p-4 sm:p-6">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">

        <h2 className="text-xl font-bold sm:text-2xl">
          Tasks
        </h2>

      </div>

      {/* Task List */}
      <div className="space-y-4">

        {isLoading ? (
          <div className="rounded-2xl bg-[#242424] p-4 sm:p-6 flex items-center justify-center">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <div className="text-base sm:text-lg">Loading tasks...</div>
            </div>
          </div>
        ) : (
          Array.from(groupedTasks.entries()).map(([label, group]) => (
            <div key={label} className="space-y-2">
              <h3 className="px-1 text-xs font-semibold uppercase tracking-wide text-gray-400 sm:text-sm">
                {label}
              </h3>
              <div className="space-y-3">
                {group.map((task) => (

                  <div

                    key={task.id}
                    className="
                flex items-center gap-4
                rounded-2xl bg-[#242424]
                p-3 sm:p-4
              "
                  >

                    {/* Done toggle */}
                    <button
                      onClick={() =>
                        handleTaskSelect(task)
                      }
                      aria-label={`Delete task ${task.text}`}
                      title="Delete task"
                      className="transition hover:scale-110"
                    >
                      {task.done ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400 sm:h-6 sm:w-6" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-500 sm:h-6 sm:w-6" />
                      )}
                    </button>

                    {/* Task Text */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`
                    text-base transition sm:text-lg
                    ${
                      task.done
                        ? "text-gray-500 line-through"
                        : ""
                    }
                  `}
                      >
                        {task.text}
                      </p>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          ))
        )}

      </div>

    </div>

  );
}