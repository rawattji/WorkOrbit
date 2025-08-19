// ---------- Enums (string literal types for strong typing) ----------
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

// ---------- Constants ----------
export const ENTITY_PREFIX: Record<EntityType, 'M_' | 'P_' | 'S_' | 'T_'> = {
  mission: 'M_',
  project: 'P_',
  story: 'S_',
  task: 'T_',
};

export const WORKFLOWS: Workflow[] = ['inbox', 'build', 'review', 'shipped'];
export const ENTITY_TYPES: EntityType[] = ['mission', 'project', 'story', 'task'];

// Allowed mapping: child -> parent
export const ALLOWED_PARENT: Record<EntityType, EntityType | null> = {
  mission: null,        // no parent
  project: 'mission',
  story: 'project',
  task: 'story',
};

// ---------- Core domain types ----------
export interface BoardEntity {
  // DB/internal fields
  entityId: string;           // UUID (entity_id)
  publicId: string;           // M_xxx | P_xxx | S_xxx | T_xxx
  type: EntityType;
  name: string;
  description?: string;
  room?: string | null;       // team id/name depending on your design
  createdBy: string;          // user_id
  assignedTo?: string | null; // user_id
  startDate?: string | null;  // ISO date
  endDate?: string | null;    // ISO date
  estimateHours?: number | null;
  sprintId?: string | null;
  workflow: Workflow;
  parentId?: string | null;   // UUID of parent (board_entities.entity_id)
  childrenCountOpen: number;
  childrenCountTotal: number;
  status?: string;            // derived from workflow (can be same as workflow)
  metadata?: Record<string, unknown>;

  // bookkeeping
  version: number;            // optimistic locking
  isDeleted: boolean;
  createdAt: string;          // ISO datetime
  updatedAt: string;          // ISO datetime
}

export interface EntityHistory {
  historyId: string;          // UUID
  entityId: string;           // UUID
  action: HistoryAction;
  actorId?: string | null;    // user_id
  payload?: Record<string, unknown>;
  createdAt: string;          // ISO datetime
}

export interface EntityOrderRow {
  id: string;                 // UUID
  entityId: string;           // UUID
  parentId?: string | null;   // UUID
  workflow: Workflow;
  position: number;
  updatedAt: string;
}

// ---------- DTOs (requests/responses) ----------
// Create
export interface CreateEntityDTO {
  type: EntityType;
  name: string;
  description?: string;
  room?: string | null;
  createdBy: string;
  assignedTo?: string | null;
  startDate?: string | null;     // ISO date
  endDate?: string | null;       // ISO date
  estimateHours?: number | null;
  sprintId?: string | null;
  workflow?: Workflow;           // default 'inbox'
  parentPublicId?: string | null; // (frontend may send publicId)
  parentId?: string | null;       // or direct UUID
  metadata?: Record<string, unknown>;

  // ✅ Backend-generated, optional in DTO
  publicId?: string;
}

// Patch/Update (partial)
export interface UpdateEntityDTO {
  name?: string;
  description?: string | null;
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
  // optimistic locking (optional)
  expectedVersion?: number;
  // drag/drop optional ordering
  newPosition?: number;          // reordering inside a column

  // ✅ Optional publicId (for cases like batch updates)
  publicId?: string;
}

// Querying the board
export interface BoardQuery {
  // search & filters
  search?: string;               // name/description/publicId
  type?: EntityType | 'any';
  room?: string;
  assignedTo?: string;
  sprintId?: string;
  workflow?: Workflow | 'any';

  // paging (for large datasets)
  limit?: number;                // default reasonable
  offset?: number;               // default 0

  // view mode: which titles to show rows for
  // e.g., if viewType='mission', show each mission as title row, cards are its projects
  // Defaults to 'mission'
  viewType?: Extract<EntityType, 'mission' | 'project' | 'story'>;

  // title filtering: allow asking for specific titles by ids
  titlePublicIds?: string[];     // if provided, restrict rows to these titles
  includeOtherTasks?: boolean;   // default true
}

// Board row & response shapes (what Controller returns)
export interface BoardColumns<T = BoardEntity> {
  inbox: T[];
  build: T[];
  review: T[];
  shipped: T[];
}

export interface BoardRow {
  title: BoardEntity;            // the row "title" entity (mission/project/story)
  columns: BoardColumns;         // its immediate children as cards grouped by workflow
}

export interface BoardResponse {
  rows: BoardRow[];
  otherTasks: BoardColumns;      // all unmapped items (parentId = null), grouped by workflow
  totalCount: number;            // total entities considered (for paging)
}

// ---------- Repository contracts (interfaces Services will depend on) ----------
export interface IBoardRepository {
  // Reads
  findByPublicId(publicId: string): Promise<BoardEntity | null>;
  findByEntityId(entityId: string): Promise<BoardEntity | null>;
  searchTitles(query: BoardQuery): Promise<BoardEntity[]>; // titles (missions/projects/stories)
  findChildrenOf(parentId: string, options?: Partial<BoardQuery>): Promise<BoardEntity[]>;
  findUnmapped(options?: Partial<BoardQuery>): Promise<BoardEntity[]>;
  fullTextSearch(search: string, options?: Partial<BoardQuery>): Promise<BoardEntity[]>;

  // Writes
  createEntity(input: CreateEntityDTO, resolvedParentId?: string | null): Promise<BoardEntity>;
  updateEntityByPublicId(publicId: string, patch: UpdateEntityDTO): Promise<BoardEntity>;
  deleteEntityByPublicId(publicId: string): Promise<void>;

  // Ordering
  setPosition(entityId: string, parentId: string | null, workflow: Workflow, position: number): Promise<void>;

  // History
  addHistory(entityId: string, action: HistoryAction, actorId: string | null, payload?: Record<string, unknown>): Promise<void>;

  // Utility lookups
  resolvePublicIdToEntityId(publicId: string): Promise<string | null>;
}

// ---------- Service contracts (controllers depend on these) ----------
export interface IBoardService {
  getBoard(query: BoardQuery): Promise<BoardResponse>;
  createEntity(dto: CreateEntityDTO): Promise<BoardEntity>;
  updateEntity(publicId: string, dto: UpdateEntityDTO): Promise<BoardEntity>;
  deleteEntity(publicId: string): Promise<void>;

  // Drag & drop helpers
  moveWithinColumn(publicId: string, workflow: Workflow, newPosition: number): Promise<void>;
  moveAcross(
    publicId: string,
    target: { parentPublicId?: string | null; parentId?: string | null; workflow?: Workflow; position?: number },
  ): Promise<BoardEntity>;

  // Validation helpers
  validateParentMapping(childType: EntityType, parentType: EntityType | null): void;
}

// ---------- Errors (narrow error names so controllers can map to HTTP) ----------
export class BoardError extends Error {
  code: 'INVALID_PARENT' | 'CYCLE' | 'NOT_FOUND' | 'VERSION_CONFLICT' | 'VALIDATION' | 'FORBIDDEN';
  details?: unknown;
  constructor(code: BoardError['code'], message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

// ---------- Small utility types ----------
export type UUID = string;
export type PublicId = string;

// Helper for grouping by workflow
export type WorkflowBuckets = Record<Workflow, BoardEntity[]>;

// Guard to ensure exhaustive checks on switch statements
export function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${String(x)}`);
}
