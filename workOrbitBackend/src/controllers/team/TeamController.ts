import { Request, Response } from 'express';
import { TeamService } from '../../services/team/TeamService';
import { ResponseHandler } from '../../utils/apiReponse';
import { NotFoundError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import Joi from 'joi';

export class TeamController {
  private teamService: TeamService;

  constructor() {
    this.teamService = new TeamService();
  }

  createTeam = async (req: Request, res: Response): Promise<Response> => {
    try {
      const schema = Joi.object({
        department_id: Joi.string().uuid().required(),
        name: Joi.string().required().min(2).max(100),
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return ResponseHandler.badRequest(res, error.details[0].message);
      }

      const user = (req as any).user;
      if (!['owner', 'admin', 'manager'].includes(user.role)) {
        return ResponseHandler.forbidden(res, 'Only owners, admins, and managers can create teams');
      }

      const team = await this.teamService.createTeam({
        ...value,
        user_id: user.user_id
      });

      return ResponseHandler.created(res, 'Team created successfully', team);
    } catch (error) {
      logger.error('Create team error:', error);
      return ResponseHandler.internalError(res, 'Failed to create team');
    }
  };

  getTeamsByDepartment = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { department_id } = req.params;
      const teams = await this.teamService.getTeamsByDepartment(department_id);
      return ResponseHandler.success(res, 'Teams retrieved successfully', teams);
    } catch (error) {
      logger.error('Get teams error:', error);
      return ResponseHandler.internalError(res, 'Failed to retrieve teams');
    }
  };

  getTeamById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { team_id } = req.params;
      const team = await this.teamService.getTeamById(team_id);
      return ResponseHandler.success(res, 'Team retrieved successfully', team);
    } catch (error) {
      logger.error('Get team by ID error:', error);

      if (error instanceof NotFoundError) {
        return ResponseHandler.notFound(res, error.message);
      }

      return ResponseHandler.internalError(res, 'Failed to retrieve team');
    }
  };

  joinTeam = async (req: Request, res: Response): Promise<Response> => {
    try {
      const schema = Joi.object({
        team_id: Joi.string().uuid().required(),
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return ResponseHandler.badRequest(res, error.details[0].message);
      }

      const user = (req as any).user;

      // Check if team exists
      const team = await this.teamService.getTeamById(value.team_id);

      // Check if user already mapped
      const alreadyMapped = await this.teamService.isUserInTeam(user.user_id, value.team_id);
      if (alreadyMapped) {
        return ResponseHandler.success(res, 'Already part of this team', null);
      }

      // Map user to team
      await this.teamService.mapUserToTeam(user.user_id, value.team_id);

      return ResponseHandler.success(res, 'Joined team successfully', null);
    } catch (error) {
      logger.error('Join team error:', error);
      return ResponseHandler.internalError(res, 'Failed to join team');
    }
  };

}
