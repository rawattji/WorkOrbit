// src/services/auth/AuthService.ts
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { UserRepository } from '../../models/repositories/UserRepository';
import { OTPService } from '../otp/OTPService';
import { RegisterRequest, LoginRequest, JWTPayload, OTPVerificationRequest } from '../../types/auth.types';
import { UserEntity } from '../../models/entities/User';
import { ValidationError, UnauthorizedError, ConflictError, NotFoundError } from '../../utils/errors';
import { WorkspaceService } from '../workspace/WorkspaceService';
import { DepartmentService } from '../department/DepartmentService';
import { TeamService } from '../team/TeamService';
import { UserWorkspaceService } from '../workspace/UserWorkspaceService';
import { database } from '../../config/database/connection';
import { logger } from '../../utils/logger';
import { User } from '../../types/user.types';
import { StringValue } from 'ms';

const defaultExpiry = '24h';
const defaultRefreshExpiry = '7d';

export class AuthService {
  private userRepository: UserRepository;
  private otpService: OTPService;
  private workspaceService: WorkspaceService;
  private departmentService: DepartmentService;
  private teamService: TeamService;
  private userWorkspaceService: UserWorkspaceService;
  private jwtSecret: string;
  private jwtRefreshSecret: string;
  private jwtExpiry: string;
  private jwtRefreshExpiry: string;

  constructor() {
    this.userRepository = new UserRepository();
    this.otpService = new OTPService();
    this.workspaceService = new WorkspaceService();
    this.departmentService = new DepartmentService();
    this.teamService = new TeamService();
    this.userWorkspaceService = new UserWorkspaceService();
    this.jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
    this.jwtExpiry = process.env.JWT_EXPIRES_IN || defaultExpiry;
    this.jwtRefreshExpiry = process.env.JWT_REFRESH_EXPIRES_IN || defaultRefreshExpiry;
  }

  async register(registerData: RegisterRequest): Promise<{ message: string }> {
    // Validate password confirmation
    if (registerData.password !== registerData.confirm_password) {
      throw new ValidationError('Passwords do not match');
    }

    // Check if user already exists
    const existingUserByEmail = await this.userRepository.findByEmail(registerData.email);
    if (existingUserByEmail) {
      throw new ConflictError('User with this email already exists');
    }

    const existingUserByUsername = await this.userRepository.findByUsername(registerData.username);
    if (existingUserByUsername) {
      throw new ConflictError('Username is already taken');
    }

    // Generate and store OTP (otpData may include workspace_data / department_data / team_data if provided)
    const otp = await this.otpService.generateAndStoreOTP(registerData.email, {
      user_data: registerData,
    });

    // Send OTP email
    await this.otpService.sendOTPEmail(registerData.email, otp, registerData.first_name);

    return { message: 'Registration initiated. Please check your email for verification code.' };
  }

  async login(loginData: LoginRequest): Promise<{ user: Omit<User, 'password_hash'>, token: string }> {
    const user = await this.userRepository.findByEmail(loginData.email);
    
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.is_verified) {
      throw new UnauthorizedError('Please verify your email before logging in');
    }

    const isPasswordValid = await bcrypt.compare(loginData.password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = this.generateJWTToken({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
    });

    return {
      user: user.toJSON(),
      token,
    };
  }

  async verifyOTP(verificationData: OTPVerificationRequest): Promise<{ user: Omit<User, 'password_hash'>, token: string }> {
    const otpData = await this.otpService.verifyOTP(verificationData.email, verificationData.otp);
    
    if (!otpData) {
      throw new UnauthorizedError('Invalid or expired OTP');
    }

    try {
      // Hash password
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(otpData.user_data.password, saltRounds);

      // Create user
      const user = await this.userRepository.createUser({
        ...otpData.user_data,
        password_hash,
      });

      // Verify user
      await this.userRepository.verifyUser(user.user_id);

      // ===== Workspace =====
      let workspace_id: string | undefined;
      if (otpData.workspace_data && otpData.workspace_data.name) {
        // createOrGetWorkspace(user_id, name) returns { workspace, isNew }
        const { workspace, isNew } = await this.workspaceService.createOrGetWorkspace(user.user_id, otpData.workspace_data.name);
        workspace_id = workspace.workspace_id;

        // Map user to workspace:
        if (workspace_id) {
          if (isNew) {
            // creator becomes owner
            await this.userWorkspaceService.addUserToWorkspace(user.user_id, workspace_id, 'owner');
          } else {
            // if existing workspace, ensure user is mapped as member (if not already)
            const existingRole = await this.userWorkspaceService.getUserRoleInWorkspace(user.user_id, workspace_id);
            if (!existingRole) {
              await this.userWorkspaceService.addUserToWorkspace(user.user_id, workspace_id, 'member');
            }
          }
        }
      }

      // ===== Department =====
      let department_id: string | undefined;
      if (otpData.department_data && workspace_id) {
        // departmentService.createDepartment expects { ...departmentData, user_id }
        const department = await this.departmentService.createDepartment({
          ...otpData.department_data,
          workspace_id,
          user_id: user.user_id,
        });
        department_id = department.department_id;
      }

      // ===== Team =====
      if (otpData.team_data && department_id) {
        // teamService.createTeam expects { ...teamData, user_id }
        await this.teamService.createTeam({
          ...otpData.team_data,
          department_id,
          user_id: user.user_id,
        });
      }

      // Generate token
      const token = this.generateJWTToken({
        user_id: user.user_id,
        email: user.email,
        role: user.role,
      });

      logger.info(`User successfully registered and verified: ${user.email}`);

      return {
        user: user.toJSON(),
        token,
      };
    } catch (error) {
      logger.error('Error during OTP verification and data persistence:', error);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      return decoded;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  private generateJWTToken(payload: { user_id: string; email: string; role: string }): string {
    const options: SignOptions = {
        expiresIn: this.jwtExpiry as StringValue,
        issuer: process.env.JWT_ISSUER || 'taskie-platform',
        audience: process.env.JWT_AUDIENCE || 'taskie-users'
    };

    return jwt.sign(payload, this.jwtSecret as Secret, options);
  }
}
