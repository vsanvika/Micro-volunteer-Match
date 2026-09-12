const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    icon: {
      type: String,
      default: '🏆',
    },
    category: {
      type: String,
      default: 'Milestone',
    },
    criteriaType: {
      type: String,
      enum: ['FIRST_TASK', 'TASKS_COUNT', 'MINUTES_COUNT', 'STREAK_DAYS', 'SKILL_MENTOR', 'RATING_STAR'],
      required: true,
    },
    criteriaThreshold: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Badge', badgeSchema);
