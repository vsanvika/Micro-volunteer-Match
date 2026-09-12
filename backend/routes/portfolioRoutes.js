const express = require('express');
const router = express.Router();
const { getPublicPortfolio, getMyPortfolio, updatePortfolioSettings } = require('../controllers/portfolioController');
const { protect } = require('../middleware/auth');

router.get('/me', protect, getMyPortfolio);
router.put('/settings', protect, updatePortfolioSettings);
router.get('/:username', getPublicPortfolio);

module.exports = router;
