// src/types/ApiTypes.ts - Updated with new creation payload structure
import { CreateDepartmentRequest } from "./DepartmentTypes";
import { CreateTeamRequest } from "./TeamTypes";
import { CreateWorkspaceRequest } from "./WokspaceTypes";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface CreateOrMapData {
  workspace?: CreateWorkspaceRequest;
  department?: CreateDepartmentRequest;
  team?: CreateTeamRequest;
}

// New structure for handling creation payload with selections
export interface CreationPayload {
  workspace: CreateWorkspaceRequest | null;
  department: CreateDepartmentRequest | null;
  team: CreateTeamRequest | null;
  selectedExistingWorkspaceId?: string;
  selectedExistingDepartmentId?: string;
  selectedExistingTeamId?: string;
}

// For step navigation data
export interface StepNavigationData {
  createNew?: any;
  existingWorkspaceId?: string;
  existingDepartmentId?: string;
  existingTeamId?: string;
}