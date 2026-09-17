const express = require('express');
const router = express.Router();
const { getTaskMessages, getInbox, clearConversation, sendMessage, createCallLog, updateCallStatus } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/task/:taskId', protect, getTaskMessages);
router.get('/inbox', protect, getInbox);
router.delete('/task/:taskId/conversation/:recipientId', protect, clearConversation);
router.post('/call-log', protect, createCallLog);
router.post('/', protect, sendMessage);
router.put('/:id/call-status', protect, updateCallStatus);

module.exports = router;
