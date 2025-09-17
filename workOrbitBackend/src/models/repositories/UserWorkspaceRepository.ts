// src/models/repositories/UserWorkspaceRepository.ts
import { v4 as uuidv4 } from 'uuid';
import { BaseRepository } from './BaseRepository';
import { UserWorkspaceEntity } from '../entities/UserWorkspace';
import { UserRole } from '../../types/user.types';

export class UserWorkspaceRepository extends BaseRepository<UserWorkspaceEntity> {
  constructor() {
    super('user_workspace');
  }

  protected mapRowToEntity(row: any): UserWorkspaceEntity {
    return new UserWorkspaceEntity(
      row.id,
      row.user_id,
      row.workspace_id,
      row.role,
      row.department_id ?? null,
      row.team_id ?? null,
      row.created_at ?? null,
      row.updated_at ?? null
    );
  }

  async createUserWorkspace(user_id: string, workspace_id: string, role: UserRole, department_id?: string | null, team_id?: string | null): Promise<UserWorkspaceEntity> {
    const payload = {
      id: uuidv4(),
      user_id,
      workspace_id,
      role,
      department_id: department_id ?? null,
      team_id: team_id ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // BaseRepository.create expects an object matching table columns
    return this.create(payload);
  }

  async findByUserId(user_id: string): Promise<UserWorkspaceEntity[]> {
    return this.findMany({ user_id });
  }

  async findByWorkspaceId(workspace_id: string): Promise<UserWorkspaceEntity[]> {
    return this.findMany({ workspace_id });
  }

  async findUserInWorkspace(user_id: string, workspace_id: string): Promise<UserWorkspaceEntity | null> {
    return this.findOne({ user_id, workspace_id });
  }
}
