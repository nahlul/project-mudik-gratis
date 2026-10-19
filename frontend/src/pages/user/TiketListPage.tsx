import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TicketAPI } from '../../lib/api';
import type { Ticket } from '../../types';
import UserLayout from '../../components/Layout/UserLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Ticket as TicketIcon, ChevronRight } from 'lucide-react';

export default function TiketListPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    TicketAPI.list()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data as { data?: Ticket[] }).data ?? [];
        setTickets(data);
      })
      .catch(() => setError('Gagal memuat tiket'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Tiket Saya</h1>
          <p className="text-slate-500 text-sm mt-1">Semua tiket mudik yang sudah terverifikasi</p>
        </div>

        {loading ? (
          <LoadingSpinner message="Memuat tiket..." />
        ) : error ? (
          <div className="card text-center text-red-600">{error}</div>
        ) : tickets.length === 0 ? (
          <div className="card text-center py-16">
            <TicketIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-700 mb-2">Belum Ada Tiket</h3>
            <p className="text-sm text-slate-500">Tiket akan muncul setelah pendaftaran Anda diverifikasi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="card hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <TicketIcon className="w-4 h-4 text-brand-600" />
                      <span className="font-bold text-slate-900">{ticket.ticket_number}</span>
                    </div>
                    <div className="text-sm text-slate-600">{ticket.passenger?.name ?? 'Penumpang'}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {ticket.route?.route_name || ticket.route?.name || ticket.registration?.schedule?.route?.route_name || ticket.registration?.schedule?.route?.name || '-'}
                    </div>
                    {ticket.registration?.schedule && (
                      <div className="text-xs text-slate-400">
                        {new Date(ticket.registration.schedule.departure_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                  <Link to={`/tiket/${ticket.id}`} className="flex items-center gap-1 text-sm text-brand-600 hover:underline font-medium ml-4">
                    Lihat <ChevronRight className="w-4 h-4" />
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
