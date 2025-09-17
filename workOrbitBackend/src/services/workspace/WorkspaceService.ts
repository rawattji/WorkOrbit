// src/services/workspace/WorkspaceService.ts
import { WorkspaceRepository } from '../../models/repositories/WorkspaceRepository';
import { WorkspaceEntity } from '../../models/entities/Workspace';
import { CreateWorkspaceRequest } from '../../types/workspace.types';
import { NotFoundError } from '../../utils/errors';
import { UserWorkspaceService } from './UserWorkspaceService'; // adjust path if needed

export class WorkspaceService {
  private workspaceRepository: WorkspaceRepository;
  private userWorkspaceService: UserWorkspaceService;

  constructor() {
    this.workspaceRepository = new WorkspaceRepository();
    this.userWorkspaceService = new UserWorkspaceService();
  }

  /**
   * Create a workspace if not exists. Ensure the creating user is added to the workspace mapping.
   * Returns { workspace, isNew } where isNew indicates whether we created it.
   */
  async createOrGetWorkspace(user_id: string, name: string): Promise<{ workspace: WorkspaceEntity; isNew: boolean }> {
    const existingWorkspace = await this.workspaceRepository.findByName(name);

    if (existingWorkspace) {
      // Ensure mapping exists - if not, create a membership for the user (member)
      const userScope = await this.userWorkspaceService.getUserScope(user_id, existingWorkspace.workspace_id);
      if (!userScope) {
        // create as member (owner is used if user created new workspace)
        await this.userWorkspaceService.addUserToWorkspace(user_id, existingWorkspace.workspace_id, 'member');
      }
      return { workspace: existingWorkspace, isNew: false };
    }
    
    const newWorkspace = await this.workspaceRepository.createWorkspace({
        name,
        owner_id: user_id,   // ✅ now satisfies type
      });

    // Add owner mapping
    await this.userWorkspaceService.addUserToWorkspace(user_id, newWorkspace.workspace_id, 'owner');

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
