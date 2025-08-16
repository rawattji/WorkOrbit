import { BaseRepository } from './BaseRepository';
import { TeamEntity } from '../entities/Team';
import { CreateTeamRequest } from '../../types/team.types';
import { v4 as uuidv4 } from 'uuid';

export class TeamRepository extends BaseRepository<TeamEntity> {
  constructor() {
    super('team');
  }

  protected mapRowToEntity(row: any): TeamEntity {
    return new TeamEntity(
      row.team_id,
      row.department_id,
      row.name,
      row.created_at
    );
  }

  async createTeam(teamData: CreateTeamRequest): Promise<TeamEntity> {
    const teamWithId = {
      team_id: uuidv4(),
      ...teamData,
      created_at: new Date()
    };
    return this.create(teamWithId);
  }

  async findById(team_id: string): Promise<TeamEntity | null> {
    return this.findOne({ team_id });
  }

  async findByNameInDepartment(department_id: string, name: string): Promise<TeamEntity | null> {
    const result = await this.query(
      `SELECT * FROM ${this.tableName} 
       WHERE department_id = $1 AND LOWER(name) = LOWER($2) 
       LIMIT 1`,
      [department_id, name]
    );
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async findAllTeamsInDepartment(department_id: string): Promise<Pick<TeamEntity, 'team_id' | 'name'>[]> {
    const result = await this.query(
      `SELECT team_id, name 
       FROM ${this.tableName} 
       WHERE department_id = $1 
       ORDER BY created_at DESC`,
      [department_id]
    );
    return result.rows;
  }

  async mapUserToTeam(user_id: string, team_id: string): Promise<void> {
    await this.query(
      `INSERT INTO user_team (user_id, team_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, team_id) DO NOTHING`,
      [user_id, team_id]
    );
  }

  async findUserInTeam(user_id: string, team_id: string): Promise<any | null> {
    const result = await this.query(
      `SELECT * FROM user_team WHERE user_id = $1 AND team_id = $2 LIMIT 1`,
      [user_id, team_id]
    );
    return result.rows[0] || null;
  }

}
