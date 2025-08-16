export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  confirm_password: string;
}

export interface OTPVerificationRequest {
  email: string;
  otp: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface User {
  user_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  username: string;
  role: 'owner' | 'admin' | 'manager' | 'member';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}