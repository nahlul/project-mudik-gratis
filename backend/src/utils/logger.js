'use strict';

const path = require('path');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, errors } = format;

const logsDir = path.resolve(__dirname, '../../logs');

// Redact sensitive fields from log messages
function redact(msg) {
  if (typeof msg !== 'string') return msg;
  return msg
    .replace(/"password[^"]*":\s*"[^"]*"/gi, '"password":"[REDACTED]"')
    .replace(/"password_hash":\s*"[^"]*"/gi, '"password_hash":"[REDACTED]"')
    .replace(/"token":\s*"[^"]*"/gi, '"token":"[REDACTED]"')
    .replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]')
    .replace(/"nik":\s*"\d+"/gi, '"nik":"[REDACTED]"');
}

const logFormat = printf(({ level, message, timestamp: ts, stack }) => {
  const msg = stack || message;
  return `[${ts}] ${level.toUpperCase()}: ${redact(String(msg))}`;
});

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    new transports.File({
      filename: path.join(logsDir, 'app.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
    }),
    new transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'HH:mm:ss' }),
      errors({ stack: true }),
      logFormat
    ),
  }));
}

module.exports = logger;
