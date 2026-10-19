import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AdminAPI } from '../../lib/api';
import type { Registration } from '../../types';
import AdminLayout from '../../components/Layout/AdminLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';

export default function AdminPendaftarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [reg, setReg] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [modalType, setModalType] = useState<'approve' | 'reject' | 'revision' | null>(null);
  const [notes, setNotes] = useState('');

  const load = () => {
    if (!id) return;
    setLoading(true);
    AdminAPI.getRegistration(Number(id))
      .then((res) => {
        const data = (res.data as { data?: Registration }).data ?? res.data as Registration;
        setReg(data);
      })
      .catch(() => setError('Gagal memuat detail'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleVerify = async () => {
    if (!id || !modalType) return;
    setActionLoading(true);
    const action = modalType === 'revision' ? 'request_revision' : modalType;
    try {
      await AdminAPI.verifyRegistration(Number(id), action, notes);
      setModalType(null);
      setNotes('');
      load();
    } catch {
      setError('Gagal memproses verifikasi');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <AdminLayout><LoadingSpinner fullPage message="Memuat detail..." /></AdminLayout>;
  if (error || !reg) return <AdminLayout><div className="card text-center text-red-600">{error || 'Data tidak ditemukan'}</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <Link to="/admin/pendaftar" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Pendaftar
        </Link>

        {/* Header Card */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900">{reg.registration_number}</h1>
                <Badge status={reg.status} />
              </div>
              <p className="text-slate-500 text-sm mt-1">
                Didaftarkan: {new Date(reg.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            {/* Actions */}
            {reg.status === 'submitted' && (
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => { setModalType('revision'); setNotes(''); }}>
                  <AlertCircle className="w-4 h-4 text-yellow-600" /> Minta Perbaikan
                </Button>
                <Button variant="danger" size="sm" onClick={() => { setModalType('reject'); setNotes(''); }}>
                  <XCircle className="w-4 h-4" /> Tolak
                </Button>
                <Button size="sm" onClick={() => { setModalType('approve'); setNotes(''); }}>
                  <CheckCircle className="w-4 h-4" /> Setujui
                </Button>
              </div>
            )}
          </div>

          {reg.admin_notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 mb-4">
              <strong>Catatan Petugas:</strong> {reg.admin_notes}
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4 text-sm">
            <div>
              <div className="text-xs text-slate-400">Rute</div>
              <div className="font-semibold text-slate-800">{reg.schedule?.route?.route_name || reg.schedule?.route?.name || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Jadwal Keberangkatan</div>
              <div className="font-semibold text-slate-800">
                {reg.schedule ? new Date(reg.schedule.departure_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }) : '-'}
                {' '}{reg.schedule?.departure_time}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Titik Kumpul</div>
              <div className="font-semibold text-slate-800">{reg.schedule?.departure_location ?? '-'}</div>
            </div>
          </div>
        </div>

        {/* Passengers */}
        <div className="card">
          <h2 className="font-bold text-slate-900 mb-4">Data Penumpang ({reg.passengers?.length ?? 0} orang)</h2>
          <div className="space-y-4">
            {(reg.passengers ?? []).map((p, idx) => (
              <div key={p.id ?? idx} className="border border-slate-200 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {p.identity_type} • NIK: <span className="font-mono">{p.nik}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {p.gender === 'L' ? 'Laki-laki' : 'Perempuan'} •{' '}
                      {p.birth_date && new Date(p.birth_date).toLocaleDateString('id-ID')}
                      {p.phone && ` • HP: ${p.phone}`}
                    </div>
                    {p.address && <div className="text-xs text-slate-400 mt-0.5">{p.address}</div>}
                  </div>
                  {/* Document button */}
                  {p.id && (
                    <a
                      href={`/api/v1/admin/documents/${p.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-2 rounded-lg transition shrink-0"
                    >
                      <FileText className="w-4 h-4" /> Lihat Dokumen
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Verification */}
        <Modal
          isOpen={!!modalType}
          onClose={() => setModalType(null)}
          title={
            modalType === 'approve' ? 'Setujui Pendaftaran' :
            modalType === 'reject' ? 'Tolak Pendaftaran' : 'Minta Perbaikan Dokumen'
          }
          size="md"
          footer={
            <>
              <Button variant="secondary" onClick={() => setModalType(null)} disabled={actionLoading}>Batal</Button>
              <Button
                variant={modalType === 'reject' ? 'danger' : 'primary'}
                onClick={handleVerify}
                loading={actionLoading}
              >
                {modalType === 'approve' ? 'Setujui' : modalType === 'reject' ? 'Tolak' : 'Kirim Permintaan'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              {modalType === 'approve' && 'Apakah Anda yakin ingin menyetujui pendaftaran ini? Tiket akan otomatis dibuat untuk penumpang.'}
              {modalType === 'reject' && 'Masukkan alasan penolakan pendaftaran ini:'}
              {modalType === 'revision' && 'Tuliskan catatan perbaikan dokumen yang harus diperbaiki oleh peserta:'}
            </p>
            {modalType !== 'approve' && (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tuliskan catatan / alasan di sini..."
                className="input-base resize-none"
                rows={3}
                required
              />
            )}
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
