const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const { calculateMatchScore, generateMatchExplanation, getRecommendationSections } = require('../services/matchingEngine');

// @desc    Get top recommended tasks for current logged-in volunteer
// @route   GET /api/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
  const user = req.user;
  const openTasks = await Task.find({ status: 'OPEN' }).populate('requester', 'name avatar organizationName');

  const scoredTasks = openTasks.map(task => {
    const taskObj = task.toObject();
    const match = calculateMatchScore(user, taskObj);
    return { ...taskObj, matchScore: match.score, matchLevel: match.level, matchReasons: match.reasons };
  });
  scoredTasks.sort((a, b) => b.matchScore - a.matchScore);

  res.json({ success: true, recommendations: scoredTasks.slice(0, 6) });
});

// @desc    Get recommendation sections (for volunteer dashboard)
// @route   GET /api/recommendations/sections
// @access  Private
const getRecommendationSectionsHandler = asyncHandler(async (req, res) => {
  const user = req.user;
  const openTasks = await Task.find({ status: 'OPEN' }).populate('requester', 'name avatar organizationName');
  const sections = getRecommendationSections(user, openTasks);
  res.json({ success: true, sections });
});

// @desc    Get time-filtered tasks ("I have X minutes right now") — enhanced
// @route   GET /api/matches/quick?minutes=15
// @access  Public (Optional auth)
const getQuickTasks = asyncHandler(async (req, res) => {
  const availableMins = Number(req.query.minutes) || 15;
  const openTasks = await Task.find({
    status: 'OPEN',
    estimatedDuration: { $lte: availableMins },
  }).populate('requester', 'name avatar organizationName');

  const currentUser = req.user;
  const scoredTasks = openTasks.map(task => {
    const taskObj = task.toObject();
    if (currentUser) {
      const match = generateMatchExplanation(currentUser, taskObj);
      taskObj.matchScore = match.score;
      taskObj.matchLevel = match.level;
      taskObj.matchReasons = match.reasons;
      taskObj.matchSummary = match.summary;
    } else {
      taskObj.matchScore = 82;
      taskObj.matchLevel = 'Good Match';
      taskObj.matchReasons = [
        { icon: '✓', text: `Can be completed within ${availableMins} minutes`, factor: 'time' },
        { icon: '✓', text: 'Open for all volunteers', factor: 'skill' },
      ];
      taskObj.matchSummary = `This ${taskObj.category} task fits your ${availableMins}-minute window.`;
    }
    return taskObj;
  });

  scoredTasks.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  res.json({
    success: true,
    minutesRequested: availableMins,
    count: scoredTasks.length,
    matches: scoredTasks,
  });
});

// @desc    Old time-filter route (backward compat)
// @route   GET /api/matches/time-filter
// @access  Public (Optional auth)
const getTimeBasedMatches = asyncHandler(async (req, res) => {
  const availableMins = Number(req.query.minutes) || 15;
  const openTasks = await Task.find({
    status: 'OPEN',
    estimatedDuration: { $lte: availableMins },
  }).populate('requester', 'name avatar organizationName');

  const currentUser = req.user;
  const scoredTasks = openTasks.map(task => {
    const taskObj = task.toObject();
    if (currentUser) {
      const match = calculateMatchScore(currentUser, taskObj);
      taskObj.matchScore = match.score;
      taskObj.matchLevel = match.level;
      taskObj.matchReasons = match.reasons;
    } else {
      taskObj.matchScore = 85;
      taskObj.matchLevel = 'Excellent Match';
      taskObj.matchReasons = [`Can complete within ${availableMins} mins`];
    }
    return taskObj;
  });

  scoredTasks.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  res.json({ success: true, minutesRequested: availableMins, count: scoredTasks.length, matches: scoredTasks });
});

// @desc    Get learning recommendations (tasks that teach skills user wants to learn)
// @route   GET /api/learning/recommendations
// @access  Private
const getLearningRecommendations = asyncHandler(async (req, res) => {
  const user = req.user;
  const learningGoals = (user.learningGoals || []).map(g => g.skill?.toLowerCase()).filter(Boolean);

  if (learningGoals.length === 0) {
    const openTasks = await Task.find({ status: 'OPEN', isSkillLearning: true })
      .populate('requester', 'name avatar organizationName')
      .limit(6);
    return res.json({ success: true, grouped: {}, all: openTasks, message: 'Set learning goals to get personalized recommendations' });
  }

  const openTasks = await Task.find({ status: 'OPEN' }).populate('requester', 'name avatar organizationName');

  // Group by learning goal
  const grouped = {};
  learningGoals.forEach(goal => {
    const matching = openTasks.filter(task => {
      const skills = (task.requiredSkills || []).map(s => s.toLowerCase());
      const learningFor = (task.skillLearningFor || []).map(s => s.toLowerCase());
      return skills.some(s => s.includes(goal) || goal.includes(s)) ||
             learningFor.some(s => s.includes(goal) || goal.includes(s));
    }).map(task => {
      const taskObj = task.toObject();
      const match = calculateMatchScore(user, taskObj);
      return { ...taskObj, matchScore: match.score, matchLevel: match.level, matchReasons: match.reasons };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);

    if (matching.length > 0) {
      const goalLabel = user.learningGoals.find(g => g.skill?.toLowerCase() === goal)?.skill || goal;
      grouped[goalLabel] = matching;
    }
  });

  res.json({ success: true, grouped, all: openTasks.slice(0, 6) });
});

module.exports = {
  getRecommendations,
  getRecommendationSectionsHandler,
  getQuickTasks,
  getTimeBasedMatches,
  getLearningRecommendations,
};
