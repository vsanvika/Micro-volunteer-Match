const express = require('express');
const router = express.Router();
const {
  getMyCertificates,
  checkEligibility,
  generateCertificate,
  verifyCertificate,
} = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');

router.get('/my', protect, getMyCertificates);
router.get('/eligibility', protect, checkEligibility);
router.post('/generate', protect, generateCertificate);
router.get('/:verificationId/verify', verifyCertificate);

module.exports = router;
