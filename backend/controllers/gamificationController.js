const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const Activity = require('../models/Activity');

// @desc    Get leaderboard rankings
// @route   GET /api/leaderboard
// @access  Public
const getLeaderboard = asyncHandler(async (req, res) => {
  const leaders = await User.find({ role: 'volunteer', isSuspended: false })
    .select('name avatar bio points verifiedMinutes volunteerMinutes tasksCompleted streak rating trustScore impactScore')
    .sort({ points: -1 })
    .limit(20);

  const formatted = leaders.map((leader, index) => ({
    rank: index + 1,
    ...leader.toObject(),
  }));

  res.json({ success: true, count: formatted.length, leaderboard: formatted });
});

// @desc    Get user achievements & badges progression
// @route   GET /api/gamification/badges
// @access  Private
const getUserBadges = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const allBadges = await Badge.find({});
  const unlocked = await UserBadge.find({ user: userId }).populate('badge');
  const unlockedBadgeIds = new Set(unlocked.map(u => u.badge._id.toString()));

  const badgesWithStatus = allBadges.map(b => {
    const isUnlocked = unlockedBadgeIds.has(b._id.toString());
    const unlockedRecord = unlocked.find(u => u.badge._id.toString() === b._id.toString());
    return { ...b.toObject(), isUnlocked, unlockedAt: unlockedRecord?.unlockedAt || null };
  });

  const recentActivities = await Activity.find({ user: userId }).sort({ createdAt: -1 }).limit(10);

  res.json({
    success: true,
    badges: badgesWithStatus,
    stats: {
      points: req.user.points,
      volunteerMinutes: req.user.volunteerMinutes,
      verifiedMinutes: req.user.verifiedMinutes,
      tasksCompleted: req.user.tasksCompleted,
      streak: req.user.streak?.current || 0,
      trustScore: req.user.trustScore,
      impactScore: req.user.impactScore,
    },
    activities: recentActivities,
  });
});

// @desc    Get trust/reputation score for a user
// @route   GET /api/reputation/:userId
// @access  Public
const getTrustScore = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId)
    .select('name avatar trustScore completionRate tasksCompleted verifiedMinutes rating cancellationCount streak impactScore');
  if (!user) { res.status(404); throw new Error('User not found'); }

  res.json({
    success: true,
    reputation: {
      name: user.name,
      avatar: user.avatar,
      trustScore: user.trustScore || 100,
      completionRate: user.completionRate || 100,
      tasksCompleted: user.tasksCompleted,
      verifiedMinutes: user.verifiedMinutes,
      rating: user.rating,
      streak: user.streak,
      impactScore: user.impactScore,
      label:
        user.trustScore >= 90 ? '🛡️ Trusted Volunteer' :
        user.trustScore >= 75 ? '⭐ Reliable Volunteer' :
        user.trustScore >= 50 ? '✅ Active Volunteer' : '🌱 New Volunteer',
    },
  });
});

module.exports = { getLeaderboard, getUserBadges, getTrustScore };
