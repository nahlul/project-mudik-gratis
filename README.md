# Mudik Gratis Aceh 2026

Aplikasi Resmi Program Mudik Gratis Dinas Perhubungan Pemerintah Aceh.

Aplikasi web full-stack terintegrasi dengan database MySQL, backend Node.js (Express.js), dan frontend React.js (TypeScript, Vite, Tailwind CSS).

---

## 🚀 Fitur Unggulan

- **18 Rute Resmi:** Terhubung langsung ke database MySQL.
- **Pendaftaran Mandiri Peserta:** Form multi-step (Pilih Rute, Jadwal, Penumpang, Upload Dokumen, Ringkasan).
- **Verifikasi KTP / KIA / KK:** Validasi dokumen identitas terunggah ke storage privat.
- **Dashboard Petugas & Admin:** Review berkas peserta, approval, penolakan dengan catatan wajib, serta pemantauan kuota kursi.
- **Tiket Digital & Validasi QR:** Penerbitan nomor tiket unik otomatis dan QR code verification.
- **Manajemen Keluarga:** Simpan data keluarga untuk mempercepat pendaftaran berulang.
- **Notifikasi Internal & Audit Log:** Rekam jejak seluruh aksi penting dan status verifikasi.

---

## 📁 Struktur Direktori

```
project-mudik-gratis/
├── backend/          # REST API Express.js + MySQL
│   ├── migrations/   # Skema tabel & seed SQL
│   ├── src/          # Controllers, routes, middleware, models
│   ├── storage/      # Storage privat dokumen identitas
│   └── package.json
├── frontend/         # Aplikasi Web React 18 + Vite + TypeScript
│   ├── src/
│   │   ├── components/ # Reusable UI, Navbar, Footer, Layout
│   │   ├── pages/      # Halaman Publik, Peserta, Admin
│   │   ├── context/    # AuthContext (JWT & Role Guard)
│   │   └── lib/        # API Client Axios
│   └── package.json
├── docs/             # Dokumentasi API, Database, Deployment & Testing
└── README.md
```

---

## ⚡ Cara Menjalankan

### Backend:
```bash
cd backend
npm install
npm run migrate
npm start
```
Server berjalan di `http://localhost:3001`.

### Frontend:
```bash
cd frontend
npm install
npm run dev
```
Aplikasi berjalan di `http://localhost:5174` (atau `5173`).

---

## 🔑 Kredensial Default Administrator
- **Email:** `admin@mudikgratis.ac.id`
- **Kata Sandi:** `Admin@2026!`
