import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { FamilyAPI } from '../../lib/api';
import type { FamilyMember } from '../../types';
import UserLayout from '../../components/Layout/UserLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal, { ConfirmModal } from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Plus, Pencil, Trash2, Users, AlertCircle } from 'lucide-react';

const emptyForm = {
  name: '', nik: '', birth_date: '', gender: 'L' as 'L' | 'P',
  identity_type: 'KTP', phone: '', address: '',
};

export default function KeluargaPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<FamilyMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FamilyMember | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () => {
    setLoading(true);
    FamilyAPI.list()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data as { data?: FamilyMember[] }).data ?? [];
        setMembers(data);
      })
      .catch(() => setError('Gagal memuat data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditTarget(null); setForm({ ...emptyForm }); setFormError(''); setShowModal(true); };
  const openEdit = (m: FamilyMember) => { setEditTarget(m); setForm({ name: m.name, nik: m.nik, birth_date: m.birth_date, gender: m.gender, identity_type: m.identity_type, phone: m.phone ?? '', address: m.address ?? '' }); setFormError(''); setShowModal(true); };

  const set = (field: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.nik || !form.birth_date) { setFormError('Nama, NIK, dan tanggal lahir wajib diisi'); return; }
    if (form.nik.length !== 16) { setFormError('NIK harus 16 digit'); return; }
    setSaving(true);
    setFormError('');
    try {
      if (editTarget) {
        await FamilyAPI.update(editTarget.id, form);
      } else {
        await FamilyAPI.create(form);
      }
      setShowModal(false);
      load();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      setFormError(e.response?.data?.message ?? 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await FamilyAPI.delete(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch {
      setError('Gagal menghapus anggota keluarga');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Anggota Keluarga</h1>
            <p className="text-slate-500 text-sm mt-1">Simpan data anggota keluarga untuk mempercepat pendaftaran</p>
          </div>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Tambah</Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {loading ? (
          <LoadingSpinner message="Memuat data..." />
        ) : members.length === 0 ? (
          <div className="card text-center py-16">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-700 mb-2">Belum Ada Anggota Keluarga</h3>
            <p className="text-sm text-slate-500 mb-4">Tambahkan anggota keluarga untuk mempercepat proses pendaftaran</p>
            <Button onClick={openAdd}><Plus className="w-4 h-4" /> Tambah Anggota</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((m) => (
              <div key={m.id} className="card flex items-start justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{m.name}</div>
                  <div className="text-sm text-slate-500 mt-0.5">{m.identity_type} • NIK: {m.nik}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {m.gender === 'L' ? 'Laki-laki' : 'Perempuan'} •{' '}
                    {m.birth_date && new Date(m.birth_date).toLocaleDateString('id-ID')}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => openEdit(m)} className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-500 hover:text-brand-600">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(m)} className="p-2 rounded-lg hover:bg-red-50 transition text-slate-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Add/Edit */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editTarget ? 'Edit Anggota Keluarga' : 'Tambah Anggota Keluarga'}
          size="md"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>Batal</Button>
              <Button onClick={(e) => handleSave(e as unknown as FormEvent)} loading={saving}>Simpan</Button>
            </>
          }
        >
          {formError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />{formError}
            </div>
          )}
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Nama Lengkap" value={form.name} onChange={set('name')} required />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Jenis Identitas</label>
                <select value={form.identity_type} onChange={set('identity_type')} className="input-base">
                  <option value="KTP">KTP</option>
                  <option value="KK">Kartu Keluarga</option>
                  <option value="AKTA">Akta Kelahiran</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Jenis Kelamin</label>
                <select value={form.gender} onChange={set('gender')} className="input-base">
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
            </div>
            <Input label="NIK (16 digit)" value={form.nik} onChange={set('nik')} maxLength={16} required />
            <Input label="Tanggal Lahir" type="date" value={form.birth_date} onChange={set('birth_date')} required />
            <Input label="Nomor HP" type="tel" value={form.phone} onChange={set('phone')} />
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Alamat</label>
              <textarea value={form.address} onChange={set('address')} className="input-base resize-none" rows={2} />
            </div>
          </form>
        </Modal>

        {/* Confirm Delete */}
        <ConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Hapus Anggota Keluarga"
          message={`Apakah Anda yakin ingin menghapus ${deleteTarget?.name}? Tindakan ini tidak dapat dibatalkan.`}
          confirmLabel="Hapus"
          confirmVariant="danger"
          loading={deleting}
        />
      </div>
    </UserLayout>
  );
}
