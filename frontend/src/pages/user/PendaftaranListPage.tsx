import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RegistrationAPI } from '../../lib/api';
import type { Registration } from '../../types';
import UserLayout from '../../components/Layout/UserLayout';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { FileText, ChevronRight, Plus } from 'lucide-react';

export default function PendaftaranListPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    RegistrationAPI.list()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data as { data?: Registration[] }).data ?? [];
        setRegistrations(data);
      })
      .catch(() => setError('Gagal memuat daftar pendaftaran'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pendaftaran Saya</h1>
            <p className="text-slate-500 text-sm mt-1">Riwayat dan status semua pendaftaran mudik Anda</p>
          </div>
          <Link to="/daftar-mudik" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Daftar Baru
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Memuat data..." />
        ) : error ? (
          <div className="card text-center text-red-600">{error}</div>
        ) : registrations.length === 0 ? (
          <div className="card text-center py-16">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-700 mb-2">Belum Ada Pendaftaran</h3>
            <p className="text-sm text-slate-500 mb-4">Anda belum mendaftar program mudik gratis</p>
            <Link to="/daftar-mudik" className="btn-primary">Daftar Sekarang</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {registrations.map((reg) => (
              <div key={reg.id} className="card hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-slate-900">{reg.registration_number}</span>
                      <Badge status={reg.status} />
                    </div>
                    <div className="text-sm text-slate-600">
                      {reg.schedule?.route?.route_name || reg.schedule?.route?.name || 'Rute tidak tersedia'}
                    </div>
                    {reg.schedule && (
                      <div className="text-xs text-slate-400 mt-1">
                        {new Date(reg.schedule.departure_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        {' • '}
                        {reg.schedule.departure_time}
                      </div>
                    )}
                    <div className="text-xs text-slate-400 mt-1">
                      {reg.passengers?.length ?? 0} penumpang
                    </div>
                    {reg.admin_notes && (
                      <div className="mt-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                        Catatan: {reg.admin_notes}
                      </div>
                    )}
                  </div>
                  <Link to={`/pendaftaran/${reg.id}`} className="flex items-center gap-1 text-sm text-brand-600 hover:underline font-medium ml-4">
                    Detail <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
