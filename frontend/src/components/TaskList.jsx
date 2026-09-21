import React, { useState, memo } from 'react';

const TaskItem = memo(function TaskItem({
  task,
  isPending,
  onUpdate,
  onDelete
}) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const handleSave = () => {
    if (!editTitle.trim()) return;
    onUpdate(task._id, { ...task, title: editTitle.trim() });
    setEditing(false);
  };

  return (
    <li className={`task-item ${isPending ? 'pending' : ''}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onUpdate(task._id, { ...task, completed: !task.completed })}
        disabled={isPending}
      />

      {editing ? (
        <input
          className="edit-input"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          autoFocus
        />
      ) : (
        <span className={`task-title ${task.completed ? 'completed' : ''}`}>
          {task.title}
        </span>
      )}

      <div className="task-actions">
        {editing ? (
          <>
            <button className="btn btn-small" onClick={handleSave}>
              Save
            </button>
            <button
              className="btn btn-small btn-secondary"
              onClick={() => {
                setEditing(false);
                setEditTitle(task.title);
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              className="btn btn-small"
              onClick={() => setEditing(true)}
              disabled={isPending}
            >
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
});

export default function TaskList({ tasks, onUpdate, onDelete, pendingIds }) {
  if (tasks.length === 0) {
    return <p className="empty-state">No tasks yet. Add one above.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          isPending={pendingIds.has(task._id)}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
