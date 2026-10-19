import { useEffect, useState } from 'react';
import { NotificationAPI } from '../../lib/api';
import type { Notification } from '../../types';
import UserLayout from '../../components/Layout/UserLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import { Bell, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function NotifikasiPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    NotificationAPI.list()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data as { data?: Notification[] }).data ?? [];
        setNotifications(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: number) => {
    await NotificationAPI.markRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAll = async () => {
    await NotificationAPI.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <UserLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifikasi</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-slate-500 mt-1">{unreadCount} notifikasi belum dibaca</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={markAll}>
              <CheckCheck className="w-4 h-4" /> Tandai Semua Dibaca
            </Button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner message="Memuat notifikasi..." />
        ) : notifications.length === 0 ? (
          <div className="card text-center py-16">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-700 mb-2">Tidak Ada Notifikasi</h3>
            <p className="text-sm text-slate-500">Notifikasi akan muncul di sini</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`card cursor-pointer transition hover:shadow-md ${notif.is_read ? '' : 'border-brand-200 bg-brand-50'}`}
                onClick={() => !notif.is_read && markRead(notif.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${notif.is_read ? 'bg-slate-300' : 'bg-brand-500'}`} />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">{notif.title}</div>
                    <div className="text-sm text-slate-600 mt-0.5 leading-relaxed">{notif.message}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {formatDistanceToNow(new Date(notif.created_at), { locale: idLocale, addSuffix: true })}
                    </div>
                  </div>
                  {!notif.is_read && (
                    <span className="text-xs text-brand-600 font-medium shrink-0">Baru</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
