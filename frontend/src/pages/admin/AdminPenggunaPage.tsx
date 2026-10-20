import { useEffect, useState } from 'react';
import { AdminAPI } from '../../lib/api';
import type { User } from '../../types';
import AdminLayout from '../../components/Layout/AdminLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import { Shield, User as UserIcon } from 'lucide-react';

export default function AdminPenggunaPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(users.length / 10) || 1;

  useEffect(() => {
    AdminAPI.listUsers()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data as { data?: User[] }).data ?? [];
        setUsers(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const paginated = users.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Kelola Pengguna</h1>
        <p className="text-slate-500 text-sm mt-1">Daftar semua akun pengguna terdaftar ({users.length} akun)</p>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Memuat pengguna..." />
        ) : paginated.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Tidak ada pengguna ditemukan</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-left font-medium">
                <tr>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Nomor HP</th>
                  <th className="px-4 py-3">Peran</th>
                  <th className="px-4 py-3">Terdaftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-medium text-slate-900">
                        <div className="w-7 h-7 bg-brand-100 rounded-full flex items-center justify-center shrink-0">
                          <UserIcon className="w-3.5 h-3.5 text-brand-600" />
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3 text-slate-500">{u.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'petugas' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role === 'admin' && <Shield className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={users.length}
          pageSize={10}
          onPageChange={setCurrentPage}
          itemLabel="pengguna"
          className="border-0 border-t rounded-none"
        />
      </div>
    </AdminLayout>
  );
}
