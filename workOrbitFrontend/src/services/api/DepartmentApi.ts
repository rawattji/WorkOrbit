import api from './api';
import { CreateDepartmentRequest, Department } from '../../types/DepartmentTypes';
import { ApiResponse } from '../../types/ApiTypes';

export const DepartmentApi = {
  createDepartment: async (data: CreateDepartmentRequest): Promise<ApiResponse<Department>> => {
    const response = await api.post('/departments', data);
    return response.data;
  },

  getDepartmentsByWorkspace: async (workspace_id: string): Promise<ApiResponse<Department[]>> => {
    const response = await api.get(`/departments/workspace/${workspace_id}`);
    return response.data;
  },

  getDepartmentById: async (department_id: string): Promise<ApiResponse<Department>> => {
    const response = await api.get(`/departments/${department_id}`);
    return response.data;
  },

  joinDepartment: async (data: { department_id: string }): Promise<ApiResponse<null>> => {
    const response = await api.post('/departments/join', data);
    return response.data;
  },
};
