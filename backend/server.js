require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pr6_tasks';

// --- Middleware ---
// CORS must be enabled so the React dev server (localhost:5173) can call this API.
app.use(cors());
app.use(express.json());

// --- Initialize Event Listeners for Asynchronous Processing (Practical 10) ---
require('./listeners');

// --- Routes ---
app.use('/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.json({
    status: 'PR10 backend running',
    message: 'Practical 10: Asynchronous Processing with Event-Driven Architecture',
  });
});

// --- MongoDB connection + server start ---
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`MongoDB connected (${MONGO_URI.includes('mongodb+srv') ? 'Atlas' : 'Local'})`);
  } catch (err) {
    console.warn(`Primary MongoDB connection failed (${err.message}). Attempting local fallback...`);
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/pr10_tasks');
      console.log('MongoDB connected to local instance: mongodb://127.0.0.1:27017/pr10_tasks');
    } catch (fallbackErr) {
      console.error('All MongoDB connection attempts failed:', fallbackErr.message);
      process.exit(1);
    }
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Practical 10 Event-Driven Notification System initialized.`);
  });
}

startServer();

