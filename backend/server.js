require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const taskRoutes = require('./routes/tasks');
const authRoutes = require('./routes/auth');

// Fallback JWT secret for containerized/lab environments
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'pr11_super_secret_jwt_key_2026_antigravity';
}

const app = express();
const PORT = process.env.PORT || 5000;

// Practical 11 Step 5: Service name 'mongodb' is resolved automatically by Docker internal DNS
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://mongodb:27017/taskdb';

// --- Middleware ---
// CORS enabled so the React frontend container (host port 5173) can communicate with backend
app.use(cors());
app.use(express.json());

// --- Initialize Event Listeners for Background Notifications ---
require('./listeners');

// --- Routes ---
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

// Health check endpoint for Docker Compose / container monitoring
app.get('/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
    uptimeSeconds: Math.floor(process.uptime()),
    containerHost: process.env.HOSTNAME || 'localhost',
  });
});

app.get('/', (req, res) => {
  res.json({
    status: 'PR11 full-stack backend running',
    message: 'Practical 11: Containerization with Docker and Docker Compose',
    container: {
      hostname: process.env.HOSTNAME || 'local-host',
      nodeVersion: process.version,
      mongoUri: MONGO_URI.replace(/\/\/.*@/, '//<credentials>@'), // Redact credentials if any
      dbConnected: mongoose.connection.readyState === 1,
    },
  });
});

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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` Practical 11 Containerized Backend Server Running `);
    console.log(` Port: ${PORT} (Bound to 0.0.0.0 for Docker networking) `);
    console.log(` Mongo URI: ${MONGO_URI} `);
    console.log(` Healthcheck: http://localhost:${PORT}/health `);
    console.log(`=======================================================`);
  });
}

startServer();
