import { UserRepository } from '../../models/repositories/UserRepository';

export class UserService {
  private userRepository = new UserRepository();

  async getTeammates(workspaceId: string, departmentId: string | null, teamId: string | null) {
    return await this.userRepository.findTeammates(workspaceId, departmentId, teamId);
  }
}
