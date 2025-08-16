import { Pool } from 'pg';
import { database } from '../../config/database/connection';
import { logger } from '../../utils/logger';

export abstract class BaseRepository<T> {
  protected pool: Pool;
  protected tableName: string;

  constructor(tableName: string) {
    this.pool = database.getPool();
    this.tableName = tableName;
  }

  protected async query(text: string, params?: any[]): Promise<any> {
    try {
      logger.debug(`Executing query: ${text}`, { params });
      const result = await database.query(text, params);
      return result;
    } catch (error) {
      logger.error(`Database query error: ${error}`, { text, params });
      throw error;
    }
  }

  protected async findOne(where: Record<string, any>): Promise<T | null> {
    const whereClause = Object.keys(where).map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const values = Object.values(where);
    
    const query = `SELECT * FROM ${this.tableName} WHERE ${whereClause} LIMIT 1`;
    const result = await this.query(query, values);
    
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
  }

  public async findMany(where?: Record<string, any>, limit?: number, offset?: number): Promise<T[]> {
    let query = `SELECT * FROM ${this.tableName}`;
    const values: any[] = [];
    
    if (where && Object.keys(where).length > 0) {
      const whereClause = Object.keys(where).map((key, index) => `${key} = $${index + 1}`).join(' AND ');
      query += ` WHERE ${whereClause}`;
      values.push(...Object.values(where));
    }
    
    query += ` ORDER BY created_at DESC`;
    
    if (limit) {
      query += ` LIMIT $${values.length + 1}`;
      values.push(limit);
    }
    
    if (offset) {
      query += ` OFFSET $${values.length + 1}`;
      values.push(offset);
    }
    
    const result = await this.query(query, values);
    return result.rows.map((row: any) => this.mapRowToEntity(row));
  }

  protected async create(data: Partial<T>): Promise<T> {
    const keys = Object.keys(data as Record<string, any>);
    const values = Object.values(data as Record<string, any>);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${this.tableName} (${keys.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    const result = await this.query(query, values);
    return this.mapRowToEntity(result.rows[0]);
  }

  protected async update(where: Record<string, any>, data: Partial<T>): Promise<T | null> {
    const updateKeys = Object.keys(data as Record<string, any>);
    const updateValues = Object.values(data as Record<string, any>);
    const whereKeys = Object.keys(where);
    const whereValues = Object.values(where);
    
    const setClause = updateKeys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    const whereClause = whereKeys.map((key, index) => `${key} = $${updateKeys.length + index + 1}`).join(' AND ');
    
    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE ${whereClause}
      RETURNING *
    `;
    
    const result = await this.query(query, [...updateValues, ...whereValues]);
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
  }

  protected async delete(where: Record<string, any>): Promise<boolean> {
    const whereClause = Object.keys(where).map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const values = Object.values(where);
    
    const query = `DELETE FROM ${this.tableName} WHERE ${whereClause}`;
    const result = await this.query(query, values);
    
    return result.rowCount > 0;
  }

  protected abstract mapRowToEntity(row: any): T;
}