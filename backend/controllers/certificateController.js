const asyncHandler = require('express-async-handler');
const Certificate = require('../models/Certificate');
const User = require('../models/User');

// Certificate type definitions
const CERTIFICATE_TYPES = {
  MINUTES_50: {
    name: '50 Volunteer Minutes',
    achievement: 'Contributed 50 Verified Volunteer Minutes',
    check: (user) => user.verifiedMinutes >= 50,
    icon: '⏱️',
  },
  MINUTES_100: {
    name: '100 Volunteer Minutes',
    achievement: 'Contributed 100 Verified Volunteer Minutes',
    check: (user) => user.verifiedMinutes >= 100,
    icon: '🕐',
  },
  TASKS_10: {
    name: '10 Tasks Completed',
    achievement: 'Completed 10 Verified Volunteer Tasks',
    check: (user) => user.tasksCompleted >= 10,
    icon: '✅',
  },
  TASKS_25: {
    name: '25 Tasks Completed',
    achievement: 'Completed 25 Verified Volunteer Tasks',
    check: (user) => user.tasksCompleted >= 25,
    icon: '🏅',
  },
  CHAMPION: {
    name: 'Community Champion',
    achievement: 'Achieved Community Champion status — 25 tasks and 300+ volunteer minutes',
    check: (user) => user.tasksCompleted >= 25 && user.verifiedMinutes >= 300,
    icon: '🏆',
  },
  STREAK_7: {
    name: '7-Day Streak Master',
    achievement: 'Maintained a 7-Day Consecutive Volunteering Streak',
    check: (user) => (user.streak?.current || 0) >= 7,
    icon: '🔥',
  },
};

// Generate unique verification ID: MVM-YYYY-NNNNNN
const generateVerificationId = async () => {
  const year = new Date().getFullYear();
  const count = await Certificate.countDocuments({});
  const padded = String(count + 1).padStart(6, '0');
  const candidate = `MVM-${year}-${padded}`;
  // Ensure unique
  const existing = await Certificate.findOne({ verificationId: candidate });
  if (existing) {
    return `MVM-${year}-${String(count + Math.floor(Math.random() * 1000) + 1).padStart(6, '0')}`;
  }
  return candidate;
};

// @desc    Get user's certificates
// @route   GET /api/certificates/my
// @access  Private
const getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({ user: req.user._id, isRevoked: false })
    .sort({ issuedAt: -1 });
  res.json({ success: true, count: certificates.length, certificates });
});

// @desc    Check which certificate types user is eligible for
// @route   GET /api/certificates/eligibility
// @access  Private
const checkEligibility = asyncHandler(async (req, res) => {
  const user = req.user;
  const existingCerts = await Certificate.find({ user: user._id, isRevoked: false }).select('type');
  const existingTypes = new Set(existingCerts.map(c => c.type));

  const eligibility = Object.entries(CERTIFICATE_TYPES).map(([type, def]) => ({
    type,
    name: def.name,
    achievement: def.achievement,
    icon: def.icon,
    eligible: def.check(user),
    alreadyEarned: existingTypes.has(type),
    // Progress info
    progress: getProgress(type, user),
  }));

  res.json({ success: true, eligibility });
});

const getProgress = (type, user) => {
  switch (type) {
    case 'MINUTES_50': return { current: user.verifiedMinutes, target: 50 };
    case 'MINUTES_100': return { current: user.verifiedMinutes, target: 100 };
    case 'TASKS_10': return { current: user.tasksCompleted, target: 10 };
    case 'TASKS_25': return { current: user.tasksCompleted, target: 25 };
    case 'CHAMPION': return { current: Math.min(user.tasksCompleted / 25, user.verifiedMinutes / 300), target: 1 };
    case 'STREAK_7': return { current: user.streak?.current || 0, target: 7 };
    default: return { current: 0, target: 1 };
  }
};

// @desc    Generate a certificate
// @route   POST /api/certificates/generate
// @access  Private
const generateCertificate = asyncHandler(async (req, res) => {
  const { type } = req.body;
  const user = req.user;

  if (!CERTIFICATE_TYPES[type]) {
    res.status(400);
    throw new Error('Invalid certificate type');
  }

  // Check eligibility
  if (!CERTIFICATE_TYPES[type].check(user)) {
    res.status(400);
    throw new Error(`You have not yet met the requirements for the "${CERTIFICATE_TYPES[type].name}" certificate.`);
  }

  // Check if already generated
  const existing = await Certificate.findOne({ user: user._id, type, isRevoked: false });
  if (existing) {
    return res.json({ success: true, certificate: existing, message: 'Certificate already issued' });
  }

  const verificationId = await generateVerificationId();
  const certDef = CERTIFICATE_TYPES[type];

  const certificate = await Certificate.create({
    user: user._id,
    verificationId,
    type,
    volunteerName: user.name,
    achievement: certDef.achievement,
    tasksCompleted: user.tasksCompleted,
    volunteerMinutes: user.verifiedMinutes,
    issuedAt: new Date(),
  });

  res.status(201).json({ success: true, certificate });
});

// @desc    Verify a certificate (public)
// @route   GET /api/certificates/:verificationId/verify
// @access  Public
const verifyCertificate = asyncHandler(async (req, res) => {
  const { verificationId } = req.params;
  const certificate = await Certificate.findOne({ verificationId });

  if (!certificate) {
    return res.json({
      success: true,
      valid: false,
      message: 'No certificate found with this verification ID',
    });
  }

  if (certificate.isRevoked) {
    return res.json({ success: true, valid: false, message: 'This certificate has been revoked' });
  }

  res.json({
    success: true,
    valid: true,
    certificate: {
      verificationId: certificate.verificationId,
      volunteerName: certificate.volunteerName,
      achievement: certificate.achievement,
      type: certificate.type,
      tasksCompleted: certificate.tasksCompleted,
      volunteerMinutes: certificate.volunteerMinutes,
      issuedAt: certificate.issuedAt,
      platform: 'Micro-Volunteer Match',
    },
  });
});

// @desc    Get all certificates (Admin)
// @route   GET /api/admin/certificates
// @access  Private (Admin)
const getAllCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({})
    .populate('user', 'name email avatar')
    .sort({ issuedAt: -1 })
    .limit(100);
  res.json({ success: true, count: certificates.length, certificates });
});

module.exports = {
  getMyCertificates,
  checkEligibility,
  generateCertificate,
  verifyCertificate,
  getAllCertificates,
};
