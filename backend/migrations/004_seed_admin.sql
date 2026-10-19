-- 004_seed_admin.sql
-- Insert default admin user (password: Admin@2026!)
INSERT IGNORE INTO users (name, email, password_hash, status, email_verified_at)
VALUES (
  'Administrator',
  'admin@mudikgratis.ac.id',
  '$2a$12$nfO9.0YcVt/JacZ/b/0pWu2NeCyBkt.dTLjDhPcEyRcZ9/IkegNNK',
  'active',
  NOW()
);

-- Assign admin role
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'admin@mudikgratis.ac.id' AND r.name = 'admin';
