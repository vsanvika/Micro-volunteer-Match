const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const SavedTask = require('../models/SavedTask');
const UserBadge = require('../models/UserBadge');
const { extractSkillsFromText } = require('../services/aiService');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  user.name = req.body.name || user.name;
  user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
  user.avatar = req.body.avatar || user.avatar;
  user.organizationName = req.body.organizationName !== undefined ? req.body.organizationName : user.organizationName;
  user.availableMinutes = req.body.availableMinutes || user.availableMinutes;
  user.preferredMode = req.body.preferredMode || user.preferredMode;
  if (req.body.skills) user.skills = req.body.skills;
  if (req.body.interests) user.interests = req.body.interests;
  if (req.body.language) user.language = req.body.language;
  if (req.body.location) user.location = req.body.location;

  const updatedUser = await user.save();
  res.json({ success: true, user: updatedUser });
});

// @desc    Get user public profile by ID
// @route   GET /api/users/:id/public
// @access  Public
const getPublicUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -email -isSuspended -cancellationCount');
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, user });
});

// @desc    Save/Bookmark task (toggle)
// @route   POST /api/users/saved-tasks/:taskId
// @access  Private
const saveTask = asyncHandler(async (req, res) => {
  const existing = await SavedTask.findOne({ user: req.user._id, task: req.params.taskId });
  if (existing) {
    await SavedTask.findByIdAndDelete(existing._id);
    return res.json({ success: true, saved: false, message: 'Task removed from saved list' });
  }
  await SavedTask.create({ user: req.user._id, task: req.params.taskId });
  res.json({ success: true, saved: true, message: 'Task saved successfully' });
});

// @desc    Get saved tasks
// @route   GET /api/users/saved-tasks
// @access  Private
const getSavedTasks = asyncHandler(async (req, res) => {
  const saved = await SavedTask.find({ user: req.user._id }).populate({
    path: 'task',
    populate: { path: 'requester', select: 'name avatar organizationName' },
  });
  res.json({ success: true, savedTasks: saved.map(s => s.task).filter(Boolean) });
});

// @desc    Get learning goals
// @route   GET /api/users/learning-goals
// @access  Private
const getLearningGoals = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('learningGoals');
  res.json({ success: true, goals: user?.learningGoals || [] });
});

// @desc    Update learning goals
// @route   PUT /api/users/learning-goals
// @access  Private
const updateLearningGoals = asyncHandler(async (req, res) => {
  const { learningGoals, skill, priority } = req.body;

  if (typeof skill === 'string' && skill.trim()) {
    const user = await User.findById(req.user._id);
    const goal = { skill: skill.trim(), priority: priority || 'Medium' };
    const existing = (user.learningGoals || []).some(g => g.skill?.toLowerCase() === goal.skill.toLowerCase());
    if (!existing) {
      user.learningGoals = [...(user.learningGoals || []), goal];
      await user.save();
      return res.json({ success: true, learningGoals: user.learningGoals });
    }
    return res.json({ success: true, learningGoals: user.learningGoals });
  }

  if (!Array.isArray(learningGoals)) {
    res.status(400); throw new Error('learningGoals must be an array');
  }
  const cleaned = learningGoals
    .filter(g => g.skill && typeof g.skill === 'string')
    .map(g => ({ skill: g.skill.trim(), priority: g.priority || 'Medium' }));

  await User.findByIdAndUpdate(req.user._id, { learningGoals: cleaned });
  res.json({ success: true, learningGoals: cleaned });
});

// @desc    Extract skills and interests from profile text and merge into user profile after confirmation
// @route   POST /api/users/skills/extract
// @access  Private
const extractSkillsForProfile = asyncHandler(async (req, res) => {
  const { text, applyToProfile } = req.body;
  if (!text || text.trim().length < 10) {
    res.status(400); throw new Error('Please provide at least 10 characters of text to analyze');
  }

  const extracted = await extractSkillsFromText(text);
  const cleanSkills = (extracted.skills || []).map(s => ({ name: s.name, proficiency: 'Intermediate' }));
  const cleanInterests = (extracted.interests || []).filter(Boolean);

  if (applyToProfile) {
    const user = await User.findById(req.user._id);
    const existingSkillNames = new Set((user.skills || []).map(s => (typeof s === 'string' ? s : s.name).toLowerCase()));
    const mergedSkills = [...(user.skills || []), ...cleanSkills.filter(s => !existingSkillNames.has(s.name.toLowerCase()))];
    const existingInterests = new Set((user.interests || []).map(i => i.toLowerCase()));
    const mergedInterests = [...new Set([...(user.interests || []), ...cleanInterests.filter(i => !existingInterests.has(i.toLowerCase()))])];
    user.skills = mergedSkills;
    user.interests = mergedInterests;
    await user.save();
    return res.json({ success: true, skills: mergedSkills, interests: mergedInterests, extracted: { skills: cleanSkills, interests: cleanInterests } });
  }

  res.json({ success: true, skills: cleanSkills, interests: cleanInterests, extracted: { skills: cleanSkills, interests: cleanInterests } });
});

// @desc    Get user reputation / trust score
// @route   GET /api/users/reputation/:userId
// @access  Public
const getUserReputation = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId)
    .select('name avatar trustScore completionRate tasksCompleted verifiedMinutes rating cancellationCount streak');
  if (!user) { res.status(404); throw new Error('User not found'); }

  res.json({
    success: true,
    reputation: {
      name: user.name,
      avatar: user.avatar,
      trustScore: user.trustScore,
      completionRate: user.completionRate,
      tasksCompleted: user.tasksCompleted,
      verifiedMinutes: user.verifiedMinutes,
      rating: user.rating,
      streak: user.streak,
      label:
        user.trustScore >= 90 ? 'Trusted Volunteer' :
        user.trustScore >= 75 ? 'Reliable Volunteer' :
        user.trustScore >= 50 ? 'Active Volunteer' : 'New Volunteer',
    },
  });
});

// @desc    Save a resume description generated by AI
// @route   PUT /api/users/resume-descriptions
// @access  Private
const saveResumeDescription = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  if (!content) { res.status(400); throw new Error('Content is required'); }

  await User.findByIdAndUpdate(req.user._id, {
    $push: {
      resumeDescriptions: { title: title || 'Volunteer Experience', content, generatedAt: new Date() },
    },
  });
  res.json({ success: true, message: 'Resume description saved' });
});

// @desc    Delete a resume description
// @route   DELETE /api/users/resume-descriptions/:index
// @access  Private
const deleteResumeDescription = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  const idx = Number(req.params.index);
  if (isNaN(idx) || idx < 0 || idx >= user.resumeDescriptions.length) {
    res.status(400); throw new Error('Invalid index');
  }
  user.resumeDescriptions.splice(idx, 1);
  await user.save();
  res.json({ success: true, message: 'Description deleted' });
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  getPublicUser,
  saveTask,
  getSavedTasks,
  getLearningGoals,
  updateLearningGoals,
  extractSkillsForProfile,
  getUserReputation,
  saveResumeDescription,
  deleteResumeDescription,
};
