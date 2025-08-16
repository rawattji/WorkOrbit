import { Workspace } from '../../types/workspace.types';

export class WorkspaceEntity implements Workspace {
  constructor(
    public workspace_id: string,
    public name: string,
    public owner_id: string,
    public created_at: Date
  ) {}
}