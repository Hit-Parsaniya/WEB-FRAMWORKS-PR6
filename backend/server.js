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

// --- Routes ---
app.use('/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'PR6 backend running' });
});

// --- MongoDB connection + server start ---
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
