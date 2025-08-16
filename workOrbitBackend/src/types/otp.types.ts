import { RegisterRequest } from "./auth.types";
import { CreateDepartmentRequest } from "./department.types";
import { CreateWorkspaceRequest } from "./workspace.types";

export interface OTPData {
  user_data: RegisterRequest;
  workspace_data?: CreateWorkspaceRequest;
  department_data?: CreateDepartmentRequest;
  team_data?: CreateWorkspaceRequest;
  otp: string;
  created_at: number;
}