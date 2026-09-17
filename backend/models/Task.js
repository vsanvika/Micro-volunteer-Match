const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a task title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
    },
    requiredSkills: [String],
    estimatedDuration: {
      type: Number,
      required: [true, 'Please specify duration in minutes'],
      default: 15,
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    locationMode: {
      type: String,
      enum: ['online', 'offline', 'in-person'],
      default: 'online',
    },
    locationAddress: { type: String, default: '' },
    completionLocation: { type: String, default: '' },
    locationCoordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    deadline: { type: Date },
    requiredVolunteers: { type: Number, default: 1 },
    assignedVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['OPEN','APPLIED','ACCEPTED','IN_PROGRESS','COMPLETED','CONFIRMED','CANCELLED','EXPIRED','REJECTED'],
      default: 'OPEN',
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },
    views: { type: Number, default: 0 },
    verifiedCompletions: { type: Number, default: 0 },
    tags: [String],

    collaboration: {
      notes: { type: String, default: '' },
      checklist: [{
        text: { type: String, trim: true },
        completed: { type: Boolean, default: false },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        updatedAt: { type: Date, default: Date.now },
      }],
    },

    // Team Volunteering
    isTeamTask: { type: Boolean, default: false },
    teamRoles: [
      {
        role: String,
        skillRequired: String,
        filled: { type: Boolean, default: false },
        volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      },
    ],

    // Discovery helpers
    isBeginnerFriendly: { type: Boolean, default: false },
    isSkillLearning: { type: Boolean, default: false },
    skillLearningFor: [String],
  },
  { timestamps: true }
);

taskSchema.index({ category: 1, status: 1, estimatedDuration: 1 });
taskSchema.index({ title: 'text', description: 'text', requiredSkills: 'text' });
taskSchema.index({ isBeginnerFriendly: 1, status: 1 });
taskSchema.index({ isSkillLearning: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);
