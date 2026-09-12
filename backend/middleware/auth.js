const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'micro_volunteer_match_hackathon_super_secret_jwt_key_2026');
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        res.status(401);
        throw new Error('User not found with this token');
      }

      if (req.user.isSuspended) {
        res.status(403);
        throw new Error('Account has been suspended. Please contact administrator.');
      }

      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`User role '${req.user?.role}' is not authorized to access this route`);
    }
    next();
  };
};

const optionalAuth = asyncHandler(async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'micro_volunteer_match_hackathon_super_secret_jwt_key_2026');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      req.user = null;
    }
  }
  next();
});

module.exports = { protect, authorize, optionalAuth };
