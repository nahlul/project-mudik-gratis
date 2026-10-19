import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../hooks/useApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs: typeof fieldErrors = {};
    if (!email) errs.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Format email tidak valid';
    if (!password) errs.password = 'Kata sandi wajib diisi';
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
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-brand-700 font-bold text-xl">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <Bus className="w-6 h-6 text-white" />
            </div>
            Mudik Gratis Aceh
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Masuk ke Akun Anda</h1>
          <p className="text-slate-500 text-sm mt-1">Belum punya akun?{' '}
            <Link to="/register" className="text-brand-600 font-semibold hover:underline">Daftar di sini</Link>
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
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              error={fieldErrors.email}
              required
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Kata Sandi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${fieldErrors.password ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-xs text-red-600">{fieldErrors.password}</p>}
            </div>
            <div className="text-right">
              <Link to="/reset-password" className="text-sm text-brand-600 hover:underline">Lupa kata sandi?</Link>
            </div>
            <Button type="submit" loading={loading} className="w-full">
              Masuk
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Panel Admin?{' '}
          <Link to="/admin/login" className="text-brand-600 hover:underline">Masuk sebagai Admin</Link>
        </p>
      </div>
    </div>
  );
}
