import UserLayout from '../../components/Layout/UserLayout';
import { CheckCircle, AlertCircle, Upload, FileText, HelpCircle } from 'lucide-react';

const steps = [
  {
    step: 1,
    title: 'Buat Akun',
    desc: 'Kunjungi halaman pendaftaran dan isi data diri Anda (nama lengkap, email aktif, nomor HP, dan kata sandi). Pastikan email yang digunakan aktif karena notifikasi akan dikirim ke sana.',
  },
  {
    step: 2,
    title: 'Pilih Rute dan Jadwal',
    desc: 'Setelah login, klik menu "Daftar Mudik" dan pilih rute tujuan yang tersedia. Kemudian pilih jadwal keberangkatan yang sesuai. Perhatikan ketersediaan kursi.',
  },
  {
    step: 3,
    title: 'Isi Data Penumpang',
    desc: 'Tambahkan data semua penumpang yang akan mudik (diri sendiri dan anggota keluarga). Data meliputi: nama lengkap, NIK, tanggal lahir, jenis kelamin, dan alamat.',
  },
  {
    step: 4,
    title: 'Upload Dokumen',
    desc: 'Upload foto atau scan dokumen identitas untuk setiap penumpang. Format yang diterima: JPG, PNG, atau PDF. Pastikan dokumen terbaca dengan jelas.',
  },
  {
    step: 5,
    title: 'Submit dan Tunggu Verifikasi',
    desc: 'Periksa kembali semua data, lalu tekan tombol "Submit Pendaftaran". Tim Dishub Aceh akan memverifikasi dokumen Anda dalam 1-3 hari kerja.',
  },
  {
    step: 6,
    title: 'Ambil Tiket',
    desc: 'Jika pendaftaran disetujui, tiket digital akan tersedia di menu "Tiket Saya". Tunjukkan tiket ini saat keberangkatan.',
  },
];

export default function PanduanPage() {
  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Panduan Pendaftaran</h1>
          <p className="text-lg text-slate-600">Ikuti langkah-langkah berikut untuk mendaftar program Mudik Gratis Aceh 2026</p>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-12">
          {steps.map((s) => (
            <div key={s.step} className="card flex gap-4">
              <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                {s.step}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Dokumen */}
        <div className="card mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-bold text-slate-900">Ketentuan Upload Dokumen</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: CheckCircle, color: 'text-green-500', text: 'Format: JPG, JPEG, PNG, atau PDF' },
              { icon: CheckCircle, color: 'text-green-500', text: 'Ukuran file maksimal: 2 MB per dokumen' },
              { icon: CheckCircle, color: 'text-green-500', text: 'Dokumen harus terbaca jelas dan tidak blur' },
              { icon: CheckCircle, color: 'text-green-500', text: 'Foto/scan semua sudut dokumen harus terlihat' },
              { icon: AlertCircle, color: 'text-red-500', text: 'Dokumen palsu atau tidak valid akan ditolak' },
              { icon: AlertCircle, color: 'text-red-500', text: 'Foto selfie dengan KTP tidak diterima' },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-2">
                <item.icon className={`w-4 h-4 ${item.color} shrink-0 mt-0.5`} />
                <span className="text-sm text-slate-600">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="card bg-amber-50 border-amber-200 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <HelpCircle className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-bold text-slate-900">Tips Pendaftaran</h2>
          </div>
          <ul className="space-y-2">
            {[
              'Daftar seawal mungkin karena kuota terbatas',
              'Siapkan semua dokumen sebelum mulai mengisi formulir',
              'Periksa email secara berkala untuk notifikasi status pendaftaran',
              'Pastikan nomor HP aktif untuk menerima informasi penting',
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-amber-500 font-bold">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div className="card bg-brand-50 border-brand-200">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-bold text-slate-900">Status Pendaftaran</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { status: 'Draft', color: 'bg-slate-100 text-slate-700', desc: 'Formulir belum disubmit' },
              { status: 'Terkirim', color: 'bg-blue-100 text-blue-700', desc: 'Sedang menunggu verifikasi' },
              { status: 'Perlu Perbaikan', color: 'bg-yellow-100 text-yellow-700', desc: 'Ada dokumen yang perlu diperbaiki' },
              { status: 'Terverifikasi', color: 'bg-green-100 text-green-700', desc: 'Tiket siap diunduh' },
              { status: 'Ditolak', color: 'bg-red-100 text-red-700', desc: 'Pendaftaran tidak memenuhi syarat' },
            ].map((s) => (
              <div key={s.status} className="flex items-center gap-3">
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.color}`}>{s.status}</span>
                <span className="text-sm text-slate-600">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
