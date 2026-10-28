const taskEvents = require('./events');

// In-memory record of processed background events for inspection & reporting
const eventHistory = [];
const MAX_HISTORY_LENGTH = 50;

function recordEvent(entry) {
  eventHistory.unshift(entry);
  if (eventHistory.length > MAX_HISTORY_LENGTH) {
    eventHistory.pop();
  }
}

/**
 * 1. Event Listener: 'task-created'
 * 
 * Simulates a real-world asynchronous background notification (e.g. sending
 * an email or push alert to the assigned user).
 * 
 * An artificial delay (2000ms setTimeout) is introduced to demonstrate that
 * the API response was already delivered to the client immediately (~10-20ms),
 * without waiting for this background operation to finish.
 */
taskEvents.on('task-created', (task) => {
  const listenerReceivedAt = new Date().toISOString();
  console.log(`[Event Triggered] "task-created" received for: "${task.title}" at ${listenerReceivedAt}`);

  // Background non-blocking execution via setTimeout
  setTimeout(() => {
    try {
      // Supplementary Problem: Demonstrate error catching inside task-created handler
      if (task.simulateError) {
        throw new Error(`Simulated notification delivery failure for task: "${task.title}"`);
      }

      const completedAt = new Date().toISOString();
      const assignedUser = task.assignedUser || task.user || 'admin@example.com';

      console.log('------------------------------------------------------------');
      console.log(`[Notification Background Service - Completed]`);
      console.log(`  Task Title   : "${task.title}"`);
      console.log(`  Task ID      : ${task._id || task.id}`);
      console.log(`  Assigned User: ${assignedUser}`);
      console.log(`  API Response : ${task.apiResponseTime || 'N/A'}`);
      console.log(`  Notification : ${completedAt}`);
      console.log('------------------------------------------------------------');

      recordEvent({
        event: 'task-created',
        taskId: task._id || task.id,
        title: task.title,
        assignedUser,
        apiResponseTime: task.apiResponseTime || null,
        listenerReceivedAt,
        completedAt,
        status: 'SUCCESS',
        delayMs: 2000,
      });
    } catch (err) {
      // Forward error to the error event listener
      taskEvents.emit('error', err, task);
    }
  }, 2000);
});

/**
 * 2. Event Listener: 'task-deleted' (Supplementary Problem 1)
 * 
 * Simulates an asynchronous audit logging service for compliance and tracking.
 */
taskEvents.on('task-deleted', (payload) => {
  const listenerReceivedAt = new Date().toISOString();
  console.log(`[Event Triggered] "task-deleted" received for task ID: ${payload.id}`);

  // Decoupled background audit execution
  setImmediate(() => {
    const completedAt = new Date().toISOString();
    console.log('------------------------------------------------------------');
    console.log(`[Audit Log Background Service]`);
    console.log(`  Action       : Task Deleted`);
    console.log(`  Task Title   : "${payload.title}"`);
    console.log(`  Task ID      : ${payload.id}`);
    console.log(`  Deleted By   : ${payload.deletedBy || 'admin@example.com'}`);
    console.log(`  Audit Time   : ${completedAt}`);
    console.log('------------------------------------------------------------');

    recordEvent({
      event: 'task-deleted',
      taskId: payload.id,
      title: payload.title,
      deletedBy: payload.deletedBy || 'admin@example.com',
      apiResponseTime: payload.apiResponseTime || null,
      listenerReceivedAt,
      completedAt,
      status: 'SUCCESS',
    });
  });
});

/**
 * 3. Event Listener: 'error' (Supplementary Problem 2)
 * 
 * EventEmitter has a special built-in behavior: if an 'error' event is emitted
 * and has NO listeners attached, Node.js throws an unhandled exception and
 * crashes the entire process.
 * 
 * Registering this listener ensures that errors occurring inside background
 * operations are caught, logged, and audited cleanly without taking down the server.
 */
taskEvents.on('error', (err, context = {}) => {
  const errorTime = new Date().toISOString();
  console.error('============================================================');
  console.error(`[EventEmitter Error Handler Caught Background Failure]`);
  console.error(`  Timestamp   : ${errorTime}`);
  console.error(`  Error Message: ${err.message}`);
  if (context.title) {
    console.error(`  Context Task: "${context.title}" (ID: ${context._id || context.id})`);
  }
  console.error('============================================================');

  recordEvent({
    event: 'error',
    errorMessage: err.message,
    contextTask: context.title || null,
    timestamp: errorTime,
    status: 'FAILED',
  });
});

module.exports = {
  getEventHistory: () => [...eventHistory],
  clearEventHistory: () => {
    eventHistory.length = 0;
  },
};
