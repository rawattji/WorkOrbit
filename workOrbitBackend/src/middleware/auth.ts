// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth/AuthService';
import { UserWorkspaceService } from '../services/workspace/UserWorkspaceService';
import { ResponseHandler } from '../utils/apiReponse';
import { logger } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      scope?: {
        workspaceId: string;
        departmentId?: string | null;
        teamId?: string | null;
        userWorkspaceId?: string;
        role?: string;
      };
    }
  }
}


export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authorization = req.headers.authorization?.replace('Bearer ', '');
    if (!authorization) {
      ResponseHandler.unauthorized(res, 'No token provided');
      return;
    }

    const authService = new AuthService();
    const decoded = await authService.verifyToken(authorization);
    req.user = {
      user_id: decoded.user_id,   
      email: decoded.email,
      role: decoded.role
    };

    // optional: active workspace header (only validate if provided and non-empty)
    const activeWorkspaceIdHeader = (req.headers['x-active-workspace-id'] as string | undefined) ?? undefined;
    if (activeWorkspaceIdHeader && activeWorkspaceIdHeader.trim() !== '') {
      const userWorkspaceService = new UserWorkspaceService();
      const userScope = await userWorkspaceService.getUserScope(req.user.user_id, activeWorkspaceIdHeader);

      if (!userScope) {
        // Client explicitly supplied an active workspace id which does not belong to this user
        ResponseHandler.forbidden(res, 'User not mapped to the requested workspace/department/team');
        return;
      }

      req.scope = {
        workspaceId: userScope.workspaceId,
        departmentId: userScope.departmentId,
        teamId: userScope.teamId,
        userWorkspaceId: userScope.userWorkspaceId,
        role: userScope.role,
      };
    }

    // If header was not supplied, we don't force a scope here.
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    ResponseHandler.unauthorized(res, 'Invalid or expired token');
  }
};

/**
 * requireScope middleware:
 * Use this on routes that must have active workspace + department + team set (e.g. board endpoints).
 * If req.scope is absent, respond with 400 (missing scope).
 */
export const requireScope = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.scope || !req.scope.workspaceId) {
    ResponseHandler.badRequest(res, 'Missing active workspace scope. Add x-active-workspace-id header or select a workspace.');
    return;
  }
  next();
};

/**
 * roleMiddleware remains same (checks req.user.role)
 */
export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user || !allowedRoles.includes(user.role)) {
      ResponseHandler.forbidden(res, 'Insufficient permissions');
      return;
    }
    next();
  };
};
