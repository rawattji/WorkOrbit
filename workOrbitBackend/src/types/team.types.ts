export interface Team {
  team_id: string;
  department_id: string;
  name: string;
  created_at: Date;
}

export interface CreateTeamRequest {
  department_id: string;
  name: string;
}