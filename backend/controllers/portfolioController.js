const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Task = require('../models/Task');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');

// @desc    Get public portfolio by portfolioUsername
// @route   GET /api/portfolio/:username
// @access  Public
const getPublicPortfolio = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({
    portfolioUsername: username.toLowerCase(),
    portfolioPublic: true,
  }).select('-password -email -isSuspended -cancellationCount -language -resumeDescriptions -monthlyGoal');

  if (!user) {
    res.status(404);
    throw new Error('Portfolio not found or set to private');
  }

  // Fetch badges
  const userBadges = await UserBadge.find({ user: user._id }).populate('badge');
  const badges = userBadges.map(ub => ub.badge);

  // Fetch recent completed tasks
  const recentTasks = await Task.find({
    assignedVolunteers: user._id,
    status: { $in: ['CONFIRMED'] },
  })
    .select('title category estimatedDuration status createdAt')
    .sort({ updatedAt: -1 })
    .limit(5);

  res.json({
    success: true,
    portfolio: {
      name: user.name,
      bio: user.bio,
      avatar: user.avatar,
      role: user.role,
      portfolioUsername: user.portfolioUsername,
      skills: user.skills,
      interests: user.interests,
      points: user.points,
      tasksCompleted: user.tasksCompleted,
      verifiedMinutes: user.verifiedMinutes,
      totalPeopleHelped: user.totalPeopleHelped,
      impactScore: user.impactScore,
      trustScore: user.trustScore,
      rating: user.rating,
      streak: user.streak,
      categoriesContributed: user.categoriesContributed,
      badges,
      recentTasks,
      createdAt: user.createdAt,
    },
  });
});

// @desc    Get own portfolio (private)
// @route   GET /api/portfolio/me
// @access  Private
const getMyPortfolio = asyncHandler(async (req, res) => {
  const user = req.user;

  const userBadges = await UserBadge.find({ user: user._id }).populate('badge');
  const badges = userBadges.map(ub => ub.badge);

  const recentTasks = await Task.find({
    assignedVolunteers: user._id,
    status: { $in: ['CONFIRMED'] },
  })
    .select('title category estimatedDuration status createdAt')
    .sort({ updatedAt: -1 })
    .limit(5);

  res.json({
    success: true,
    portfolio: {
      name: user.name,
      bio: user.bio,
      avatar: user.avatar,
      role: user.role,
      portfolioUsername: user.portfolioUsername,
      portfolioPublic: user.portfolioPublic,
      skills: user.skills,
      interests: user.interests,
      learningGoals: user.learningGoals,
      points: user.points,
      tasksCompleted: user.tasksCompleted,
      verifiedMinutes: user.verifiedMinutes,
      totalPeopleHelped: user.totalPeopleHelped,
      impactScore: user.impactScore,
      trustScore: user.trustScore,
      completionRate: user.completionRate,
      rating: user.rating,
      streak: user.streak,
      categoriesContributed: user.categoriesContributed,
      resumeDescriptions: user.resumeDescriptions,
      monthlyGoal: user.monthlyGoal,
      badges,
      recentTasks,
      createdAt: user.createdAt,
    },
  });
});

// @desc    Update portfolio settings
// @route   PUT /api/portfolio/settings
// @access  Private
const updatePortfolioSettings = asyncHandler(async (req, res) => {
  const { portfolioPublic, portfolioUsername } = req.body;

  // Check username uniqueness
  if (portfolioUsername) {
    const usernameClean = portfolioUsername.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    const existing = await User.findOne({
      portfolioUsername: usernameClean,
      _id: { $ne: req.user._id },
    });
    if (existing) {
      res.status(400);
      throw new Error('This portfolio username is already taken. Please choose another.');
    }

    await User.findByIdAndUpdate(req.user._id, {
      portfolioUsername: usernameClean,
      ...(typeof portfolioPublic === 'boolean' && { portfolioPublic }),
    });

    return res.json({ success: true, portfolioUsername: usernameClean, portfolioPublic });
  }

  await User.findByIdAndUpdate(req.user._id, {
    ...(typeof portfolioPublic === 'boolean' && { portfolioPublic }),
  });

  res.json({ success: true, portfolioPublic });
});

module.exports = { getPublicPortfolio, getMyPortfolio, updatePortfolioSettings };
