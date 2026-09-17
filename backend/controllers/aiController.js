const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const User = require('../models/User');
const Activity = require('../models/Activity');
const {
  getAiTaskRecommendations,
  generateSmartTaskSuggestions,
  generateTaskBreakdown,
  extractSkillsFromText,
  generateResumeDescription,
  generateGoalPlan,
} = require('../services/aiService');

// @desc    AI Assistant Task Recommendation Chat
// @route   POST /api/ai/assistant
// @access  Public (Optional auth)
const handleAiAssistant = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) { res.status(400); throw new Error('Please enter a query or question'); }

  const openTasks = await Task.find({ status: 'OPEN' }).populate('requester', 'name avatar organizationName');
  const userProfile = req.user ? { name: req.user.name, skills: req.user.skills, interests: req.user.interests, availableMinutes: req.user.availableMinutes } : null;
  const result = await getAiTaskRecommendations(prompt, openTasks, userProfile);
  const tasks = await Task.find({ _id: { $in: result.recommendedTaskIds || [] } }).populate('requester', 'name avatar organizationName');

  res.json({ success: true, reply: result.reply, tasks });
});

// @desc    Smart Task Creator AI Helper
// @route   POST /api/ai/smart-task-creator
// @access  Private (Requester / Admin)
const handleSmartTaskCreator = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) { res.status(400); throw new Error('Please provide a prompt describing your request'); }
  const suggestions = await generateSmartTaskSuggestions(prompt);
  res.json({ success: true, suggestions });
});

const handleTaskBreakdown = asyncHandler(async (req, res) => {
  const { title, description, duration } = req.body;
  if (!title || !description) {
    res.status(400); throw new Error('Please provide a task title and description');
  }
  const breakdown = await generateTaskBreakdown({ title, description, duration });
  res.json({ success: true, breakdown });
});

// @desc    Extract skills from resume/bio text
// @route   POST /api/ai/extract-skills
// @access  Public (Optional auth)
const handleExtractSkills = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length < 10) {
    res.status(400);
    throw new Error('Please provide at least 10 characters of text to analyze');
  }
  const result = await extractSkillsFromText(text);
  res.json({ success: true, skills: result.skills || [], interests: result.interests || [] });
});

// @desc    Generate AI resume bullet from activities
// @route   POST /api/ai/resume-builder
// @access  Private
const handleResumeBuilder = asyncHandler(async (req, res) => {
  const { title } = req.body;
  // Fetch user's verified activities
  const activities = await Activity.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
  if (activities.length === 0) {
    res.status(400);
    throw new Error('No volunteer activities found. Complete verified tasks first.');
  }
  const description = await generateResumeDescription(activities, title || 'Volunteer Experience');

  // Save to user's resumeDescriptions
  await User.findByIdAndUpdate(req.user._id, {
    $push: {
      resumeDescriptions: {
        title: title || 'Volunteer Experience',
        content: description,
        generatedAt: new Date(),
      },
    },
  });

  res.json({ success: true, description });
});

// @desc    Generate monthly goal plan
// @route   POST /api/ai/goal-plan
// @access  Private
const handleGoalPlan = asyncHandler(async (req, res) => {
  const { targetTasks, targetMinutes, month } = req.body;
  if (!targetTasks || targetTasks < 1) {
    res.status(400);
    throw new Error('Please set a target number of tasks (minimum 1)');
  }

  const plan = await generateGoalPlan(req.user, {
    targetTasks: Number(targetTasks),
    targetMinutes: Number(targetMinutes) || targetTasks * 15,
    month: month || new Date().toLocaleString('en', { month: 'long', year: 'numeric' }),
  });

  // Save plan to user
  await User.findByIdAndUpdate(req.user._id, {
    monthlyGoal: {
      targetTasks: Number(targetTasks),
      targetMinutes: Number(targetMinutes) || targetTasks * 15,
      month: month || new Date().toLocaleString('en', { month: 'long', year: 'numeric' }),
      weekPlan: plan.weekPlan,
      currentProgress: req.user.tasksCompleted || 0,
    },
  });

  res.json({ success: true, plan });
});

module.exports = {
  handleAiAssistant,
  handleSmartTaskCreator,
  handleTaskBreakdown,
  handleExtractSkills,
  handleResumeBuilder,
  handleGoalPlan,
};
