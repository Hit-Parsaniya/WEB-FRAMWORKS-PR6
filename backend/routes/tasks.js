const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const cache = require('../cache');
const auth = require('../middleware/auth');
const { validateTask } = require('../middleware/validate');
const taskEvents = require('../events');
const { getEventHistory, clearEventHistory } = require('../listeners');

// Every route below requires a valid JWT (Authorization: Bearer <token>).
router.use(auth);

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

// GET /tasks/debug/events - expose processed event history and timestamps (Practical 10)
router.get('/debug/events', (req, res) => {
  res.status(200).json({
    totalEvents: getEventHistory().length,
    events: getEventHistory(),
  });
});

// POST /tasks/simulate-error - test error event listener (Practical 10 Supplementary Problem 2)
router.post('/simulate-error', (req, res) => {
  const triggerTime = new Date().toISOString();
  console.log(`[API] Triggering simulated error event at ${triggerTime}`);
  
  // Responds immediately to the client
  res.status(200).json({
    message: 'Simulated task-created error triggered. Check server console for [EventEmitter Error Handler] output.',
    timestamp: triggerTime,
  });

  // Emits task-created with simulateError flag
  taskEvents.emit('task-created', {
    _id: 'simulated-err-id-' + Date.now(),
    title: req.body.title || 'Intentionally Failing Task',
    assignedUser: 'qa-tester@example.com',
    apiResponseTime: triggerTime,
    simulateError: true,
  });
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

// POST /tasks - create a task (Practical 10: Event-Driven Async Notification)
router.post('/', validateTask, async (req, res) => {
  try {
    const { title, description, assignedUser, simulateError } = req.body;
    
    // Save task to MongoDB
    const task = await Task.create({
      title,
      description,
      assignedUser: assignedUser || req.user?.email || 'admin@example.com',
    });

    if (cache.enabled) {
      cache.del('tasks:all');
    }

    const apiResponseTimestamp = new Date().toISOString();
    console.log(`[API] Response sent at ${apiResponseTimestamp}`);

    // Return HTTP 201 response immediately BEFORE background handler finishes
    res.status(201).json(task);

    // Emit event asynchronously after sending the response
    taskEvents.emit('task-created', {
      ...task.toObject(),
      apiResponseTime: apiResponseTimestamp,
      simulateError: Boolean(simulateError),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task', error: err.message });
  }
});

// PUT /tasks/:id - update a task
router.put('/:id', async (req, res) => {
  try {
    const { title, description, completed, assignedUser } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, completed, ...(assignedUser && { assignedUser }) },
      { new: true, runValidators: true }
    );
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (cache.enabled) {
      cache.del('tasks:all');
      cache.del(`tasks:${req.params.id}`);
    }
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task', error: err.message });
  }
});

// DELETE /tasks/:id - delete a task (Practical 10 Supplementary Problem 1: task-deleted event)
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (cache.enabled) {
      cache.del('tasks:all');
      cache.del(`tasks:${req.params.id}`);
    }

    const apiResponseTimestamp = new Date().toISOString();
    console.log(`[API] Delete response sent at ${apiResponseTimestamp}`);

    // Return response immediately
    res.status(200).json({ message: 'Task deleted', id: req.params.id, title: task.title });

    // Emit 'task-deleted' event for background audit logging
    taskEvents.emit('task-deleted', {
      id: req.params.id,
      title: task.title,
      deletedBy: req.user?.email || 'admin@example.com',
      apiResponseTime: apiResponseTimestamp,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task', error: err.message });
  }
});

module.exports = router;

