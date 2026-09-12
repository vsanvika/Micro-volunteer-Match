const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: String,
    icon: {
      type: String,
      default: 'Sparkles',
    },
    color: {
      type: String,
      default: '#10b981',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
