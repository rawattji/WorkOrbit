import { DepartmentRepository } from '../../models/repositories/DepartmentRepository';
import { DepartmentEntity } from '../../models/entities/Department';
import { CreateDepartmentRequest } from '../../types/department.types';
import { NotFoundError } from '../../utils/errors';

export class DepartmentService {
  private departmentRepository: DepartmentRepository;

  constructor() {
    this.departmentRepository = new DepartmentRepository();
  }

  async createDepartment(departmentData: CreateDepartmentRequest & { user_id: string }): Promise<DepartmentEntity> {
    const existingDepartment = await this.departmentRepository.findByNameInWorkspace(
      departmentData.workspace_id,
      departmentData.name
    );

    if (existingDepartment) {
      await this.departmentRepository.mapUserToDepartment(departmentData.user_id, existingDepartment.department_id);
      return existingDepartment;
    }

    const newDepartment = await this.departmentRepository.createDepartment(departmentData);
    await this.departmentRepository.mapUserToDepartment(departmentData.user_id, newDepartment.department_id);
    return newDepartment;
  }

  async getDepartmentsByWorkspace(workspace_id: string): Promise<DepartmentEntity[]> {
    return await this.departmentRepository.findMany({ workspace_id });
  }

  async getDepartmentById(department_id: string): Promise<DepartmentEntity> {
    const department = await this.departmentRepository.findById(department_id);
    if (!department) {
      throw new NotFoundError('Department not found');
    }
    return department;
  }

  async getAllDepartmentsInWorkspace(workspace_id: string) {
    return this.departmentRepository.findAllDepartmentsInWorkspace(workspace_id);
  }

  async mapUserToDepartment(user_id: string, department_id: string): Promise<void> {
    return this.departmentRepository.mapUserToDepartment(user_id, department_id);
  }

  async isUserInDepartment(user_id: string, department_id: string): Promise<boolean> {
    const result = await this.departmentRepository.findUserInDepartment(user_id, department_id);
    return !!result;
  }
}
