// src/services/api/WorkspaceApi.ts
import api from './api';
import { CreateWorkspaceRequest, Workspace } from '../../types/WokspaceTypes';
import { ApiResponse } from '../../types/ApiTypes';

export const WorkspaceApi = {
  createWorkspace: async (data: CreateWorkspaceRequest): Promise<ApiResponse<Workspace>> => {
    const response = await api.post('/workspaces', data);
    return response.data;
  },

  getWorkspaces: async (): Promise<ApiResponse<Workspace[]>> => {
    const response = await api.get('/workspaces');
    return response.data;
  },

  getWorkspaceById: async (workspace_id: string): Promise<ApiResponse<Workspace>> => {
    const response = await api.get(`/workspaces/${workspace_id}`);
    return response.data;
  },

  joinWorkspace: async (workspace_id: string, role: string = 'member'): Promise<ApiResponse<any>> => {
    const response = await api.post('/workspaces/join', { workspace_id, role });
    return response.data;
  },

};