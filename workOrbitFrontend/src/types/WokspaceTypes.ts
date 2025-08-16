import { UserRole } from "./UserTypes";

export interface Workspace {
  workspace_id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface CreateWorkspaceRequest {
  name: string;
  user_id?:string;
}

export interface UserWorkspace {
  id: string;
  user_id: string;
  workspace_id: string;
  role: UserRole;
}
