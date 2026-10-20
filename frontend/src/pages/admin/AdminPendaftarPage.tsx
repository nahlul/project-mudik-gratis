import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AdminAPI, RoutesAPI } from '../../lib/api';
import type { Registration, Route } from '../../types';
import AdminLayout from '../../components/Layout/AdminLayout';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import { Search, ChevronRight, Users, Calendar, MapPin } from 'lucide-react';

interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminPendaftarPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? '');
  const [routeFilter, setRouteFilter] = useState(searchParams.get('route_id') ?? '');

  // Pagination state (default: 30 per page as requested)
  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(searchParams.get('page') ?? '1', 10) || 1
  );
  const [pageSize, setPageSize] = useState<number>(
    parseInt(searchParams.get('limit') ?? '30', 10) || 30
  );
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const loadData = useCallback(() => {
    setLoading(true);
    const params: Record<string, unknown> = {
      page: currentPage,
      limit: pageSize,
    };
    if (statusFilter) params.status = statusFilter;
    if (routeFilter) params.route_id = routeFilter;
    if (search.trim()) params.search = search.trim();

    AdminAPI.listRegistrations(params)
      .then((res) => {
        const resData = res.data as {
          data?: Registration[];
          meta?: PaginatedMeta;
        };

        const items = Array.isArray(res.data)
          ? (res.data as Registration[])
          : resData.data ?? [];

        setRegistrations(items);

        if (resData.meta) {
          setTotalItems(resData.meta.total);
          setTotalPages(resData.meta.totalPages || 1);
        } else {
          setTotalItems(items.length);
          setTotalPages(Math.ceil(items.length / pageSize) || 1);
        }
      })
      .catch((err) => {
        console.error('Error loading registrations:', err);
      })
      .finally(() => setLoading(false));
  }, [currentPage, pageSize, statusFilter, routeFilter, search]);

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

  // Synchronize URL search params
  const updateUrlParams = (newParams: Record<string, string | number>) => {
    const nextParams: Record<string, string> = {};
    if (statusFilter) nextParams.status = statusFilter;
    if (routeFilter) nextParams.route_id = routeFilter;
    if (search.trim()) nextParams.search = search.trim();
    if (currentPage > 1) nextParams.page = String(currentPage);
    if (pageSize !== 30) nextParams.limit = String(pageSize);

    Object.entries(newParams).forEach(([k, v]) => {
      if (v) nextParams[k] = String(v);
      else delete nextParams[k];
    });

    setSearchParams(nextParams);
  };

  const handleFilterChange = (newStatus: string, newRoute: string) => {
    setStatusFilter(newStatus);
    setRouteFilter(newRoute);
    setCurrentPage(1);
    updateUrlParams({ status: newStatus, route_id: newRoute, page: 1 });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    updateUrlParams({ search: search.trim(), page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateUrlParams({ page: newPage });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    updateUrlParams({ limit: newSize, page: 1 });
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Pendaftar</h1>
          <p className="text-slate-500 text-sm mt-1">
            Daftar seluruh pendaftaran peserta program Mudik Gratis Aceh 2026
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card mb-6">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, NIK, atau No. Reg..."
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
            <option value="submitted">Menunggu Verifikasi (Terkirim)</option>
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
              <option key={r.id} value={r.id}>
                {r.route_name || r.name}
              </option>
            ))}
          </select>
        </form>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="py-16">
            <LoadingSpinner message="Memuat daftar pendaftar..." />
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-base font-semibold text-slate-700">Tidak ada pendaftaran ditemukan</p>
            <p className="text-sm mt-1">Coba sesuaikan kata kunci pencarian atau ubah filter status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-left font-semibold">
                <tr>
                  <th className="px-4 py-3.5">No. Registrasi</th>
                  <th className="px-4 py-3.5">Nama Pemohon & Penumpang</th>
                  <th className="px-4 py-3.5">Rute Perjalanan</th>
                  <th className="px-4 py-3.5">Jadwal Keberangkatan</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registrations.map((reg) => {
                  const applicantName = reg.user_name || 'Pemohon';
                  const passengerCount = reg.passenger_count ?? reg.passengers?.length ?? 1;
                  const routeName =
                    reg.route_name ||
                    reg.schedule?.route?.route_name ||
                    reg.schedule?.route?.name ||
                    '-';
                  const departureDateStr = reg.departure_date || reg.schedule?.departure_date;
                  const departureTimeStr = reg.departure_time || reg.schedule?.departure_time;

                  return (
                    <tr key={reg.id} className="hover:bg-slate-50/70 transition">
                      {/* No. Reg & Tanggal Submit */}
                      <td className="px-4 py-3.5 align-middle">
                        <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded text-xs">
                          {reg.registration_number}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {new Date(reg.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      {/* Nama Pemohon & Penumpang */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                          {applicantName}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {passengerCount} orang
                            {reg.passenger_names && (
                              <span className="text-slate-400 font-normal">
                                {' '}
                                • {reg.passenger_names}
                              </span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Rute Perjalanan */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="text-slate-800 font-medium text-xs sm:text-sm flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                          <span>{routeName}</span>
                        </div>
                      </td>

                      {/* Jadwal Keberangkatan */}
                      <td className="px-4 py-3.5 align-middle">
                        {departureDateStr ? (
                          <div className="text-xs text-slate-600 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <div>
                              <span className="font-medium text-slate-800">
                                {new Date(departureDateStr).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                              {departureTimeStr && (
                                <span className="text-slate-500 ml-1.5 font-mono">
                                  {departureTimeStr.slice(0, 5)} WIB
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 align-middle">
                        <Badge status={reg.status} />
                      </td>

                      {/* Aksi Button */}
                      <td className="px-4 py-3.5 text-right align-middle">
                        <Link
                          to={`/admin/pendaftar/${reg.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3 py-1.5 rounded-lg transition"
                        >
                          Detail <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination Bar (Always Attached to Table) */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[10, 20, 30, 50, 100]}
          itemLabel="pendaftar"
          className="border-0 border-t rounded-none"
        />
      </div>
    </AdminLayout>
  );
}
