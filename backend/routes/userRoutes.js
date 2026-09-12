const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getPublicUser,
  saveTask,
  getSavedTasks,
  getLearningGoals,
  updateLearningGoals,
  extractSkillsForProfile,
  getUserReputation,
  saveResumeDescription,
  deleteResumeDescription,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/saved-tasks', protect, getSavedTasks);
router.post('/saved-tasks/:taskId', protect, saveTask);
router.get('/learning-goals', protect, getLearningGoals);
router.put('/learning-goals', protect, updateLearningGoals);
router.post('/skills/extract', protect, extractSkillsForProfile);
router.put('/resume-descriptions', protect, saveResumeDescription);
router.delete('/resume-descriptions/:index', protect, deleteResumeDescription);
router.get('/reputation/:userId', getUserReputation);
router.get('/:id/public', getPublicUser);

module.exports = router;
