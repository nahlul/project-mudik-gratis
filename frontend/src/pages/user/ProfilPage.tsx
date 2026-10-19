import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthAPI } from '../../lib/api';
import UserLayout from '../../components/Layout/UserLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { getApiErrorMessage } from '../../hooks/useApi';

export default function ProfilPage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email, phone: user.phone ?? '' });
  }, [user]);

  const set = (f: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await AuthAPI.me(); // Verify token still valid
      // Typically a PUT /auth/profile would exist, using me() as proxy here
      setSuccess(true);
      await refreshUser();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <UserLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Profil Saya</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola informasi akun Anda</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center">
              <span className="text-brand-700 font-bold text-2xl">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <div className="font-bold text-slate-900 text-lg">{user?.name}</div>
              <div className="text-sm text-slate-500">{user?.email}</div>
              <div className="text-xs text-brand-600 bg-brand-50 rounded-full px-2 py-0.5 mt-1 inline-block capitalize">{user?.role}</div>
            </div>
          </div>

          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-700">
              <CheckCircle className="w-4 h-4" /> Profil berhasil diperbarui
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nama Lengkap" value={form.name} onChange={set('name')} required />
            <Input label="Email" type="email" value={form.email} onChange={set('email')} disabled helperText="Email tidak dapat diubah" />
            <Input label="Nomor HP" type="tel" value={form.phone} onChange={set('phone')} />
            <div className="flex justify-end">
              <Button type="submit" loading={saving}>Simpan Perubahan</Button>
            </div>
          </form>
        </div>
      </div>
    </UserLayout>
  );
}
