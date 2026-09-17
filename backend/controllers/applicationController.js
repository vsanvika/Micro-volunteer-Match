const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const Application = require('../models/Application');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const Rating = require('../models/Rating');
const Organization = require('../models/Organization');
const { calculateMatchScore } = require('../services/matchingEngine');
const { sendNotificationToUser } = require('../services/socketService');
const { updateChallengeProgressOnComplete } = require('./challengeController');

// Helper: check & award badges
const checkAndAwardBadges = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return [];
  const allBadges = await Badge.find({});
  const existingUserBadges = await UserBadge.find({ user: userId }).select('badge');
  const existingBadgeIds = new Set(existingUserBadges.map(ub => ub.badge.toString()));
  const newlyUnlocked = [];

  for (const badge of allBadges) {
    if (existingBadgeIds.has(badge._id.toString())) continue;
    let unlocked = false;
    if (badge.criteriaType === 'FIRST_TASK' && user.tasksCompleted >= 1) unlocked = true;
    if (badge.criteriaType === 'TASKS_COUNT' && user.tasksCompleted >= badge.criteriaThreshold) unlocked = true;
    if (badge.criteriaType === 'MINUTES_COUNT' && user.verifiedMinutes >= badge.criteriaThreshold) unlocked = true;
    if (badge.criteriaType === 'STREAK_DAYS' && (user.streak?.current || 0) >= badge.criteriaThreshold) unlocked = true;

    if (unlocked) {
      await UserBadge.create({ user: userId, badge: badge._id });
      newlyUnlocked.push(badge);
      const notif = await Notification.create({
        user: userId,
        title: `Badge Unlocked! ${badge.icon}`,
        message: `Congratulations! You earned the "${badge.name}" badge.`,
        type: 'BADGE_UNLOCKED',
        link: '/achievements',
      });
      sendNotificationToUser(userId, notif);
    }
  }
  return newlyUnlocked;
};

// @desc    Apply for a task
// @route   POST /api/tasks/:id/apply
// @access  Private (Volunteer)
const applyForTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) { res.status(404); throw new Error('Task not found'); }
  if (task.status !== 'OPEN') { res.status(400); throw new Error(`Cannot apply for task with status: ${task.status}`); }

  const existing = await Application.findOne({ task: task._id, volunteer: req.user._id });
  if (existing) { res.status(400); throw new Error('You have already applied for this task'); }

  const match = calculateMatchScore(req.user, task);
  const application = await Application.create({
    task: task._id,
    volunteer: req.user._id,
    coverNote: req.body.coverNote || '',
    matchScore: match.score,
  });

  const notif = await Notification.create({
    user: task.requester,
    title: 'New Volunteer Application! 🤝',
    message: `${req.user.name} applied for "${task.title}" (${match.score}% Match).`,
    type: 'APPLICATION_NEW',
    link: `/requester/tasks/${task._id}/applicants`,
  });
  sendNotificationToUser(task.requester, notif);

  res.status(201).json({ success: true, application });
});

// @desc    Get applicants for a task
// @route   GET /api/tasks/:id/applications
// @access  Private (Requester owner / Admin)
const getTaskApplications = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) { res.status(404); throw new Error('Task not found'); }
  if (task.requester.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized to view applicants');
  }

  const applications = await Application.find({ task: req.params.id })
    .populate('volunteer', 'name email avatar bio skills interests points verifiedMinutes tasksCompleted rating trustScore')
    .sort({ matchScore: -1 });

  res.json({ success: true, count: applications.length, applications });
});

// @desc    Accept or Reject application
// @route   PUT /api/applications/:id
// @access  Private (Requester owner / Admin)
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['ACCEPTED', 'REJECTED'].includes(status)) {
    res.status(400); throw new Error('Invalid application status');
  }
  const application = await Application.findById(req.params.id).populate('task');
  if (!application) { res.status(404); throw new Error('Application not found'); }

  const task = application.task;
  if (task.requester.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized to manage this application');
  }

  application.status = status;
  await application.save();

  if (status === 'ACCEPTED') {
    task.status = 'ACCEPTED';
    if (!task.assignedVolunteers.includes(application.volunteer)) {
      task.assignedVolunteers.push(application.volunteer);
    }
    await task.save();

    await Application.updateMany(
      { task: task._id, _id: { $ne: application._id }, status: 'PENDING' },
      { status: 'REJECTED' }
    );

    const notif = await Notification.create({
      user: application.volunteer,
      title: 'Application Accepted! 🎉',
      message: `Your application for "${task.title}" was accepted! You can now begin.`,
      type: 'APPLICATION_ACCEPTED',
      link: `/tasks/${task._id}`,
    });
    sendNotificationToUser(application.volunteer, notif);
  } else if (status === 'REJECTED') {
    const notif = await Notification.create({
      user: application.volunteer,
      title: 'Application Update',
      message: `Your application for "${task.title}" was not selected. Keep exploring!`,
      type: 'APPLICATION_REJECTED',
      link: `/tasks`,
    });
    sendNotificationToUser(application.volunteer, notif);
  }

  res.json({ success: true, application });
});

// @desc    Mark task as Completed by Volunteer
// @route   POST /api/tasks/:id/complete
// @access  Private (Assigned Volunteer)
const completeTask = asyncHandler(async (req, res) => {
  const { completionLocation } = req.body;
  const task = await Task.findById(req.params.id);
  if (!task) { res.status(404); throw new Error('Task not found'); }

  const isAssigned = task.assignedVolunteers.some((volunteerId) => volunteerId.toString() === req.user._id.toString());
  if (!isAssigned && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only an assigned volunteer can complete this task');
  }
  if (!['ACCEPTED', 'IN_PROGRESS'].includes(task.status)) {
    res.status(400);
    throw new Error(`Cannot complete task with status: ${task.status}`);
  }
  if (task.locationMode === 'offline' && !completionLocation?.trim()) {
    res.status(400);
    throw new Error('Please confirm the offline task location before completing');
  }

  task.status = 'COMPLETED';
  if (completionLocation?.trim()) task.completionLocation = completionLocation.trim();
  await task.save();

  const notif = await Notification.create({
    user: task.requester,
    title: 'Task Submitted for Review! ✅',
    message: `${req.user.name} marked "${task.title}" as completed. Please confirm to award points!`,
    type: 'TASK_COMPLETED',
    link: `/tasks/${task._id}`,
  });
  sendNotificationToUser(task.requester, notif);

  res.json({ success: true, message: 'Task marked as completed', task });
});

// @desc    Confirm task completion by Requester (Awards verified minutes, points, badges)
// @route   POST /api/tasks/:id/confirm
// @access  Private (Requester owner)
const confirmTaskCompletion = asyncHandler(async (req, res) => {
  const { stars, comment } = req.body;
  const task = await Task.findById(req.params.id).populate('assignedVolunteers');
  if (!task) { res.status(404); throw new Error('Task not found'); }
  if (task.requester.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized to confirm completion');
  }
  if (task.status !== 'COMPLETED') {
    res.status(400); throw new Error(`Cannot confirm task with status: ${task.status}`);
  }

  task.status = 'CONFIRMED';
  task.verifiedCompletions = (task.verifiedCompletions || 0) + 1;
  await task.save();

  const volunteerId = task.assignedVolunteers[0]?._id || req.body.volunteerId;
  const volunteer = await User.findById(volunteerId);

  if (volunteer) {
    const duration = task.estimatedDuration || 15;
    const pointsToAdd = duration;

    // Award points, minutes, verified minutes
    volunteer.points += pointsToAdd;
    volunteer.volunteerMinutes += duration;
    volunteer.verifiedMinutes = (volunteer.verifiedMinutes || 0) + duration;
    volunteer.tasksCompleted += 1;
    volunteer.totalPeopleHelped = (volunteer.totalPeopleHelped || 0) + 1;

    // Add category to contributed list
    if (task.category && !volunteer.categoriesContributed.includes(task.category)) {
      volunteer.categoriesContributed.push(task.category);
    }

    // Update impact score
    volunteer.impactScore = Math.min(100, Math.round(
      volunteer.tasksCompleted * 2 +
      volunteer.verifiedMinutes * 0.1 +
      (volunteer.rating?.average || 5) * 4
    ));

    // Update trust score
    const totalApps = volunteer.tasksCompleted + volunteer.cancellationCount;
    volunteer.completionRate = totalApps > 0 ? Math.round((volunteer.tasksCompleted / totalApps) * 100) : 100;
    volunteer.trustScore = Math.min(100, Math.round(
      volunteer.completionRate * 0.5 +
      (volunteer.rating?.average || 5) * 8 +
      Math.min(volunteer.tasksCompleted, 20) * 2
    ));

    // Update streak
    const now = new Date();
    const lastActive = volunteer.streak?.lastActiveDate ? new Date(volunteer.streak.lastActiveDate) : null;
    if (!lastActive) {
      volunteer.streak = { current: 1, lastActiveDate: now };
    } else {
      const diffHours = (now - lastActive) / (1000 * 60 * 60);
      if (diffHours >= 20 && diffHours <= 48) {
        volunteer.streak.current += 1;
        volunteer.streak.lastActiveDate = now;
      } else if (diffHours > 48) {
        volunteer.streak.current = 1;
        volunteer.streak.lastActiveDate = now;
      }
    }

    // Process rating
    if (stars) {
      const currentTotal = (volunteer.rating?.average || 5) * (volunteer.rating?.count || 0);
      const newCount = (volunteer.rating?.count || 0) + 1;
      volunteer.rating = { average: Number(((currentTotal + Number(stars)) / newCount).toFixed(1)), count: newCount };
      await Rating.create({ task: task._id, fromUser: req.user._id, toUser: volunteer._id, stars: Number(stars), comment: comment || '' });
    }

    await volunteer.save();

    // Log activity
    await Activity.create({
      user: volunteer._id,
      action: `Completed Task: ${task.title}`,
      details: `${duration} verified volunteer mins logged`,
      pointsEarned: pointsToAdd,
      minutesLogged: duration,
    });

    // Award badges
    const newBadges = await checkAndAwardBadges(volunteer._id);

    // Update challenge progress
    await updateChallengeProgressOnComplete(volunteer._id, task);

    // Update organization stats if task belongs to one
    if (task.organizationId) {
      await Organization.findByIdAndUpdate(task.organizationId, {
        $inc: { totalImpactMinutes: duration, totalVolunteers: 1 },
      });
    }

    // Notify volunteer
    const notif = await Notification.create({
      user: volunteer._id,
      title: 'Task Confirmed! 🌟',
      message: `+${pointsToAdd} points & ${duration} verified mins for "${task.title}"!`,
      type: 'TASK_CONFIRMED',
      link: `/achievements`,
    });
    sendNotificationToUser(volunteer._id, notif);

    res.json({ success: true, message: 'Task confirmed successfully', pointsEarned: pointsToAdd, verifiedMinutes: duration, newBadges });
  } else {
    res.json({ success: true, message: 'Task marked as confirmed' });
  }
});

// @desc    Join a team role on a team task
// @route   POST /api/tasks/:id/team/join
// @access  Private (Volunteer)
const joinTeamRole = asyncHandler(async (req, res) => {
  const { roleIndex } = req.body;
  const task = await Task.findById(req.params.id);
  if (!task) { res.status(404); throw new Error('Task not found'); }
  if (!task.isTeamTask) { res.status(400); throw new Error('This is not a team task'); }
  if (task.status !== 'OPEN') { res.status(400); throw new Error('This task is no longer open for applications'); }

  const idx = Number(roleIndex);
  if (isNaN(idx) || !task.teamRoles[idx]) { res.status(400); throw new Error('Invalid role index'); }
  if (task.teamRoles[idx].filled) { res.status(400); throw new Error('This role is already filled'); }
  if (task.assignedVolunteers.some((volunteerId) => volunteerId.toString() === req.user._id.toString())) {
    res.status(400);
    throw new Error('You have already joined a role on this team task');
  }

  task.teamRoles[idx].filled = true;
  task.teamRoles[idx].volunteer = req.user._id;

  if (!task.assignedVolunteers.includes(req.user._id)) {
    task.assignedVolunteers.push(req.user._id);
  }

  const allFilled = task.teamRoles.every(r => r.filled);
  if (allFilled) task.status = 'ACCEPTED';

  await task.save();

  const notif = await Notification.create({
    user: task.requester,
    title: '🤝 Team Role Filled!',
    message: `${req.user.name} joined "${task.title}" as ${task.teamRoles[idx].role}.`,
    type: 'APPLICATION_NEW',
    link: `/tasks/${task._id}`,
  });
  sendNotificationToUser(task.requester, notif);

  res.json({ success: true, task, message: `Joined as ${task.teamRoles[idx].role}` });
});

// @desc    Get user's applications
// @route   GET /api/applications/my-applications
// @access  Private (Volunteer)
const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ volunteer: req.user._id })
    .populate({ path: 'task', populate: { path: 'requester', select: 'name avatar organizationName' } })
    .sort({ createdAt: -1 });
  res.json({ success: true, applications });
});

module.exports = {
  applyForTask,
  getTaskApplications,
  updateApplicationStatus,
  completeTask,
  confirmTaskCompletion,
  joinTeamRole,
  getMyApplications,
};
