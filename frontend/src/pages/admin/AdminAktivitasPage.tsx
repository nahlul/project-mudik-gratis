import { useEffect, useState } from 'react';
import { AdminAPI } from '../../lib/api';
import AdminLayout from '../../components/Layout/AdminLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import { Activity, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface ActivityLog {
  id: number;
  user_id?: number;
  action: string;
  description: string;
  created_at: string;
}

export default function AdminAktivitasPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(logs.length / 15) || 1;

  useEffect(() => {
    AdminAPI.activityLog()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data as { data?: ActivityLog[] }).data ?? [];
        setLogs(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const paginated = logs.slice((currentPage - 1) * 15, currentPage * 15);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Log Aktivitas</h1>
        <p className="text-slate-500 text-sm mt-1">Riwayat aksi dan perubahan pada sistem Mudik Gratis</p>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Memuat log aktivitas..." />
        ) : paginated.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p>Belum ada aktivitas tercatat</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginated.map((log) => (
              <div key={log.id} className="p-4 flex items-start gap-3 hover:bg-slate-50 transition">
                <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Activity className="w-4 h-4 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">{log.action}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5">{log.description}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDistanceToNow(new Date(log.created_at), { locale: idLocale, addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </AdminLayout>
  );
}
