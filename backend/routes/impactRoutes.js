const express = require('express');
const router = express.Router();
const { getImpactAnalytics, getImpactMapData, getVolunteerAnalytics } = require('../controllers/impactController');
const { protect } = require('../middleware/auth');

router.get('/impact', getImpactAnalytics);
router.get('/map', getImpactMapData);
router.get('/volunteer/:userId', protect, getVolunteerAnalytics);

module.exports = router;
