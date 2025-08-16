import { UserWorkspaceRepository } from '../../models/repositories/UserWorkspaceRepository';
import { UserWorkspaceEntity } from '../../models/entities/UserWorkspace';
import { UserRole } from '../../types/user.types';

export class UserWorkspaceService {
  private userWorkspaceRepository: UserWorkspaceRepository;

  constructor() {
    this.userWorkspaceRepository = new UserWorkspaceRepository();
  }

  async addUserToWorkspace(user_id: string, workspace_id: string, role: UserRole): Promise<UserWorkspaceEntity> {
    return await this.userWorkspaceRepository.createUserWorkspace(user_id, workspace_id, role);
  }

  async getUserWorkspaces(user_id: string): Promise<UserWorkspaceEntity[]> {
    return await this.userWorkspaceRepository.findByUserId(user_id);
  }

  async getWorkspaceUsers(workspace_id: string): Promise<UserWorkspaceEntity[]> {
    return await this.userWorkspaceRepository.findByWorkspaceId(workspace_id);
  }

  async getUserRoleInWorkspace(user_id: string, workspace_id: string): Promise<string | null> {
    const userWorkspace = await this.userWorkspaceRepository.findUserInWorkspace(user_id, workspace_id);
    return userWorkspace ? userWorkspace.role : null;
  }
}
