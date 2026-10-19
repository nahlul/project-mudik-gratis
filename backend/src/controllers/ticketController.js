'use strict';

const { query } = require('../config/database');
const { success, error } = require('../utils/response');

async function listTickets(req, res, next) {
  try {
    const tickets = await query(
      `SELECT t.id, t.ticket_number, t.status, t.issued_at,
         rp.full_name as passenger_name, rp.age_category, rp.gender,
         r.registration_number,
         ds.departure_date, ds.departure_time, ds.departure_location,
         rt.origin, rt.destination, rt.route_name
       FROM tickets t
       INNER JOIN registration_passengers rp ON rp.id = t.registration_passenger_id
       INNER JOIN registrations r ON r.id = rp.registration_id
       INNER JOIN departure_schedules ds ON ds.id = t.schedule_id
       INNER JOIN routes rt ON rt.id = ds.route_id
       WHERE r.user_id = ?
       ORDER BY t.issued_at DESC`,
      [req.user.id]
    );
    return success(res, tickets, 'Tickets retrieved');
  } catch (err) {
    next(err);
  }
}

async function getTicket(req, res, next) {
  try {
    const { id } = req.params;
    const tickets = await query(
      `SELECT t.id, t.ticket_number, t.status, t.issued_at,
         rp.full_name as passenger_name, rp.nik, rp.age_category, rp.gender, rp.birth_date, rp.identity_type, rp.domicile_address,
         r.registration_number, r.user_id,
         ds.departure_date, ds.departure_time, ds.departure_location,
         rt.origin, rt.destination, rt.route_name
       FROM tickets t
       INNER JOIN registration_passengers rp ON rp.id = t.registration_passenger_id
       INNER JOIN registrations r ON r.id = rp.registration_id
       INNER JOIN departure_schedules ds ON ds.id = t.schedule_id
       INNER JOIN routes rt ON rt.id = ds.route_id
       WHERE t.id = ?`,
      [id]
    );

    if (!tickets.length) return error(res, 'Ticket not found', 404);
    const ticket = tickets[0];
    if (ticket.user_id !== req.user.id && !req.user.roles.includes('admin') && !req.user.roles.includes('petugas')) {
      return error(res, 'Access denied', 403);
    }

    return success(res, ticket, 'Ticket retrieved');
  } catch (err) {
    next(err);
  }
}

async function downloadTicket(req, res, next) {
  try {
    const { id } = req.params;
    const tickets = await query(
      `SELECT t.id, t.ticket_number, t.status, t.issued_at,
         rp.full_name as passenger_name, rp.nik, rp.age_category, rp.gender, rp.birth_date, rp.identity_type, rp.domicile_address, rp.phone,
         r.registration_number, r.user_id,
         u.name as registrant_name, u.email as registrant_email,
         ds.departure_date, ds.departure_time, ds.departure_location,
         rt.origin, rt.destination, rt.route_name
       FROM tickets t
       INNER JOIN registration_passengers rp ON rp.id = t.registration_passenger_id
       INNER JOIN registrations r ON r.id = rp.registration_id
       INNER JOIN users u ON u.id = r.user_id
       INNER JOIN departure_schedules ds ON ds.id = t.schedule_id
       INNER JOIN routes rt ON rt.id = ds.route_id
       WHERE t.id = ?`,
      [id]
    );

    if (!tickets.length) return error(res, 'Ticket not found', 404);
    const ticket = tickets[0];
    if (ticket.user_id !== req.user.id && !req.user.roles.includes('admin') && !req.user.roles.includes('petugas')) {
      return error(res, 'Access denied', 403);
    }
    if (ticket.status !== 'active') {
      return error(res, `Ticket status is ${ticket.status}`, 409);
    }

    return success(res, {
      ticket_data: ticket,
      generated_at: new Date().toISOString(),
      instructions: 'Print this ticket and present it at the departure point along with your identity document.',
    }, 'Ticket data for download');
  } catch (err) {
    next(err);
  }
}

module.exports = { listTickets, getTicket, downloadTicket };
