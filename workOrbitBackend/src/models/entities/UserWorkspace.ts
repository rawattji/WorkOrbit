import { UserWorkspace } from '../../types/workspace.types';
import { UserRole } from '../../types/user.types';

export class UserWorkspaceEntity implements UserWorkspace {
  constructor(
    public id: string,
    public user_id: string,
    public workspace_id: string,
    public role: UserRole
  ) {}
}