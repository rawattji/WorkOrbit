export interface Department {
  department_id: string;
  workspace_id: string;
  name: string;
  created_at: string;
}

export interface CreateDepartmentRequest {
  workspace_id: string;
  name: string;
}