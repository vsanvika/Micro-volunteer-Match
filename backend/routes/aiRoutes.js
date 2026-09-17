const express = require('express');
const router = express.Router();
const {
  handleAiAssistant,
  handleSmartTaskCreator,
  handleTaskBreakdown,
  handleExtractSkills,
  handleResumeBuilder,
  handleGoalPlan,
} = require('../controllers/aiController');
const { protect, optionalAuth } = require('../middleware/auth');

router.post('/assistant', optionalAuth, handleAiAssistant);
router.post('/smart-task-creator', protect, handleSmartTaskCreator);
router.post('/task-breakdown', protect, handleTaskBreakdown);
router.post('/extract-skills', optionalAuth, handleExtractSkills);
router.post('/resume-builder', protect, handleResumeBuilder);
router.post('/goal-plan', protect, handleGoalPlan);

module.exports = router;
