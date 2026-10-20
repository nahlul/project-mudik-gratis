import axios, { AxiosError } from 'axios';
import type {
  AuthResponse,
  User,
  Route,
  Schedule,
  FamilyMember,
  Registration,
  Ticket,
  Notification,
  AdminStats,
  Passenger,
} from '../types';

export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:3001/api/v1`;
  }
  return 'http://localhost:3001/api/v1';
};

export const getDocumentUrl = (documentId: number) => {
  const token = localStorage.getItem('token');
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/admin/documents/${documentId}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth ────────────────────────────────────────────────────────────────────
export const AuthAPI = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post<AuthResponse>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<User>('/auth/me'),
};

// ─── Routes ──────────────────────────────────────────────────────────────────
export const RoutesAPI = {
  list: (params?: Record<string, unknown>) =>
    api.get<Route[]>('/routes', { params }),

  getById: (id: number) =>
    api.get<Route>(`/routes/${id}`),

  getSchedules: (routeId: number) =>
    api.get<Schedule[]>(`/routes/${routeId}/schedules`),
};

// ─── Family ──────────────────────────────────────────────────────────────────
export const FamilyAPI = {
  list: () => api.get<FamilyMember[]>('/family'),

  create: (data: Omit<FamilyMember, 'id' | 'user_id'>) =>
    api.post<FamilyMember>('/family', data),

  update: (id: number, data: Partial<FamilyMember>) =>
    api.put<FamilyMember>(`/family/${id}`, data),

  delete: (id: number) => api.delete(`/family/${id}`),
};

// ─── Registration ─────────────────────────────────────────────────────────────
export const RegistrationAPI = {
  create: (data: { schedule_id: number; passengers: Passenger[] }) =>
    api.post<Registration>('/registrations', data),

  list: (params?: Record<string, unknown>) =>
    api.get<Registration[]>('/registrations', { params }),

  getById: (id: number) =>
    api.get<Registration>(`/registrations/${id}`),

  submit: (id: number) =>
    api.post<Registration>(`/registrations/${id}/submit`),

  uploadDocument: (registrationId: number, passengerId: number, formData: FormData) =>
    api.post(`/registrations/${registrationId}/passengers/${passengerId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ─── Tickets ─────────────────────────────────────────────────────────────────
export const TicketAPI = {
  list: (params?: Record<string, unknown>) =>
    api.get<Ticket[]>('/tickets', { params }),

  getById: (id: number) =>
    api.get<Ticket>(`/tickets/${id}`),

  download: (id: number) =>
    api.get(`/tickets/${id}/download`, { responseType: 'blob' }),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const NotificationAPI = {
  list: (params?: Record<string, unknown>) =>
    api.get<Notification[]>('/notifications', { params }),

  markRead: (id: number) =>
    api.patch<Notification>(`/notifications/${id}/read`),

  markAllRead: () => api.patch('/notifications/read-all'),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const AdminAPI = {
  stats: () => api.get<AdminStats>('/admin/stats'),

  listRegistrations: (params?: Record<string, unknown>) =>
    api.get<Registration[]>('/admin/registrations', { params }),

  getRegistration: (id: number) =>
    api.get<Registration>(`/admin/registrations/${id}`),

  verifyRegistration: (id: number, action: 'approve' | 'reject' | 'request_revision', notes?: string) =>
    api.post(`/admin/registrations/${id}/verify`, { action, notes, reason: notes, note: notes }),

  approveRegistration: (id: number, note?: string) =>
    api.post(`/admin/registrations/${id}/approve`, { note }),

  rejectRegistration: (id: number, reason: string) =>
    api.post(`/admin/registrations/${id}/reject`, { reason }),

  requestRevision: (id: number, note: string) =>
    api.post(`/admin/registrations/${id}/request-revision`, { note }),

  listRoutes: (params?: Record<string, unknown>) =>
    api.get<Route[]>('/admin/routes', { params }),

  listSchedules: (params?: Record<string, unknown>) =>
    api.get<Schedule[]>('/admin/schedules', { params }),

  updateRoute: (id: number, data: Partial<Route>) =>
    api.put<Route>(`/admin/routes/${id}`, data),

  createSchedule: (routeId: number, data: Partial<Schedule>) =>
    api.post<Schedule>(`/admin/routes/${routeId}/schedules`, data),

  updateSchedule: (routeId: number, scheduleId: number, data: Partial<Schedule>) =>
    api.put<Schedule>(`/admin/routes/${routeId}/schedules/${scheduleId}`, data),

  listUsers: (params?: Record<string, unknown>) =>
    api.get<User[]>('/admin/users', { params }),

  getDocument: (documentId: number) =>
    api.get(`/admin/documents/${documentId}`, { responseType: 'blob' }),

  activityLog: (params?: Record<string, unknown>) =>
    api.get('/admin/activity-log', { params }),
};

// ─── Konfirmasi ──────────────────────────────────────────────────────────────
export const KonfirmasiAPI = {
  confirm: (uuid: string) =>
    api.post(`/confirm/${uuid}`),

  getByUuid: (uuid: string) =>
    api.get(`/confirm/${uuid}`),
};
