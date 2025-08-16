import { Team } from '../../types/team.types';

export class TeamEntity implements Team {
  constructor(
    public team_id: string,
    public department_id: string,
    public name: string,
    public created_at: Date
  ) {}
}