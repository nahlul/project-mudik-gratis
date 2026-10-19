import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { AuthAPI } from '../../lib/api';
import { getApiErrorMessage } from '../../hooks/useApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<typeof form>>({});
  const navigate = useNavigate();

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs: Partial<typeof form> = {};
    if (!form.name.trim()) errs.name = 'Nama wajib diisi';
    if (!form.email) errs.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Format email tidak valid';
    if (!form.phone) errs.phone = 'Nomor HP wajib diisi';
    else if (!/^[0-9+]{8,15}$/.test(form.phone)) errs.phone = 'Format nomor HP tidak valid';
    if (!form.password) errs.password = 'Kata sandi wajib diisi';
    else if (form.password.length < 8) errs.password = 'Kata sandi minimal 8 karakter';
    if (!form.confirmPassword) errs.confirmPassword = 'Konfirmasi kata sandi wajib diisi';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Kata sandi tidak cocok';
    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setError('');
    setLoading(true);
    try {
      await AuthAPI.register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Pendaftaran Berhasil!</h2>
          <p className="text-slate-600 mb-6">Akun Anda berhasil dibuat. Anda akan diarahkan ke halaman masuk...</p>
          <Link to="/login" className="btn-primary">Masuk Sekarang</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-slate-100 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-brand-700 font-bold text-xl">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <Bus className="w-6 h-6 text-white" />
            </div>
            Mudik Gratis Aceh
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Buat Akun Baru</h1>
          <p className="text-slate-500 text-sm mt-1">Sudah punya akun?{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:underline">Masuk di sini</Link>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nama Lengkap" value={form.name} onChange={set('name')} placeholder="Nama sesuai KTP" error={fieldErrors.name} required />
            <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="nama@email.com" error={fieldErrors.email} required />
            <Input label="Nomor HP" type="tel" value={form.phone} onChange={set('phone')} placeholder="08xxxxxxxxxx" error={fieldErrors.phone} required />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Kata Sandi <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Minimal 8 karakter"
                  className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${fieldErrors.password ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-xs text-red-600">{fieldErrors.password}</p>}
            </div>
            <Input label="Konfirmasi Kata Sandi" type={showPass ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Ulangi kata sandi" error={fieldErrors.confirmPassword} required />
            <Button type="submit" loading={loading} className="w-full">
              Daftar Sekarang
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
