const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'micro_volunteer_match_hackathon_super_secret_jwt_key_2026', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, skills, interests, bio, availableMinutes, preferredMode, organizationName } = req.body;

  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role || 'volunteer',
    skills: skills || [],
    interests: interests || [],
    bio: bio || '',
    availableMinutes: availableMinutes || 15,
    preferredMode: preferredMode || 'both',
    organizationName: organizationName || '',
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
  });

  if (user) {
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills,
        interests: user.interests,
        availableMinutes: user.availableMinutes,
        points: user.points,
        volunteerMinutes: user.volunteerMinutes,
        tasksCompleted: user.tasksCompleted,
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (user && (await user.matchPassword(password))) {
    if (user.isSuspended) {
      res.status(403);
      throw new Error('Account has been suspended by admin.');
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills,
        interests: user.interests,
        availableMinutes: user.availableMinutes,
        preferredMode: user.preferredMode,
        points: user.points,
        volunteerMinutes: user.volunteerMinutes,
        tasksCompleted: user.tasksCompleted,
        streak: user.streak,
        rating: user.rating,
      },
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    user,
  });
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
