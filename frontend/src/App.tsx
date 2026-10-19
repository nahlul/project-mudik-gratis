import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import ProgramPage from './pages/public/ProgramPage';
import PanduanPage from './pages/public/PanduanPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';
import KonfirmasiPage from './pages/public/KonfirmasiPage';

// User Pages
import DashboardPage from './pages/user/DashboardPage';
import DaftarMudikPage from './pages/user/DaftarMudikPage';
import PendaftaranListPage from './pages/user/PendaftaranListPage';
import PendaftaranDetailPage from './pages/user/PendaftaranDetailPage';
import TiketListPage from './pages/user/TiketListPage';
import TiketDetailPage from './pages/user/TiketDetailPage';
import KeluargaPage from './pages/user/KeluargaPage';
import ProfilPage from './pages/user/ProfilPage';
import NotifikasiPage from './pages/user/NotifikasiPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminPendaftarPage from './pages/admin/AdminPendaftarPage';
import AdminPendaftarDetailPage from './pages/admin/AdminPendaftarDetailPage';
import AdminRutePage from './pages/admin/AdminRutePage';
import AdminJadwalPage from './pages/admin/AdminJadwalPage';
import AdminStatistikPage from './pages/admin/AdminStatistikPage';
import AdminPenggunaPage from './pages/admin/AdminPenggunaPage';
import AdminAktivitasPage from './pages/admin/AdminAktivitasPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/program" element={<ProgramPage />} />
          <Route path="/panduan" element={<PanduanPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/konfirmasi/:uuid" element={<KonfirmasiPage />} />

          {/* User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="peserta">
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/daftar-mudik"
            element={
              <ProtectedRoute role="peserta">
                <DaftarMudikPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pendaftaran"
            element={
              <ProtectedRoute role="peserta">
                <PendaftaranListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pendaftaran/:id"
            element={
              <ProtectedRoute role="peserta">
                <PendaftaranDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tiket"
            element={
              <ProtectedRoute role="peserta">
                <TiketListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tiket/:id"
            element={
              <ProtectedRoute role="peserta">
                <TiketDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/keluarga"
            element={
              <ProtectedRoute role="peserta">
                <KeluargaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profil"
            element={
              <ProtectedRoute role="peserta">
                <ProfilPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifikasi"
            element={
              <ProtectedRoute role="peserta">
                <NotifikasiPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="petugas">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pendaftar"
            element={
              <ProtectedRoute role="petugas">
                <AdminPendaftarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pendaftar/:id"
            element={
              <ProtectedRoute role="petugas">
                <AdminPendaftarDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rute"
            element={
              <ProtectedRoute role="admin">
                <AdminRutePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/jadwal"
            element={
              <ProtectedRoute role="admin">
                <AdminJadwalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/statistik"
            element={
              <ProtectedRoute role="admin">
                <AdminStatistikPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pengguna"
            element={
              <ProtectedRoute role="admin">
                <AdminPenggunaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/aktivitas"
            element={
              <ProtectedRoute role="admin">
                <AdminAktivitasPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
