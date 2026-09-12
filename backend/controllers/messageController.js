const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { sendChatMessageToRoom, sendNotificationToUser } = require('../services/socketService');

// @desc    Get messages for a task
// @route   GET /api/messages/task/:taskId
// @access  Private
const getTaskMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ task: req.params.taskId })
    .populate('sender', 'name avatar role')
    .populate('recipient', 'name avatar role')
    .sort({ createdAt: 1 });

  res.json({ success: true, count: messages.length, messages });
});

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { taskId, recipientId, content } = req.body;

  if (!taskId || !recipientId || !content) {
    res.status(400);
    throw new Error('Please fill all message fields');
  }

  const message = await Message.create({
    task: taskId,
    sender: req.user._id,
    recipient: recipientId,
    content,
  });

  const populated = await Message.findById(message._id)
    .populate('sender', 'name avatar role')
    .populate('recipient', 'name avatar role');

  sendChatMessageToRoom(taskId, populated);

  const notif = await Notification.create({
    user: recipientId,
    title: `New Message from ${req.user.name} 💬`,
    message: content.length > 50 ? `${content.substring(0, 47)}...` : content,
    type: 'MESSAGE',
    link: `/messages?task=${taskId}`,
  });
  sendNotificationToUser(recipientId, notif);

  res.status(201).json({ success: true, message: populated });
});

module.exports = {
  getTaskMessages,
  sendMessage,
};
