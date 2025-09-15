import { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../../utils/apiReponse';
import { UserService } from '../../services/user/UserService';

export class UserController {
  private userService = new UserService();

  getTeammates = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.scope) {
        return ResponseHandler.badRequest(res, 'Missing user scope');
      }

      const teammates = await this.userService.getTeammates(
        req.scope.workspaceId,
        req.scope.departmentId,
        req.scope.teamId
      );

      return ResponseHandler.success(res, 'Teammates fetched successfully', teammates);
    } catch (err) {
      return ResponseHandler.internalError(res, 'Failed to fetch teammates');
    }
  };
}
