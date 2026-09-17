const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['TEXT', 'FILE', 'VOICE', 'VOICE_CALL', 'VIDEO_CALL'],
      default: 'TEXT',
    },
    callStatus: {
      type: String,
      enum: ['RINGING', 'ANSWERED', 'MISSED'],
      default: undefined,
    },
    callStartedAt: { type: Date },
    callEndedAt: { type: Date },
    attachment: {
      name: { type: String, default: '' },
      mimeType: { type: String, default: '' },
      dataUrl: { type: String, default: '' },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
