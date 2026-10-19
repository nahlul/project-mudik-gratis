'use strict';

const { query } = require('../config/database');
const { success, error, paginate } = require('../utils/response');

async function listRoutes(req, res, next) {
  try {
    const routes = await query(
      `SELECT r.*,
         COUNT(ds.id) as schedule_count,
         SUM(CASE WHEN ds.status = 'open' THEN 1 ELSE 0 END) as open_schedules
       FROM routes r
       LEFT JOIN departure_schedules ds ON ds.route_id = r.id
       WHERE r.is_active = 1
       GROUP BY r.id
       ORDER BY r.destination ASC`
    );
    return success(res, routes, 'Routes retrieved');
  } catch (err) {
    next(err);
  }
}

async function getRoute(req, res, next) {
  try {
    const { id } = req.params;
    const routes = await query(
      `SELECT r.*,
         COUNT(ds.id) as schedule_count
       FROM routes r
       LEFT JOIN departure_schedules ds ON ds.route_id = r.id
       WHERE r.id = ?
       GROUP BY r.id`,
      [id]
    );
    if (!routes.length) return error(res, 'Route not found', 404);
    return success(res, routes[0], 'Route retrieved');
  } catch (err) {
    next(err);
  }
}

async function getRouteSchedules(req, res, next) {
  try {
    const { id } = req.params;
    const route = await query('SELECT id FROM routes WHERE id = ? AND is_active = 1', [id]);
    if (!route.length) return error(res, 'Route not found', 404);

    const schedules = await query(
      `SELECT ds.*,
         (ds.capacity - ds.booked_seats) as available_seats
       FROM departure_schedules ds
       WHERE ds.route_id = ? AND ds.status = 'open'
       ORDER BY ds.departure_date ASC, ds.departure_time ASC`,
      [id]
    );
    return success(res, schedules, 'Schedules retrieved');
  } catch (err) {
    next(err);
  }
}

module.exports = { listRoutes, getRoute, getRouteSchedules };
