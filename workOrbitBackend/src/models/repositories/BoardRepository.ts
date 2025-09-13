import { Pool } from 'pg';
import {
  BoardEntity,
  CreateEntityDTO,
  UpdateEntityDTO,
  BoardQuery,
  Workflow,
  EntityType,
  HistoryAction,
  IBoardRepository,
} from '../../types/board.types';
import { BaseRepository } from './BaseRepository';

export class BoardRepository extends BaseRepository<BoardEntity> implements IBoardRepository {

  constructor() {
    super('board_entities');
  }

  /* -------------------------
   * Helpers
   * ------------------------- */
  protected mapRowToEntity(row: any): BoardEntity {
    return {
      entityId: row.entity_id,
      publicId: row.public_id,
      type: row.type,
      name: row.name,
      description: row.description,
      room: row.room,
      createdBy: row.created_by,
      assignedTo: row.assigned_to,
      startDate: row.start_date,
      endDate: row.end_date,
      estimateHours: row.estimate_hours,
      sprintId: row.sprint_id,
      workflow: row.workflow,
      parentId: row.parent_id,
      parentPublicId: row.parent_public_id ?? null,
      childrenCountOpen: row.children_count_open ?? 0,
      childrenCountTotal: row.children_count_total ?? 0,
      status: row.status,
      metadata: row.metadata,
      version: row.version,
      isDeleted: row.is_deleted,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private toSnake(key: string): string {
    return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  /* -------------------------
   * Lookups
   * ------------------------- */
  async findByPublicId(publicId: string): Promise<BoardEntity | null> {
    const res = await this.pool.query(
      `SELECT b.*, p.public_id as parent_public_id
       FROM board_entities b
       LEFT JOIN board_entities p ON p.entity_id = b.parent_id
       WHERE b.public_id = $1 AND b.is_deleted = false`,
      [publicId],
    );
    return res.rows.length ? this.mapRowToEntity(res.rows[0]) : null;
  }

  async findByEntityId(entityId: string): Promise<BoardEntity | null> {
    const res = await this.pool.query(
      `SELECT b.*, p.public_id as parent_public_id
       FROM board_entities b
       LEFT JOIN board_entities p ON p.entity_id = b.parent_id
       WHERE b.entity_id = $1 AND b.is_deleted = false`,
      [entityId],
    );
    return res.rows.length ? this.mapRowToEntity(res.rows[0]) : null;
  }

  async resolvePublicIdToEntityId(publicId: string): Promise<string | null> {
    const res = await this.pool.query(
      `SELECT entity_id FROM board_entities WHERE public_id = $1 AND is_deleted = false`,
      [publicId],
    );
    return res.rows[0]?.entity_id ?? null;
  }

  /* -------------------------
   * Create / Update / Delete
   * ------------------------- */
  async createEntity(input: CreateEntityDTO, resolvedParentId?: string | null): Promise<BoardEntity> {
    const res = await this.pool.query(
      `INSERT INTO board_entities
       (public_id, type, name, description, room, created_by,
        assigned_to, start_date, end_date, estimate_hours, sprint_id,
        workflow, parent_id, metadata, version, is_deleted, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,1,false,NOW(),NOW())
       RETURNING *`,
      [
        input.publicId,
        input.type,
        input.name,
        input.description ?? null,
        input.room ?? null,
        input.createdBy,
        input.assignedTo ?? null,
        input.startDate ?? null,
        input.endDate ?? null,
        input.estimateHours ?? null,
        input.sprintId ?? null,
        input.workflow ?? 'inbox',
        resolvedParentId ?? null,
        input.metadata ?? {},
      ],
    );
    return this.mapRowToEntity(res.rows[0]);
  }

  async updateEntityByPublicId(publicId: string, patch: UpdateEntityDTO): Promise<BoardEntity> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [k, v] of Object.entries(patch)) {
      if (v !== undefined) {
        fields.push(`${this.toSnake(k)} = $${idx++}`);
        values.push(v);
      }
    }

    if (fields.length === 0) throw new Error('Nothing to update');
    values.push(publicId);

    const res = await this.pool.query(
      `UPDATE board_entities SET ${fields.join(', ')}, updated_at = NOW()
       WHERE public_id = $${idx} AND is_deleted = false
       RETURNING *`,
      values,
    );

    if (!res.rows.length) throw new Error(`Entity ${publicId} not found`);
    return this.mapRowToEntity(res.rows[0]);
  }

  async deleteEntityByPublicId(publicId: string): Promise<void> {
    await this.pool.query(
      `UPDATE board_entities SET is_deleted = true, updated_at = NOW() WHERE public_id = $1`,
      [publicId],
    );
  }

  /* -------------------------
   * Board Queries
   * ------------------------- */
  async searchTitles(query: BoardQuery): Promise<BoardEntity[]> {
    const { type, search } = query;
    let sql = `SELECT b.*, p.public_id as parent_public_id
               FROM board_entities b
               LEFT JOIN board_entities p ON p.entity_id = b.parent_id
               WHERE b.is_deleted = false`;
    const params: any[] = [];

    if (type && type !== 'any') {
      params.push(type);
      sql += ` AND b.type = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (b.name ILIKE $${params.length} OR b.description ILIKE $${params.length})`;
    }

    sql += ` ORDER BY b.created_at ASC`;

    const res = await this.pool.query(sql, params);
    return res.rows.map(this.mapRowToEntity);
  }

  async findChildrenOf(parentId: string, options: Partial<BoardQuery> = {}): Promise<BoardEntity[]> {
    const res = await this.pool.query(
      `SELECT b.*, p.public_id as parent_public_id
       FROM board_entities b
       LEFT JOIN board_entities p ON p.entity_id = b.parent_id
       WHERE b.parent_id = $1 AND b.is_deleted = false
       ORDER BY b.created_at ASC`,
      [parentId],
    );
    return res.rows.map(this.mapRowToEntity);
  }

  async findUnmapped(options: Partial<BoardQuery> = {}): Promise<BoardEntity[]> {
    const res = await this.pool.query(
      `SELECT b.*, null as parent_public_id
       FROM board_entities b
       WHERE b.parent_id IS NULL AND b.is_deleted = false`,
    );
    return res.rows.map(this.mapRowToEntity);
  }

  async fullTextSearch(search: string, options: Partial<BoardQuery> = {}): Promise<BoardEntity[]> {
    const res = await this.pool.query(
      `SELECT b.*, p.public_id as parent_public_id
       FROM board_entities b
       LEFT JOIN board_entities p ON p.entity_id = b.parent_id
       WHERE (to_tsvector('english', b.name || ' ' || coalesce(b.description,'')) @@ plainto_tsquery('english',$1))
         AND b.is_deleted = false`,
      [search],
    );
    return res.rows.map(this.mapRowToEntity);
  }

  async countByType(type: EntityType, opts?: { parentNotNull?: boolean; isDeleted?: boolean }): Promise<number> {
    let sql = `SELECT COUNT(*) FROM board_entities WHERE type = $1`;
    const params: any[] = [type];
    if (opts?.parentNotNull) sql += ` AND parent_id IS NOT NULL`;
    if (opts?.isDeleted === false) sql += ` AND is_deleted = false`;
    const res = await this.pool.query(sql, params);
    return parseInt(res.rows[0].count, 10);
  }

  /* -------------------------
   * Ordering & History
   * ------------------------- */
  async setPosition(entityId: string, parentId: string | null, workflow: Workflow, position: number): Promise<void> {
    await this.pool.query(
      `UPDATE board_entities SET workflow = $1, parent_id = $2, updated_at = NOW()
       WHERE entity_id = $3`,
      [workflow, parentId, entityId],
    );
    // NOTE: You can add "position" column in DB if you want strict ordering
  }

  async addHistory(entityId: string, action: HistoryAction, actorId: string | null, payload?: Record<string, unknown>): Promise<void> {
    await this.pool.query(
      `INSERT INTO board_history (entity_id, action, actor_id, payload, created_at)
       VALUES ($1,$2,$3,$4,NOW())`,
      [entityId, action, actorId, payload ?? {}],
    );
  }
}
