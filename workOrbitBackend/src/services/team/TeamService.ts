import { TeamRepository } from '../../models/repositories/TeamRepository';
import { TeamEntity } from '../../models/entities/Team';
import { CreateTeamRequest } from '../../types/team.types';
import { NotFoundError } from '../../utils/errors';

export class TeamService {
  private teamRepository: TeamRepository;

  constructor() {
    this.teamRepository = new TeamRepository();
  }

  async createTeam(teamData: CreateTeamRequest & { user_id: string }): Promise<TeamEntity> {
    // 1. Check if team already exists in the department
    const existingTeam = await this.teamRepository.findByNameInDepartment(
      teamData.department_id,
      teamData.name
    );

    if (existingTeam) {
      // Map user to existing team
      await this.teamRepository.mapUserToTeam(teamData.user_id, existingTeam.team_id);
      return existingTeam;
    }

    // 2. Create new team
    const newTeam = await this.teamRepository.createTeam(teamData);

    // 3. Map user to new team
    await this.teamRepository.mapUserToTeam(teamData.user_id, newTeam.team_id);

    return newTeam;
  }

  async getTeamsByDepartment(department_id: string): Promise<TeamEntity[]> {
    return await this.teamRepository.findMany({ department_id });
  }

  async getTeamById(team_id: string): Promise<TeamEntity> {
    const team = await this.teamRepository.findById(team_id);
    if (!team) {
      throw new NotFoundError('Team not found');
    }
    return team;
  }

  async mapUserToTeam(user_id: string, team_id: string): Promise<void> {
    return this.teamRepository.mapUserToTeam(user_id, team_id);
  }

  async isUserInTeam(user_id: string, team_id: string): Promise<boolean> {
    const result = await this.teamRepository.findUserInTeam(user_id, team_id);
    return !!result;
  }

  async getAllTeamsInDepartment(department_id: string) {
    return this.teamRepository.findAllTeamsInDepartment(department_id);
  }
}
