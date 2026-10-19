import { useEffect, useState } from 'react';
import { AdminAPI } from '../../lib/api';
import type { AdminStats } from '../../types';
import AdminLayout from '../../components/Layout/AdminLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { BarChart3, Users, Ticket, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function AdminStatistikPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminAPI.stats()
      .then((res) => {
        const data = (res.data as { data?: AdminStats }).data ?? res.data as AdminStats;
        setStats(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const regsObj = stats?.registrations as Record<string, number> | undefined;
  const total = (stats?.total_registrations ?? (regsObj ? Object.values(regsObj).reduce((a: number, b: number) => a + Number(b), 0) : 0)) || 1;
  const verifiedCount = stats?.verified_registrations ?? (regsObj?.['verified'] || 0);
  const pendingCount = stats?.pending_registrations ?? (regsObj?.['submitted'] || regsObj?.['pending'] || 0);
  const rejectedCount = stats?.rejected_registrations ?? (regsObj?.['rejected'] || 0);
  const verifiedPct = Math.round((verifiedCount / total) * 100);
  const pendingPct = Math.round((pendingCount / total) * 100);
  const rejectedPct = Math.round((rejectedCount / total) * 100);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Statistik & Laporan</h1>
        <p className="text-slate-500 text-sm mt-1">Analitik dan visualisasi data pendaftaran mudik gratis</p>
      </div>

      {loading ? (
        <LoadingSpinner message="Memuat statistik..." />
      ) : (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Pendaftaran', val: stats?.total_registrations ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Total Tiket Terbit', val: stats?.total_tickets ?? 0, icon: Ticket, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Total Penumpang', val: stats?.total_passengers ?? 0, icon: BarChart3, color: 'text-brand-600', bg: 'bg-brand-50' },
              { label: 'Tingkat Kelolosan', val: `${verifiedPct}%`, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
            ].map(({ label, val, icon: Icon, color, bg }) => (
              <div key={label} className="card">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">{val}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Status Breakdown */}
          <div className="card">
            <h2 className="font-bold text-slate-900 mb-4">Distribusi Status Pendaftaran</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-slate-700 font-medium">Terverifikasi</span>
                  </div>
                  <span className="text-slate-600 font-semibold">{stats?.verified_registrations ?? 0} ({verifiedPct}%)</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${verifiedPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-slate-700 font-medium">Menunggu Verifikasi</span>
                  </div>
                  <span className="text-slate-600 font-semibold">{stats?.pending_registrations ?? 0} ({pendingPct}%)</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${pendingPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-slate-700 font-medium">Ditolak</span>
                  </div>
                  <span className="text-slate-600 font-semibold">{stats?.rejected_registrations ?? 0} ({rejectedPct}%)</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${rejectedPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Per Route Breakdown */}
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
                        <span className="text-slate-500 font-semibold">{r.count} orang</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full">
                        <div className="h-2 bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
