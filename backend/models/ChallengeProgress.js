const mongoose = require('mongoose');

const challengeProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

challengeProgressSchema.index({ user: 1, challenge: 1 }, { unique: true });

module.exports = mongoose.model('ChallengeProgress', challengeProgressSchema);
