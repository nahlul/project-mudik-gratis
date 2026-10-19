import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, FileText, Send, Bus, Users, ChevronRight, MapPin, AlertCircle } from 'lucide-react';
import { RoutesAPI } from '../../lib/api';
import type { Route } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Footer from '../../components/Layout/Footer';
import Navbar from '../../components/Layout/Navbar';

const steps = [
  { icon: Users, title: 'Buat Akun', desc: 'Daftar dengan email dan data diri Anda' },
  { icon: FileText, title: 'Isi Formulir', desc: 'Pilih rute, jadwal, dan data penumpang' },
  { icon: Send, title: 'Upload Dokumen', desc: 'Unggah KTP/KK untuk verifikasi' },
  { icon: CheckCircle, title: 'Terima Tiket', desc: 'Tiket dikirim setelah verifikasi selesai' },
];

const requirements = [
  'KTP asli bagi penumpang dewasa (17 tahun ke atas)',
  'Kartu Keluarga (KK) bagi anak-anak',
  'Akta Kelahiran bagi bayi',
  'Merupakan warga ber-KTP Aceh atau berdomisili di Aceh',
  'Belum pernah mendapat tiket mudik gratis tahun ini',
];

const faqs = [
  { q: 'Apakah program ini benar-benar gratis?', a: 'Ya, program mudik gratis ini sepenuhnya dibiayai oleh Pemerintah Aceh. Peserta tidak dipungut biaya apapun.' },
  { q: 'Siapa yang bisa mendaftar?', a: 'Warga yang memiliki KTP Aceh atau berdomisili di Aceh dan ingin melakukan perjalanan mudik ke kampung halaman.' },
  { q: 'Berapa banyak anggota keluarga yang bisa didaftarkan?', a: 'Setiap kepala keluarga dapat mendaftarkan seluruh anggota keluarga intinya (suami, istri, dan anak-anak).' },
  { q: 'Kapan tiket akan dikirimkan?', a: 'Tiket akan tersedia di aplikasi setelah dokumen Anda diverifikasi oleh petugas Dishub Aceh.' },
  { q: 'Apa yang terjadi jika dokumen saya ditolak?', a: 'Anda akan mendapat notifikasi beserta alasan penolakan, dan dapat mengunggah ulang dokumen yang benar.' },
];

export default function HomePage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [errorRoutes, setErrorRoutes] = useState<string | null>(null);

  useEffect(() => {
    RoutesAPI.list()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data :
          (res.data as { data?: Route[] }).data ?? [];
        setRoutes(data);
      })
      .catch(() => setErrorRoutes('Gagal memuat rute'))
      .finally(() => setLoadingRoutes(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Bus className="w-4 h-4" />
              Program Pemerintah Aceh 2026
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Mudik Gratis<br />Aceh 2026
            </h1>
            <p className="text-lg md:text-xl text-brand-100 mb-8 max-w-xl leading-relaxed">
              Program mudik gratis dari Dinas Perhubungan Aceh untuk membantu masyarakat pulang kampung di Hari Raya dengan aman, nyaman, dan tanpa biaya.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 font-bold px-8 py-4 rounded-xl hover:bg-brand-50 transition text-base shadow-lg"
              >
                Daftar Sekarang <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center bg-white/20 hover:bg-white/30 text-white font-semibold px-8 py-4 rounded-xl transition text-base border border-white/30"
              >
                Sudah Punya Akun? Masuk
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Rute Tujuan', value: '18+' },
              { label: 'Kursi Tersedia', value: '10.000+' },
              { label: 'Kota/Kabupaten', value: '23' },
              { label: 'Tahun Program', value: '2026' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-extrabold text-brand-700">{s.value}</div>
                <div className="text-sm text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara Pendaftaran */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Cara Pendaftaran</h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Proses pendaftaran mudah dan cepat, cukup ikuti 4 langkah berikut
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div key={step.title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center">
                <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-6 h-6 text-brand-600" />
                </div>
                <div className="text-xs font-bold text-brand-600 mb-1">Langkah {idx + 1}</div>
                <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rute Tujuan */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Rute Tujuan</h2>
            <p className="text-slate-600">Tersedia {routes.length || '18'} rute perjalanan ke berbagai wilayah di Aceh dan sekitarnya</p>
          </div>

          {loadingRoutes ? (
            <LoadingSpinner message="Memuat rute..." />
          ) : errorRoutes ? (
            <div className="flex items-center gap-2 text-red-600 justify-center py-8">
              <AlertCircle className="w-5 h-5" />{errorRoutes}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {routes.map((route) => (
                <div key={route.id} className={`rounded-xl border p-4 flex items-start gap-3 ${route.is_active ? 'border-slate-200 bg-slate-50 hover:border-brand-300 hover:bg-brand-50 transition' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                  <div className="w-9 h-9 bg-brand-100 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">{route.name || route.route_name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{route.origin} → {route.destination}</div>
                    {!route.is_active && (
                      <span className="text-xs text-red-500 mt-1 block">Tidak tersedia</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/register" className="btn-primary inline-flex items-center gap-2">
              Daftar dan Pilih Rute <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Persyaratan */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Persyaratan Dokumen</h2>
            <p className="text-slate-600">Siapkan dokumen berikut untuk kelancaran proses pendaftaran</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <ul className="space-y-3">
              {requirements.map((req) => (
                <li key={req} className="flex items-start gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Pertanyaan Umum</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">{faq.q}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Segera Daftar Sebelum Kuota Habis!</h2>
          <p className="text-brand-100 mb-8">Pendaftaran dibuka terbatas. Pastikan Anda dan keluarga mendapatkan tempat.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-8 py-4 rounded-xl hover:bg-brand-50 transition text-base shadow-lg">
            Daftar Sekarang <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
