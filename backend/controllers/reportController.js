const asyncHandler = require('express-async-handler');
const Report = require('../models/Report');

// @desc    Submit a safety/abuse report
// @route   POST /api/reports
// @access  Private
const createReport = asyncHandler(async (req, res) => {
  const { targetType, targetId, reason, description } = req.body;

  if (!targetType || !targetId || !reason) {
    res.status(400);
    throw new Error('Please fill all required report fields');
  }

  const report = await Report.create({
    reporter: req.user._id,
    targetType,
    targetId,
    reason,
    description: description || '',
  });

  res.status(201).json({
    success: true,
    message: 'Report submitted successfully. Thank you for keeping our community safe!',
    report,
  });
});

module.exports = {
  createReport,
};
