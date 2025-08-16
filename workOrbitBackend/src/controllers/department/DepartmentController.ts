import { Request, Response } from 'express';
import { DepartmentService } from '../../services/department/DepartmentService';
import { ResponseHandler } from '../../utils/apiReponse';
import { NotFoundError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import Joi from 'joi';

export class DepartmentController {
  private departmentService: DepartmentService;

  constructor() {
    this.departmentService = new DepartmentService();
  }

  createDepartment = async (req: Request, res: Response): Promise<Response> => {
    try {
      const schema = Joi.object({
        workspace_id: Joi.string().uuid().required(),
        name: Joi.string().required().min(2).max(100),
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return ResponseHandler.badRequest(res, error.details[0].message);
      }

      const user = (req as any).user;
      if (!['owner', 'admin', 'manager'].includes(user.role)) {
        return ResponseHandler.forbidden(res, 'Only owners, admins, and managers can create departments');
      }

      const department = await this.departmentService.createDepartment({
        ...value,
        user_id: user.user_id
      });

      return ResponseHandler.created(res, 'Department created successfully', department);
    } catch (error) {
      logger.error('Create department error:', error);
      return ResponseHandler.internalError(res, 'Failed to create department');
    }
  };

  getDepartmentsByWorkspace = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { workspace_id } = req.params;
      const departments = await this.departmentService.getDepartmentsByWorkspace(workspace_id);

      return ResponseHandler.success(res, 'Departments retrieved successfully', departments);
    } catch (error) {
      logger.error('Get departments error:', error);
      return ResponseHandler.internalError(res, 'Failed to retrieve departments');
    }
  };

  getDepartmentById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { department_id } = req.params;
      const department = await this.departmentService.getDepartmentById(department_id);

      return ResponseHandler.success(res, 'Department retrieved successfully', department);
    } catch (error) {
      logger.error('Get department by ID error:', error);

      if (error instanceof NotFoundError) {
        return ResponseHandler.notFound(res, error.message);
      }

      return ResponseHandler.internalError(res, 'Failed to retrieve department');
    }
  };

  joinDepartment = async (req: Request, res: Response): Promise<Response> => {
    try {
      const schema = Joi.object({
        department_id: Joi.string().uuid().required(),
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return ResponseHandler.badRequest(res, error.details[0].message);
      }

      const user = (req as any).user;

      // Check if department exists
      const department = await this.departmentService.getDepartmentById(value.department_id);

      // Check if user already mapped
      const alreadyMapped = await this.departmentService.isUserInDepartment(user.user_id, value.department_id);
      if (alreadyMapped) {
        return ResponseHandler.success(res, 'Already part of this department', null);
      }

      // Map user to department
      await this.departmentService.mapUserToDepartment(user.user_id, value.department_id);

      return ResponseHandler.success(res, 'Joined department successfully', null);
    } catch (error) {
      logger.error('Join department error:', error);
      return ResponseHandler.internalError(res, 'Failed to join department');
    }
  };

}
