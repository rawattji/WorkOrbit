import { WorkspaceRepository } from '../../models/repositories/WorkspaceRepository';
import { WorkspaceEntity } from '../../models/entities/Workspace';
import { CreateWorkspaceRequest } from '../../types/workspace.types';
import { NotFoundError } from '../../utils/errors';

export class WorkspaceService {
  private workspaceRepository: WorkspaceRepository;

  constructor() {``
    this.workspaceRepository = new WorkspaceRepository();
  }

  async createOrGetWorkspace(user_id: string, name: string): Promise<{ workspace: WorkspaceEntity, isNew: boolean }> {
    const existingWorkspace = await this.workspaceRepository.findByName(name);

    if (existingWorkspace) {
      return { workspace: existingWorkspace, isNew: false };
    }

    const newWorkspace = await this.workspaceRepository.createWorkspace({
      name,
      owner_id: user_id
    });

    return { workspace: newWorkspace, isNew: true };
  }

  async getAllWorkspaces(): Promise<Pick<WorkspaceEntity, 'workspace_id' | 'name'>[]> {
    return this.workspaceRepository.findAllWorkspaces();
  }

  async getWorkspaceById(workspace_id: string): Promise<WorkspaceEntity> {
    const workspace = await this.workspaceRepository.findById(workspace_id);
    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }
    return workspace;
  }
}
