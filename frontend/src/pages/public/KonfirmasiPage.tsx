import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Bus } from 'lucide-react';
import { KonfirmasiAPI } from '../../lib/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function KonfirmasiPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!uuid) { setStatus('error'); setMessage('UUID tidak valid'); return; }
    KonfirmasiAPI.confirm(uuid)
      .then(() => { setStatus('success'); setMessage('Kehadiran Anda berhasil dikonfirmasi!'); })
      .catch((err) => {
        const msg = err?.response?.data?.message || 'Gagal mengkonfirmasi kehadiran';
        setStatus('error');
        setMessage(msg);
      });
  }, [uuid]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-brand-700 font-bold text-lg">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Bus className="w-5 h-5 text-white" />
            </div>
            Mudik Gratis Aceh
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          {status === 'loading' && <LoadingSpinner message="Mengkonfirmasi kehadiran..." />}
          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Konfirmasi Berhasil!</h2>
              <p className="text-slate-600 mb-6">{message}</p>
              <Link to="/tiket" className="btn-primary">Lihat Tiket Saya</Link>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Konfirmasi Gagal</h2>
              <p className="text-slate-600 mb-6">{message}</p>
              <Link to="/dashboard" className="btn-secondary">Kembali ke Dashboard</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
