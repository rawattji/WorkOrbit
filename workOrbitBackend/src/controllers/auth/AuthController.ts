import { Request, Response } from 'express';
import { AuthService } from '../../services/auth/AuthService';
import { ResponseHandler } from '../../utils/apiReponse';
import { ValidationError, UnauthorizedError, ConflictError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import Joi from 'joi';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response): Promise<Response> => {
    try {
      const schema = Joi.object({
        first_name: Joi.string().required().min(2).max(50),
        middle_name: Joi.string().optional().max(50),
        last_name: Joi.string().required().min(2).max(50),
        email: Joi.string().email().required(),
        username: Joi.string().required().min(3).max(30).alphanum(),
        password: Joi.string().required().min(8).max(128),
        confirm_password: Joi.string().required().valid(Joi.ref('password')),
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return ResponseHandler.badRequest(res, error.details[0].message);
      }

      const result = await this.authService.register(value);
      return ResponseHandler.success(res, result.message);
    } catch (error) {
      logger.error('Registration error:', error);
      
      if (error instanceof ValidationError) {
        return ResponseHandler.badRequest(res, error.message);
      }
      if (error instanceof ConflictError) {
        return ResponseHandler.conflict(res, error.message);
      }
      
      return ResponseHandler.internalError(res, 'Registration failed');
    }
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return ResponseHandler.badRequest(res, error.details[0].message);
      }

      const result = await this.authService.login(value);
      return ResponseHandler.success(res, 'Login successful', result);
    } catch (error) {
      logger.error('Login error:', error);
      
      if (error instanceof UnauthorizedError) {
        return ResponseHandler.unauthorized(res, error.message);
      }
      
      return ResponseHandler.internalError(res, 'Login failed');
    }
  };

  verifyOTP = async (req: Request, res: Response): Promise<Response> => {
    try {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        otp: Joi.string().required().length(6).pattern(/^\d{6}$/),
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return ResponseHandler.badRequest(res, error.details[0].message);
      }

      const result = await this.authService.verifyOTP(value);
      return ResponseHandler.success(res, 'Email verified successfully', result);
    } catch (error) {
      logger.error('OTP verification error:', error);
      
      if (error instanceof UnauthorizedError) {
        return ResponseHandler.unauthorized(res, error.message);
      }
      
      return ResponseHandler.internalError(res, 'OTP verification failed');
    }
  };

  verifyToken = async (req: Request, res: Response): Promise<Response> => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return ResponseHandler.unauthorized(res, 'No token provided');
      }

      const decoded = await this.authService.verifyToken(token);
      return ResponseHandler.success(res, 'Token is valid', { user: decoded });
    } catch (error) {
      logger.error('Token verification error:', error);
      return ResponseHandler.unauthorized(res, 'Invalid or expired token');
    }
  };
}
