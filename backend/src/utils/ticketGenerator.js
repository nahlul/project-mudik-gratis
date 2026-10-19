'use strict';

const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Generate a ticket number: MG-YYYYMMDD-RANDOM6
 */
function generateTicketNumber() {
  const now = new Date();
  const yyyymmdd = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `MG-${yyyymmdd}-${random}`;
}

/**
 * Generate a verification code: 16 char hex + its bcrypt hash
 * @returns {Promise<{code: string, hash: string}>}
 */
async function generateVerificationCode() {
  const code = crypto.randomBytes(8).toString('hex').toUpperCase();
  const hash = await bcrypt.hash(code, 10);
  return { code, hash };
}

/**
 * Generate a registration number: REG-YYYYMMDD-RANDOM6
 */
function generateRegistrationNumber() {
  const now = new Date();
  const yyyymmdd = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `REG-${yyyymmdd}-${random}`;
}

module.exports = { generateTicketNumber, generateVerificationCode, generateRegistrationNumber };
