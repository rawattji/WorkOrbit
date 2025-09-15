import { BaseRepository } from './BaseRepository';
import { UserEntity } from '../entities/User';
import { CreateUserRequest } from '../../types/user.types';
import { v4 as uuidv4 } from 'uuid';

export class UserRepository extends BaseRepository<UserEntity> {
  constructor() {
    super('users');
  }

  protected mapRowToEntity(row: any): UserEntity {
    return new UserEntity(
      row.user_id,
      row.first_name,
      row.last_name,
      row.email,
      row.username,
      row.password_hash,
      row.role,
      row.is_verified,
      row.created_at,
      row.updated_at,
      row.middle_name
    );
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.findOne({ email });
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    return this.findOne({ username });
  }

  async findById(user_id: string): Promise<UserEntity | null> {
    return this.findOne({ user_id });
  }

  async createUser(userData: CreateUserRequest & { password_hash: string }): Promise<UserEntity> {
    const userWithId = {
      user_id: uuidv4(),
      ...userData,
      role: userData.role || 'member',
      is_verified: false,
      created_at: new Date(),
      updated_at: new Date()
    };

    return this.create(userWithId);
  }

  async verifyUser(user_id: string): Promise<UserEntity | null> {
    return this.update({ user_id }, { is_verified: true } as any);
  }

  async findTeammates(workspaceId: string, departmentId: string | null, teamId: string | null) {
    let sql = `
      SELECT u.id, u.name, u.email
      FROM users u
      JOIN user_workspace uw ON uw.user_id = u.id
      WHERE uw.workspace_id = $1
    `;
    const params: any[] = [workspaceId];

    if (departmentId) {
      sql += ` AND uw.department_id = $${params.length + 1}`;
      params.push(departmentId);
    }
    if (teamId) {
      sql += ` AND uw.team_id = $${params.length + 1}`;
      params.push(teamId);
    }

    const res = await this.pool.query(sql, params);
    return res.rows;
  }
}
