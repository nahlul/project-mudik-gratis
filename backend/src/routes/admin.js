'use strict';

const express = require('express');
const router = express.Router();
const {
  listAdminRegistrations, getAdminRegistration,
  approveRegistration, rejectRegistration, requestRevision,
  serveDocument,
  listAdminRoutes, createRoute, updateRoute,
  listAdminSchedules, createSchedule, updateSchedule,
  getStats, listUsers, listActivityLogs,
} = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);
router.use(requireRole('admin', 'petugas'));

// Registrations
router.get('/registrations', listAdminRegistrations);
router.get('/registrations/:id', getAdminRegistration);
router.post('/registrations/:id/approve', approveRegistration);
router.post('/registrations/:id/reject', rejectRegistration);
router.post('/registrations/:id/request-revision', requestRevision);

// Documents
router.get('/documents/:documentId', serveDocument);

// Routes (admin only for create/update)
router.get('/routes', listAdminRoutes);
router.post('/routes', requireRole('admin'), createRoute);
router.patch('/routes/:id', requireRole('admin'), updateRoute);

// Schedules
router.get('/schedules', listAdminSchedules);
router.post('/schedules', createSchedule);
router.patch('/schedules/:id', updateSchedule);

// Stats & Users
router.get('/stats', getStats);
router.get('/users', listUsers);
router.get('/activity-logs', listActivityLogs);

module.exports = router;
