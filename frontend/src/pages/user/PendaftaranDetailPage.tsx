import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { RegistrationAPI } from '../../lib/api';
import type { Registration } from '../../types';
import UserLayout from '../../components/Layout/UserLayout';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { AlertCircle, Upload, Ticket, ArrowLeft, Users, Calendar, MapPin } from 'lucide-react';

export default function PendaftaranDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [reg, setReg] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [_uploadIdx, setUploadIdx] = useState<number | null>(null);
  const [_uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) return;
    RegistrationAPI.getById(Number(id))
      .then((res) => {
        const data = (res.data as { data?: Registration }).data ?? res.data as Registration;
        setReg(data);
      })
      .catch(() => setError('Gagal memuat detail pendaftaran'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpload = async (passengerId: number, file: File) => {
    if (!reg) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('document', file);
      await RegistrationAPI.uploadDocument(reg.id, passengerId, fd);
      // Refresh
      const res = await RegistrationAPI.getById(reg.id);
      setReg((res.data as { data?: Registration }).data ?? res.data as Registration);
    } catch {
      setError('Gagal upload dokumen');
    } finally {
      setUploading(false);
      setUploadIdx(null);
    }
  };

  if (loading) return <UserLayout><LoadingSpinner fullPage message="Memuat detail..." /></UserLayout>;
  if (error || !reg) return <UserLayout><div className="max-w-3xl mx-auto p-8"><div className="card text-center text-red-600">{error || 'Data tidak ditemukan'}</div></div></UserLayout>;

  return (
    <UserLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/pendaftaran" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
        </Link>

        <div className="card mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{reg.registration_number}</h1>
              <p className="text-slate-500 text-sm mt-1">Dibuat: {new Date(reg.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <Badge status={reg.status} />
          </div>

          {reg.admin_notes && (
            <div className={`flex items-start gap-2 rounded-lg p-3 mb-4 text-sm ${reg.status === 'need_revision' ? 'bg-yellow-50 border border-yellow-200 text-yellow-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div><strong>Catatan Admin:</strong> {reg.admin_notes}</div>
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-slate-400">Rute</div>
                <div className="font-medium text-slate-800">
                  {reg.schedule?.route?.route_name || (reg as unknown as Record<string, string>).route_name || reg.schedule?.route?.name || '-'}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-slate-400">Tanggal</div>
                <div className="font-medium text-slate-800">
                  {reg.schedule?.departure_date || (reg as unknown as Record<string, string>).departure_date
                    ? new Date(reg.schedule?.departure_date || (reg as unknown as Record<string, string>).departure_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '-'}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-slate-400">Penumpang</div>
                <div className="font-medium text-slate-800">{reg.passengers?.length ?? 0} orang</div>
              </div>
            </div>
          </div>

          {reg.status === 'verified' && (
            <div className="mt-4">
              <Link to="/tiket" className="btn-primary flex items-center gap-2 w-fit">
                <Ticket className="w-4 h-4" /> Lihat Tiket
              </Link>
            </div>
          )}
        </div>

        {/* Passengers */}
        <div className="card">
          <h2 className="font-bold text-slate-900 mb-4">Daftar Penumpang</h2>
          <div className="space-y-3">
            {(reg.passengers ?? []).map((p, idx) => (
              <div key={p.id ?? idx} className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">{p.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{p.identity_type} • NIK: {p.nik}</div>
                    <div className="text-xs text-slate-500">
                      {p.gender === 'L' ? 'Laki-laki' : 'Perempuan'} •{' '}
                      {p.birth_date && new Date(p.birth_date).toLocaleDateString('id-ID')}
                    </div>
                    {p.document_status && (
                      <div className={`text-xs mt-1 font-medium ${p.document_status === 'verified' ? 'text-green-600' : p.document_status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                        Dokumen: {p.document_status}
                      </div>
                    )}
                  </div>
                  {reg.status === 'need_revision' && p.id && (
                    <label className="cursor-pointer flex items-center gap-1 text-xs text-brand-600 hover:underline font-medium">
                      <Upload className="w-3 h-3" /> Upload Ulang
                      <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && p.id) handleUpload(p.id, file);
                        }} />
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
