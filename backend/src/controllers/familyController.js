'use strict';

const { body, validationResult } = require('express-validator');
const { query, pool } = require('../config/database');
const { success, error } = require('../utils/response');

const familyMemberValidation = [
  body('full_name').trim().notEmpty().withMessage('Full name is required').isLength({ max: 255 }),
  body('birth_date').isDate().withMessage('Valid birth date (YYYY-MM-DD) is required'),
  body('gender').isIn(['L', 'P']).withMessage('Gender must be L or P'),
  body('identity_type').isIn(['KTP', 'KIA', 'KK']).withMessage('Identity type must be KTP, KIA, or KK'),
  body('nik').optional({ nullable: true }).isLength({ min: 16, max: 16 }).withMessage('NIK must be 16 digits'),
  body('phone').optional({ nullable: true }).isLength({ max: 20 }),
  body('domicile_address').trim().notEmpty().withMessage('Domicile address is required'),
];

async function listFamilyMembers(req, res, next) {
  try {
    const members = await query(
      'SELECT id, full_name, birth_date, gender, identity_type, phone, domicile_address, created_at, updated_at FROM family_members WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    return success(res, members, 'Family members retrieved');
  } catch (err) {
    next(err);
  }
}

async function createFamilyMember(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return error(res, 'Validation failed', 422, errors.array());

    const { full_name, nik, birth_date, gender, identity_type, phone, domicile_address } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO family_members (user_id, full_name, nik, birth_date, gender, identity_type, phone, domicile_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, full_name, nik || null, birth_date, gender, identity_type, phone || null, domicile_address]
    );

    const member = await query('SELECT * FROM family_members WHERE id = ?', [result.insertId]);
    return success(res, member[0], 'Family member created', 201);
  } catch (err) {
    next(err);
  }
}

async function getFamilyMember(req, res, next) {
  try {
    const { id } = req.params;
    const members = await query(
      'SELECT * FROM family_members WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (!members.length) return error(res, 'Family member not found', 404);
    return success(res, members[0], 'Family member retrieved');
  } catch (err) {
    next(err);
  }
}

async function updateFamilyMember(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return error(res, 'Validation failed', 422, errors.array());

    const { id } = req.params;
    const members = await query(
      'SELECT id FROM family_members WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (!members.length) return error(res, 'Family member not found', 404);

    const { full_name, nik, birth_date, gender, identity_type, phone, domicile_address } = req.body;
    await pool.execute(
      `UPDATE family_members SET full_name=?, nik=?, birth_date=?, gender=?, identity_type=?, phone=?, domicile_address=?
       WHERE id = ? AND user_id = ?`,
      [full_name, nik || null, birth_date, gender, identity_type, phone || null, domicile_address, id, req.user.id]
    );

    const updated = await query('SELECT * FROM family_members WHERE id = ?', [id]);
    return success(res, updated[0], 'Family member updated');
  } catch (err) {
    next(err);
  }
}

async function deleteFamilyMember(req, res, next) {
  try {
    const { id } = req.params;
    const members = await query(
      'SELECT id FROM family_members WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (!members.length) return error(res, 'Family member not found', 404);

    // Check if in active registration
    const activeRegs = await query(
      `SELECT rp.id FROM registration_passengers rp
       INNER JOIN registrations r ON r.id = rp.registration_id
       WHERE rp.family_member_id = ?
         AND r.status NOT IN ('rejected','cancelled')`,
      [id]
    );
    if (activeRegs.length) {
      return error(res, 'Cannot delete: family member is part of an active registration', 409);
    }

    await pool.execute('DELETE FROM family_members WHERE id = ? AND user_id = ?', [id, req.user.id]);
    return success(res, null, 'Family member deleted');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listFamilyMembers,
  createFamilyMember,
  getFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  familyMemberValidation,
};
