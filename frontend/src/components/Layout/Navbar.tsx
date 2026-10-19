import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bus, Bell, ChevronDown, LogOut, User, FileText, Ticket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-brand-700 text-lg">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:block">Mudik Gratis Aceh</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/program" className="hover:text-brand-700 transition">Program</Link>
            <Link to="/panduan" className="hover:text-brand-700 transition">Panduan</Link>
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="hover:text-brand-700 transition">Masuk</Link>
                <Link to="/register" className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition">
                  Daftar Sekarang
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 hover:text-brand-700 transition"
                >
                  <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                    <span className="text-brand-700 font-bold text-xs">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span>{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {dropOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                    <Link to="/dashboard" onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 transition">
                      <User className="w-4 h-4 text-slate-400" /> Dashboard
                    </Link>
                    <Link to="/pendaftaran" onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 transition">
                      <FileText className="w-4 h-4 text-slate-400" /> Pendaftaran Saya
                    </Link>
                    <Link to="/tiket" onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 transition">
                      <Ticket className="w-4 h-4 text-slate-400" /> Tiket Saya
                    </Link>
                    <Link to="/notifikasi" onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 transition">
                      <Bell className="w-4 h-4 text-slate-400" /> Notifikasi
                    </Link>
                    <hr className="my-1 border-slate-200" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition"
                    >
                      <LogOut className="w-4 h-4" /> Keluar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          <Link to="/program" className="block py-2 text-sm font-medium text-slate-600 hover:text-brand-700" onClick={() => setMenuOpen(false)}>Program</Link>
          <Link to="/panduan" className="block py-2 text-sm font-medium text-slate-600 hover:text-brand-700" onClick={() => setMenuOpen(false)}>Panduan</Link>
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="block py-2 text-sm font-medium text-slate-600" onClick={() => setMenuOpen(false)}>Masuk</Link>
              <Link to="/register" className="block text-center bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-700" onClick={() => setMenuOpen(false)}>Daftar Sekarang</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="block py-2 text-sm font-medium text-slate-600" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/pendaftaran" className="block py-2 text-sm font-medium text-slate-600" onClick={() => setMenuOpen(false)}>Pendaftaran</Link>
              <Link to="/tiket" className="block py-2 text-sm font-medium text-slate-600" onClick={() => setMenuOpen(false)}>Tiket Saya</Link>
              <button onClick={handleLogout} className="block py-2 text-sm font-medium text-red-600 w-full text-left">Keluar</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
