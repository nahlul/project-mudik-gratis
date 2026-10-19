import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { AuthAPI } from '../lib/api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: 'peserta' | 'admin' | 'petugas') => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await AuthAPI.login({ email, password });
    const payload =
      (res.data as { data?: { token: string; user: User } }).data ??
      (res.data as { token: string; user: User });
    const newToken = payload.token;
    const newUser = payload.user;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    try { AuthAPI.logout(); } catch { /* ignore */ }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await AuthAPI.me();
      const userData = (res.data as { data?: User }).data ?? (res.data as User);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch {
      // token might be invalid
    }
  }, []);

  const hasRole = useCallback(
    (targetRole: 'peserta' | 'admin' | 'petugas') => {
      if (!user) return false;
      const userRoles: string[] = [];
      if (user.role) userRoles.push(user.role);
      if (Array.isArray(user.roles)) {
        user.roles.forEach((r) => {
          if (typeof r === 'string') userRoles.push(r);
          else if (r && typeof r === 'object' && 'name' in r) userRoles.push(r.name);
        });
      }
      if (targetRole === 'peserta') {
        return userRoles.includes('peserta') || userRoles.length === 0;
      }
      if (targetRole === 'admin') {
        return userRoles.includes('admin') || userRoles.includes('superadmin');
      }
      if (targetRole === 'petugas') {
        return (
          userRoles.includes('petugas') ||
          userRoles.includes('admin') ||
          userRoles.includes('superadmin')
        );
      }
      return false;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        hasRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
