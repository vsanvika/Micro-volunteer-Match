const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  toggleSuspendUser,
  getReports,
  updateReportStatus,
  createCategory,
  createChallenge,
  getAllOrganizations,
  verifyOrganization,
  getAllCertificates,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-suspend', toggleSuspendUser);
router.get('/reports', getReports);
router.put('/reports/:id', updateReportStatus);
router.post('/categories', createCategory);

// New admin routes
router.post('/challenges', createChallenge);
router.get('/organizations', getAllOrganizations);
router.put('/organizations/:id/verify', verifyOrganization);
router.get('/certificates', getAllCertificates);

module.exports = router;
