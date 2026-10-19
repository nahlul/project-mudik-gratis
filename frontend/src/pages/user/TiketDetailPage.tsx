import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TicketAPI } from '../../lib/api';
import type { Ticket } from '../../types';
import UserLayout from '../../components/Layout/UserLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import { ArrowLeft, Download, QrCode } from 'lucide-react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export default function TiketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!id) return;
    TicketAPI.getById(Number(id))
      .then(async (res) => {
        const data = (res.data as { data?: Ticket }).data ?? res.data as Ticket;
        setTicket(data);
        if (data.verification_code) {
          const url = await QRCode.toDataURL(data.verification_code, { width: 200, margin: 1 });
          setQrDataUrl(url);
        }
      })
      .catch(() => setError('Gagal memuat tiket'))
      .finally(() => setLoading(false));
  }, [id]);

  const maskCode = (code: string) => code.slice(0, 4) + '****' + code.slice(-4);

  const downloadPdf = async () => {
    if (!ticket) return;
    setGenerating(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
      const pageW = doc.internal.pageSize.getWidth();
      
      doc.setFillColor(2, 132, 199);
      doc.rect(0, 0, pageW, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('TIKET MUDIK GRATIS ACEH 2026', pageW / 2, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Dinas Perhubungan Aceh', pageW / 2, 22, { align: 'center' });

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`No. Tiket: ${ticket.ticket_number}`, 15, 42);

      const details = [
        ['Penumpang', ticket.passenger?.name ?? '-'],
        ['NIK', ticket.passenger?.nik ?? '-'],
        ['Rute', ticket.route?.route_name || ticket.route?.name || ticket.registration?.schedule?.route?.route_name || ticket.registration?.schedule?.route?.name || '-'],
        ['Tanggal', ticket.registration?.schedule ? new Date(ticket.registration.schedule.departure_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'],
        ['Jam', ticket.registration?.schedule?.departure_time ?? '-'],
        ['Lokasi', ticket.registration?.schedule?.departure_location ?? '-'],
        ['Kode Verifikasi', ticket.verification_code ? maskCode(ticket.verification_code) : '-'],
      ];

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      let y = 52;
      details.forEach(([label, val]) => {
        doc.setTextColor(100, 116, 139);
        doc.text(label + ':', 15, y);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text(val, 65, y);
        doc.setFont('helvetica', 'normal');
        y += 9;
      });

      if (qrDataUrl) {
        doc.addImage(qrDataUrl, 'PNG', pageW / 2 - 25, y + 5, 50, 50);
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(9);
        doc.text('Tunjukkan QR Code ini kepada petugas', pageW / 2, y + 60, { align: 'center' });
      }

      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Tiket ini sah dan berlaku sesuai jadwal yang tertera', pageW / 2, 190, { align: 'center' });

      doc.save(`tiket-mudik-${ticket.ticket_number}.pdf`);
    } catch {
      /* ignore */
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <UserLayout><LoadingSpinner fullPage message="Memuat tiket..." /></UserLayout>;
  if (error || !ticket) return <UserLayout><div className="max-w-2xl mx-auto p-8"><div className="card text-center text-red-600">{error || 'Tiket tidak ditemukan'}</div></div></UserLayout>;

  return (
    <UserLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/tiket" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Tiket
        </Link>

        <div className="card mb-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-600 to-brand-700 -m-6 mb-6 p-6 rounded-t-xl">
            <div className="text-white/80 text-xs font-medium mb-1">TIKET MUDIK GRATIS ACEH 2026</div>
            <div className="text-white text-xl font-bold">{ticket.ticket_number}</div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            {[
              ['Penumpang', ticket.passenger?.name ?? '-'],
              ['NIK', ticket.passenger?.nik ?? '-'],
              ['Rute', ticket.route?.route_name || ticket.route?.name || ticket.registration?.schedule?.route?.route_name || ticket.registration?.schedule?.route?.name || '-'],
              ['Tanggal Berangkat', ticket.registration?.schedule ?
                new Date(ticket.registration.schedule.departure_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                : '-'],
              ['Jam Berangkat', ticket.registration?.schedule?.departure_time ?? '-'],
              ['Lokasi Keberangkatan', ticket.registration?.schedule?.departure_location ?? '-'],
              ['Kode Verifikasi', ticket.verification_code ? maskCode(ticket.verification_code) : '-'],
            ].map(([label, val]) => (
              <div key={label}>
                <div className="text-xs text-slate-400 mb-0.5">{label}</div>
                <div className="font-semibold text-slate-800">{val}</div>
              </div>
            ))}
          </div>

          {/* QR Code */}
          {qrDataUrl ? (
            <div className="flex flex-col items-center border-t border-slate-200 pt-6">
              <QrCode className="w-5 h-5 text-slate-400 mb-2" />
              <img src={qrDataUrl} alt="QR Code Tiket" className="w-40 h-40" />
              <p className="text-xs text-slate-400 mt-2">Tunjukkan QR Code ini kepada petugas</p>
            </div>
          ) : null}
        </div>

        <Button onClick={downloadPdf} loading={generating} className="w-full">
          <Download className="w-4 h-4" /> Unduh Tiket PDF
        </Button>

        <p className="text-xs text-slate-400 text-center mt-4">
          Tiket ini adalah bukti resmi pendaftaran program Mudik Gratis Aceh 2026
        </p>
      </div>
    </UserLayout>
  );
}
