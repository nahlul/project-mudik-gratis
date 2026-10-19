'use strict';

const express = require('express');
const router = express.Router();
const { rateLimit } = require('express-rate-limit');
const {
  register, login, logout, me, forgotPassword, resetPassword,
  registerValidation, loginValidation,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
