import { useEffect, useState, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask, getEventLogs, simulateErrorEvent } from './api';
import { useAuth } from './AuthContext';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import Toast from './components/Toast';
import ConfirmDialog from './components/ConfirmDialog';

export default function TaskManager() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [pendingIds, setPendingIds] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Practical 10: Event-Driven Background Notifications state
  const [eventLogs, setEventLogs] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [simulatingError, setSimulatingError] = useState(false);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const markPending = (id, isPending) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      isPending ? next.add(id) : next.delete(id);
      return next;
    });
  };

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

  const fetchEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const data = await getEventLogs();
      setEventLogs(data.events || []);
    } catch (err) {
      console.warn('Failed to fetch events:', err.message);
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchEvents();
  }, [fetchTasks, fetchEvents]);

  // Create — optimistic UI: show the task immediately with a temp id,
  // then reconcile with the real backend response.
  const handleCreate = async (taskInput) => {
    setCreating(true);
    const tempId = `temp-${Date.now()}`;
    const optimisticTask = { _id: tempId, completed: false, ...taskInput };
    setTasks((prev) => [optimisticTask, ...prev]);

    try {
      const saved = await createTask(taskInput);
      setTasks((prev) => prev.map((t) => (t._id === tempId ? saved : t)));
      showToast('Task created! API responded immediately (notification queued in background).', 'success');
      // Refresh event logs after background listener completes (2.2s)
      setTimeout(fetchEvents, 2200);
      setTimeout(fetchEvents, 400); // Immediate check for queue log
    } catch (err) {
      setTasks((prev) => prev.filter((t) => t._id !== tempId));
      showToast(`Failed to create task: ${err.message}`, 'error');
    } finally {
      setCreating(false);
    }
  };

  // Update
  const handleUpdate = async (id, updates) => {
    markPending(id, true);
    const prevTasks = tasks;
    setTasks((cur) => cur.map((t) => (t._id === id ? { ...t, ...updates } : t)));

    try {
      const saved = await updateTask(id, updates);
      setTasks((cur) => cur.map((t) => (t._id === id ? saved : t)));
      showToast('Task updated', 'success');
    } catch (err) {
      setTasks(prevTasks);
      showToast(`Failed to update task: ${err.message}`, 'error');
    } finally {
      markPending(id, false);
    }
  };

  // Delete
  const handleDeleteConfirmed = async () => {
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    markPending(id, true);
    const prevTasks = tasks;
    setTasks((cur) => cur.filter((t) => t._id !== id));

    try {
      await deleteTask(id);
      showToast('Task deleted! task-deleted event logged to audit stream.', 'success');
      setTimeout(fetchEvents, 300);
    } catch (err) {
      setTasks(prevTasks);
      showToast(`Failed to delete task: ${err.message}`, 'error');
    } finally {
      markPending(id, false);
    }
  };

  // Supplementary Problem 2: Simulate background error
  const handleSimulateError = async () => {
    setSimulatingError(true);
    try {
      await simulateErrorEvent('Faulty Task via UI Test');
      showToast('Simulated background error emitted! Check events feed and server console.', 'error');
      setTimeout(fetchEvents, 2200);
    } catch (err) {
      showToast(`Simulation failed: ${err.message}`, 'error');
    } finally {
      setSimulatingError(false);
    }
  };

  return (
    <div className="app">
      <div className="app-header">
        <div>
          <h1>PR11 — Containerized Task Manager</h1>
          <p className="subtitle">
            Logged in as {user?.email || '...'} · Docker Compose Orchestration (Frontend + Backend + MongoDB)
          </p>
        </div>
        <button className="btn btn-secondary" onClick={logout}>
          Log Out
        </button>
      </div>

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

      {/* Practical 10: Live Event-Driven Background Processing Stream */}
      <div className="events-panel">
        <div className="events-header">
          <h3>
            ⚡ Background Event Stream
            <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#64748b' }}>
              ({eventLogs.length} events recorded)
            </span>
          </h3>
          <div className="events-actions">
            <button
              className="btn btn-small btn-secondary"
              onClick={fetchEvents}
              disabled={loadingEvents}
            >
              {loadingEvents ? 'Refreshing...' : '🔄 Refresh Logs'}
            </button>
            <button
              className="btn btn-small btn-danger"
              onClick={handleSimulateError}
              disabled={simulatingError}
              title="Test Supplementary Problem 2 error listener"
            >
              {simulatingError ? 'Testing...' : '⚠️ Test Error Listener'}
            </button>
          </div>
        </div>

        <div className="timing-summary-banner">
          <strong>Non-Blocking Proof:</strong> API returns HTTP 201 immediately (~10ms) while the
          <code> task-created </code> event handler processes notifications asynchronously in the
          background with a 2,000ms delay.
        </div>

        {eventLogs.length === 0 ? (
          <p className="empty-state">No events processed yet. Add a task to emit an event.</p>
        ) : (
          <div className="events-list">
            {eventLogs.map((ev, idx) => (
              <div key={idx} className="event-card">
                <div className="event-card-header">
                  <span className={`event-tag ${ev.event}`}>
                    {ev.event}
                  </span>
                  <span style={{ fontSize: '11px', color: ev.status === 'SUCCESS' ? '#15803d' : '#b91c1c', fontWeight: 600 }}>
                    ● {ev.status}
                  </span>
                </div>

                <div style={{ fontWeight: 500 }}>
                  {ev.title ? `Task: "${ev.title}"` : ev.contextTask ? `Context: "${ev.contextTask}"` : 'System Event'}
                  {ev.assignedUser && ` · Assigned: ${ev.assignedUser}`}
                  {ev.deletedBy && ` · Deleted By: ${ev.deletedBy}`}
                  {ev.errorMessage && <div style={{ color: '#dc2626', marginTop: 4 }}>Error: {ev.errorMessage}</div>}
                </div>

                <div className="event-timestamps">
                  <div className="ts-col">
                    <span className="ts-label">API Response Sent</span>
                    <span>{ev.apiResponseTime ? ev.apiResponseTime.split('T')[1].replace('Z', '') : 'N/A'}</span>
                  </div>
                  <div className="ts-col">
                    <span className="ts-label">Background Completed</span>
                    <span>{(ev.completedAt || ev.timestamp || 'N/A').split('T')[1]?.replace('Z', '') || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

