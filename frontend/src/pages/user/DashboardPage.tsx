import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Ticket, Users, Bell, ChevronRight, PlusCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RegistrationAPI, NotificationAPI } from '../../lib/api';
import type { Registration, Notification } from '../../types';
import UserLayout from '../../components/Layout/UserLayout';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function DashboardPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingReg, setLoadingReg] = useState(true);
  const [loadingNotif, setLoadingNotif] = useState(true);

  useEffect(() => {
    RegistrationAPI.list()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data as { data?: Registration[] }).data ?? [];
        setRegistrations(data.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoadingReg(false));

    NotificationAPI.list({ limit: 5 })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data as { data?: Notification[] }).data ?? [];
        setNotifications(data.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoadingNotif(false));
  }, []);

  const latestReg = registrations[0];

  return (
    <UserLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Selamat Datang, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-slate-500 mt-1">Kelola pendaftaran mudik Anda dari sini</p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { to: '/daftar-mudik', icon: PlusCircle, label: 'Daftar Mudik', color: 'bg-brand-600 text-white' },
            { to: '/pendaftaran', icon: FileText, label: 'Pendaftaran Saya', color: 'bg-white text-slate-700 border border-slate-200' },
            { to: '/tiket', icon: Ticket, label: 'Tiket Saya', color: 'bg-white text-slate-700 border border-slate-200' },
            { to: '/keluarga', icon: Users, label: 'Anggota Keluarga', color: 'bg-white text-slate-700 border border-slate-200' },
          ].map(({ to, icon: Icon, label, color }) => (
            <Link key={to} to={to}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl text-center font-semibold text-sm hover:shadow-md transition ${color}`}>
              <Icon className="w-6 h-6" />
              {label}
            </Link>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Latest Registration */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900">Pendaftaran Terakhir</h2>
              <Link to="/pendaftaran" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
                Semua <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {loadingReg ? (
              <LoadingSpinner size="sm" />
            ) : latestReg ? (
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">{latestReg.registration_number}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {latestReg.schedule?.route?.route_name || latestReg.schedule?.route?.name || 'Rute tidak tersedia'}
                    </div>
                  </div>
                  <Badge status={latestReg.status} />
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <Users className="w-3 h-3" />
                  {latestReg.passengers?.length ?? 0} penumpang
                </div>
                {latestReg.admin_notes && (
                  <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-700">{latestReg.admin_notes}</p>
                  </div>
                )}
                <Link to={`/pendaftaran/${latestReg.id}`} className="mt-3 text-sm text-brand-600 hover:underline flex items-center gap-1 font-medium">
                  Lihat Detail <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500 mb-3">Belum ada pendaftaran</p>
                <Link to="/daftar-mudik" className="btn-primary text-sm">Daftar Sekarang</Link>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900">Notifikasi Terbaru</h2>
              <Link to="/notifikasi" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
                Semua <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {loadingNotif ? (
              <LoadingSpinner size="sm" />
            ) : notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`p-3 rounded-lg border ${notif.is_read ? 'bg-white border-slate-100' : 'bg-brand-50 border-brand-100'}`}>
                    <div className="flex items-start gap-2">
                      <Bell className={`w-4 h-4 shrink-0 mt-0.5 ${notif.is_read ? 'text-slate-400' : 'text-brand-600'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-800">{notif.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</div>
                        <div className="text-xs text-slate-400 mt-1">
                          {formatDistanceToNow(new Date(notif.created_at), { locale: idLocale, addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Belum ada notifikasi</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
