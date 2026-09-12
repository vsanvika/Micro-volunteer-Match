const express = require('express');
const router = express.Router();
const { getLeaderboard, getUserBadges, getTrustScore } = require('../controllers/gamificationController');
const { protect } = require('../middleware/auth');

router.get('/leaderboard', getLeaderboard);
router.get('/badges', protect, getUserBadges);
router.get('/reputation/:userId', getTrustScore);

module.exports = router;
