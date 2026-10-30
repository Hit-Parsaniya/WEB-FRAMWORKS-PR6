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

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://mongodb:27017/taskdb';

// --- Middleware ---
// CORS enabled so the React frontend container can communicate with backend
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
    status: 'PR12 full-stack backend running',
    message: 'Practical 12: CI/CD Pipeline with GitHub Actions',
    container: {
      hostname: process.env.HOSTNAME || 'local-host',
      nodeVersion: process.version,
      mongoUri: MONGO_URI.replace(/\/\/.*@/, '//<credentials>@'), // Redact credentials if any
      dbConnected: mongoose.connection.readyState === 1,
    },
  });
});

module.exports = app;
