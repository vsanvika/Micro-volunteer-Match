const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '🎯' },
    type: {
      type: String,
      enum: ['COMPLETE_TASKS', 'VOLUNTEER_MINUTES', 'HELP_STUDENTS', 'USE_SKILL', 'CATEGORY_TASKS', 'STREAK'],
      required: true,
    },
    target: { type: Number, required: true },
    targetSkill: { type: String, default: '' },
    targetCategory: { type: String, default: '' },
    rewardPoints: { type: Number, default: 50 },
    rewardBadgeCode: { type: String, default: '' },
    weekStart: { type: Date, required: true },
    weekEnd: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

challengeSchema.index({ isActive: 1, weekStart: 1, weekEnd: 1 });

module.exports = mongoose.model('Challenge', challengeSchema);
