const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://mongodb:27017/taskdb';

// --- Resilient MongoDB Connection with Automatic Retry for Docker Compose ---
async function connectWithRetry(maxRetries = 10, delayMs = 3000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Database] Connecting to MongoDB at ${MONGO_URI} (Attempt ${attempt}/${maxRetries})...`);
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[Database] Successfully connected to MongoDB: ${MONGO_URI}`);
      return;
    } catch (err) {
      console.warn(`[Database] Attempt ${attempt} failed: ${err.message}`);
      if (attempt < maxRetries) {
        console.log(`[Database] Retrying connection in ${delayMs / 1000}s...`);
        await new Promise((res) => setTimeout(res, delayMs));
      } else {
        // Attempt local host fallback in case running natively outside Docker
        try {
          console.warn('[Database] Retrying with local host fallback: mongodb://127.0.0.1:27017/taskdb...');
          await mongoose.connect('mongodb://127.0.0.1:27017/taskdb', { serverSelectionTimeoutMS: 3000 });
          console.log('[Database] Connected via local host fallback.');
          return;
        } catch (fallbackErr) {
          console.error('[Database] Fatal: Unable to connect to MongoDB after maximum retries.', fallbackErr.message);
          process.exit(1);
        }
      }
    }
  }
}

// --- Start Server ---
async function startServer() {
  await connectWithRetry();

  return app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` Practical 12 Containerized Backend Server Running `);
    console.log(` Port: ${PORT} (Bound to 0.0.0.0 for Docker networking) `);
    console.log(` Mongo URI: ${MONGO_URI} `);
    console.log(` Healthcheck: http://localhost:${PORT}/health `);
    console.log(`=======================================================`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };

