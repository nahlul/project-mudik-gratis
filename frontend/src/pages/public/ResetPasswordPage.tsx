import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Bus, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import api from '../../lib/api';
import { getApiErrorMessage } from '../../hooks/useApi';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Email wajib diisi'); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
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
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Lupa Kata Sandi</h1>
          <p className="text-slate-500 text-sm mt-1">Masukkan email Anda untuk mereset kata sandi</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {success ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Email Terkirim!</h3>
              <p className="text-sm text-slate-600 mb-4">Jika email Anda terdaftar, kami akan mengirimkan tautan reset kata sandi.</p>
              <Link to="/login" className="text-brand-600 font-semibold hover:underline text-sm">Kembali ke halaman masuk</Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Email <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <Button type="submit" loading={loading} className="w-full">
                  Kirim Link Reset
                </Button>
              </form>
              <p className="text-center mt-4 text-sm">
                <Link to="/login" className="text-brand-600 hover:underline">Kembali ke halaman masuk</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
