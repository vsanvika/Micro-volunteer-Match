const asyncHandler = require('express-async-handler');
const Challenge = require('../models/Challenge');
const ChallengeProgress = require('../models/ChallengeProgress');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendNotificationToUser } = require('../services/socketService');

// Helper: get start and end of current week (Monday-Sunday)
const getCurrentWeekBounds = () => {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diffToMonday = (day === 0 ? -6 : 1 - day);
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { weekStart: monday, weekEnd: sunday };
};

// @desc    Get active weekly challenges
// @route   GET /api/challenges
// @access  Public
const getActiveChallenges = asyncHandler(async (req, res) => {
  const { weekStart, weekEnd } = getCurrentWeekBounds();
  const challenges = await Challenge.find({
    isActive: true,
    weekStart: { $lte: weekEnd },
    weekEnd: { $gte: weekStart },
  }).sort({ rewardPoints: -1 });

  res.json({ success: true, count: challenges.length, challenges });
});

// @desc    Get user's progress on active challenges
// @route   GET /api/challenges/my-progress
// @access  Private
const getMyChallengeProgress = asyncHandler(async (req, res) => {
  const { weekStart, weekEnd } = getCurrentWeekBounds();
  const challenges = await Challenge.find({
    isActive: true,
    weekStart: { $lte: weekEnd },
    weekEnd: { $gte: weekStart },
  });

  const progressRecords = await ChallengeProgress.find({
    user: req.user._id,
    challenge: { $in: challenges.map(c => c._id) },
  });

  const progressMap = {};
  progressRecords.forEach(p => { progressMap[p.challenge.toString()] = p; });

  const result = challenges.map(challenge => ({
    ...challenge.toObject(),
    userProgress: progressMap[challenge._id.toString()]?.progress || 0,
    completed: progressMap[challenge._id.toString()]?.completed || false,
    completedAt: progressMap[challenge._id.toString()]?.completedAt || null,
  }));

  res.json({ success: true, challenges: result });
});

// @desc    Create a challenge (Admin)
// @route   POST /api/admin/challenges
// @access  Private (Admin)
const createChallenge = asyncHandler(async (req, res) => {
  const { title, description, icon, type, target, targetSkill, targetCategory, rewardPoints, rewardBadgeCode } = req.body;

  if (!title || !type || !target) {
    res.status(400);
    throw new Error('Title, type, and target are required');
  }

  const { weekStart, weekEnd } = getCurrentWeekBounds();

  const challenge = await Challenge.create({
    title,
    description: description || '',
    icon: icon || '🎯',
    type,
    target: Number(target),
    targetSkill: targetSkill || '',
    targetCategory: targetCategory || '',
    rewardPoints: rewardPoints || 50,
    rewardBadgeCode: rewardBadgeCode || '',
    weekStart,
    weekEnd,
    isActive: true,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, challenge });
});

// @desc    Update challenge progress after task completion (internal helper)
// Called by applicationController after task confirmed
const updateChallengeProgressOnComplete = async (userId, task) => {
  try {
    const { weekStart, weekEnd } = getCurrentWeekBounds();
    const challenges = await Challenge.find({
      isActive: true,
      weekStart: { $lte: weekEnd },
      weekEnd: { $gte: weekStart },
    });

    const user = await User.findById(userId);
    if (!user) return;

    for (const challenge of challenges) {
      let increment = 0;

      switch (challenge.type) {
        case 'COMPLETE_TASKS': increment = 1; break;
        case 'VOLUNTEER_MINUTES': increment = task.estimatedDuration || 15; break;
        case 'HELP_STUDENTS':
          if (['Education', 'Technology'].includes(task.category)) increment = 1; break;
        case 'USE_SKILL':
          if (challenge.targetSkill && (task.requiredSkills || []).some(s =>
            s.toLowerCase().includes(challenge.targetSkill.toLowerCase()))) increment = 1; break;
        case 'CATEGORY_TASKS':
          if (challenge.targetCategory && task.category === challenge.targetCategory) increment = 1; break;
        case 'STREAK':
          increment = 0; // Checked separately
          break;
      }

      if (increment === 0) continue;

      // Upsert progress
      const progress = await ChallengeProgress.findOneAndUpdate(
        { user: userId, challenge: challenge._id },
        { $inc: { progress: increment } },
        { upsert: true, new: true }
      );

      // Check completion
      if (!progress.completed && progress.progress >= challenge.target) {
        progress.completed = true;
        progress.completedAt = new Date();
        await progress.save();

        // Award points
        await User.findByIdAndUpdate(userId, { $inc: { points: challenge.rewardPoints } });

        // Notify
        const notif = await Notification.create({
          user: userId,
          title: `🏆 Challenge Completed! ${challenge.icon}`,
          message: `You completed "${challenge.title}" and earned +${challenge.rewardPoints} points!`,
          type: 'BADGE_UNLOCKED',
          link: '/challenges',
        });
        sendNotificationToUser(userId, notif);
      }
    }
  } catch (err) {
    console.warn('[ChallengeProgress]: Error updating challenge progress:', err.message);
  }
};

module.exports = {
  getActiveChallenges,
  getMyChallengeProgress,
  createChallenge,
  updateChallengeProgressOnComplete,
};
