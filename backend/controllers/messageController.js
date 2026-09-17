const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { sendChatMessageToRoom, sendChatClearedToRoom, sendNotificationToUser } = require('../services/socketService');

const callTypes = ['VOICE_CALL', 'VIDEO_CALL'];

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

// @desc    Get the current user's latest direct messages grouped by task/contact
// @route   GET /api/messages/inbox
// @access  Private
const getInbox = asyncHandler(async (req, res) => {
  const messages = await Message.find({
    $or: [{ sender: req.user._id }, { recipient: req.user._id }],
  })
    .populate('sender', 'name avatar role')
    .populate('recipient', 'name avatar role')
    .populate('task', 'title requester assignedVolunteers')
    .sort({ createdAt: -1 });

  const conversations = [];
  const seen = new Set();
  for (const message of messages) {
    const otherUser = message.sender._id.toString() === req.user._id.toString()
      ? message.recipient
      : message.sender;
    const key = `${message.task._id.toString()}:${otherUser._id.toString()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    conversations.push({
      ...message.toObject(),
      otherUser,
      unread: message.recipient._id.toString() === req.user._id.toString() && !message.isRead,
    });
  }

  res.json({ success: true, count: conversations.length, conversations });
});

// @desc    Clear the current task conversation with another participant
// @route   DELETE /api/messages/task/:taskId/conversation/:recipientId
// @access  Private
const clearConversation = asyncHandler(async (req, res) => {
  const { taskId, recipientId } = req.params;
  const participantQuery = {
    task: taskId,
    $or: [
      { sender: req.user._id, recipient: recipientId },
      { sender: recipientId, recipient: req.user._id },
    ],
  };
  const result = await Message.deleteMany(participantQuery);
  sendChatClearedToRoom(taskId, req.user._id);
  res.json({ success: true, deletedCount: result.deletedCount });
});

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { taskId, recipientId, content = '', type = 'TEXT', attachment } = req.body;

  if (!taskId || !recipientId || (!content.trim() && !attachment?.dataUrl)) {
    res.status(400);
    throw new Error('Please fill all message fields');
  }
  if (!['TEXT', 'FILE', 'VOICE'].includes(type)) {
    res.status(400);
    throw new Error('Invalid message type');
  }
  if (attachment?.dataUrl && attachment.dataUrl.length > 8 * 1024 * 1024) {
    res.status(413);
    throw new Error('Attachment is too large. Please keep files under 6 MB.');
  }

  const message = await Message.create({
    task: taskId,
    sender: req.user._id,
    recipient: recipientId,
    content: content.trim(),
    type,
    attachment: attachment || undefined,
  });

  const populated = await Message.findById(message._id)
    .populate('sender', 'name avatar role')
    .populate('recipient', 'name avatar role');

  sendChatMessageToRoom(taskId, populated);

  const notif = await Notification.create({
    user: recipientId,
    title: `New Message from ${req.user.name} 💬`,
    message: type === 'VOICE' ? 'Sent a voice note' : type === 'FILE' ? `Sent a file: ${attachment?.name || 'attachment'}` : (content.length > 50 ? `${content.substring(0, 47)}...` : content),
    type: 'MESSAGE',
    link: `/messages?task=${taskId}`,
  });
  sendNotificationToUser(recipientId, notif);

  res.status(201).json({ success: true, message: populated });
});

// @desc    Create a persistent voice/video call entry
// @route   POST /api/messages/call-log
// @access  Private
const createCallLog = asyncHandler(async (req, res) => {
  const { taskId, recipientId, type } = req.body;
  if (!taskId || !recipientId || !callTypes.includes(type)) {
    res.status(400); throw new Error('Invalid call details');
  }

  const message = await Message.create({
    task: taskId,
    sender: req.user._id,
    recipient: recipientId,
    type,
    content: type === 'VIDEO_CALL' ? 'Video call' : 'Voice call',
    callStatus: 'RINGING',
    callStartedAt: new Date(),
  });
  const populated = await Message.findById(message._id)
    .populate('sender', 'name avatar role')
    .populate('recipient', 'name avatar role');
  sendChatMessageToRoom(taskId, populated);
  res.status(201).json({ success: true, message: populated });
});

// @desc    Update a call entry after answer or missed call
// @route   PUT /api/messages/:id/call-status
// @access  Private
const updateCallStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['ANSWERED', 'MISSED'].includes(status)) {
    res.status(400); throw new Error('Invalid call status');
  }
  const message = await Message.findById(req.params.id);
  if (!message || !callTypes.includes(message.type)) {
    res.status(404); throw new Error('Call record not found');
  }
  const isParticipant = [message.sender.toString(), message.recipient.toString()]
    .includes(req.user._id.toString());
  if (!isParticipant) {
    res.status(403); throw new Error('Not authorized to update this call');
  }
  if (message.callStatus === 'ANSWERED' && status === 'MISSED') {
    return res.json({ success: true, message });
  }
  message.callStatus = status;
  message.callEndedAt = status === 'MISSED' ? new Date() : undefined;
  await message.save();
  const populated = await Message.findById(message._id)
    .populate('sender', 'name avatar role')
    .populate('recipient', 'name avatar role');
  sendChatMessageToRoom(message.task, populated);
  res.json({ success: true, message: populated });
});

module.exports = {
  getTaskMessages,
  getInbox,
  clearConversation,
  sendMessage,
  createCallLog,
  updateCallStatus,
};
