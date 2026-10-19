-- 001_create_tables.sql
-- Create all application tables

SET FOREIGN_KEY_CHECKS = 0;

-- 1. users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email_verified_at DATETIME NULL DEFAULT NULL,
  phone VARCHAR(20) NULL,
  status ENUM('active','inactive','suspended') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. roles
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. user_roles
CREATE TABLE IF NOT EXISTS user_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  INDEX idx_ur_role (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. routes
CREATE TABLE IF NOT EXISTS routes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  route_name VARCHAR(500) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_route_name (route_name(255)),
  INDEX idx_routes_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. departure_schedules
CREATE TABLE IF NOT EXISTS departure_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  route_id INT NOT NULL,
  departure_date DATE NOT NULL,
  departure_time TIME NULL DEFAULT NULL,
  departure_location VARCHAR(500) NULL DEFAULT NULL,
  capacity INT NOT NULL DEFAULT 0,
  booked_seats INT NOT NULL DEFAULT 0,
  status ENUM('open','closed','cancelled') NOT NULL DEFAULT 'open',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ds_route FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
  INDEX idx_ds_route (route_id),
  INDEX idx_ds_date (departure_date),
  INDEX idx_ds_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. family_members
CREATE TABLE IF NOT EXISTS family_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  nik VARCHAR(16) NULL DEFAULT NULL,
  birth_date DATE NOT NULL,
  gender ENUM('L','P') NOT NULL,
  identity_type ENUM('KTP','KIA','KK') NOT NULL,
  phone VARCHAR(20) NULL DEFAULT NULL,
  domicile_address TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_fm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_fm_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. registrations
CREATE TABLE IF NOT EXISTS registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  schedule_id INT NOT NULL,
  status ENUM('draft','submitted','need_revision','verified','rejected','cancelled') NOT NULL DEFAULT 'draft',
  rejection_reason TEXT NULL DEFAULT NULL,
  submitted_at DATETIME NULL DEFAULT NULL,
  reviewed_at DATETIME NULL DEFAULT NULL,
  reviewed_by INT NULL DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reg_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_reg_schedule FOREIGN KEY (schedule_id) REFERENCES departure_schedules(id),
  CONSTRAINT fk_reg_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id),
  INDEX idx_reg_user (user_id),
  INDEX idx_reg_schedule (schedule_id),
  INDEX idx_reg_status (status),
  INDEX idx_reg_number (registration_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. registration_passengers
CREATE TABLE IF NOT EXISTS registration_passengers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registration_id INT NOT NULL,
  family_member_id INT NULL DEFAULT NULL,
  full_name VARCHAR(255) NOT NULL,
  nik VARCHAR(16) NULL DEFAULT NULL,
  birth_date DATE NOT NULL,
  gender ENUM('L','P') NOT NULL,
  identity_type ENUM('KTP','KIA','KK') NOT NULL,
  phone VARCHAR(20) NULL DEFAULT NULL,
  domicile_address TEXT NOT NULL,
  age_category VARCHAR(20) NULL DEFAULT NULL,
  passenger_status ENUM('pending','need_revision','verified','rejected') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_rp_registration FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
  CONSTRAINT fk_rp_family FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE SET NULL,
  INDEX idx_rp_registration (registration_id),
  INDEX idx_rp_family (family_member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. identity_documents
CREATE TABLE IF NOT EXISTS identity_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registration_passenger_id INT NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  original_filename VARCHAR(255) NULL DEFAULT NULL,
  mime_type VARCHAR(100) NULL DEFAULT NULL,
  file_size INT NULL DEFAULT NULL,
  verification_status ENUM('pending','valid','invalid') NOT NULL DEFAULT 'pending',
  verified_by INT NULL DEFAULT NULL,
  verified_at DATETIME NULL DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_id_passenger FOREIGN KEY (registration_passenger_id) REFERENCES registration_passengers(id) ON DELETE CASCADE,
  CONSTRAINT fk_id_verifier FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_id_passenger (registration_passenger_id),
  INDEX idx_id_status (verification_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. verification_logs
CREATE TABLE IF NOT EXISTS verification_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registration_id INT NOT NULL,
  registration_passenger_id INT NULL DEFAULT NULL,
  admin_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  note TEXT NULL DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vl_registration FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
  CONSTRAINT fk_vl_passenger FOREIGN KEY (registration_passenger_id) REFERENCES registration_passengers(id) ON DELETE SET NULL,
  CONSTRAINT fk_vl_admin FOREIGN KEY (admin_id) REFERENCES users(id),
  INDEX idx_vl_registration (registration_id),
  INDEX idx_vl_admin (admin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. tickets
CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_number VARCHAR(100) UNIQUE NOT NULL,
  verification_code_hash VARCHAR(255) NOT NULL,
  registration_passenger_id INT NOT NULL UNIQUE,
  schedule_id INT NOT NULL,
  status ENUM('active','cancelled','used') NOT NULL DEFAULT 'active',
  issued_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tk_passenger FOREIGN KEY (registration_passenger_id) REFERENCES registration_passengers(id),
  CONSTRAINT fk_tk_schedule FOREIGN KEY (schedule_id) REFERENCES departure_schedules(id),
  INDEX idx_tk_number (ticket_number),
  INDEX idx_tk_schedule (schedule_id),
  INDEX idx_tk_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  channel ENUM('internal','whatsapp','email') NOT NULL DEFAULT 'internal',
  event_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  delivery_status ENUM('pending','sent','failed','not_configured') NOT NULL DEFAULT 'pending',
  sent_at DATETIME NULL DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user (user_id),
  INDEX idx_notif_read (is_read),
  INDEX idx_notif_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. activity_logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actor_id INT NULL DEFAULT NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100) NULL DEFAULT NULL,
  entity_id INT NULL DEFAULT NULL,
  ip_address VARCHAR(45) NULL DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_al_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_al_actor (actor_id),
  INDEX idx_al_entity (entity_type, entity_id),
  INDEX idx_al_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. system_settings
CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NULL DEFAULT NULL,
  description TEXT NULL DEFAULT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ss_key (key_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
