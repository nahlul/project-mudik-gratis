# Laporan Pengujian & Cross-Check - Mudik Gratis Aceh 2026

Pengujian sistem dilakukan secara menyeluruh mencakup End-to-End API testing dan pengujian UI interaktif.

---

## 1. Hasil Pengujian End-to-End (10 Skenario Kritis)

| No | Skenario Pengujian | Hasil Aktual | Status |
|---|---|---|---|
| 1 | Cek 18 Rute Resmi | Mengembalikan tepat 18 rute resmi sesuai urutan | ✅ LULUS |
| 2 | Registrasi Peserta Baru | Akun peserta baru berhasil dibuat, password di-hash bcrypt | ✅ LULUS |
| 3 | Tambah Anggota Keluarga | Data tersimpan di MySQL lengkap dengan NIK & alamat | ✅ LULUS |
| 4 | Cek Jadwal & Kuota Kursi | Menampilkan sisa kursi live secara dinamis | ✅ LULUS |
| 5 | Buat Draft Pendaftaran | Nomor registrasi unik terbuat (`REG-YYYYMMDD-XXXXXX`), relasi penumpang tersimpan | ✅ LULUS |
| 6 | Upload Berkas Dokumen (Multipart) | Berkas tersimpan di storage privat dengan UUID acak, mime-type tervalidasi | ✅ LULUS |
| 7 | Submit Pendaftaran | Status terkunci menjadi `submitted`, dicek kelengkapan berkas | ✅ LULUS |
| 8 | Login Admin / Petugas | Otentikasi admin sukses, JWT memuat role `admin` | ✅ LULUS |
| 9 | Verifikasi & Persetujuan Admin | Admin menyetujui, catatan audit tercatat, tiket diterbitkan | ✅ LULUS |
| 10 | Penerbitan Tiket Digital | Tiket aktif terbit dengan nomor unik `MG-YYYYMMDD-XXXXXX` & QR verification code | ✅ LULUS |

---

## 2. Pengujian UI Frontend & Antarmuka Browser

- **Kompilasi TypeScript:** `tsc -b && vite build` lulus 100% tanpa error.
- **Halaman Publik:** `/`, `/program`, `/panduan`, `/login`, `/register` teruji responsif.
- **Dashboard Peserta:** Berhasil login, menampilkan riwayat, sapaan dinamis, notifikasi.
- **Form Pendaftaran (Stepper 5 Langkah):**
  - Step 1: 18 rute tampil sebagai kartu pilihan interaktif.
  - Step 2: Jadwal keberangkatan terhubung live dengan kapasitas kursi.
  - Step 3: Input identitas penumpang (NIK 16 digit, gender, tgl lahir).
  - Step 4: Upload berkas KTP/KIA.
  - Step 5: Ringkasan pendaftaran.
- **Panel Admin:**
  - `/admin/dashboard`: Metrik statistik live (total pendaftar, kuota, tiket, rute).
  - `/admin/pendaftar`: Tabel filter pendaftar live.
  - `/admin/rute`: Kartu 18 rute dengan toggle status aktif/nonaktif.
  - `/admin/jadwal`: 36 jadwal keberangkatan untuk 18 rute.
