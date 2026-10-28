const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    assignedUser: {
      type: String,
      trim: true,
      default: 'admin@example.com',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
