import UserLayout from '../../components/Layout/UserLayout';
import { Bus, CheckCircle, Users, Clock, MapPin, Phone, Mail } from 'lucide-react';

export default function ProgramPage() {
  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Bus className="w-4 h-4" /> Tentang Program
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Program Mudik Gratis Aceh 2026</h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Program Mudik Gratis adalah inisiatif Pemerintah Aceh melalui Dinas Perhubungan Aceh untuk memfasilitasi masyarakat dalam perjalanan mudik Hari Raya secara gratis, aman, dan nyaman.
          </p>
        </div>

        <div className="space-y-8">
          <div className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Latar Belakang</h2>
            <p className="text-slate-600 leading-relaxed">
              Setiap tahun, ribuan warga Aceh melakukan perjalanan mudik ke kampung halaman mereka untuk merayakan Hari Raya bersama keluarga. Pemerintah Aceh hadir untuk meringankan beban masyarakat dengan menyediakan layanan transportasi gratis ke berbagai pelosok wilayah Aceh dan daerah sekitarnya.
            </p>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Tujuan Program</h2>
            <ul className="space-y-3">
              {[
                'Membantu masyarakat berpenghasilan rendah untuk mudik dengan aman dan nyaman',
                'Mengurangi kepadatan kendaraan pribadi di jalan raya saat musim mudik',
                'Meningkatkan keselamatan berkendara selama periode mudik',
                'Memberikan kemudahan akses transportasi bagi seluruh lapisan masyarakat',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-slate-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-bold text-slate-900">Sasaran Peserta</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Warga ber-KTP Aceh</li>
                <li>• Berdomisili di wilayah Aceh</li>
                <li>• Masyarakat berpenghasilan rendah</li>
                <li>• Belum pernah mendapat tiket program ini</li>
              </ul>
            </div>
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-bold text-slate-900">Jadwal Pelaksanaan</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Pendaftaran dibuka H-30 sebelum Lebaran</li>
                <li>• Verifikasi dokumen H-14</li>
                <li>• Distribusi tiket H-7</li>
                <li>• Keberangkatan H-3 hingga H-1</li>
              </ul>
            </div>
          </div>

          <div className="card bg-brand-50 border-brand-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Hubungi Kami</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                <span className="text-sm">Jl. T. Nyak Arief No.159, Banda Aceh</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4 text-brand-600 shrink-0" />
                <span className="text-sm">(0651) 7551111</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 text-brand-600 shrink-0" />
                <span className="text-sm">mudikgratis@acehprov.go.id</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
