const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  getRecommendationSectionsHandler,
  getQuickTasks,
  getTimeBasedMatches,
  getLearningRecommendations,
} = require('../controllers/matchingController');
const { protect, optionalAuth } = require('../middleware/auth');

// Existing routes (backward compat)
router.get('/recommendations', protect, getRecommendations);
router.get('/time-filter', optionalAuth, getTimeBasedMatches);

// New routes
router.get('/quick', optionalAuth, getQuickTasks);
router.get('/sections', protect, getRecommendationSectionsHandler);
router.get('/learning', protect, getLearningRecommendations);

module.exports = router;
