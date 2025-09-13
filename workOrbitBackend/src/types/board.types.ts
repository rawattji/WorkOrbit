/* =========================
 * Core domain enums/types
 * ========================= */

export type EntityType = 'mission' | 'project' | 'story' | 'task';
export type Workflow = 'inbox' | 'build' | 'review' | 'shipped';

export type HistoryAction =
  | 'created'
  | 'updated'
  | 'mapped'
  | 'unmapped'
  | 'workflow_changed'
  | 'assigned'
  | 'deleted'
  | 'comment'
  | 'bulk_mapped';

/* =========================
 * Constants
 * ========================= */

export const ENTITY_PREFIX: Record<EntityType, 'M_' | 'P_' | 'S_' | 'T_'> = {
  mission: 'M_',
  project: 'P_',
  story: 'S_',
  task: 'T_',
};

export const WORKFLOWS: Workflow[] = ['inbox', 'build', 'review', 'shipped'];
export const ENTITY_TYPES: EntityType[] = ['mission', 'project', 'story', 'task'];

/**
 * Allowed mapping: child -> parent type
 * (Used only for validation WHEN a parent is provided; parent is optional.)
 */
export const ALLOWED_PARENT: Record<EntityType, EntityType | null> = {
  mission: null,
  project: 'mission',
  story: 'project',
  task: 'story',
};

/* =========================
 * Entities & DTOs
 * ========================= */

export interface BoardEntity {
  entityId: string;
  publicId: string;
  type: EntityType;
  name: string;
  description?: string;
  room?: string | null;
  createdBy: string;
  assignedTo?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  estimateHours?: number | null;
  sprintId?: string | null;
  workflow: Workflow;
  parentId?: string | null;        // internal UUID
  parentPublicId?: string | null;  // NEW: parent's external ID (M_/P_/S_)
  childrenCountOpen: number;
  childrenCountTotal: number;
  status?: string;
  metadata?: Record<string, unknown>;
  version: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntityDTO {
  type: EntityType;
  name: string;
  description?: string;
  room?: string | null;
  createdBy: string;
  assignedTo?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  estimateHours?: number | null;
  sprintId?: string | null;
  workflow?: Workflow;
  parentPublicId?: string | null;
  parentId?: string | null;
  metadata?: Record<string, unknown>;
  publicId?: string;
}

export interface UpdateEntityDTO {
  name?: string;
  description?: string;
  room?: string | null;
  assignedTo?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  estimateHours?: number | null;
  sprintId?: string | null;
  workflow?: Workflow;
  parentPublicId?: string | null;
  parentId?: string | null;
  metadata?: Record<string, unknown>;
  expectedVersion?: number;
}

/* =========================
 * Board view/query shapes
 * ========================= */

export interface BoardQuery {
  search?: string;
  type?: EntityType | 'any';
  room?: string;
  assignedTo?: string;
  sprintId?: string;
  workflow?: Workflow | 'any';
  limit?: number;
  offset?: number;

  viewType?: Extract<EntityType, 'mission' | 'project' | 'story'> | 'auto';
  titlePublicIds?: string[];
  includeOtherTasks?: boolean;
}

export interface BoardColumns<T = BoardEntity> {
  inbox: T[];
  build: T[];
  review: T[];
  shipped: T[];
}

export interface BoardRow {
  title: BoardEntity;
  columns: BoardColumns;
}

export interface BoardResponse {
  rows: BoardRow[];
  otherTasks: BoardColumns;
  totalCount: number;
}

/* =========================
 * Repository contract
 * ========================= */

export interface IBoardRepository {
  findByPublicId(publicId: string): Promise<BoardEntity | null>;
  findByEntityId(entityId: string): Promise<BoardEntity | null>;

  searchTitles(query: BoardQuery): Promise<BoardEntity[]>;
  findChildrenOf(parentId: string, options?: Partial<BoardQuery>): Promise<BoardEntity[]>;
  findUnmapped(options?: Partial<BoardQuery>): Promise<BoardEntity[]>;

  fullTextSearch(search: string, options?: Partial<BoardQuery>): Promise<BoardEntity[]>;

  createEntity(input: CreateEntityDTO, resolvedParentId?: string | null): Promise<BoardEntity>;
  updateEntityByPublicId(publicId: string, patch: UpdateEntityDTO): Promise<BoardEntity>;
  deleteEntityByPublicId(publicId: string): Promise<void>;

  setPosition(entityId: string, parentId: string | null, workflow: Workflow, position: number): Promise<void>;

  addHistory(entityId: string, action: HistoryAction, actorId: string | null, payload?: Record<string, unknown>): Promise<void>;

  resolvePublicIdToEntityId(publicId: string): Promise<string | null>;
  countByType(type: EntityType, opts?: { parentNotNull?: boolean; isDeleted?: boolean }): Promise<number>;
}

/* =========================
 * Service contract
 * ========================= */

export interface IBoardService {
  getBoard(query: BoardQuery): Promise<BoardResponse>;

  createEntity(dto: CreateEntityDTO): Promise<BoardEntity>;
  updateEntity(publicId: string, dto: UpdateEntityDTO): Promise<BoardEntity>;
  deleteEntity(publicId: string): Promise<void>;

  moveWithinColumn(publicId: string, workflow: Workflow, newPosition: number): Promise<void>;
  moveAcross(
    publicId: string,
    target: {
      parentPublicId?: string | null;
      parentId?: string | null;
      workflow?: Workflow;
      position?: number;
    }
  ): Promise<BoardEntity>;

  validateParentMapping(childType: EntityType, parentType: EntityType | null): void;
}

/* =========================
 * Domain error
 * ========================= */

export class BoardError extends Error {
  code:
    | 'INVALID_PARENT'
    | 'CYCLE'
    | 'NOT_FOUND'
    | 'VERSION_CONFLICT'
    | 'VALIDATION'
    | 'FORBIDDEN';
  details?: unknown;

  constructor(code: BoardError['code'], message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
  }
}
