# Skema Database MySQL - Mudik Gratis Aceh

- **Engine:** MariaDB 10.6 / MySQL 8.0
- **Database:** `mudik_gratis`
- **Charset:** `utf8mb4`
- **Collation:** `utf8mb4_unicode_ci`

---

## 1. Daftar Tabel Utama

1. `users` — Data akun pengguna (nama, email unik, bcrypt password_hash, no HP, status).
2. `roles` — Peran pengguna sistem (`admin`, `petugas`, `peserta`).
3. `user_roles` — Relasi many-to-many pengguna dan perannya.
4. `routes` — 18 rute resmi Mudik Gratis Aceh (asal, tujuan, nama rute unik, status aktif).
5. `departure_schedules` — Jadwal keberangkatan per rute (tanggal, jam, lokasi kumpul, kapasitas kursi, kuota terpakai).
6. `family_members` — Profil data identitas anggota keluarga tersimpan milik peserta.
7. `registrations` — Pendaftaran mudik (`registration_number` unik, user_id, schedule_id, status state machine, waktu review, reviewer).
8. `registration_passengers` — Data snapshot penumpang dalam pendaftaran (nama, NIK, tgl lahir, jenis kelamin, kategori usia otomatis: bayi/anak/dewasa, status verifikasi penumpang).
9. `identity_documents` — Berkas identitas terunggah (KTP/KIA/KK, storage_key privat, mime_type, file_size, status validasi).
10. `verification_logs` — Jejak riwayat catatan verifikasi dan tindakan admin terhadap pendaftar.
11. `tickets` — Tiket digital diterbitkan (`ticket_number` unik `MG-YYYYMMDD-XXXXXX`, hash kode QR verifikasi, schedule_id, status aktif).
12. `notifications` — Notifikasi sistem untuk peserta (internal, status pengiriman).
13. `activity_logs` — Audit log pencatatan aksi administratif dan keamanan IP.
14. `system_settings` — Parameter konfigurasi program (batas penumpang, umur bayi/anak, portal buka/tutup).

---

## 2. Seed Data Rute Resmi (18 Rute)
1. Banda Aceh → Bener Meriah
2. Banda Aceh → Bireuen
3. Banda Aceh → Blang Kejeren (Gayo Lues) via Babah Rot
4. Banda Aceh → Blang Pidie (Abdya)
5. Banda Aceh → Idi - Peureulak (Aceh Timur)
6. Banda Aceh → Jeuram (Nagan Raya)
7. Banda Aceh → Kuala Simpang (Aceh Tamiang)
8. Banda Aceh → Kuta Cane (Aceh Tenggara) via Medan
9. Banda Aceh → Langsa
10. Banda Aceh → Lhokseumawe
11. Banda Aceh → Lhoksukon (Aceh Utara)
12. Banda Aceh → Medan (SUMUT)
13. Banda Aceh → Meulaboh (Aceh Barat)
14. Banda Aceh → Meureudu (Pidie Jaya)
15. Banda Aceh → Rimo (Aceh Singkil)
16. Banda Aceh → Subulussalam
17. Banda Aceh → Takengon (Aceh Tengah)
18. Banda Aceh → Tapak Tuan (Aceh Selatan)
