const mongoose = require('mongoose');

const savedTaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
  },
  { timestamps: true }
);

savedTaskSchema.index({ user: 1, task: 1 }, { unique: true });

module.exports = mongoose.model('SavedTask', savedTaskSchema);
