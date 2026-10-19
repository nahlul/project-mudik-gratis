import { useEffect, useState } from 'react';
import { RoutesAPI } from '../../lib/api';
import type { Route, Schedule } from '../../types';
import AdminLayout from '../../components/Layout/AdminLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Calendar, MapPin } from 'lucide-react';

export default function AdminJadwalPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [schedules, setSchedules] = useState<{ schedule: Schedule; routeName: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    RoutesAPI.list()
      .then(async (res) => {
        const routeList = Array.isArray(res.data) ? res.data : (res.data as { data?: Route[] }).data ?? [];
        setRoutes(routeList);

        const allSchedules: { schedule: Schedule; routeName: string }[] = [];
        for (const route of routeList) {
          try {
            const schedRes = await RoutesAPI.getSchedules(route.id);
            const schedList = Array.isArray(schedRes.data) ? schedRes.data : (schedRes.data as { data?: Schedule[] }).data ?? [];
            schedList.forEach((s) => allSchedules.push({ schedule: s, routeName: route.route_name || route.name || '-' }));
          } catch {
            /* ignore */
          }
        }
        setSchedules(allSchedules);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Jadwal Keberangkatan</h1>
        <p className="text-slate-500 text-sm mt-1">Daftar semua jadwal keberangkatan bus mudik gratis ({routes.length} rute)</p>
      </div>

      {loading ? (
        <LoadingSpinner message="Memuat jadwal..." />
      ) : schedules.length === 0 ? (
        <div className="card text-center py-12 text-slate-500">Belum ada jadwal keberangkatan yang dibuat</div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-left font-medium">
                <tr>
                  <th className="px-4 py-3">Rute</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Waktu</th>
                  <th className="px-4 py-3">Lokasi Keberangkatan</th>
                  <th className="px-4 py-3 text-center">Kapasitas</th>
                  <th className="px-4 py-3 text-center">Sisa Kursi</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedules.map(({ schedule, routeName }) => (
                  <tr key={schedule.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        {routeName}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(schedule.departure_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{schedule.departure_time} WIB</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{schedule.departure_location}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{schedule.capacity}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${schedule.available_seats > 10 ? 'text-green-600' : schedule.available_seats > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {schedule.available_seats}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${schedule.status === 'open' || schedule.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {schedule.status === 'open' || schedule.is_active ? 'Buka' : 'Tutup'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
