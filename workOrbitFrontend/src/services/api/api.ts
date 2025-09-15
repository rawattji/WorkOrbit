import axios from 'axios';
import { ApiResponse } from '../../types/ApiTypes';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('workorbit_token');
    const activeWorkspaceId = localStorage.getItem('activeWorkspaceId');
    const activeDepartmentId = localStorage.getItem('activeDepartmentId');
    const activeTeamId = localStorage.getItem('activeTeamId');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Normalize values: only set non-empty strings, else set empty
    config.headers['x-active-workspace-id'] =
      activeWorkspaceId && activeWorkspaceId !== 'null' && activeWorkspaceId !== 'undefined'
        ? activeWorkspaceId
        : '';
    config.headers['x-active-department-id'] =
      activeDepartmentId && activeDepartmentId !== 'null' && activeDepartmentId !== 'undefined'
        ? activeDepartmentId
        : '';
    config.headers['x-active-team-id'] =
      activeTeamId && activeTeamId !== 'null' && activeTeamId !== 'undefined'
        ? activeTeamId
        : '';

    return config;
  },
  (error) => Promise.reject(error)
);


// Response interceptor to handle errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('workorbit_token');
//       localStorage.removeItem('workorbit_user');
//       // window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

export default api;
