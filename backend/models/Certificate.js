const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    verificationId: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ['MINUTES_50', 'MINUTES_100', 'TASKS_10', 'TASKS_25', 'CHAMPION', 'STREAK_7'],
      required: true,
    },
    volunteerName: { type: String, required: true },
    achievement: { type: String, required: true },
    tasksCompleted: { type: Number, default: 0 },
    volunteerMinutes: { type: Number, default: 0 },
    issuedAt: { type: Date, default: Date.now },
    isRevoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

certificateSchema.index({ user: 1, isRevoked: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);
