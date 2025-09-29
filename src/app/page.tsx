"use client";

import { useState, useEffect } from "react";

type Task = {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function ModernTodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchTasks();
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const addTask = async () => {
    if (!input.trim()) return;
    setLoading(true);

    try {
      if (editingTask) {
        await fetch(`/api/tasks/${editingTask.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: input }),
        });
        setEditingTask(null);
      } else {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: input }),
        });
      }
      setInput("");
      await fetchTasks();
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: number) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    await fetchTasks();
  };

  const toggleTask = async (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    });
    await fetchTasks();
  };

  const filteredTasks = tasks
    .filter((task) => {
      if (filter === "active") return !task.completed;
      if (filter === "completed") return task.completed;
      return true;
    })
    .filter((task) =>
      task.text.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = {
    total: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  };

  const cardBg = darkMode ? "#1f2937" : "#ffffff";
  const textColor = darkMode ? "#f3f4f6" : "#1f2937";
  const borderColor = darkMode ? "#374151" : "#e5e7eb";

  return (
    <div style={{
      minHeight: "100vh",
      background: darkMode ? "#111827" : "#f8fafb",
      padding: isMobile ? "1rem" : "2rem",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{ 
        maxWidth: "900px", 
        margin: "0 auto",
        width: "100%"
      }}>
        {/* Header */}
        <div style={{ 
          textAlign: "center", 
          marginBottom: isMobile ? "1.5rem" : "2rem", 
          position: "relative" 
        }}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              padding: isMobile ? "0.5rem" : "0.75rem",
              background: cardBg,
              border: "none",
              borderRadius: "0.75rem",
              fontSize: isMobile ? "1.25rem" : "1.5rem",
              cursor: "pointer",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
            }}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
          
          <h1 style={{ 
            fontSize: isMobile ? "2rem" : "3rem", 
            fontWeight: "bold", 
            color: textColor,
            marginBottom: "0.5rem",
            paddingRight: isMobile ? "3rem" : "0"
          }}>
            To-Do-List
          </h1>
        </div>

        {/* Statistics */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", 
          gap: isMobile ? "0.75rem" : "1rem",
          marginBottom: isMobile ? "1rem" : "1.5rem"
        }}>
          {[
            { label: "Total Tasks", value: stats.total, color: "#3b82f6" },
            { label: "Active", value: stats.active, color: "#f59e0b" },
            { label: "Completed", value: stats.completed, color: "#10b981" }
          ].map((stat, i) => (
            <div key={i} style={{
              background: cardBg,
              padding: isMobile ? "1rem" : "1.5rem",
              borderRadius: isMobile ? "0.75rem" : "1rem",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              textAlign: "center",
              transition: "transform 0.2s"
            }}>
              <div style={{ 
                fontSize: isMobile ? "1.5rem" : "2rem", 
                fontWeight: "bold", 
                color: stat.color 
              }}>
                {stat.value}
              </div>
              <div style={{ 
                fontSize: isMobile ? "0.75rem" : "0.875rem", 
                color: darkMode ? "#9ca3af" : "#6b7280" 
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div style={{
          background: cardBg,
          borderRadius: isMobile ? "1rem" : "1.5rem",
          padding: isMobile ? "1rem" : "2rem",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
        }}>
          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search tasks..."
            style={{
              width: "100%",
              padding: isMobile ? "0.75rem" : "0.875rem",
              marginBottom: isMobile ? "0.75rem" : "1rem",
              border: `2px solid ${borderColor}`,
              borderRadius: "0.75rem",
              fontSize: isMobile ? "0.875rem" : "1rem",
              background: darkMode ? "#374151" : "#f9fafb",
              color: textColor,
              outline: "none",
              boxSizing: "border-box"
            }}
          />

          {/* Add Task */}
          <div style={{ 
            display: "flex", 
            flexDirection: isMobile ? "column" : "row",
            gap: "0.5rem", 
            marginBottom: isMobile ? "0.75rem" : "1rem" 
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !loading && addTask()}
              placeholder="Add a new task..."
              style={{
                flex: 1,
                padding: isMobile ? "0.75rem" : "0.875rem",
                border: `2px solid ${borderColor}`,
                borderRadius: "0.75rem",
                fontSize: isMobile ? "0.875rem" : "1rem",
                background: darkMode ? "#374151" : "#f9fafb",
                color: textColor,
                outline: "none",
                boxSizing: "border-box"
              }}
            />
            <button
              onClick={addTask}
              disabled={loading}
              style={{
                padding: isMobile ? "0.75rem" : "0.875rem 2rem",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "0.75rem",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
                fontSize: isMobile ? "0.875rem" : "1rem"
              }}
            >
              {loading ? "..." : editingTask ? "Update" : "Add"}
            </button>
          </div>

          {editingTask && (
            <button
              onClick={() => {
                setEditingTask(null);
                setInput("");
              }}
              style={{
                marginBottom: isMobile ? "0.75rem" : "1rem",
                fontSize: "0.875rem",
                color: "#ef4444",
                background: "none",
                border: "none",
                cursor: "pointer"
              }}
            >
              ✖ Cancel Edit
            </button>
          )}

          {/* Filters */}
          <div style={{ 
            display: "flex", 
            gap: "0.5rem", 
            marginBottom: isMobile ? "1rem" : "1.5rem",
            flexWrap: "wrap"
          }}>
            {(["all", "active", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: isMobile ? "0.5rem 1rem" : "0.625rem 1.25rem",
                  background: filter === f 
                    ? (darkMode ? "#3b82f6" : "#2563eb")
                    : (darkMode ? "#374151" : "#f3f4f6"),
                  color: filter === f ? "white" : textColor,
                  border: "none",
                  borderRadius: "0.5rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  fontSize: isMobile ? "0.875rem" : "1rem",
                  flex: isMobile ? "1" : "0"
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Tasks */}
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: isMobile ? "0.5rem" : "0.75rem" 
          }}>
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? "0.5rem" : "0.75rem",
                  padding: isMobile ? "0.75rem" : "1rem",
                  background: task.completed 
                    ? (darkMode ? "#374151" : "#f9fafb")
                    : (darkMode ? "#1f2937" : "#ffffff"),
                  border: `2px solid ${task.completed ? "#9ca3af" : "#3b82f6"}`,
                  borderRadius: "0.75rem",
                  transition: "all 0.2s"
                }}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  style={{
                    width: isMobile ? "20px" : "24px",
                    height: isMobile ? "20px" : "24px",
                    minWidth: isMobile ? "20px" : "24px",
                    borderRadius: "50%",
                    border: `2px solid ${task.completed ? "#10b981" : "#d1d5db"}`,
                    background: task.completed ? "#10b981" : "transparent",
                    color: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem"
                  }}
                >
                  {task.completed && "✓"}
                </button>

                <span
                  onClick={() => toggleTask(task.id)}
                  style={{
                    flex: 1,
                    cursor: "pointer",
                    textDecoration: task.completed ? "line-through" : "none",
                    color: task.completed ? "#9ca3af" : textColor,
                    fontSize: isMobile ? "0.875rem" : "1rem",
                    wordBreak: "break-word"
                  }}
                >
                  {task.text}
                </span>

                <button
                  onClick={() => {
                    setInput(task.text);
                    setEditingTask(task);
                  }}
                  style={{
                    padding: isMobile ? "0.25rem" : "0.5rem",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: isMobile ? "1rem" : "1.25rem"
                  }}
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  style={{
                    padding: isMobile ? "0.25rem" : "0.5rem",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: isMobile ? "1rem" : "1.25rem"
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div style={{ 
              textAlign: "center", 
              padding: isMobile ? "2rem 1rem" : "3rem", 
              color: darkMode ? "#9ca3af" : "#6b7280" 
            }}>
              <div style={{ 
                fontSize: isMobile ? "3rem" : "4rem", 
                marginBottom: "1rem" 
              }}>
                📝
              </div>
              <p style={{ fontSize: isMobile ? "1rem" : "1.125rem" }}>
                {searchQuery ? "No tasks found" : "No tasks yet. Add one to get started!"}
              </p>
            </div>
          )}

          {tasks.length > 0 && (
            <button
              onClick={async () => {
                for (const task of tasks) {
                  await deleteTask(task.id);
                }
              }}
              style={{
                width: "100%",
                marginTop: isMobile ? "1rem" : "1.5rem",
                padding: isMobile ? "0.75rem" : "0.875rem",
                background: darkMode ? "#7f1d1d" : "#fee2e2",
                color: darkMode ? "#fca5a5" : "#dc2626",
                border: "none",
                borderRadius: "0.75rem",
                fontWeight: "500",
                cursor: "pointer",
                fontSize: isMobile ? "0.875rem" : "1rem"
              }}
            >
              🗑️ Clear All Tasks ({tasks.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}