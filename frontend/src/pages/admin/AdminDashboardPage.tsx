import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AdminAPI } from '../../lib/api';
import type { AdminStats } from '../../types';
import AdminLayout from '../../components/Layout/AdminLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Users, Clock, CheckCircle, XCircle, Ticket, TrendingUp, RefreshCw } from 'lucide-react';
import { getApiErrorMessage } from '../../hooks/useApi';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = useCallback(() => {
    setLoading(true);
    setError('');
    AdminAPI.stats()
      .then((res) => {
        const data = (res.data as { data?: AdminStats }).data ?? res.data as AdminStats;
        setStats(data);
      })
      .catch((err) => {
        const msg = getApiErrorMessage(err);
        setError(msg || 'Gagal memuat statistik. Silakan coba beberapa saat lagi.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const regsObj = stats?.registrations as Record<string, number> | undefined;
  const totalRegs = stats?.total_registrations ?? (regsObj ? Object.values(regsObj).reduce((a: number, b: number) => a + Number(b), 0) : 0);
  const pendingRegs = stats?.pending_registrations ?? (regsObj?.['submitted'] || regsObj?.['pending'] || 0);
  const verifiedRegs = stats?.verified_registrations ?? (regsObj?.['verified'] || 0);
  const rejectedRegs = stats?.rejected_registrations ?? (regsObj?.['rejected'] || 0);
  const totalTickets = stats?.total_tickets ?? stats?.active_tickets ?? 0;
  const totalRoutes = stats?.active_routes ?? 18;

  const cards = stats ? [
    { label: 'Total Pendaftar', value: totalRegs, icon: Users, color: 'bg-blue-50 text-blue-700', iconColor: 'text-blue-500' },
    { label: 'Menunggu Verifikasi', value: pendingRegs, icon: Clock, color: 'bg-yellow-50 text-yellow-700', iconColor: 'text-yellow-500' },
    { label: 'Terverifikasi', value: verifiedRegs, icon: CheckCircle, color: 'bg-green-50 text-green-700', iconColor: 'text-green-500' },
    { label: 'Ditolak', value: rejectedRegs, icon: XCircle, color: 'bg-red-50 text-red-700', iconColor: 'text-red-500' },
    { label: 'Total Tiket', value: totalTickets, icon: Ticket, color: 'bg-purple-50 text-purple-700', iconColor: 'text-purple-500' },
    { label: 'Rute Aktif', value: totalRoutes, icon: TrendingUp, color: 'bg-brand-50 text-brand-700', iconColor: 'text-brand-500' },
  ] : [];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Admin</h1>
        <p className="text-slate-500 text-sm mt-1">Ringkasan data program Mudik Gratis Aceh 2026</p>
      </div>

      {loading ? (
        <LoadingSpinner message="Memuat data..." />
      ) : error ? (
        <div className="card text-center py-8">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={loadStats}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition"
            >
              <RefreshCw className="w-4 h-4" /> Coba Muat Ulang
            </button>
            <Link
              to="/admin/login"
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
            >
              Login Ulang Admin
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {cards.map(({ label, value, icon: Icon, color, iconColor }) => (
              <div key={label} className={`card flex items-center gap-4 ${color}`}>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <div>
                  <div className="text-2xl font-extrabold">{value?.toLocaleString('id-ID') ?? 0}</div>
                  <div className="text-xs font-medium opacity-80">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {stats?.by_route && stats.by_route.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-slate-900 mb-4">Pendaftar per Rute</h2>
              <div className="space-y-3">
                {stats.by_route.map((r) => {
                  const maxCount = Math.max(...stats.by_route!.map((x) => x.count));
                  const pct = maxCount > 0 ? (r.count / maxCount) * 100 : 0;
                  return (
                    <div key={r.route_name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700 font-medium">{r.route_name}</span>
                        <span className="text-slate-500">{r.count} pendaftar</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full">
                        <div className="h-2 bg-brand-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <Link to="/admin/pendaftar?status=submitted" className="card hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-yellow-500" />
                <div>
                  <div className="font-bold text-slate-900">{stats?.pending_registrations ?? 0} Menunggu</div>
                  <div className="text-sm text-slate-500">Pendaftaran perlu diverifikasi</div>
                </div>
              </div>
            </Link>
            <Link to="/admin/pendaftar" className="card hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-brand-500" />
                <div>
                  <div className="font-bold text-slate-900">Semua Pendaftar</div>
                  <div className="text-sm text-slate-500">Lihat dan kelola semua pendaftaran</div>
                </div>
              </div>
            </Link>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
