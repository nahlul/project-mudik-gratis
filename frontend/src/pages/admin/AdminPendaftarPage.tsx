import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AdminAPI, RoutesAPI } from '../../lib/api';
import type { Registration, Route } from '../../types';
import AdminLayout from '../../components/Layout/AdminLayout';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import { Search, ChevronRight } from 'lucide-react';

export default function AdminPendaftarPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? '');
  const [routeFilter, setRouteFilter] = useState(searchParams.get('route_id') ?? '');
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(registrations.length / 10) || 1;

  const loadData = useCallback(() => {
    setLoading(true);
    const params: Record<string, unknown> = {};
    if (statusFilter) params.status = statusFilter;
    if (routeFilter) params.route_id = routeFilter;
    if (search) params.search = search;

    AdminAPI.listRegistrations(params)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data as { data?: Registration[] }).data ?? [];
        setRegistrations(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter, routeFilter, search]);

  useEffect(() => {
    RoutesAPI.list()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data as { data?: Route[] }).data ?? [];
        setRoutes(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (status: string, route: string) => {
    setStatusFilter(status);
    setRouteFilter(route);
    const p: Record<string, string> = {};
    if (status) p.status = status;
    if (route) p.route_id = route;
    if (search) p.search = search;
    setSearchParams(p);
  };

  const paginated = registrations.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Kelola Pendaftar</h1>
        <p className="text-slate-500 text-sm mt-1">Daftar semua permohonan pendaftaran mudik gratis</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau No. Reg..."
              className="input-base pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value, routeFilter)}
            className="input-base"
          >
            <option value="">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Menunggu Verifikasi</option>
            <option value="need_revision">Perlu Perbaikan</option>
            <option value="verified">Terverifikasi</option>
            <option value="rejected">Ditolak</option>
          </select>
          <select
            value={routeFilter}
            onChange={(e) => handleFilterChange(statusFilter, e.target.value)}
            className="input-base"
          >
            <option value="">Semua Rute</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>{r.route_name || r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Memuat pendaftar..." />
        ) : paginated.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Tidak ada pendaftaran ditemukan</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-left font-medium">
                <tr>
                  <th className="px-4 py-3">No. Reg</th>
                  <th className="px-4 py-3">Rute</th>
                  <th className="px-4 py-3">Jadwal</th>
                  <th className="px-4 py-3">Penumpang</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{reg.registration_number}</td>
                    <td className="px-4 py-3 text-slate-600">{reg.schedule?.route?.route_name || reg.schedule?.route?.name || '-'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {reg.schedule ? (
                        <>
                          {new Date(reg.schedule.departure_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          <br />
                          {reg.schedule.departure_time}
                        </>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{reg.passengers?.length ?? 0} orang</td>
                    <td className="px-4 py-3"><Badge status={reg.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/pendaftar/${reg.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition"
                      >
                        Detail <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </AdminLayout>
  );
}
