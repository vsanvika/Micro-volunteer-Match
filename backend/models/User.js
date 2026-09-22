const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['volunteer', 'requester', 'admin'],
      default: 'volunteer',
    },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    organizationName: { type: String, default: '' },

    // Skills with proficiency
    skills: [
      {
        name: String,
        proficiency: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Expert'],
          default: 'Intermediate',
        },
      },
    ],
    interests: [String],

    // Availability
    availableMinutes: { type: Number, default: 15 },
    preferredMode: {
      type: String,
      enum: ['online', 'in-person', 'both'],
      default: 'both',
    },

    // Gamification
    points: { type: Number, default: 0 },
    volunteerMinutes: { type: Number, default: 0 },
    verifiedMinutes: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    totalPeopleHelped: { type: Number, default: 0 },
    streak: {
      current: { type: Number, default: 0 },
      lastActiveDate: { type: Date },
    },
    rating: {
      average: { type: Number, default: 5.0 },
      count: { type: Number, default: 0 },
    },

    // Trust & Reputation
    trustScore: { type: Number, default: 100 },
    completionRate: { type: Number, default: 100 },
    cancellationCount: { type: Number, default: 0 },
    impactScore: { type: Number, default: 0 },

    // Learning Goals (for skill-gap feature)
    learningGoals: [
      {
        skill: String,
        priority: {
          type: String,
          enum: ['Low', 'Medium', 'High'],
          default: 'Medium',
        },
      },
    ],

    // Portfolio
    portfolioPublic: { type: Boolean, default: true },
    portfolioUsername: { type: String, trim: true, lowercase: true },
    categoriesContributed: [String],
    resumeDescriptions: [
      {
        title: String,
        content: String,
        generatedAt: { type: Date, default: Date.now },
      },
    ],

    // Monthly Goal Planner
    monthlyGoal: {
      targetTasks: { type: Number, default: 0 },
      targetMinutes: { type: Number, default: 0 },
      month: { type: String, default: '' },
      weekPlan: [{ week: Number, targetTasks: Number }],
      currentProgress: { type: Number, default: 0 },
    },

    // Localization
    language: { type: String, enum: ['en', 'te', 'hi'], default: 'en' },

    // Location (approximate, for map)
    location: {
      city: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },

    isSuspended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Sparse index for portfolioUsername
userSchema.index({ portfolioUsername: 1 }, { sparse: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
