-- 003_seed_routes.sql
INSERT INTO routes (origin, destination, route_name) VALUES
('Banda Aceh', 'Bener Meriah', 'Banda Aceh → Bener Meriah'),
('Banda Aceh', 'Bireuen', 'Banda Aceh → Bireuen'),
('Banda Aceh', 'Blang Kejeren (Gayo Lues)', 'Banda Aceh → Blang Kejeren (Gayo Lues) via Babah Rot'),
('Banda Aceh', 'Blang Pidie (Abdya)', 'Banda Aceh → Blang Pidie (Abdya)'),
('Banda Aceh', 'Idi - Peureulak (Aceh Timur)', 'Banda Aceh → Idi - Peureulak (Aceh Timur)'),
('Banda Aceh', 'Jeuram (Nagan Raya)', 'Banda Aceh → Jeuram (Nagan Raya)'),
('Banda Aceh', 'Kuala Simpang (Aceh Tamiang)', 'Banda Aceh → Kuala Simpang (Aceh Tamiang)'),
('Banda Aceh', 'Kuta Cane (Aceh Tenggara)', 'Banda Aceh → Kuta Cane (Aceh Tenggara) via Medan'),
('Banda Aceh', 'Langsa', 'Banda Aceh → Langsa'),
('Banda Aceh', 'Lhokseumawe', 'Banda Aceh → Lhokseumawe'),
('Banda Aceh', 'Lhoksukon (Aceh Utara)', 'Banda Aceh → Lhoksukon (Aceh Utara)'),
('Banda Aceh', 'Medan (SUMUT)', 'Banda Aceh → Medan (SUMUT)'),
('Banda Aceh', 'Meulaboh (Aceh Barat)', 'Banda Aceh → Meulaboh (Aceh Barat)'),
('Banda Aceh', 'Meureudu (Pidie Jaya)', 'Banda Aceh → Meureudu (Pidie Jaya)'),
('Banda Aceh', 'Rimo (Aceh Singkil)', 'Banda Aceh → Rimo (Aceh Singkil)'),
('Banda Aceh', 'Subulussalam', 'Banda Aceh → Subulussalam'),
('Banda Aceh', 'Takengon (Aceh Tengah)', 'Banda Aceh → Takengon (Aceh Tengah)'),
('Banda Aceh', 'Tapak Tuan (Aceh Selatan)', 'Banda Aceh → Tapak Tuan (Aceh Selatan)')
ON DUPLICATE KEY UPDATE updated_at = NOW();
