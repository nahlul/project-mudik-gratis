# Dokumentasi API - Mudik Gratis Aceh 2026

Base URL (Development): `http://localhost:3001/api/v1`
Format Respons: JSON (`{ success: boolean, data?: any, message: string }`)

---

## 1. Autentikasi (`/auth`)

| Metode | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| `POST` | `/auth/register` | Mendaftarkan akun peserta baru | Publik |
| `POST` | `/auth/login` | Masuk ke sistem (peserta/admin) & dapatkan JWT | Publik |
| `POST` | `/auth/logout` | Keluar dari sistem | Authenticated |
| `GET` | `/auth/me` | Mendapatkan data profil akun yang sedang login | Authenticated |
| `POST` | `/auth/forgot-password` | Pengajuan lupa kata sandi | Publik |
| `POST` | `/auth/reset-password` | Reset kata sandi dengan token | Publik |

---

## 2. Rute & Jadwal (`/routes`)

| Metode | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| `GET` | `/routes` | Mengambil daftar 18 rute resmi | Publik |
| `GET` | `/routes/:id` | Mengambil detail 1 rute | Publik |
| `GET` | `/routes/:id/schedules` | Mengambil daftar jadwal keberangkatan & sisa kuota | Publik |

---

## 3. Anggota Keluarga (`/family-members`)

| Metode | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| `GET` | `/family-members` | Daftar anggota keluarga milik user | Peserta |
| `POST` | `/family-members` | Tambah anggota keluarga baru | Peserta |
| `GET` | `/family-members/:id` | Detail anggota keluarga | Peserta (Owner) |
| `PATCH` | `/family-members/:id` | Edit anggota keluarga | Peserta (Owner) |
| `DELETE` | `/family-members/:id` | Hapus anggota keluarga | Peserta (Owner) |

---

## 4. Pendaftaran Mudik (`/registrations`)

| Metode | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| `POST` | `/registrations` | Membuat draft pendaftaran beserta data penumpang | Peserta |
| `GET` | `/registrations` | Daftar riwayat pendaftaran user | Peserta |
| `GET` | `/registrations/:id` | Detail pendaftaran, status verifikasi & dokumen | Peserta/Admin |
| `POST` | `/registrations/:id/passengers/:passengerId/documents` | Upload dokumen identitas penumpang (KTP/KIA/KK) | Peserta |
| `POST` | `/registrations/:id/submit` | Mengunci dan mengajukan pendaftaran ke admin | Peserta |

---

## 5. Tiket Digital (`/tickets`)

| Metode | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| `GET` | `/tickets` | Mengambil daftar tiket aktif milik user | Peserta |
| `GET` | `/tickets/:id` | Mengambil detail tiket digital dan QR verification code | Peserta (Owner) |
| `GET` | `/tickets/:id/download` | Unduh payload tiket untuk cetak PDF | Peserta (Owner) |

---

## 6. Panel Administrator (`/admin`)

| Metode | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| `GET` | `/admin/stats` | Statistik ringkasan kuota, pendaftar, dan tiket | Admin / Petugas |
| `GET` | `/admin/registrations` | Daftar semua pendaftar (filter rute, status, tanggal) | Admin / Petugas |
| `GET` | `/admin/registrations/:id` | Detail lengkap pendaftar untuk verifikasi berkas | Admin / Petugas |
| `POST` | `/admin/registrations/:id/approve` | Setujui pendaftaran & terbitkan tiket otomatis | Admin / Petugas |
| `POST` | `/admin/registrations/:id/reject` | Tolak pendaftaran beserta alasan wajib | Admin / Petugas |
| `POST` | `/admin/registrations/:id/request-revision` | Minta perbaikan dokumen kepada peserta | Admin / Petugas |
| `GET` | `/admin/documents/:documentId` | Mengunduh/melihat berkas identitas privat | Admin / Petugas |
| `GET` | `/admin/routes` | Mengelola data rute perjalanan | Admin / Petugas |
| `PATCH` | `/admin/routes/:id` | Aktifkan/nonaktifkan rute | Admin |
| `GET` | `/admin/schedules` | Mengambil semua jadwal keberangkatan bus | Admin / Petugas |
| `POST` | `/admin/schedules` | Menambah jadwal keberangkatan bus baru | Admin |
| `GET` | `/admin/users` | Daftar semua pengguna terdaftar dan perannya | Admin |
| `GET` | `/admin/activity-logs` | Jejak audit log keamanan seluruh aktivitas admin | Admin |
