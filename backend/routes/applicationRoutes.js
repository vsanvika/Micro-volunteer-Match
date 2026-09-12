const express = require('express');
const router = express.Router();
const {
  applyForTask,
  getTaskApplications,
  updateApplicationStatus,
  completeTask,
  confirmTaskCompletion,
  joinTeamRole,
  getMyApplications,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/my-applications', protect, getMyApplications);
router.post('/tasks/:id/apply', protect, authorize('volunteer', 'admin'), applyForTask);
router.get('/tasks/:id/applications', protect, getTaskApplications);
router.put('/:id', protect, updateApplicationStatus);
router.post('/tasks/:id/complete', protect, completeTask);
router.post('/tasks/:id/confirm', protect, confirmTaskCompletion);
router.post('/tasks/:id/team/join', protect, authorize('volunteer', 'admin'), joinTeamRole);

module.exports = router;
