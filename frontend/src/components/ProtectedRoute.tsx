import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'peserta' | 'admin' | 'petugas';
  redirectTo?: string;
}

export default function ProtectedRoute({ children, role, redirectTo = '/login' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole, user } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (role && !hasRole(role)) {
    const fallback = (user?.role === 'admin' || user?.role === 'petugas') ? '/admin/dashboard' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
