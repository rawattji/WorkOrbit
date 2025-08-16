import { UserRole } from "./user.types";

export interface Workspace {
  workspace_id: string;
  name: string;
  owner_id: string;
  created_at: Date;
}

export interface CreateWorkspaceRequest {
  name: string;
  id?:string;
}

export interface UserWorkspace {
  id: string;
  user_id: string;
  workspace_id: string;
  role: UserRole;
}
