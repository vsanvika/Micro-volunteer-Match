const express = require('express');
const router = express.Router();
const {
  createOrganization,
  getMyOrganization,
  getOrganization,
  updateOrganization,
  requestVerification,
} = require('../controllers/organizationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/my', protect, getMyOrganization);
router.post('/', protect, authorize('requester', 'admin'), createOrganization);
router.get('/:id', getOrganization);
router.put('/:id', protect, updateOrganization);
router.post('/:id/request-verification', protect, requestVerification);

module.exports = router;
