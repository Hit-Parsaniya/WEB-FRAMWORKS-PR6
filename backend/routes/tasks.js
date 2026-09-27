const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const cache = require('../cache');

// GET /tasks - fetch all tasks
router.get('/', async (req, res) => {
  try {
    const cachedTasks = cache.enabled ? cache.get('tasks:all') : undefined;
    if (cachedTasks !== undefined) {
      return res.status(200).json(cachedTasks);
    }

    const tasks = await Task.find().sort({ createdAt: -1 }).lean();
    if (cache.enabled) {
      cache.set('tasks:all', tasks);
    }
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: err.message });
  }
});

// GET /tasks/debug/cache - expose process-local cache metrics
router.get('/debug/cache', (req, res) => {
  res.status(200).json(cache.getMetrics());
});

// GET /tasks/:id - fetch one task
router.get('/:id', async (req, res) => {
  try {
    const key = `tasks:${req.params.id}`;
    const cachedTask = cache.enabled ? cache.get(key) : undefined;
    if (cachedTask !== undefined) {
      return res.status(200).json(cachedTask);
    }

    const task = await Task.findById(req.params.id).lean();
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (cache.enabled) {
      cache.set(key, task);
    }
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch task', error: err.message });
  }
});

// POST /tasks - create a task
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    const task = await Task.create({ title, description });
    cache.del('tasks:all');
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task', error: err.message });
  }
});

// PUT /tasks/:id - update a task
router.put('/:id', async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, completed },
      { new: true, runValidators: true }
    );
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    cache.del('tasks:all');
    cache.del(`tasks:${req.params.id}`);
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task', error: err.message });
  }
});

// DELETE /tasks/:id - delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    cache.del('tasks:all');
    cache.del(`tasks:${req.params.id}`);
    res.status(200).json({ message: 'Task deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task', error: err.message });
  }
});

module.exports = router;
