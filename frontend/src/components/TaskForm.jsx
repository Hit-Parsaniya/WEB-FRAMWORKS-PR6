import { useState } from 'react';

export default function TaskForm({ onCreate, creating }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedUser, setAssignedUser] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({
      title: title.trim(),
      description: description.trim(),
      assignedUser: assignedUser.trim() || undefined,
    });
    setTitle('');
    setDescription('');
    setAssignedUser('');
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Task title *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="email"
        placeholder="Assigned user email (e.g. dev@example.com)"
        value={assignedUser}
        onChange={(e) => setAssignedUser(e.target.value)}
      />
      <button className="btn btn-primary" type="submit" disabled={creating}>
        {creating ? 'Adding...' : 'Add Task'}
      </button>
    </form>
  );
}

