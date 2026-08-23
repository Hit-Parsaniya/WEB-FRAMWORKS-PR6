import { useState } from 'react';

export default function TaskList({ tasks, onUpdate, onDelete, pendingIds }) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const startEdit = (task) => {
    setEditingId(task._id);
    setEditTitle(task.title);
  };

  const saveEdit = (task) => {
    if (!editTitle.trim()) return;
    onUpdate(task._id, { ...task, title: editTitle.trim() });
    setEditingId(null);
  };

  if (tasks.length === 0) {
    return <p className="empty-state">No tasks yet. Add one above.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => {
        const isPending = pendingIds.has(task._id);
        return (
          <li key={task._id} className={`task-item ${isPending ? 'pending' : ''}`}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onUpdate(task._id, { ...task, completed: !task.completed })}
              disabled={isPending}
            />

            {editingId === task._id ? (
              <input
                className="edit-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveEdit(task)}
                autoFocus
              />
            ) : (
              <span className={`task-title ${task.completed ? 'completed' : ''}`}>
                {task.title}
              </span>
            )}

            <div className="task-actions">
              {editingId === task._id ? (
                <>
                  <button className="btn btn-small" onClick={() => saveEdit(task)}>
                    Save
                  </button>
                  <button className="btn btn-small btn-secondary" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-small" onClick={() => startEdit(task)} disabled={isPending}>
                    Edit
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => onDelete(task._id)}
                    disabled={isPending}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
