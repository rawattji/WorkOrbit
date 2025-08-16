import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth/AuthService';
import { ResponseHandler } from '../utils/apiReponse';
import { logger } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      ResponseHandler.unauthorized(res, 'No token provided');
      return;
    }

    const authService = new AuthService();
    const decoded = await authService.verifyToken(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    ResponseHandler.unauthorized(res, 'Invalid or expired token');
  }
};

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