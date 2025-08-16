import { Department } from '../../types/department.types';

export class DepartmentEntity implements Department {
  constructor(
    public department_id: string,
    public workspace_id: string,
    public name: string,
    public created_at: Date
  ) {}
}
