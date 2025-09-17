import { UserWorkspaceRepository } from '../../models/repositories/UserWorkspaceRepository';
import { UserWorkspaceEntity } from '../../models/entities/UserWorkspace';
import { UserRole } from '../../types/user.types';

export class UserWorkspaceService {
  private userWorkspaceRepository: UserWorkspaceRepository;

  constructor() {
    this.userWorkspaceRepository = new UserWorkspaceRepository();
  }

  async addUserToWorkspace(user_id: string, workspace_id: string, role: UserRole, department_id?: string | null, team_id?: string | null): Promise<UserWorkspaceEntity> {
    const existing = await this.userWorkspaceRepository.findUserInWorkspace(user_id, workspace_id);
    if (existing) return existing;

    return await this.userWorkspaceRepository.createUserWorkspace(user_id, workspace_id, role, department_id ?? null, team_id ?? null);
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

  async getUserScope(user_id: string, workspace_id: string): Promise<{
    workspaceId: string;
    departmentId: string | null;
    teamId: string | null;
    userWorkspaceId: string;
    role: string;
  } | null> {
    const userWorkspace = await this.userWorkspaceRepository.findUserInWorkspace(user_id, workspace_id);
    if (!userWorkspace) return null;

    return {
      workspaceId: userWorkspace.workspace_id,
      departmentId: userWorkspace.department_id ?? null,
      teamId: userWorkspace.team_id ?? null,
      userWorkspaceId: userWorkspace.id,
      role: userWorkspace.role,
    };
  }
}
