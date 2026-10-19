import { Link } from 'react-router-dom';
import { Bus, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Bus className="w-5 h-5 text-white" />
              </div>
              Mudik Gratis Aceh 2026
            </div>
            <p className="text-sm leading-relaxed">
              Program mudik gratis yang diselenggarakan oleh Pemerintah Aceh melalui Dinas Perhubungan Aceh untuk membantu masyarakat pulang kampung di hari raya.
            </p>
          </div>
          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Tautan</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition">Beranda</Link></li>
              <li><Link to="/program" className="hover:text-white transition">Tentang Program</Link></li>
              <li><Link to="/panduan" className="hover:text-white transition">Panduan Pendaftaran</Link></li>
              <li><Link to="/register" className="hover:text-white transition">Daftar Sekarang</Link></li>
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Kontak</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-brand-400 shrink-0" />
                <span>Dinas Perhubungan Aceh, Jl. T. Nyak Arief No.159, Banda Aceh</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>(0651) 7551111</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>mudikgratis@acehprov.go.id</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-800 text-sm text-center">
          © 2026 Dinas Perhubungan Aceh. Hak Cipta Dilindungi.
        </div>
      </div>
    </footer>
  );
}
