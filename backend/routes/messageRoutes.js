const express = require('express');
const router = express.Router();
const { getTaskMessages, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/task/:taskId', protect, getTaskMessages);
router.post('/', protect, sendMessage);

module.exports = router;
