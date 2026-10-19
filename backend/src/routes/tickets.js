'use strict';

const express = require('express');
const router = express.Router();
const { listTickets, getTicket, downloadTicket } = require('../controllers/ticketController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', listTickets);
router.get('/:id', getTicket);
router.get('/:id/download', downloadTicket);

module.exports = router;
