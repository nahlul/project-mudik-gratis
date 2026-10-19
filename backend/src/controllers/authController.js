'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { query, withTransaction } = require('../config/database');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

const SALT_ROUNDS = 12;

function signToken(userId) {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Nama lengkap wajib diisi').isLength({ max: 255 }),
  body('email').isEmail().withMessage('Format email tidak valid').normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Kata sandi minimal 6 karakter'),
  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^[0-9+\s-]{8,20}$/)
    .withMessage('Format nomor HP tidak valid (contoh: 08123456789)'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 422, errors.array());
    }

    const { name, email, password, phone } = req.body;

    // Check duplicate email
    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return error(res, 'Email already registered', 409);
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    let userId;
    await withTransaction(async (conn) => {
      const [result] = await conn.execute(
        'INSERT INTO users (name, email, password_hash, phone, status) VALUES (?, ?, ?, ?, ?)',
        [name, email, password_hash, phone || null, 'active']
      );
      userId = result.insertId;

      // Assign 'peserta' role
      const [roles] = await conn.execute('SELECT id FROM roles WHERE name = ?', ['peserta']);
      if (roles.length) {
        await conn.execute('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, roles[0].id]);
      }

      // Create welcome notification
      await conn.execute(
        `INSERT INTO notifications (user_id, channel, event_type, title, message, delivery_status)
         VALUES (?, 'internal', 'user.registered', ?, ?, 'sent')`,
        [userId, 'Selamat Datang!', `Halo ${name}, akun Anda telah berhasil dibuat. Silakan lengkapi data dan daftar program Mudik Gratis Aceh.`]
      );

      // Activity log
      await conn.execute(
        `INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, ip_address)
         VALUES (?, 'user.registered', 'users', ?, ?)`,
        [userId, userId, req.ip]
      );
    });

    const token = signToken(userId);
    const user = await query('SELECT id, name, email, phone, status, created_at FROM users WHERE id = ?', [userId]);

    logger.info(`User registered: ${email}`);
    return success(res, { token, user: user[0] }, 'Registration successful', 201);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 422, errors.array());
    }

    const { email, password } = req.body;

    const users = await query(
      'SELECT id, name, email, password_hash, phone, status, created_at FROM users WHERE email = ?',
      [email]
    );

    if (!users.length) {
      return error(res, 'Invalid email or password', 401);
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      await query(
        `INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, ip_address)
         VALUES (?, 'auth.login_failed', 'users', ?, ?)`,
        [null, user.id, req.ip]
      );
      return error(res, 'Invalid email or password', 401);
    }

    if (user.status !== 'active') {
      return error(res, `Account is ${user.status}. Please contact administrator.`, 403);
    }

    const roles = await query(
      `SELECT r.id, r.name FROM roles r
       INNER JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [user.id]
    );

    const token = signToken(user.id);
    delete user.password_hash;
    user.roles = roles;

    await query(
      `INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, ip_address)
       VALUES (?, 'auth.login', 'users', ?, ?)`,
      [user.id, user.id, req.ip]
    );

    logger.info(`User logged in: ${email}`);
    return success(res, { token, user }, 'Login successful');
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  return success(res, null, 'Logged out successfully');
}

async function me(req, res, next) {
  try {
    const users = await query(
      'SELECT id, name, email, phone, status, email_verified_at, created_at, updated_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!users.length) return error(res, 'User not found', 404);

    const user = users[0];
    const roles = await query(
      `SELECT r.id, r.name FROM roles r
       INNER JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [user.id]
    );
    user.roles = roles;

    return success(res, { user }, 'User info retrieved');
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return error(res, 'Email is required', 422);

    const users = await query('SELECT id, email FROM users WHERE email = ?', [email]);
    // Always return success to prevent email enumeration
    if (users.length) {
      const resetToken = uuidv4();
      await query(
        `INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, ip_address)
         VALUES (?, 'auth.password_reset_requested', 'users', ?, ?)`,
        [users[0].id, users[0].id, req.ip]
      );
      logger.info(`Password reset requested for: ${email}, token: ${resetToken}`);
    }

    return success(res, null, 'If the email exists, a reset link has been sent.');
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return error(res, 'Token and password are required', 422);
    }
    // Placeholder: in production, validate token from a password_resets table
    return error(res, 'Password reset via token is not yet fully implemented. Contact administrator.', 501);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  logout,
  me,
  forgotPassword,
  resetPassword,
  registerValidation,
  loginValidation,
};
