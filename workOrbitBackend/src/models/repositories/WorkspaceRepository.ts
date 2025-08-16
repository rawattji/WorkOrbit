import { BaseRepository } from './BaseRepository';
import { WorkspaceEntity } from '../entities/Workspace';
import { CreateWorkspaceRequest } from '../../types/workspace.types';
import { v4 as uuidv4 } from 'uuid';

export class WorkspaceRepository extends BaseRepository<WorkspaceEntity> {
  constructor() {
    super('workspace');
  }

  protected mapRowToEntity(row: any): WorkspaceEntity {
    return new WorkspaceEntity(
      row.workspace_id,
      row.name,
      row.owner_id,
      row.created_at
    );
  }

  async createWorkspace(workspaceData: CreateWorkspaceRequest & { owner_id: string }): Promise<WorkspaceEntity> {
    const workspaceWithId = {
      workspace_id: uuidv4(),
      ...workspaceData,
      created_at: new Date()
    };

    return this.create(workspaceWithId);
  }

  async findByOwnerId(owner_id: string): Promise<WorkspaceEntity[]> {
    return this.findMany({ owner_id });
  }

  async findById(workspace_id: string): Promise<WorkspaceEntity | null> {
    return this.findOne({ workspace_id });
  }

  async findByName(name: string): Promise<WorkspaceEntity | null> {
    const result = await this.query(
      `SELECT * FROM ${this.tableName} WHERE LOWER(name) = LOWER($1) LIMIT 1`,
      [name]
    );
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async findAllWorkspaces(): Promise<Pick<WorkspaceEntity, 'workspace_id' | 'name'>[]> {
    const result = await this.query(
      `SELECT workspace_id, name FROM ${this.tableName} ORDER BY created_at DESC`
    );
    return result.rows;
  }

  async mapUserToWorkspace(user_id: string, workspace_id: string): Promise<void> {
    await this.query(
      `INSERT INTO user_workspace (user_id, workspace_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, workspace_id) DO NOTHING`,
      [user_id, workspace_id]
    );
  }
}
