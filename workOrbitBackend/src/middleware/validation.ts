import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ResponseHandler } from '../utils/apiReponse';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      ResponseHandler.badRequest(res, error.details[0].message);
      return;
    }
    
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.params);
    
    if (error) {
      ResponseHandler.badRequest(res, error.details[0].message);
      return;
    }
    
    next();
  };
};