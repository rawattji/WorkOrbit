export interface RegisterRequest {
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  confirm_password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OTPVerificationRequest {
  email: string;
  otp: string;
}

export interface JWTPayload {
  user_id: string;
  email: string;
  role: string;
}