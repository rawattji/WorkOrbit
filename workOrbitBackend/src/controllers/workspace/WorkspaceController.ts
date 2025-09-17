// src/controllers/workspace/WorkspaceController.ts
import { Request, Response, NextFunction } from 'express';
import { WorkspaceService } from '../../services/workspace/WorkspaceService';
import { UserWorkspaceService } from '../../services/workspace/UserWorkspaceService';
import { ResponseHandler } from '../../utils/apiReponse';
import { logger } from '../../utils/logger';

export class WorkspaceController {
  private workspaceService = new WorkspaceService();
  private userWorkspaceService = new UserWorkspaceService();

  createWorkspace = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body;
      if (!name || typeof name !== 'string') {
        return ResponseHandler.badRequest(res, 'Missing workspace name');
      }

      const userId = (req.user as any)?.userId ?? (req.user as any)?.user_id ?? (req.user as any)?.id;
      if (!userId) return ResponseHandler.unauthorized(res, 'Missing user information');

      const { workspace, isNew } = await this.workspaceService.createOrGetWorkspace(userId, name);

      return ResponseHandler.success(res, isNew ? 'Workspace created' : 'Workspace exists', {
        workspace_id: workspace.workspace_id,
        name: workspace.name,
        isNew,
      });
    } catch (error) {
      logger.error('createWorkspace error', error);
      return ResponseHandler.internalError(res, 'Failed to create workspace');
    }
  };

  getAllWorkspaces = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any)?.userId ?? (req.user as any)?.user_id ?? (req.user as any)?.id;
      if (!userId) return ResponseHandler.unauthorized(res, 'Missing user information');

      // fetch user->workspace mappings
      const mappings = await this.userWorkspaceService.getUserWorkspaces(userId);

      // fetch workspace metadata (name) for each mapping
      const workspaces = await Promise.all(
        mappings.map(async (m) => {
          try {
            const ws = await this.workspaceService.getWorkspaceById(m.workspace_id);
            return { workspace_id: ws.workspace_id, name: ws.name };
          } catch {
            return null;
          }
        })
      );

      const filtered = workspaces.filter(Boolean);
      return ResponseHandler.success(res, 'User workspaces fetched', filtered);
    } catch (error) {
      logger.error('getAllWorkspaces error', error);
      return ResponseHandler.internalError(res, 'Failed to fetch workspaces');
    }
  };

  getWorkspaceById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.params.workspace_id;
      if (!workspaceId) return ResponseHandler.badRequest(res, 'Missing workspace_id');

      const workspace = await this.workspaceService.getWorkspaceById(workspaceId);
      return ResponseHandler.success(res, 'Workspace fetched', workspace);
    } catch (error) {
      logger.error('getWorkspaceById error', error);
      return ResponseHandler.internalError(res, 'Failed to fetch workspace');
    }
  };

  joinWorkspace = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workspace_id, role } = req.body;
      const userId = (req.user as any)?.userId ?? (req.user as any)?.user_id ?? (req.user as any)?.id;
      if (!userId) return ResponseHandler.unauthorized(res, 'Missing user information');
      if (!workspace_id) return ResponseHandler.badRequest(res, 'Missing workspace_id');

      await this.userWorkspaceService.addUserToWorkspace(userId, workspace_id, (role as any) ?? 'member');
      return ResponseHandler.success(res, 'Joined workspace successfully');
    } catch (error) {
      logger.error('joinWorkspace error', error);
      return ResponseHandler.internalError(res, 'Failed to join workspace');
    }
  };
}
