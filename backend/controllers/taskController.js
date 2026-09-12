const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Category = require('../models/Category');
const { calculateMatchScore } = require('../services/matchingEngine');
const { sendNotificationToUser } = require('../services/socketService');

// @desc    Get all tasks with filtering, search, time picker & calculated match score
// @route   GET /api/tasks
// @access  Public (Optional auth for personalized match scores)
const getTasks = asyncHandler(async (req, res) => {
  const { search, category, maxDuration, minDuration, locationMode, difficulty, sort } = req.query;

  const filter = { status: 'OPEN' };

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { requiredSkills: { $elemMatch: { $regex: search, $options: 'i' } } },
    ];
  }

  if (category && category !== 'All') {
    filter.category = category;
  }

  if (locationMode && locationMode !== 'all') {
    filter.locationMode = locationMode;
  }

  if (difficulty && difficulty !== 'All') {
    filter.difficulty = difficulty;
  }

  if (maxDuration) {
    filter.estimatedDuration = { $lte: Number(maxDuration) };
  }
  if (minDuration) {
    filter.estimatedDuration = { ...filter.estimatedDuration, $gte: Number(minDuration) };
  }

  let tasksQuery = Task.find(filter).populate('requester', 'name avatar organizationName rating');

  if (sort === 'shortest') {
    tasksQuery = tasksQuery.sort({ estimatedDuration: 1 });
  } else if (sort === 'newest') {
    tasksQuery = tasksQuery.sort({ createdAt: -1 });
  }

  let tasks = await tasksQuery;

  // Augment with match scores if user is authenticated
  const currentUser = req.user;
  const tasksWithMatch = tasks.map(task => {
    const taskObj = task.toObject();
    if (currentUser && currentUser.role === 'volunteer') {
      const match = calculateMatchScore(currentUser, taskObj);
      taskObj.matchScore = match.score;
      taskObj.matchLevel = match.level;
      taskObj.matchReasons = match.reasons;
    } else {
      taskObj.matchScore = 75;
      taskObj.matchLevel = 'Good Match';
      taskObj.matchReasons = ['Popular opportunity'];
    }
    return taskObj;
  });

  if (sort === 'bestMatch' && currentUser && currentUser.role === 'volunteer') {
    tasksWithMatch.sort((a, b) => b.matchScore - a.matchScore);
  }

  res.json({ success: true, count: tasksWithMatch.length, tasks: tasksWithMatch });
});

// @desc    Get single task details
// @route   GET /api/tasks/:id
// @access  Public
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('requester', 'name email avatar bio organizationName rating')
    .populate('assignedVolunteers', 'name avatar')
    .populate('teamRoles.volunteer', 'name avatar');

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Increment views
  task.views = (task.views || 0) + 1;
  await task.save();

  const taskObj = task.toObject();

  if (req.user && req.user.role === 'volunteer') {
    const match = calculateMatchScore(req.user, taskObj);
    taskObj.matchScore = match.score;
    taskObj.matchLevel = match.level;
    taskObj.matchReasons = match.reasons;

    // Check user application status
    const app = await Application.findOne({ task: task._id, volunteer: req.user._id });
    taskObj.userApplication = app || null;
  }

  const applicantCount = await Application.countDocuments({ task: task._id });
  taskObj.applicantCount = applicantCount;

  res.json({ success: true, task: taskObj });
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Requester / Admin)
const createTask = asyncHandler(async (req, res) => {
  const { title, description, category, requiredSkills, estimatedDuration, difficulty, locationMode, locationAddress, deadline, priority, requiredVolunteers } = req.body;

  const task = await Task.create({
    title,
    description,
    category,
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills || '').split(',').map(s => s.trim()).filter(Boolean),
    estimatedDuration: Number(estimatedDuration) || 15,
    difficulty: difficulty || 'Beginner',
    locationMode: locationMode || 'online',
    locationAddress: locationAddress || '',
    deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    priority: priority || 'Medium',
    requiredVolunteers: Number(requiredVolunteers) || 1,
    requester: req.user._id,
  });

  // Notify matching volunteers asynchronously via Sockets
  const volunteers = await User.find({ role: 'volunteer', isSuspended: false }).limit(20);
  volunteers.forEach(async (v) => {
    const match = calculateMatchScore(v, task);
    if (match.score >= 75) {
      const notif = await Notification.create({
        user: v._id,
        title: 'New High-Match Task Available! ✨',
        message: `"${task.title}" matches your skills (${match.score}% match, ${task.estimatedDuration} mins).`,
        type: 'TASK_MATCH',
        link: `/tasks/${task._id}`,
      });
      sendNotificationToUser(v._id, notif);
    }
  });

  res.status(201).json({ success: true, task });
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private (Requester owner / Admin)
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (task.requester.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this task');
  }

  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, task: updatedTask });
});

// @desc    Delete/Cancel a task
// @route   DELETE /api/tasks/:id
// @access  Private (Requester owner / Admin)
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (task.requester.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this task');
  }

  task.status = 'CANCELLED';
  await task.save();

  res.json({ success: true, message: 'Task cancelled successfully' });
});

// @desc    Get tasks created by current requester
// @route   GET /api/tasks/my-created
// @access  Private (Requester / Admin)
const getMyCreatedTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ requester: req.user._id }).sort({ createdAt: -1 });

  const tasksWithStats = await Promise.all(
    tasks.map(async (t) => {
      const appCount = await Application.countDocuments({ task: t._id });
      const pendingCount = await Application.countDocuments({ task: t._id, status: 'PENDING' });
      return {
        ...t.toObject(),
        applicantCount: appCount,
        pendingApplicantCount: pendingCount,
      };
    })
  );

  res.json({ success: true, tasks: tasksWithStats });
});

// @desc    Get categories
// @route   GET /api/tasks/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  res.json({ success: true, categories });
});

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getMyCreatedTasks,
  getCategories,
};
