-- 005_seed_settings.sql
INSERT IGNORE INTO system_settings (key_name, value, description) VALUES
('max_passengers_per_registration', '10', 'Maximum number of passengers per registration'),
('registration_open', 'true', 'Whether new registrations are accepted'),
('baby_age_max_months', '24', 'Maximum age in months to be categorized as bayi'),
('child_age_max_years', '12', 'Maximum age in years to be categorized as anak');
