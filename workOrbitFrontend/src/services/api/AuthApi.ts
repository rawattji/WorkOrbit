// src/services/api/AuthApi.ts
import api from './api';
import { LoginRequest, RegisterRequest, OTPVerificationRequest, AuthResponse } from '../../types/AuthTypes';
import { ApiResponse } from '../../types/ApiTypes';

export const AuthApi = {
  register: async (data: RegisterRequest): Promise<ApiResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  verifyOTP: async (data: OTPVerificationRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/verify-otp', data);
    return response.data;
  },

  verifyToken: async (): Promise<ApiResponse> => {
    const response = await api.get('/auth/verify-token');
    return response.data;
  },
};
