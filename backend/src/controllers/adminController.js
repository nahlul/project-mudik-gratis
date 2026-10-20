'use strict';

const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { query, pool, withTransaction } = require('../config/database');
const { success, error, paginate } = require('../utils/response');
const { generateTicketNumber, generateVerificationCode } = require('../utils/ticketGenerator');
const logger = require('../utils/logger');

const STORAGE_PATH = path.resolve(process.env.STORAGE_PATH || './storage/documents');

// ─── REGISTRATIONS ────────────────────────────────────────────────

async function listAdminRegistrations(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const conditions = ['1=1'];
    const params = [];

    if (req.query.status) {
      conditions.push('r.status = ?');
      params.push(req.query.status);
    }
    if (req.query.route_id) {
      conditions.push('ds.route_id = ?');
      params.push(req.query.route_id);
    }
    if (req.query.date) {
      conditions.push('ds.departure_date = ?');
      params.push(req.query.date);
    }
    if (req.query.search) {
      conditions.push('(r.registration_number LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR EXISTS (SELECT 1 FROM registration_passengers rp2 WHERE rp2.registration_id = r.id AND (rp2.full_name LIKE ? OR rp2.nik LIKE ?)))');
      const like = `%${req.query.search}%`;
      params.push(like, like, like, like, like);
    }

    const where = conditions.join(' AND ');

    const countRows = await query(
      `SELECT COUNT(DISTINCT r.id) as total FROM registrations r
       INNER JOIN departure_schedules ds ON ds.id = r.schedule_id
       INNER JOIN users u ON u.id = r.user_id
       WHERE ${where}`,
      params
    );
    const total = parseInt(countRows[0].total, 10);

    const registrations = await query(
      `SELECT r.id, r.registration_number, r.status, r.submitted_at, r.reviewed_at, r.created_at,
         u.name as user_name, u.email as user_email,
         ds.departure_date, ds.departure_time, ds.departure_location,
         rt.origin, rt.destination, rt.route_name,
         COUNT(rp.id) as passenger_count,
         GROUP_CONCAT(rp.full_name SEPARATOR ', ') as passenger_names
       FROM registrations r
       INNER JOIN users u ON u.id = r.user_id
       INNER JOIN departure_schedules ds ON ds.id = r.schedule_id
       INNER JOIN routes rt ON rt.id = ds.route_id
       LEFT JOIN registration_passengers rp ON rp.registration_id = r.id
       WHERE ${where}
       GROUP BY r.id
       ORDER BY r.submitted_at DESC, r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return paginate(res, registrations, total, page, limit);
  } catch (err) {
    next(err);
  }
}

async function getAdminRegistration(req, res, next) {
  try {
    const { id } = req.params;
    const { getRegistrationDetail } = require('./registrationController');
    const detail = await getRegistrationDetail(parseInt(id, 10));
    if (!detail) return error(res, 'Registration not found', 404);

    // Get verification logs
    detail.verification_logs = await query(
      `SELECT vl.*, u.name as admin_name
       FROM verification_logs vl
       INNER JOIN users u ON u.id = vl.admin_id
       WHERE vl.registration_id = ?
       ORDER BY vl.created_at DESC`,
      [id]
    );

    return success(res, detail, 'Registration retrieved');
  } catch (err) {
    next(err);
  }
}

async function approveRegistration(req, res, next) {
  try {
    const { id } = req.params;
    const note = req.body.note || req.body.notes || '';

    const regs = await query(
      "SELECT * FROM registrations WHERE id = ? AND status IN ('submitted', 'need_revision')",
      [id]
    );
    if (!regs.length) return error(res, 'Pendaftaran tidak ditemukan atau tidak dalam status menunggu verifikasi', 404);

    const registration = regs[0];

    await withTransaction(async (conn) => {
      // Set registration to verified
      await conn.execute(
        "UPDATE registrations SET status='verified', reviewed_at=NOW(), reviewed_by=? WHERE id=?",
        [req.user.id, id]
      );

      // Update all passengers to verified
      await conn.execute(
        "UPDATE registration_passengers SET passenger_status='verified' WHERE registration_id=?",
        [id]
      );

      // Get all passengers
      const [passengers] = await conn.execute(
        'SELECT id FROM registration_passengers WHERE registration_id = ?',
        [id]
      );

      const now = new Date();

      // Generate tickets for each passenger
      for (const p of passengers) {
        const ticketNumber = generateTicketNumber();
        const { hash } = await generateVerificationCode();

        await conn.execute(
          `INSERT INTO tickets (ticket_number, verification_code_hash, registration_passenger_id, schedule_id, status, issued_at)
           VALUES (?, ?, ?, ?, 'active', NOW())`,
          [ticketNumber, hash, p.id, registration.schedule_id]
        );
      }

      // Update booked_seats
      await conn.execute(
        `UPDATE departure_schedules SET booked_seats = (
           SELECT COUNT(*) FROM registration_passengers rp
           INNER JOIN registrations r ON r.id = rp.registration_id
           WHERE r.schedule_id = ? AND r.status = 'verified'
         ) WHERE id = ?`,
        [registration.schedule_id, registration.schedule_id]
      );

      // Log verification
      await conn.execute(
        `INSERT INTO verification_logs (registration_id, admin_id, action, note)
         VALUES (?, ?, 'approved', ?)`,
        [id, req.user.id, note || null]
      );

      // Notify user
      await conn.execute(
        `INSERT INTO notifications (user_id, channel, event_type, title, message, delivery_status)
         VALUES (?, 'internal', 'registration.approved', 'Pendaftaran Disetujui!', ?, 'sent')`,
        [registration.user_id, `Selamat! Pendaftaran Anda telah diverifikasi dan tiket telah diterbitkan. Silakan cek menu Tiket.`]
      );

      // Activity log
      await conn.execute(
        `INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, ip_address)
         VALUES (?, 'admin.registration.approved', 'registrations', ?, ?)`,
        [req.user.id, id, req.ip]
      );
    });

    logger.info(`Registration ${id} approved by admin ${req.user.id}`);
    return success(res, null, 'Registration approved and tickets issued');
  } catch (err) {
    next(err);
  }
}

async function rejectRegistration(req, res, next) {
  try {
    const { id } = req.params;
    const reason = req.body.reason || req.body.note || req.body.notes || '';
    if (!reason.trim()) return error(res, 'Alasan penolakan wajib diisi', 422);

    const regs = await query(
      "SELECT * FROM registrations WHERE id = ? AND status IN ('submitted', 'need_revision')",
      [id]
    );
    if (!regs.length) return error(res, 'Pendaftaran tidak ditemukan atau sudah diproses', 404);

    await withTransaction(async (conn) => {
      await conn.execute(
        "UPDATE registrations SET status='rejected', rejection_reason=?, reviewed_at=NOW(), reviewed_by=? WHERE id=?",
        [reason, req.user.id, id]
      );

      await conn.execute(
        "UPDATE registration_passengers SET passenger_status='rejected' WHERE registration_id=?",
        [id]
      );

      await conn.execute(
        `INSERT INTO verification_logs (registration_id, admin_id, action, note)
         VALUES (?, ?, 'rejected', ?)`,
        [id, req.user.id, reason]
      );

      await conn.execute(
        `INSERT INTO notifications (user_id, channel, event_type, title, message, delivery_status)
         VALUES (?, 'internal', 'registration.rejected', 'Pendaftaran Ditolak', ?, 'sent')`,
        [regs[0].user_id, `Pendaftaran Anda tidak dapat disetujui. Alasan: ${reason}`]
      );

      await conn.execute(
        `INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, ip_address)
         VALUES (?, 'admin.registration.rejected', 'registrations', ?, ?)`,
        [req.user.id, id, req.ip]
      );
    });

    return success(res, null, 'Pendaftaran berhasil ditolak');
  } catch (err) {
    next(err);
  }
}

async function requestRevision(req, res, next) {
  try {
    const { id } = req.params;
    const note = req.body.note || req.body.notes || req.body.reason || '';
    if (!note.trim()) return error(res, 'Catatan perbaikan wajib diisi', 422);

    const regs = await query(
      "SELECT * FROM registrations WHERE id = ? AND status = 'submitted'",
      [id]
    );
    if (!regs.length) return error(res, 'Pendaftaran tidak ditemukan atau tidak dalam status terkirim', 404);

    await withTransaction(async (conn) => {
      await conn.execute(
        "UPDATE registrations SET status='need_revision', rejection_reason=?, reviewed_at=NOW(), reviewed_by=? WHERE id=?",
        [note, req.user.id, id]
      );

      await conn.execute(
        `INSERT INTO verification_logs (registration_id, admin_id, action, note)
         VALUES (?, ?, 'request_revision', ?)`,
        [id, req.user.id, note]
      );

      await conn.execute(
        `INSERT INTO notifications (user_id, channel, event_type, title, message, delivery_status)
         VALUES (?, 'internal', 'registration.revision', 'Revisi Diperlukan', ?, 'sent')`,
        [regs[0].user_id, `Pendaftaran Anda memerlukan revisi. Catatan: ${note}`]
      );
    });

    return success(res, null, 'Permintaan perbaikan berhasil dikirim ke peserta');
  } catch (err) {
    next(err);
  }
}

async function verifyRegistration(req, res, next) {
  try {
    const { action, notes, note, reason } = req.body;
    req.body.note = note || notes || reason || '';
    req.body.reason = reason || notes || note || '';
    if (action === 'approve') {
      return approveRegistration(req, res, next);
    }
    if (action === 'reject') {
      return rejectRegistration(req, res, next);
    }
    if (action === 'request_revision' || action === 'revision') {
      return requestRevision(req, res, next);
    }
    return error(res, 'Aksi tidak valid (harus approve, reject, atau request_revision)', 422);
  } catch (err) {
    next(err);
  }
}

async function serveDocument(req, res, next) {
  try {
    const { documentId } = req.params;
    let docs = await query(
      'SELECT storage_key, original_filename, mime_type FROM identity_documents WHERE id = ?',
      [documentId]
    );
    if (!docs.length) {
      docs = await query(
        'SELECT storage_key, original_filename, mime_type FROM identity_documents WHERE registration_passenger_id = ? ORDER BY id DESC LIMIT 1',
        [documentId]
      );
    }
    if (!docs.length) return error(res, 'Dokumen tidak ditemukan', 404);

    const doc = docs[0];
    const filePath = path.join(STORAGE_PATH, doc.storage_key);
    if (!fs.existsSync(filePath)) {
      return error(res, 'Berkas tidak ditemukan pada server', 404);
    }

    res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${doc.original_filename || doc.storage_key}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    next(err);
  }
}

// ─── ROUTES ADMIN ─────────────────────────────────────────────────

async function listAdminRoutes(req, res, next) {
  try {
    const routes = await query(
      `SELECT r.*, COUNT(ds.id) as schedule_count
       FROM routes r
       LEFT JOIN departure_schedules ds ON ds.route_id = r.id
       GROUP BY r.id
       ORDER BY r.destination ASC`
    );
    return success(res, routes, 'Routes retrieved');
  } catch (err) {
    next(err);
  }
}

async function createRoute(req, res, next) {
  try {
    const { origin, destination, route_name } = req.body;
    if (!origin || !destination || !route_name) {
      return error(res, 'origin, destination, and route_name are required', 422);
    }

    const [result] = await pool.execute(
        'INSERT INTO routes (origin, destination, route_name) VALUES (?, ?, ?)',
        [origin, destination, route_name]
      );

    const route = await query('SELECT * FROM routes WHERE id = ?', [result.insertId]);
    return success(res, route[0], 'Route created', 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return error(res, 'Route name already exists', 409);
    next(err);
  }
}

async function updateRoute(req, res, next) {
  try {
    const { id } = req.params;
    const { route_name, is_active, origin, destination } = req.body;

    const routes = await query('SELECT id FROM routes WHERE id = ?', [id]);
    if (!routes.length) return error(res, 'Route not found', 404);

    const fields = [];
    const params = [];
    if (route_name !== undefined) { fields.push('route_name = ?'); params.push(route_name); }
    if (is_active !== undefined) { fields.push('is_active = ?'); params.push(is_active ? 1 : 0); }
    if (origin !== undefined) { fields.push('origin = ?'); params.push(origin); }
    if (destination !== undefined) { fields.push('destination = ?'); params.push(destination); }

    if (!fields.length) return error(res, 'No fields to update', 422);
    params.push(id);

    await query(`UPDATE routes SET ${fields.join(', ')} WHERE id = ?`, params);
    const updated = await query('SELECT * FROM routes WHERE id = ?', [id]);
    return success(res, updated[0], 'Route updated');
  } catch (err) {
    next(err);
  }
}

// ─── SCHEDULES ADMIN ──────────────────────────────────────────────

async function listAdminSchedules(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const conditions = ['1=1'];
    const params = [];

    if (req.query.route_id) { conditions.push('ds.route_id = ?'); params.push(req.query.route_id); }
    if (req.query.status) { conditions.push('ds.status = ?'); params.push(req.query.status); }

    const where = conditions.join(' AND ');

    const [{ total }] = await query(
      `SELECT COUNT(*) as total FROM departure_schedules ds WHERE ${where}`,
      params
    );

    const schedules = await query(
      `SELECT ds.*, rt.origin, rt.destination, rt.route_name,
         (ds.capacity - ds.booked_seats) as available_seats,
         (SELECT COUNT(*) FROM registrations r WHERE r.schedule_id = ds.id AND r.status = 'submitted') as pending_count
       FROM departure_schedules ds
       INNER JOIN routes rt ON rt.id = ds.route_id
       WHERE ${where}
       ORDER BY ds.departure_date ASC, ds.departure_time ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return paginate(res, schedules, parseInt(total, 10), page, limit);
  } catch (err) {
    next(err);
  }
}

async function createSchedule(req, res, next) {
  try {
    const { route_id, departure_date, departure_time, departure_location, capacity } = req.body;
    if (!route_id || !departure_date || !capacity) {
      return error(res, 'route_id, departure_date, and capacity are required', 422);
    }

    const routes = await query('SELECT id FROM routes WHERE id = ? AND is_active = 1', [route_id]);
    if (!routes.length) return error(res, 'Route not found or inactive', 404);

    const [result] = await pool.execute(
        `INSERT INTO departure_schedules (route_id, departure_date, departure_time, departure_location, capacity)
         VALUES (?, ?, ?, ?, ?)`,
        [route_id, departure_date, departure_time || null, departure_location || null, parseInt(capacity, 10)]
      );

    const schedule = await query(
      `SELECT ds.*, rt.origin, rt.destination, rt.route_name FROM departure_schedules ds
       INNER JOIN routes rt ON rt.id = ds.route_id WHERE ds.id = ?`,
      [result.insertId]
    );
    return success(res, schedule[0], 'Schedule created', 201);
  } catch (err) {
    next(err);
  }
}

async function updateSchedule(req, res, next) {
  try {
    const { id } = req.params;
    const schedules = await query('SELECT id FROM departure_schedules WHERE id = ?', [id]);
    if (!schedules.length) return error(res, 'Schedule not found', 404);

    const { departure_date, departure_time, departure_location, capacity, status } = req.body;
    const fields = [];
    const params = [];

    if (departure_date !== undefined) { fields.push('departure_date = ?'); params.push(departure_date); }
    if (departure_time !== undefined) { fields.push('departure_time = ?'); params.push(departure_time); }
    if (departure_location !== undefined) { fields.push('departure_location = ?'); params.push(departure_location); }
    if (capacity !== undefined) { fields.push('capacity = ?'); params.push(parseInt(capacity, 10)); }
    if (status !== undefined) {
      if (!['open', 'closed', 'cancelled'].includes(status)) {
        return error(res, 'Invalid status', 422);
      }
      fields.push('status = ?');
      params.push(status);
    }

    if (!fields.length) return error(res, 'No fields to update', 422);
    params.push(id);

    await query(`UPDATE departure_schedules SET ${fields.join(', ')} WHERE id = ?`, params);
    const updated = await query(
      `SELECT ds.*, rt.origin, rt.destination, rt.route_name FROM departure_schedules ds
       INNER JOIN routes rt ON rt.id = ds.route_id WHERE ds.id = ?`,
      [id]
    );
    return success(res, updated[0], 'Schedule updated');
  } catch (err) {
    next(err);
  }
}

// ─── STATS ────────────────────────────────────────────────────────

async function getStats(req, res, next) {
  try {
    const statusStats = await query(
      `SELECT status, COUNT(*) as count FROM registrations GROUP BY status`
    );

    const userCountRows = await query('SELECT COUNT(*) as total FROM users');
    const routeCountRows = await query('SELECT COUNT(*) as total FROM routes WHERE is_active = 1');
    const scheduleCountRows = await query("SELECT COUNT(*) as total FROM departure_schedules WHERE status = 'open'");
    const ticketCountRows = await query("SELECT COUNT(*) as total FROM tickets WHERE status = 'active'");

    const statsByStatus = {};
    for (const row of statusStats) {
      statsByStatus[row.status] = parseInt(row.count, 10);
    }

    return success(res, {
      registrations: statsByStatus,
      total_users: parseInt(userCountRows[0].total, 10),
      active_routes: parseInt(routeCountRows[0].total, 10),
      open_schedules: parseInt(scheduleCountRows[0].total, 10),
      active_tickets: parseInt(ticketCountRows[0].total, 10),
    }, 'Stats retrieved');
  } catch (err) {
    next(err);
  }
}

// ─── USERS ────────────────────────────────────────────────────────

async function listUsers(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const [{ total }] = await query('SELECT COUNT(*) as total FROM users');

    const users = await query(
      `SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at,
         GROUP_CONCAT(r.name ORDER BY r.name SEPARATOR ',') as roles
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles r ON r.id = ur.role_id
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const usersWithRoles = users.map(u => ({
      ...u,
      roles: u.roles ? u.roles.split(',') : [],
    }));

    return paginate(res, usersWithRoles, parseInt(total, 10), page, limit);
  } catch (err) {
    next(err);
  }
}

async function listActivityLogs(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;

    const [{ total }] = await query('SELECT COUNT(*) as total FROM activity_logs');

    const logs = await query(
      `SELECT al.*, u.name as actor_name, u.email as actor_email
       FROM activity_logs al
       LEFT JOIN users u ON u.id = al.actor_id
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return paginate(res, logs, parseInt(total, 10), page, limit);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listAdminRegistrations,
  getAdminRegistration,
  approveRegistration,
  rejectRegistration,
  requestRevision,
  verifyRegistration,
  serveDocument,
  listAdminRoutes,
  createRoute,
  updateRoute,
  listAdminSchedules,
  createSchedule,
  updateSchedule,
  getStats,
  listUsers,
  listActivityLogs,
};
