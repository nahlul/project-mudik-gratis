-- Seed departure schedules for 18 routes (Mudik 2026)
INSERT INTO departure_schedules (route_id, departure_date, departure_time, departure_location, capacity, booked_seats, status)
SELECT 
    id AS route_id,
    '2026-04-04' AS departure_date,
    '08:30:00' AS departure_time,
    'Terminal Tipe A Batoh, Banda Aceh' AS departure_location,
    40 AS capacity,
    0 AS booked_seats,
    'open' AS status
FROM routes
WHERE is_active = 1
ON DUPLICATE KEY UPDATE updated_at = NOW();

INSERT INTO departure_schedules (route_id, departure_date, departure_time, departure_location, capacity, booked_seats, status)
SELECT 
    id AS route_id,
    '2026-04-05' AS departure_date,
    '20:00:00' AS departure_time,
    'Terminal Tipe A Batoh, Banda Aceh' AS departure_location,
    40 AS capacity,
    0 AS booked_seats,
    'open' AS status
FROM routes
WHERE is_active = 1
ON DUPLICATE KEY UPDATE updated_at = NOW();
