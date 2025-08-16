import { BaseRepository } from './BaseRepository';
import { UserWorkspaceEntity } from '../entities/UserWorkspace';
import { UserRole } from '../../types/user.types';
import { v4 as uuidv4 } from 'uuid';

export class UserWorkspaceRepository extends BaseRepository<UserWorkspaceEntity> {
  constructor() {
    super('user_workspace');
  }

  protected mapRowToEntity(row: any): UserWorkspaceEntity {
    return new UserWorkspaceEntity(
      row.id,
      row.user_id,
      row.workspace_id,
      row.role
    );
  }

  async createUserWorkspace(user_id: string, workspace_id: string, role: UserRole): Promise<UserWorkspaceEntity> {
    const userWorkspaceWithId = {
      id: uuidv4(),
      user_id,
      workspace_id,
      role
    };

    return this.create(userWorkspaceWithId);
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