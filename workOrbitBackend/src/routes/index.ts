// src/routes/index.ts
import { Router } from 'express';
import { AuthController } from '../controllers/auth/AuthController';
import { WorkspaceController } from '../controllers/workspace/WorkspaceController';
import { DepartmentController } from '../controllers/department/DepartmentController';
import { TeamController } from '../controllers/team/TeamController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

// Controllers
const authController = new AuthController();
const workspaceController = new WorkspaceController();
const departmentController = new DepartmentController();
const teamController = new TeamController();

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'WorkOrbit API is running', timestamp: new Date().toISOString() });
});

// Auth
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/verify-otp', authController.verifyOTP);
router.get('/auth/verify-token', authController.verifyToken);

// Workspaces
router.post(
  '/workspaces',
  authMiddleware,
  roleMiddleware(['owner', 'admin', 'manager']),
  workspaceController.createWorkspace
);
router.get('/workspaces', authMiddleware, workspaceController.getAllWorkspaces);
router.get('/workspaces/:workspace_id', authMiddleware, workspaceController.getWorkspaceById);
router.post('/workspaces/join', authMiddleware, workspaceController.joinWorkspace); // 🔹 Added

// Departments
router.post(
  '/departments',
  authMiddleware,
  roleMiddleware(['owner', 'admin', 'manager']),
  departmentController.createDepartment
);
router.get('/departments/workspace/:workspace_id', authMiddleware, departmentController.getDepartmentsByWorkspace);
router.get('/departments/:department_id', authMiddleware, departmentController.getDepartmentById);
router.post('/departments/join', authMiddleware, departmentController.joinDepartment);

// Teams
router.post(
  '/teams',
  authMiddleware,
  roleMiddleware(['owner', 'admin', 'manager']),
  teamController.createTeam
);
router.get('/teams/department/:department_id', authMiddleware, teamController.getTeamsByDepartment);
router.get('/teams/:team_id', authMiddleware, teamController.getTeamById);
router.post('/teams/join', authMiddleware, teamController.joinTeam);

export default router;
