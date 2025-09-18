"use client";

import { useState, useEffect } from "react";

type Task = {
  id: number;
  text: string;
  completed: boolean;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // LocalStorage'dan yuklash
  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  // LocalStorage'ga saqlash
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Yangi task qo‘shish
  const addTask = () => {
    if (!input.trim()) return;
    if (editingTask) {
      // edit rejimi
      setTasks(
        tasks.map((t) => (t.id === editingTask.id ? { ...t, text: input } : t))
      );
      setEditingTask(null);
    } else {
      setTasks([...tasks, { id: Date.now(), text: input, completed: false }]);
    }
    setInput("");
  };

  // Taskni o‘chirish
  const deleteTask = (id: number) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  // Taskni bajarilgan/bajarilmagan qilish
  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // Taskni edit qilish
  const editTask = (task: Task) => {
    setInput(task.text);
    setEditingTask(task);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4 text-center text-black">📝 To-Do List</h1>

        {/* Input + Button */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Yangi vazifa..."
            className="flex-1 border p-2 rounded-lg text-black"
          />
          <button
            onClick={addTask}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            {editingTask ? "Update" : "Add"}
          </button>
        </div>

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
            onClick={() => setTasks([])}
            className="mt-4 text-sm text-gray-600 hover:text-red-600"
          >
            Clear all
          </button>
        )}
      </div>
    </main>
  );
}
