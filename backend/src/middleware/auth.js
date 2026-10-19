'use strict';

const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { error } = require('../utils/response');

/**
 * Authenticate: verify JWT from Authorization Bearer header.
 * Attaches req.user = { id, name, email, status, roles: [string] }
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Authentication required', 401);
  }

  const token = authHeader.slice(7);
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token expired', 401);
    }
    return error(res, 'Invalid token', 401);
  }

  try {
    const users = await query(
      'SELECT id, name, email, status FROM users WHERE id = ?',
      [payload.sub]
    );
    if (!users.length) return error(res, 'User not found', 401);

    const user = users[0];
    if (user.status !== 'active') {
      return error(res, 'Account is not active', 403);
    }

    const roles = await query(
      `SELECT r.name FROM roles r
       INNER JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [user.id]
    );
    user.roles = roles.map(r => r.name);
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * requireRole: checks that req.user has at least one of the specified roles.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return error(res, 'Authentication required', 401);
    const hasRole = roles.some(role => req.user.roles.includes(role));
    if (!hasRole) {
      return error(res, 'Insufficient permissions', 403);
    }
    next();
  };
}

/**
 * optionalAuth: try to authenticate but don't fail if no token or invalid.
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const users = await query(
      'SELECT id, name, email, status FROM users WHERE id = ?',
      [payload.sub]
    );
    if (users.length && users[0].status === 'active') {
      const roles = await query(
        `SELECT r.name FROM roles r
         INNER JOIN user_roles ur ON ur.role_id = r.id
         WHERE ur.user_id = ?`,
        [users[0].id]
      );
      req.user = { ...users[0], roles: roles.map(r => r.name) };
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }
  next();
}

module.exports = { authenticate, requireRole, optionalAuth };
