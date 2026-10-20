// Shared types for Mudik Gratis Aceh

export interface UserRole {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: 'peserta' | 'admin' | 'petugas' | string;
  roles?: UserRole[] | string[];
  status?: string;
  created_at?: string;
}

export interface Route {
  id: number;
  name?: string;
  route_name?: string;
  origin: string;
  destination: string;
  description?: string;
  is_active: boolean | number;
  schedules?: Schedule[];
}

export interface Schedule {
  id: number;
  route_id: number;
  departure_date: string;
  departure_time: string;
  departure_location: string;
  capacity: number;
  available_seats: number;
  is_active?: boolean | number;
  status?: string;
  route?: Route;
}

export interface FamilyMember {
  id: number;
  user_id: number;
  name: string;
  nik: string;
  birth_date: string;
  gender: 'L' | 'P';
  identity_type: string;
  phone?: string;
  address?: string;
  age_category?: string;
}

export interface Passenger {
  id?: number;
  name: string;
  full_name?: string;
  nik: string;
  birth_date: string;
  gender: 'L' | 'P';
  identity_type: string;
  phone?: string;
  address?: string;
  domicile_address?: string;
  age_category?: string;
  document_status?: string;
  documents?: Array<{
    id: number;
    document_type?: string;
    original_filename?: string;
    mime_type?: string;
    file_size?: number;
    verification_status?: string;
  }>;
}

export interface Registration {
  id: number;
  registration_number: string;
  user_id: number;
  schedule_id: number;
  status: 'draft' | 'submitted' | 'need_revision' | 'verified' | 'rejected';
  admin_notes?: string;
  rejection_reason?: string;
  passengers?: Passenger[];
  schedule?: Schedule;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  registration_id: number;
  passenger_id: number;
  verification_code: string;
  status: string;
  registration?: Registration;
  passenger?: Passenger;
  schedule?: Schedule;
  route?: Route;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminStats {
  total_registrations?: number;
  pending_registrations?: number;
  verified_registrations?: number;
  rejected_registrations?: number;
  total_tickets?: number;
  total_passengers?: number;
  total_users?: number;
  active_routes?: number;
  open_schedules?: number;
  active_tickets?: number;
  registrations?: Record<string, number>;
  by_route?: Array<{ route_name: string; count: number }>;
}

export interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    per_page: number;
    last_page: number;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type RegistrationStatus = 'draft' | 'submitted' | 'need_revision' | 'verified' | 'rejected';
