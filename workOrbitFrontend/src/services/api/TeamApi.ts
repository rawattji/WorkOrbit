import api from './api';
import { CreateTeamRequest, Team } from '../../types/TeamTypes';
import { ApiResponse } from '../../types/ApiTypes';

export const TeamsApi = {
  createTeam: async (data: CreateTeamRequest): Promise<ApiResponse<Team>> => {
    const response = await api.post('/teams', data);
    return response.data;
  },

  getTeamsByDepartment: async (department_id: string): Promise<ApiResponse<Team[]>> => {
    const response = await api.get(`/teams/department/${department_id}`);
    return response.data;
  },

  getTeamById: async (team_id: string): Promise<ApiResponse<Team>> => {
    const response = await api.get(`/teams/${team_id}`);
    return response.data;
  },

  joinTeam: async (data: { team_id: string }): Promise<ApiResponse<null>> => {
    const response = await api.post('/teams/join', data);
    return response.data;
  },
};
