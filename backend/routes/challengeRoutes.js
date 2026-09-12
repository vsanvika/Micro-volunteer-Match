const express = require('express');
const router = express.Router();
const { getActiveChallenges, getMyChallengeProgress, createChallenge } = require('../controllers/challengeController');
const { protect } = require('../middleware/auth');

router.get('/', getActiveChallenges);
router.get('/my-progress', protect, getMyChallengeProgress);

module.exports = router;
