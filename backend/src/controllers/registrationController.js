'use strict';

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { query, pool, withTransaction } = require('../config/database');
const { success, error, paginate } = require('../utils/response');
const { calculateAgeCategory } = require('../utils/ageCategory');
const { generateRegistrationNumber } = require('../utils/ticketGenerator');
const logger = require('../utils/logger');

const STORAGE_PATH = path.resolve(process.env.STORAGE_PATH || './storage/documents');

// Ensure storage path exists
if (!fs.existsSync(STORAGE_PATH)) {
  fs.mkdirSync(STORAGE_PATH, { recursive: true });
}

// Multer config for document upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, STORAGE_PATH),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, JPEG, PNG files are allowed'), false);
    }
  },
}).any();

async function getSetting(key, defaultValue) {
  const rows = await query('SELECT value FROM system_settings WHERE key_name = ?', [key]);
  return rows.length ? rows[0].value : defaultValue;
}

async function createRegistration(req, res, next) {
  try {
    const { schedule_id, passengers } = req.body;

    if (!schedule_id) return error(res, 'schedule_id is required', 422);
    if (!Array.isArray(passengers) || passengers.length === 0) {
      return error(res, 'At least one passenger is required', 422);
    }

    const maxPassengers = parseInt(await getSetting('max_passengers_per_registration', '10'), 10);
    if (passengers.length > maxPassengers) {
      return error(res, `Maximum ${maxPassengers} passengers per registration`, 422);
    }

    // Validate each passenger
    for (const p of passengers) {
      p.full_name = (p.full_name || p.name || '').trim();
      p.domicile_address = (p.domicile_address || p.address || '').trim() || '-';
      p.identity_type = p.identity_type || 'KTP';
      if (!p.full_name) return error(res, 'Nama lengkap penumpang wajib diisi', 422);
      if (!p.birth_date) return error(res, 'Tanggal lahir penumpang wajib diisi', 422);
      if (!['L', 'P'].includes(p.gender)) return error(res, 'Jenis kelamin penumpang harus L atau P', 422);
      if (!p.domicile_address) return error(res, 'Alamat domisili penumpang wajib diisi', 422);
    }

    // Validate schedule
    const schedules = await query(
      'SELECT * FROM departure_schedules WHERE id = ? AND status = ?',
      [schedule_id, 'open']
    );
    if (!schedules.length) return error(res, 'Schedule not found or not open', 404);

    const schedule = schedules[0];

    // Check capacity
    const bookedCount = await query(
      `SELECT COUNT(*) as cnt FROM registration_passengers rp
       INNER JOIN registrations r ON r.id = rp.registration_id
       WHERE r.schedule_id = ? AND r.status IN ('submitted','verified')`,
      [schedule_id]
    );
    const currentBooked = parseInt(bookedCount[0].cnt, 10);
    if (currentBooked + passengers.length > schedule.capacity) {
      return error(res, `Insufficient capacity. Available: ${schedule.capacity - currentBooked} seats`, 409);
    }

    const babyMaxMonths = parseInt(await getSetting('baby_age_max_months', '24'), 10);
    const childMaxYears = parseInt(await getSetting('child_age_max_years', '12'), 10);
    const settings = { babyMaxMonths, childMaxYears };

    const registration_number = generateRegistrationNumber();

    let registrationId;
    await withTransaction(async (conn) => {
      const [regResult] = await conn.execute(
        `INSERT INTO registrations (registration_number, user_id, schedule_id, status)
         VALUES (?, ?, ?, 'draft')`,
        [registration_number, req.user.id, schedule_id]
      );
      registrationId = regResult.insertId;

      for (const p of passengers) {
        let bDate = p.birth_date;
        try {
          const d = new Date(p.birth_date);
          if (!isNaN(d.getTime())) {
            bDate = d.toISOString().slice(0, 10);
          }
        } catch (_) {}
        const ageCategory = calculateAgeCategory(bDate, new Date(), settings);
        await conn.execute(
          `INSERT INTO registration_passengers
           (registration_id, family_member_id, full_name, nik, birth_date, gender, identity_type, phone, domicile_address, age_category)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            registrationId,
            p.family_member_id || null,
            p.full_name,
            p.nik || null,
            bDate,
            p.gender,
            p.identity_type,
            p.phone || null,
            p.domicile_address,
            ageCategory,
          ]
        );
      }

      // Activity log
      await conn.execute(
        `INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, ip_address)
         VALUES (?, 'registration.created', 'registrations', ?, ?)`,
        [req.user.id, registrationId, req.ip]
      );
    });

    const registration = await getRegistrationDetail(registrationId);
    logger.info(`Registration created: ${registration_number} by user ${req.user.id}`);
    return success(res, registration, 'Registration created as draft', 201);
  } catch (err) {
    next(err);
  }
}

async function getRegistrationDetail(registrationId) {
  const regs = await query(
    `SELECT r.*, ds.departure_date, ds.departure_time, ds.departure_location,
       ds.capacity, ds.booked_seats, ds.status as schedule_status,
       rt.origin, rt.destination, rt.route_name,
       u.name as user_name, u.email as user_email
     FROM registrations r
     INNER JOIN departure_schedules ds ON ds.id = r.schedule_id
     INNER JOIN routes rt ON rt.id = ds.route_id
     INNER JOIN users u ON u.id = r.user_id
     WHERE r.id = ?`,
    [registrationId]
  );
  if (!regs.length) return null;

  const reg = regs[0];
  reg.schedule = {
    departure_date: reg.departure_date,
    departure_time: reg.departure_time,
    departure_location: reg.departure_location,
    capacity: reg.capacity,
    booked_seats: reg.booked_seats,
    status: reg.schedule_status,
    route: {
      origin: reg.origin,
      destination: reg.destination,
      route_name: reg.route_name,
    },
  };
  reg.passengers = await query(
    `SELECT rp.*, 
       GROUP_CONCAT(id.id) as doc_ids,
       GROUP_CONCAT(id.document_type) as doc_types,
       GROUP_CONCAT(id.verification_status) as doc_statuses
     FROM registration_passengers rp
     LEFT JOIN identity_documents id ON id.registration_passenger_id = rp.id
     WHERE rp.registration_id = ?
     GROUP BY rp.id
     ORDER BY rp.id ASC`,
    [registrationId]
  );

  // Structure documents properly
  const passengersWithDocs = await Promise.all(
    reg.passengers.map(async (p) => {
      const docs = await query(
        'SELECT id, document_type, original_filename, mime_type, file_size, verification_status, verified_at, created_at FROM identity_documents WHERE registration_passenger_id = ?',
        [p.id]
      );
      const { doc_ids, doc_types, doc_statuses, ...passenger } = p;
      return {
        ...passenger,
        name: passenger.full_name || passenger.name,
        address: passenger.domicile_address || passenger.address,
        documents: docs,
      };
    })
  );
  reg.passengers = passengersWithDocs;

  return reg;
}

async function listRegistrations(req, res, next) {
  try {
    const registrations = await query(
      `SELECT r.id, r.registration_number, r.status, r.submitted_at, r.created_at,
         ds.departure_date, rt.route_name,
         COUNT(rp.id) as passenger_count
       FROM registrations r
       INNER JOIN departure_schedules ds ON ds.id = r.schedule_id
       INNER JOIN routes rt ON rt.id = ds.route_id
       LEFT JOIN registration_passengers rp ON rp.registration_id = r.id
       WHERE r.user_id = ?
       GROUP BY r.id
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    return success(res, registrations, 'Registrations retrieved');
  } catch (err) {
    next(err);
  }
}

async function getRegistration(req, res, next) {
  try {
    const { id } = req.params;
    const regs = await query('SELECT id, user_id FROM registrations WHERE id = ?', [id]);
    if (!regs.length) return error(res, 'Registration not found', 404);
    if (regs[0].user_id !== req.user.id && !req.user.roles.includes('admin') && !req.user.roles.includes('petugas')) {
      return error(res, 'Access denied', 403);
    }

    const detail = await getRegistrationDetail(parseInt(id, 10));
    return success(res, detail, 'Registration retrieved');
  } catch (err) {
    next(err);
  }
}

async function submitRegistration(req, res, next) {
  try {
    const { id } = req.params;
    const regs = await query(
      "SELECT id, user_id, status FROM registrations WHERE id = ?",
      [id]
    );
    if (!regs.length) return error(res, 'Registration not found', 404);
    if (regs[0].user_id !== req.user.id) return error(res, 'Access denied', 403);
    if (regs[0].status !== 'draft' && regs[0].status !== 'need_revision') {
      return error(res, `Cannot submit a registration with status: ${regs[0].status}`, 409);
    }

    // Check all passengers have at least one document
    const passengersWithoutDocs = await query(
      `SELECT rp.id, rp.full_name FROM registration_passengers rp
       LEFT JOIN identity_documents id ON id.registration_passenger_id = rp.id
       WHERE rp.registration_id = ?
       GROUP BY rp.id
       HAVING COUNT(id.id) = 0`,
      [id]
    );
    if (passengersWithoutDocs.length) {
      return error(
        res,
        'Wajib mengunggah foto/scan dokumen identitas untuk setiap penumpang',
        422,
        passengersWithoutDocs.map((p) => ({
          passenger: p.full_name,
          message: `Dokumen untuk ${p.full_name} belum diunggah`,
        }))
      );
    }

    await query(
      "UPDATE registrations SET status='submitted', submitted_at=NOW() WHERE id = ?",
      [id]
    );

    // Notify user
    await query(
      `INSERT INTO notifications (user_id, channel, event_type, title, message, delivery_status)
       VALUES (?, 'internal', 'registration.submitted', 'Pendaftaran Terkirim', ?, 'sent')`,
      [req.user.id, `Pendaftaran Anda telah berhasil dikirim dan sedang menunggu verifikasi admin.`]
    );

    await query(
      `INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, ip_address)
       VALUES (?, 'registration.submitted', 'registrations', ?, ?)`,
      [req.user.id, id, req.ip]
    );

    const detail = await getRegistrationDetail(parseInt(id, 10));
    return success(res, detail, 'Registration submitted successfully');
  } catch (err) {
    next(err);
  }
}

async function uploadDocument(req, res, next) {
  upload(req, res, async (uploadErr) => {
    if (uploadErr) {
      if (uploadErr.code === 'LIMIT_FILE_SIZE') {
        return error(res, 'File size must not exceed 2MB', 413);
      }
      return error(res, uploadErr.message, 400);
    }

    try {
      const { id } = req.params;
      const passenger_id = req.params.passengerId || req.body.passenger_id;
      const document_type = req.body.document_type || 'KTP';
      const uploadedFile = (req.files && req.files.length > 0) ? req.files[0] : req.file;

      if (!uploadedFile) return error(res, 'No file uploaded', 400);
      if (!passenger_id) return error(res, 'passenger_id is required', 422);

      // Verify registration ownership
      const regs = await query(
        'SELECT id, user_id, status FROM registrations WHERE id = ?',
        [id]
      );
      if (!regs.length) return error(res, 'Registration not found', 404);
      if (regs[0].user_id !== req.user.id) return error(res, 'Access denied', 403);
      if (!['draft', 'need_revision'].includes(regs[0].status)) {
        return error(res, 'Cannot upload documents for a registration with status: ' + regs[0].status, 409);
      }

      // Verify passenger belongs to this registration
      const passengers = await query(
        'SELECT id FROM registration_passengers WHERE id = ? AND registration_id = ?',
        [passenger_id, id]
      );
      if (!passengers.length) return error(res, 'Passenger not found in this registration', 404);

      const storage_key = uploadedFile.filename;
      const [result] = await pool.execute(
        `INSERT INTO identity_documents (registration_passenger_id, document_type, storage_key, original_filename, mime_type, file_size)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [passenger_id, document_type, storage_key, uploadedFile.originalname, uploadedFile.mimetype, uploadedFile.size]
      );

      const doc = await query('SELECT * FROM identity_documents WHERE id = ?', [result.insertId]);
      return success(res, doc[0], 'Document uploaded successfully', 201);
    } catch (err) {
      // Clean up uploaded file if DB insert failed
      if (uploadedFile && fs.existsSync(uploadedFile.path)) {
        fs.unlinkSync(uploadedFile.path);
      }
      next(err);
    }
  });
}

module.exports = {
  createRegistration,
  listRegistrations,
  getRegistration,
  submitRegistration,
  uploadDocument,
  getRegistrationDetail,
};
