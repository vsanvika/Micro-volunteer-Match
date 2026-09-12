const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Task = require('../models/Task');
const Report = require('../models/Report');
const Category = require('../models/Category');
const Badge = require('../models/Badge');
const Certificate = require('../models/Certificate');
const { createChallenge } = require('./challengeController');
const { getAllOrganizations, verifyOrganization } = require('./organizationController');
const { getAllCertificates } = require('./certificateController');

// @desc    Get admin statistics overview
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({});
  const volunteers = await User.countDocuments({ role: 'volunteer' });
  const requesters = await User.countDocuments({ role: 'requester' });
  const totalTasks = await Task.countDocuments({});
  const openTasks = await Task.countDocuments({ status: 'OPEN' });
  const completedTasks = await Task.countDocuments({ status: { $in: ['COMPLETED', 'CONFIRMED'] } });
  const pendingReports = await Report.countDocuments({ status: 'PENDING' });
  const totalCertificates = await Certificate.countDocuments({ isRevoked: false });

  res.json({
    success: true,
    stats: { totalUsers, volunteers, requesters, totalTasks, openTasks, completedTasks, pendingReports, totalCertificates },
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
});

// @desc    Suspend or Activate user account
// @route   PUT /api/admin/users/:id/toggle-suspend
// @access  Private (Admin)
const toggleSuspendUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  user.isSuspended = !user.isSuspended;
  await user.save();
  res.json({ success: true, message: `User account ${user.isSuspended ? 'suspended' : 'activated'} successfully`, isSuspended: user.isSuspended });
});

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({}).populate('reporter', 'name email avatar').sort({ createdAt: -1 });
  res.json({ success: true, count: reports.length, reports });
});

// @desc    Resolve or dismiss report
// @route   PUT /api/admin/reports/:id
// @access  Private (Admin)
const updateReportStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const report = await Report.findById(req.params.id);
  if (!report) { res.status(404); throw new Error('Report not found'); }
  report.status = status;
  await report.save();
  res.json({ success: true, report });
});

// @desc    Add category
// @route   POST /api/admin/categories
// @access  Private (Admin)
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, color } = req.body;
  const category = await Category.create({ name, description: description || '', icon: icon || 'Sparkles', color: color || '#10b981' });
  res.status(201).json({ success: true, category });
});

module.exports = {
  getAdminStats,
  getAllUsers,
  toggleSuspendUser,
  getReports,
  updateReportStatus,
  createCategory,
  // Re-exported from other controllers for admin routes
  createChallenge,
  getAllOrganizations,
  verifyOrganization,
  getAllCertificates,
};
