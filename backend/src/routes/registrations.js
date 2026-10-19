'use strict';

const express = require('express');
const router = express.Router();
const {
  createRegistration, listRegistrations, getRegistration,
  submitRegistration, uploadDocument,
} = require('../controllers/registrationController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

router.get('/', requireRole('peserta'), listRegistrations);
router.post('/', requireRole('peserta'), createRegistration);
router.get('/:id', getRegistration);  // admin/petugas can also view
router.post('/:id/submit', requireRole('peserta'), submitRegistration);
router.post('/:id/documents', requireRole('peserta'), uploadDocument);
router.post('/:id/passengers/:passengerId/documents', requireRole('peserta'), uploadDocument);

module.exports = router;
