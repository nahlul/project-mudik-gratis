'use strict';

const express = require('express');
const router = express.Router();
const {
  listFamilyMembers, createFamilyMember, getFamilyMember,
  updateFamilyMember, deleteFamilyMember, familyMemberValidation,
} = require('../controllers/familyController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate, requireRole('peserta'));

router.get('/', listFamilyMembers);
router.post('/', familyMemberValidation, createFamilyMember);
router.get('/:id', getFamilyMember);
router.patch('/:id', familyMemberValidation, updateFamilyMember);
router.delete('/:id', deleteFamilyMember);

module.exports = router;
