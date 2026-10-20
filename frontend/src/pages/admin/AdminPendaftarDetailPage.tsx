import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AdminAPI, getDocumentUrl } from '../../lib/api';
import type { Registration } from '../../types';
import AdminLayout from '../../components/Layout/AdminLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  ExternalLink,
} from 'lucide-react';

interface DocumentModalState {
  isOpen: boolean;
  title: string;
  url: string;
  filename?: string;
  isPdf?: boolean;
}

export default function AdminPendaftarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [reg, setReg] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'approve' | 'reject' | 'revision' | null>(null);
  const [notes, setNotes] = useState('');

  // Document modal states
  const [docModal, setDocModal] = useState<DocumentModalState | null>(null);
  const [docBlobUrl, setDocBlobUrl] = useState<string | null>(null);
  const [docLoading, setDocLoading] = useState(false);

  const load = () => {
    if (!id) return;
    setLoading(true);
    AdminAPI.getRegistration(Number(id))
      .then((res) => {
        const data = (res.data as { data?: Registration }).data ?? (res.data as Registration);
        setReg(data);
      })
      .catch(() => setError('Gagal memuat detail pendaftaran'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  // Load document blob for secure preview
  useEffect(() => {
    if (!docModal?.url) {
      if (docBlobUrl) {
        URL.revokeObjectURL(docBlobUrl);
        setDocBlobUrl(null);
      }
      return;
    }

    let active = true;
    setDocLoading(true);

    fetch(docModal.url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (!active) return;
        const blobUrl = URL.createObjectURL(blob);
        setDocBlobUrl(blobUrl);
      })
      .catch((err) => {
        console.error('Error loading document preview blob:', err);
      })
      .finally(() => {
        if (active) setDocLoading(false);
      });

    return () => {
      active = false;
    };
  }, [docModal?.url]);

  const handleVerify = async () => {
    if (!id || !modalType) return;
    if (modalType !== 'approve' && !notes.trim()) {
      setActionError('Catatan atau alasan wajib diisi');
      return;
    }

    setActionLoading(true);
    setActionError(null);
    const action = modalType === 'revision' ? 'request_revision' : modalType;

    try {
      await AdminAPI.verifyRegistration(Number(id), action, notes);
      setModalType(null);
      setNotes('');
      setActionSuccess(
        action === 'approve'
          ? 'Pendaftaran berhasil disetujui & tiket telah terbit otomatis!'
          : action === 'reject'
          ? 'Pendaftaran berhasil ditolak.'
          : 'Permintaan perbaikan dokumen berhasil dikirim ke peserta.'
      );
      await load();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = apiErr.response?.data?.message || apiErr.message || 'Gagal memproses verifikasi';
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner fullPage message="Memuat detail pendaftar..." />
      </AdminLayout>
    );
  }

  if (error || !reg) {
    return (
      <AdminLayout>
        <div className="card text-center text-red-600 py-8">
          <p className="font-semibold mb-3">{error || 'Data pendaftaran tidak ditemukan'}</p>
          <Button variant="secondary" size="sm" onClick={load}>
            Coba Muat Ulang
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          to="/admin/pendaftar"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Pendaftar
        </Link>

        {/* Success Alert Banner */}
        {actionSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button
              onClick={() => setActionSuccess(null)}
              className="text-xs font-bold text-emerald-700 hover:underline ml-4"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Header Card */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900">{reg.registration_number}</h1>
                <Badge status={reg.status} />
              </div>
              <p className="text-slate-500 text-sm mt-1">
                Didaftarkan pada:{' '}
                {new Date(reg.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Actions for Pending/Submitted */}
            {(reg.status === 'submitted' || reg.status === 'need_revision') && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setModalType('revision');
                    setNotes('');
                    setActionError(null);
                  }}
                >
                  <AlertCircle className="w-4 h-4 text-yellow-600" /> Minta Perbaikan
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setModalType('reject');
                    setNotes('');
                    setActionError(null);
                  }}
                >
                  <XCircle className="w-4 h-4" /> Tolak
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setModalType('approve');
                    setNotes('');
                    setActionError(null);
                  }}
                >
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

          {reg.rejection_reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 mb-4">
              <strong>Catatan / Alasan:</strong> {reg.rejection_reason}
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4 text-sm">
            <div>
              <div className="text-xs text-slate-400">Rute Perjalanan</div>
              <div className="font-semibold text-slate-800">
                {reg.schedule?.route?.route_name ||
                  reg.schedule?.route?.name ||
                  (reg as unknown as { route_name?: string }).route_name ||
                  '-'}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Jadwal Keberangkatan</div>
              <div className="font-semibold text-slate-800">
                {reg.schedule
                  ? new Date(reg.schedule.departure_date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })
                  : '-'}
                {' '}{reg.schedule?.departure_time}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Titik Kumpul / Terminal</div>
              <div className="font-semibold text-slate-800">{reg.schedule?.departure_location ?? '-'}</div>
            </div>
          </div>
        </div>

        {/* Passengers Card */}
        <div className="card">
          <h2 className="font-bold text-slate-900 mb-4">
            Data Penumpang ({reg.passengers?.length ?? 0} orang)
          </h2>
          <div className="space-y-4">
            {(reg.passengers ?? []).map((p, idx) => {
              const passengerName = p.name || p.full_name || 'Penumpang';
              const passengerAddress = p.address || p.domicile_address;
              const docs = p.documents || [];

              return (
                <div key={p.id ?? idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 text-base">{passengerName}</div>
                      <div className="text-xs text-slate-600 mt-1">
                        <span className="font-semibold">{p.identity_type}</span> • NIK:{' '}
                        <span className="font-mono font-medium text-slate-800">{p.nik}</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {p.gender === 'L' ? 'Laki-laki' : 'Perempuan'} •{' '}
                        {p.birth_date && new Date(p.birth_date).toLocaleDateString('id-ID')}
                        {p.phone && ` • HP: ${p.phone}`}
                      </div>
                      {passengerAddress && (
                        <div className="text-xs text-slate-500 mt-1">{passengerAddress}</div>
                      )}
                    </div>

                    {/* Document View Buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {docs.length > 0 ? (
                        docs.map((doc) => {
                          const docUrl = getDocumentUrl(doc.id);
                          const isPdf =
                            doc.mime_type?.includes('pdf') ||
                            doc.original_filename?.toLowerCase().endsWith('.pdf');

                          return (
                            <button
                              key={doc.id}
                              type="button"
                              onClick={() =>
                                setDocModal({
                                  isOpen: true,
                                  title: `${doc.document_type || 'Dokumen'} - ${passengerName}`,
                                  url: docUrl,
                                  filename: doc.original_filename,
                                  isPdf,
                                })
                              }
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3 py-2 rounded-lg transition"
                            >
                              <FileText className="w-4 h-4 text-brand-600" /> Lihat {doc.document_type || 'Dokumen'}
                            </button>
                          );
                        })
                      ) : p.id ? (
                        <button
                          type="button"
                          onClick={() => {
                            const docUrl = getDocumentUrl(p.id!);
                            setDocModal({
                              isOpen: true,
                              title: `Dokumen Identitas - ${passengerName}`,
                              url: docUrl,
                              filename: 'Dokumen Identitas',
                              isPdf: false,
                            });
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3 py-2 rounded-lg transition"
                        >
                          <FileText className="w-4 h-4 text-brand-600" /> Lihat Dokumen
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Verification (Approve / Reject / Request Revision) */}
        <Modal
          isOpen={!!modalType}
          onClose={() => {
            if (!actionLoading) {
              setModalType(null);
              setActionError(null);
            }
          }}
          title={
            modalType === 'approve'
              ? 'Setujui Pendaftaran'
              : modalType === 'reject'
              ? 'Tolak Pendaftaran'
              : 'Minta Perbaikan Dokumen'
          }
          size="md"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setModalType(null);
                  setActionError(null);
                }}
                disabled={actionLoading}
              >
                Batal
              </Button>
              <Button
                variant={modalType === 'reject' ? 'danger' : 'primary'}
                onClick={handleVerify}
                loading={actionLoading}
              >
                {modalType === 'approve'
                  ? 'Setujui & Terbitkan Tiket'
                  : modalType === 'reject'
                  ? 'Tolak Pendaftaran'
                  : 'Kirim Permintaan'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            {actionError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
                {actionError}
              </div>
            )}

            <p className="text-sm text-slate-600">
              {modalType === 'approve' &&
                'Apakah Anda yakin ingin menyetujui pendaftaran ini? Tiket resmi Mudik Gratis beserta kode QR unik akan otomatis dibuat untuk penumpang.'}
              {modalType === 'reject' && 'Masukkan alasan penolakan pendaftaran ini secara jelas:'}
              {modalType === 'revision' &&
                'Tuliskan instruksi atau catatan perbaikan dokumen yang harus diperbaiki oleh peserta:'}
            </p>

            {modalType !== 'approve' && (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  modalType === 'reject'
                    ? 'Contoh: NIK tidak sesuai dengan KTP yang diunggah...'
                    : 'Contoh: Foto KTP buram dan terpotong, harap unggah ulang yang jelas...'
                }
                className="input-base resize-none"
                rows={3}
                required
              />
            )}
          </div>
        </Modal>

        {/* Interactive Document Preview Modal */}
        {docModal && docModal.isOpen && (
          <Modal
            isOpen={docModal.isOpen}
            onClose={() => setDocModal(null)}
            title={docModal.title}
            size="lg"
            footer={
              <div className="flex items-center justify-between w-full">
                <a
                  href={docModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3 py-2 rounded-lg transition"
                >
                  <ExternalLink className="w-4 h-4" /> Buka di Tab Baru
                </a>
                <Button variant="secondary" onClick={() => setDocModal(null)}>
                  Tutup
                </Button>
              </div>
            }
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span>
                  Nama Berkas:{' '}
                  <strong className="text-slate-700 font-medium">{docModal.filename || 'Dokumen'}</strong>
                </span>
              </div>

              <div className="flex justify-center items-center bg-slate-900 rounded-xl p-3 min-h-[300px] max-h-[70vh] overflow-auto">
                {docLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-300">
                    <LoadingSpinner message="Mengambil pratinjau dokumen..." />
                  </div>
                ) : docBlobUrl ? (
                  docModal.isPdf ? (
                    <iframe
                      src={docBlobUrl}
                      className="w-full h-[550px] rounded-lg bg-white"
                      title="Pratinjau PDF"
                    />
                  ) : (
                    <img
                      src={docBlobUrl}
                      alt="Pratinjau Dokumen"
                      className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-md"
                    />
                  )
                ) : (
                  <div className="text-center p-6 text-white text-sm">
                    <p className="mb-2">Gagal memuat pratinjau dokumen secara langsung.</p>
                    <p className="text-xs text-slate-400">
                      Gunakan tombol &quot;Buka di Tab Baru&quot; di bawah untuk melihat file.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
}
