"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, subDays, isToday, isTomorrow, isYesterday } from "date-fns";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Plus, Loader2, Trash2, Edit2, X, Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Task {
  _id: string;
  title: string;
  completed: boolean;
  dueDate: string;
  category: string;
}

export default function RemindersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Edit state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchTasks(currentDate);
    }
  }, [currentDate, status]);

  const fetchTasks = async (date: Date) => {
    setIsLoading(true);
    try {
      const formattedDate = date.toISOString();
      const res = await fetch(`/api/tasks?date=${formattedDate}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsAdding(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskTitle,
          dueDate: currentDate.toISOString(),
          category: "Today",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks([data.task, ...tasks]);
        setNewTaskTitle("");
      }
    } catch (error) {
      console.error("Error adding task:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    setTasks(tasks.map(t => t._id === id ? { ...t, completed } : t));
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
    } catch (error) {
      setTasks(tasks.map(t => t._id === id ? { ...t, completed: !completed } : t));
    }
  };

  const deleteTask = async (id: string) => {
    setTasks(tasks.filter(t => t._id !== id));
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      // Ideally rollback state here
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task._id);
    setEditingTitle(task.title);
  };

  const saveEdit = async (id: string) => {
    if (!editingTitle.trim()) {
      setEditingTaskId(null);
      return;
    }

    const originalTitle = tasks.find(t => t._id === id)?.title;
    setTasks(tasks.map(t => t._id === id ? { ...t, title: editingTitle } : t));
    setEditingTaskId(null);

    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingTitle }),
      });
    } catch (error) {
      console.error("Error editing task:", error);
      setTasks(tasks.map(t => t._id === id ? { ...t, title: originalTitle || "" } : t));
    }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE"); 
  };

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-accent" /></div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-2xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-light tracking-tight flex items-center gap-2">
              <button onClick={() => setCurrentDate(subDays(currentDate, 1))} className="p-2 hover:bg-surface rounded-full transition-colors">
                <ChevronLeft className="w-5 h-5 text-foreground/50 hover:text-foreground" />
              </button>
              <span className="min-w-[140px] text-center">{getDateLabel(currentDate)}</span>
              <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="p-2 hover:bg-surface rounded-full transition-colors">
                <ChevronRight className="w-5 h-5 text-foreground/50 hover:text-foreground" />
              </button>
            </h1>
            <p className="text-foreground/40 text-sm font-mono mt-1 text-center">{format(currentDate, "MMMM d, yyyy")}</p>
          </div>
        </div>

        <form onSubmit={addTask} className="mb-10 relative group">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder={`Add a task for ${getDateLabel(currentDate).toLowerCase()}...`}
            className="w-full bg-surface border border-border rounded-2xl pl-12 pr-6 py-5 text-sm outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-foreground/30 shadow-sm"
          />
          <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30 group-focus-within:text-accent transition-colors" />
          <button 
            type="submit" 
            disabled={!newTaskTitle.trim() || isAdding}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-background bg-foreground px-3 py-1.5 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity disabled:opacity-50"
          >
            {isAdding ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Enter'}
          </button>
        </form>

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-foreground/20" /></div>
          ) : tasks.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 border border-dashed border-border rounded-2xl">
              <p className="text-foreground/40 text-sm">No tasks scheduled for {getDateLabel(currentDate).toLowerCase()}.</p>
              <p className="text-foreground/20 text-xs mt-1">Enjoy the clarity.</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => (
                <motion.div
                  key={task._id}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  whileHover={{ scale: 1.01 }}
                  className={`group flex items-center justify-between gap-4 p-5 rounded-2xl border transition-all duration-300 ${
                    task.completed 
                      ? "bg-background border-transparent opacity-50" 
                      : "bg-surface border-border hover:border-accent/30 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <button 
                      onClick={() => toggleTask(task._id, !task.completed)}
                      className="flex-shrink-0 relative w-6 h-6 flex items-center justify-center text-accent"
                    >
                      {task.completed ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <CheckCircle2 className="w-6 h-6" />
                        </motion.div>
                      ) : (
                        <Circle className="w-6 h-6 text-foreground/20 group-hover:text-accent/50 transition-colors" />
                      )}
                    </button>
                    
                    {editingTaskId === task._id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="flex-1 bg-background border border-border rounded-lg px-3 py-1 text-sm outline-none focus:border-accent/50"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(task._id);
                            if (e.key === 'Escape') setEditingTaskId(null);
                          }}
                        />
                        <button onClick={() => saveEdit(task._id)} className="p-1 text-green-500 hover:bg-green-500/10 rounded">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingTaskId(null)} className="p-1 text-red-500 hover:bg-red-500/10 rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className={`text-sm transition-all duration-300 ${task.completed ? "line-through text-foreground/50" : "text-foreground"}`}>
                        {task.title}
                      </span>
                    )}
                  </div>

                  {/* Actions (Edit / Delete) */}
                  {!task.completed && editingTaskId !== task._id && (
                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEditing(task)}
                        className="p-2 text-foreground/40 hover:text-accent hover:bg-accent/10 rounded-xl transition-colors active:scale-95"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteTask(task._id)}
                        className="p-2 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {task.completed && (
                     <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                       <button 
                        onClick={() => deleteTask(task._id)}
                        className="p-2 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                     </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
