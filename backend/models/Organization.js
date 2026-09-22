const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    website: { type: String, default: '' },
    logo: { type: String, default: '' },
    category: { type: String, default: 'Community' },
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'],
      default: 'NONE',
    },
    location: {
      city: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },
    tasksPosted: { type: Number, default: 0 },
    totalVolunteers: { type: Number, default: 0 },
    totalImpactMinutes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

organizationSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('Organization', organizationSchema);
