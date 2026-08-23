import { useEffect, useState, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from './api';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import Toast from './components/Toast';
import ConfirmDialog from './components/ConfirmDialog';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [pendingIds, setPendingIds] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const markPending = (id, isPending) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      isPending ? next.add(id) : next.delete(id);
      return next;
    });
  };

  // Initial fetch — this is what makes data survive a browser refresh:
  // we always read from MongoDB via GET /tasks, never from hardcoded state.
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create — optimistic UI: show the task immediately with a temp id,
  // then reconcile with the real backend response (or roll back on failure).
  const handleCreate = async (taskInput) => {
    setCreating(true);
    const tempId = `temp-${Date.now()}`;
    const optimisticTask = { _id: tempId, completed: false, ...taskInput };
    setTasks((prev) => [optimisticTask, ...prev]);

    try {
      const saved = await createTask(taskInput);
      setTasks((prev) => prev.map((t) => (t._id === tempId ? saved : t)));
      showToast('Task created', 'success');
    } catch (err) {
      // roll back the optimistic entry since the backend never confirmed it
      setTasks((prev) => prev.filter((t) => t._id !== tempId));
      showToast(`Failed to create task: ${err.message}`, 'error');
    } finally {
      setCreating(false);
    }
  };

  // Update — never assume success; only reflect the server's confirmed state.
  const handleUpdate = async (id, updates) => {
    markPending(id, true);
    const prevTasks = tasks;
    setTasks((cur) => cur.map((t) => (t._id === id ? { ...t, ...updates } : t)));

    try {
      const saved = await updateTask(id, updates);
      setTasks((cur) => cur.map((t) => (t._id === id ? saved : t)));
      showToast('Task updated', 'success');
    } catch (err) {
      setTasks(prevTasks); // roll back
      showToast(`Failed to update task: ${err.message}`, 'error');
    } finally {
      markPending(id, false);
    }
  };

  // Delete — always confirmed via dialog first, then synced with backend.
  const handleDeleteConfirmed = async () => {
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    markPending(id, true);
    const prevTasks = tasks;
    setTasks((cur) => cur.filter((t) => t._id !== id));

    try {
      await deleteTask(id);
      showToast('Task deleted', 'success');
    } catch (err) {
      setTasks(prevTasks); // roll back — deletion did not actually succeed
      showToast(`Failed to delete task: ${err.message}`, 'error');
    } finally {
      markPending(id, false);
    }
  };

  return (
    <div className="app">
      <h1>PR6 — Task Manager</h1>
      <p className="subtitle">React (5173) ↔ Express (5000) ↔ MongoDB</p>

      <TaskForm onCreate={handleCreate} creating={creating} />

      {loading && <p className="status">Loading tasks...</p>}
      {error && (
        <p className="status error">
          {error}{' '}
          <button className="btn btn-small" onClick={fetchTasks}>
            Retry
          </button>
        </p>
      )}

      {!loading && !error && (
        <TaskList
          tasks={tasks}
          onUpdate={handleUpdate}
          onDelete={(id) => setConfirmDeleteId(id)}
          pendingIds={pendingIds}
        />
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        message="Delete this task? This cannot be undone."
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
