const EventEmitter = require('events');

/**
 * TaskEvents - Custom EventEmitter instance for the Task Management System.
 * 
 * In Node.js, EventEmitter provides an in-process publish/subscribe pattern
 * that decouples core business logic (e.g. database transactions, HTTP responses)
 * from side effects (e.g. notifications, audit logging, emails).
 */
class TaskEvents extends EventEmitter {}

// Export a single shared singleton instance across the application
const taskEvents = new TaskEvents();

module.exports = taskEvents;
