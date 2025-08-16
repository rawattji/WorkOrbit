import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ResponseHandler } from '../utils/apiReponse';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Unhandled error:', error);

  if (error instanceof AppError) {
    ResponseHandler.error(res, error.message, error.statusCode);
    return;
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    ResponseHandler.badRequest(res, error.message);
    return;
  }

  if (error.name === 'CastError') {
    ResponseHandler.badRequest(res, 'Invalid ID format');
    return;
  }

  if (error.name === 'JsonWebTokenError') {
    ResponseHandler.unauthorized(res, 'Invalid token');
    return;
  }

  if (error.name === 'TokenExpiredError') {
    ResponseHandler.unauthorized(res, 'Token expired');
    return;
  }

  // Default error
  ResponseHandler.internalError(res, 'Internal server error');
};
