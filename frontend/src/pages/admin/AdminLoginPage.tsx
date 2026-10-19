import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bus, Eye, EyeOff, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../hooks/useApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Email dan kata sandi wajib diisi'); return; }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-white font-bold text-xl">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <Bus className="w-6 h-6 text-white" />
            </div>
            Mudik Gratis Aceh
          </div>
          <div className="flex items-center justify-center gap-2 mt-3 text-slate-400 text-sm">
            <Shield className="w-4 h-4" />
            <span>Panel Administrator</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-xl font-bold text-slate-900 mb-6">Masuk sebagai Admin</h1>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email Admin" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@mudikgratis.ac.id" required />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Kata Sandi <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" loading={loading} className="w-full">Masuk ke Panel Admin</Button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-4">
          <Link to="/login" className="hover:text-white transition">← Masuk sebagai Peserta</Link>
        </p>
      </div>
    </div>
  );
}
