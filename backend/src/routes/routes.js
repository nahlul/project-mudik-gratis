'use strict';

const express = require('express');
const router = express.Router();
const { listRoutes, getRoute, getRouteSchedules } = require('../controllers/routesController');

router.get('/', listRoutes);
router.get('/:id', getRoute);
router.get('/:id/schedules', getRouteSchedules);

module.exports = router;
