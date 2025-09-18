// src/services/api/api.ts
import axios, {AxiosRequestHeaders} from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token + active scope headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('workorbit_token');

    const activeWorkspaceId =
      localStorage.getItem('activeWorkspaceId') || localStorage.getItem('workorbit_workspace_id');
    const activeDepartmentId =
      localStorage.getItem('activeDepartmentId') || localStorage.getItem('workorbit_department_id');
    const activeTeamId =
      localStorage.getItem('activeTeamId') || localStorage.getItem('workorbit_team_id');

    // ✅ Safe cast to avoid TS errors
    const headers = config.headers as AxiosRequestHeaders;

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (activeWorkspaceId && activeWorkspaceId !== 'null' && activeWorkspaceId !== 'undefined') {
      headers['x-active-workspace-id'] = activeWorkspaceId;
    }
    if (activeDepartmentId && activeDepartmentId !== 'null' && activeDepartmentId !== 'undefined') {
      headers['x-active-department-id'] = activeDepartmentId;
    }
    if (activeTeamId && activeTeamId !== 'null' && activeTeamId !== 'undefined') {
      headers['x-active-team-id'] = activeTeamId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
