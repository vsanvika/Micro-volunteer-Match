const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
    },
    aliases: [String], // Normalized alternatives e.g. ["JS", "JavaScript", "ECMAScript"]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Skill', skillSchema);
