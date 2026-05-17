import { CheckCircle2, Circle } from "lucide-react";

export default function TaskList({
  tasks = [],
  setTasks,
  setCounts,
  setError,
}) {

  
  console.log("tasks in tasklist : ", tasks);
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
      const response = await fetch(`http://localhost:8000/tasks/${id}`, {
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

  return (

    <div className="rounded-3xl bg-[#2a2a2a] p-6">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">

        <h2 className="text-2xl font-bold">
          Tasks
        </h2>

      </div>

      {/* Task List */}
      <div className="space-y-4">

        {tasks.map((task) => (

          <div
            key={task.id}
            className="
              flex items-center gap-4
              rounded-2xl bg-[#242424]
              p-4
            "
          >

            {/* Checkbox */}
            <button
              onClick={() =>
                handleTaskSelect(task)
              }
              className="transition hover:scale-110"
            >

              {
                task.done
                  ? (
                    <CheckCircle2 className="text-green-400" />
                  )
                  : (
                    <Circle className="text-gray-500" />
                  )
              }

            </button>

            {/* Task Text */}
            <p
              className={`
                text-lg transition
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

        ))}

      </div>

    </div>

  );
}