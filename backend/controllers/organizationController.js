const asyncHandler = require('express-async-handler');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendNotificationToUser } = require('../services/socketService');

// @desc    Create organization profile
// @route   POST /api/organizations
// @access  Private (Requester)
const createOrganization = asyncHandler(async (req, res) => {
  const existing = await Organization.findOne({ user: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error('You already have an organization profile. Update it instead.');
  }

  const { name, description, website, logo, category, location } = req.body;
  if (!name) { res.status(400); throw new Error('Organization name is required'); }

  const org = await Organization.create({
    user: req.user._id,
    name,
    description: description || '',
    website: website || '',
    logo: logo || '',
    category: category || 'Community',
    location: location || { city: '', country: 'India' },
  });

  res.status(201).json({ success: true, organization: org });
});

// @desc    Get own organization
// @route   GET /api/organizations/my
// @access  Private (Requester)
const getMyOrganization = asyncHandler(async (req, res) => {
  const org = await Organization.findOne({ user: req.user._id });
  if (!org) {
    return res.json({ success: true, organization: null });
  }
  res.json({ success: true, organization: org });
});

// @desc    Get organization by ID (public)
// @route   GET /api/organizations/:id
// @access  Public
const getOrganization = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.params.id).populate('user', 'name avatar bio');
  if (!org) { res.status(404); throw new Error('Organization not found'); }
  res.json({ success: true, organization: org });
});

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private (Owner)
const updateOrganization = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.params.id);
  if (!org) { res.status(404); throw new Error('Organization not found'); }
  if (org.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized to update this organization');
  }

  const { name, description, website, logo, category, location } = req.body;
  if (name) org.name = name;
  if (description !== undefined) org.description = description;
  if (website !== undefined) org.website = website;
  if (logo !== undefined) org.logo = logo;
  if (category) org.category = category;
  if (location) org.location = location;

  await org.save();
  res.json({ success: true, organization: org });
});

// @desc    Request verification
// @route   POST /api/organizations/:id/request-verification
// @access  Private (Owner)
const requestVerification = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.params.id);
  if (!org) { res.status(404); throw new Error('Organization not found'); }
  if (org.user.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }
  if (org.verificationStatus === 'PENDING' || org.verificationStatus === 'APPROVED') {
    res.status(400);
    throw new Error(`Verification is already ${org.verificationStatus.toLowerCase()}`);
  }

  org.verificationStatus = 'PENDING';
  await org.save();

  res.json({ success: true, message: 'Verification request submitted. Admin will review shortly.', organization: org });
});

// @desc    Get all organizations (Admin)
// @route   GET /api/admin/organizations
// @access  Private (Admin)
const getAllOrganizations = asyncHandler(async (req, res) => {
  const orgs = await Organization.find({})
    .populate('user', 'name email avatar organizationName')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: orgs.length, organizations: orgs });
});

// @desc    Verify organization (Admin)
// @route   PUT /api/admin/organizations/:id/verify
// @access  Private (Admin)
const verifyOrganization = asyncHandler(async (req, res) => {
  const { approve } = req.body;
  const org = await Organization.findById(req.params.id);
  if (!org) { res.status(404); throw new Error('Organization not found'); }

  org.isVerified = approve === true;
  org.verificationStatus = approve === true ? 'APPROVED' : 'REJECTED';
  await org.save();

  // Notify org owner
  const notif = await Notification.create({
    user: org.user,
    title: approve ? '✅ Organization Verified!' : 'Organization Verification Update',
    message: approve
      ? `Your organization "${org.name}" has been verified! You now have a verified badge.`
      : `Your organization verification request was not approved. Contact admin for details.`,
    type: approve ? 'BADGE_UNLOCKED' : 'APPLICATION_REJECTED',
  });
  sendNotificationToUser(org.user, notif);

  res.json({ success: true, organization: org });
});

module.exports = {
  createOrganization,
  getMyOrganization,
  getOrganization,
  updateOrganization,
  requestVerification,
  getAllOrganizations,
  verifyOrganization,
};
