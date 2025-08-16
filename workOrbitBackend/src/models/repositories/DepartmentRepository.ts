import { BaseRepository } from './BaseRepository';
import { DepartmentEntity } from '../entities/Department';
import { CreateDepartmentRequest } from '../../types/department.types';
import { v4 as uuidv4 } from 'uuid';

export class DepartmentRepository extends BaseRepository<DepartmentEntity> {
  constructor() {
    super('department');
  }

  protected mapRowToEntity(row: any): DepartmentEntity {
    return new DepartmentEntity(
      row.department_id,
      row.workspace_id,
      row.name,
      row.created_at
    );
  }

  async createDepartment(departmentData: CreateDepartmentRequest): Promise<DepartmentEntity> {
    const departmentWithId = {
      department_id: uuidv4(),
      ...departmentData,
      created_at: new Date()
    };
    return this.create(departmentWithId);
  }

  async findById(department_id: string): Promise<DepartmentEntity | null> {
    return this.findOne({ department_id });
  }

  async findByNameInWorkspace(workspace_id: string, name: string): Promise<DepartmentEntity | null> {
    const result = await this.query(
      `SELECT * FROM ${this.tableName} 
       WHERE workspace_id = $1 AND LOWER(name) = LOWER($2) 
       LIMIT 1`,
      [workspace_id, name]
    );
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async findAllDepartmentsInWorkspace(workspace_id: string): Promise<Pick<DepartmentEntity, 'department_id' | 'name'>[]> {
    const result = await this.query(
      `SELECT department_id, name 
       FROM ${this.tableName} 
       WHERE workspace_id = $1 
       ORDER BY created_at DESC`,
      [workspace_id]
    );
    return result.rows;
  }

  async mapUserToDepartment(user_id: string, department_id: string): Promise<void> {
    await this.query(
      `INSERT INTO user_department (user_id, department_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, department_id) DO NOTHING`,
      [user_id, department_id]
    );
  }

  async findUserInDepartment(user_id: string, department_id: string): Promise<any | null> {
    const result = await this.query(
      `SELECT * FROM user_department WHERE user_id = $1 AND department_id = $2 LIMIT 1`,
      [user_id, department_id]
    );
    return result.rows[0] || null;
  }
}
