import { Request, Response } from 'express';
import { WorkspaceService } from '../../services/workspace/WorkspaceService';
import { ResponseHandler } from '../../utils/apiReponse';
import { NotFoundError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import Joi from 'joi';
import { UserWorkspaceService } from '../../services/workspace/UserWorkspaceService';

export class WorkspaceController {
  private workspaceService: WorkspaceService;
  private userWorkspaceService: UserWorkspaceService;

  constructor() {
    this.workspaceService = new WorkspaceService();
    this.userWorkspaceService = new UserWorkspaceService();
  }

  createWorkspace = async (req: Request, res: Response): Promise<Response> => {
    try {
      const schema = Joi.object({
        name: Joi.string().required().min(2).max(100),
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return ResponseHandler.badRequest(res, error.details[0].message);
      }

      const user = (req as any).user;

      // Step 1: Create or get existing workspace
      const { workspace, isNew } = await this.workspaceService.createOrGetWorkspace(user.user_id, value.name);

      // Step 2: Check if user already mapped
      const alreadyMapped = await this.userWorkspaceService.getUserRoleInWorkspace(user.user_id, workspace.workspace_id);
      if (!alreadyMapped) {
        await this.userWorkspaceService.addUserToWorkspace(
          user.user_id,
          workspace.workspace_id,
          isNew ? 'owner' : 'member'
        );
      }

      return ResponseHandler.created(
        res,
        isNew ? 'Workspace created successfully' : 'Joined existing workspace',
        workspace
      );
    } catch (error) {
      logger.error('Create workspace error:', error);
      return ResponseHandler.internalError(res, 'Failed to create workspace');
    }
  };



  getAllWorkspaces = async (req: Request, res: Response): Promise<Response> => {
    try {
      const workspaces = await this.workspaceService.getAllWorkspaces();
      return ResponseHandler.success(res, 'Workspaces retrieved successfully', workspaces);
    } catch (error) {
      logger.error('Get all workspaces error:', error);
      return ResponseHandler.internalError(res, 'Failed to retrieve workspaces');
    }
  };

  joinWorkspace = async (req: Request, res: Response): Promise<Response> => {
    try {
      const schema = Joi.object({
        workspace_id: Joi.string().uuid().required(),
        role: Joi.string().valid('member', 'admin', 'manager').default('member')
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return ResponseHandler.badRequest(res, error.details[0].message);
      }

      const user = (req as any).user;

      // Check if already part of workspace
      const existingMapping = await this.userWorkspaceService.getUserRoleInWorkspace(user.user_id, value.workspace_id);
      if (existingMapping) {
        return ResponseHandler.success(res, 'User already part of this workspace', null);
      }

      // Add mapping
      const mapping = await this.userWorkspaceService.addUserToWorkspace(user.user_id, value.workspace_id, value.role);

      return ResponseHandler.success(res, 'Joined workspace successfully', mapping);
    } catch (error) {
      logger.error('Join workspace error:', error);
      return ResponseHandler.internalError(res, 'Failed to join workspace');
    }
  };


  getWorkspaceById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { workspace_id } = req.params;
      const workspace = await this.workspaceService.getWorkspaceById(workspace_id);
      return ResponseHandler.success(res, 'Workspace retrieved successfully', workspace);
    } catch (error) {
      logger.error('Get workspace by ID error:', error);
      if (error instanceof NotFoundError) {
        return ResponseHandler.notFound(res, error.message);
      }
      return ResponseHandler.internalError(res, 'Failed to retrieve workspace');
    }
  };
}
