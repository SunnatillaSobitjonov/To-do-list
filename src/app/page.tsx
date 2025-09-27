"use client";

import { useState, useEffect } from "react";

type Task = {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  // Database'dan tasklarani yuklash
  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Component yuklanganda tasklarani olish
  useEffect(() => {
    fetchTasks();
  }, []);

  // Yangi task qo'shish yoki mavjudini yangilash
  const addTask = async () => {
    if (!input.trim()) return;

    setLoading(true);

    try {
      if (editingTask) {
        // Task yangilash
        console.log("Updating task:", editingTask.id, "with text:", input); // Debug

        const response = await fetch(`/api/tasks/${editingTask.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: input }),
        });

        console.log("Update response status:", response.status); // Debug

        if (response.ok) {
          await fetchTasks(); // Ma'lumotlarni qayta yuklash
          setEditingTask(null);
          console.log("Task updated successfully"); // Debug
        } else {
          const errorData = await response.json();
          console.error("Update failed:", errorData);
          alert("Taskni yangilashda xatolik yuz berdi");
        }
      } else {
        // Yangi task qo'shish
        console.log("Adding new task:", input); // Debug

        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: input }),
        });

        console.log("Add response status:", response.status); // Debug
        const responseData = await response.json();
        console.log("Add response data:", responseData); // Debug

        if (response.ok) {
          await fetchTasks(); // Ma'lumotlarni qayta yuklash
          console.log("Task added successfully"); // Debug
        } else {
          console.error("Add failed:", responseData);
          alert(
            `Taskni qo'shishda xatolik: ${
              responseData.error || "Unknown error"
            }`,
          );
        }
      }
      setInput("");
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setLoading(false);
    }
  };

  // Taskni o'chirish
  const deleteTask = async (id: number) => {
    try {
      console.log("Deleting task with ID:", id); // Debug

      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      console.log("Delete response status:", response.status); // Debug

      if (response.ok) {
        await fetchTasks(); // Ma'lumotlarni qayta yuklash
        console.log("Task deleted successfully"); // Debug
      } else {
        const errorData = await response.json();
        console.error("Delete failed:", errorData);
        alert("Taskni o'chirishda xatolik yuz berdi");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Taskni o'chirishda xatolik yuz berdi");
    }
  };

  // Taskni bajarilgan/bajarilmagan qilish
  const toggleTask = async (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    try {
      console.log("Toggling task:", id, "to:", !task.completed); // Debug

      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });

      console.log("Toggle response status:", response.status); // Debug

      if (response.ok) {
        await fetchTasks(); // Ma'lumotlarni qayta yuklash
        console.log("Task toggled successfully"); // Debug
      } else {
        const errorData = await response.json();
        console.error("Toggle failed:", errorData);
        alert("Task holatini o'zgartirishda xatolik yuz berdi");
      }
    } catch (error) {
      console.error("Error toggling task:", error);
      alert("Task holatini o'zgartirishda xatolik yuz berdi");
    }
  };

  // Taskni edit qilish
  const editTask = (task: Task) => {
    setInput(task.text);
    setEditingTask(task);
  };

  // Barcha tasklarani tozalash
  const clearAllTasks = async () => {
    if (tasks.length === 0) return;

    try {
      // Har bir taskni alohida o'chirish (bulk delete yo'q)
      for (const task of tasks) {
        await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      }
      await fetchTasks(); // Ma'lumotlarni qayta yuklash
    } catch (error) {
      console.error("Error clearing tasks:", error);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4 text-center text-black">
          📝 To-Do List
        </h1>

        {/* Input + Button */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Yangi vazifa..."
            className="flex-1 border p-2 rounded-lg text-black"
            onKeyPress={(e) => e.key === "Enter" && !loading && addTask()}
          />
          <button
            onClick={addTask}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? "..." : editingTask ? "Update" : "Add"}
          </button>
        </div>

        {/* Cancel edit button */}
        {editingTask && (
          <button
            onClick={() => {
              setEditingTask(null);
              setInput("");
            }}
            className="mb-4 text-sm text-gray-600 hover:text-red-600"
          >
            Cancel Edit
          </button>
        )}

        {/* Task list */}
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex justify-between items-center border rounded-lg p-2"
            >
              <span
                onClick={() => toggleTask(task.id)}
                className={`flex-1 cursor-pointer text-black ${
                  task.completed ? "line-through text-gray-500" : ""
                }`}
              >
                {task.text}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => editTask(task)}
                  className="text-yellow-600 hover:text-yellow-800"
                  disabled={editingTask?.id === task.id}
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  ❌
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Clear all */}
        {tasks.length > 0 && (
          <button
            onClick={clearAllTasks}
            className="mt-4 text-sm text-gray-600 hover:text-red-600"
          >
            Clear all ({tasks.length})
          </button>
        )}

        {/* Empty state */}
        {tasks.length === 0 && (
          <p className="text-center text-gray-500 mt-4">
            Hech qanday vazifa yo&apos;q. Yangi vazifa qo&apos;shing!
          </p>
        )}
      </div>
    </main>
  );
}
