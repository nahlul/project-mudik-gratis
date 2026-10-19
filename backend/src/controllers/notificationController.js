'use strict';

const { query } = require('../config/database');
const { success, error } = require('../utils/response');

async function listNotifications(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const notifications = await query(
      `SELECT id, channel, event_type, title, message, is_read, delivery_status, sent_at, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, limit, offset]
    );

    const [{ total }] = await query(
      `SELECT COUNT(*) as total FROM notifications WHERE user_id = ?`,
      [req.user.id]
    );

    const [{ unread }] = await query(
      'SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );

    return success(res, { notifications, unread, total, page, limit }, 'Notifications retrieved');
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const notifs = await query(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (!notifs.length) return error(res, 'Notification not found', 404);

    await query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    return success(res, null, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    await query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    return success(res, null, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
}

module.exports = { listNotifications, markAsRead, markAllAsRead };
