import { UserWorkspace } from '../../types/workspace.types';
import { UserRole } from '../../types/user.types';

export class UserWorkspaceEntity {
  id: string;
  user_id: string;
  workspace_id: string;
  role: UserRole;
  department_id?: string | null;
  team_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;

  constructor(
    id: string,
    user_id: string,
    workspace_id: string,
    role: UserRole,
    department_id?: string | null,
    team_id?: string | null,
    created_at?: string | null,
    updated_at?: string | null,
  ) {
    this.id = id;
    this.user_id = user_id;
    this.workspace_id = workspace_id;
    this.role = role;
    this.department_id = department_id ?? null;
    this.team_id = team_id ?? null;
    this.created_at = created_at ?? null;
    this.updated_at = updated_at ?? null;
  }
}