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
  entityId: string;
  publicId: string;
  type: EntityType;
  name: string;
  description?: string | null;
  room?: string | null;
  createdBy: string;
  assignedTo?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  estimateHours?: number | null;
  sprintId?: string | null;
  workflow: Workflow;
  parentId?: string | null;
  childrenCountOpen: number;
  childrenCountTotal: number;
  status?: string;
  metadata?: Record<string, unknown>;
  workspaceId: string;
  departmentId?: string | null;
  teamId?: string | null;
  version: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EntityHistory {
  historyId: string;          // UUID
  entityId: string;           // UUID
  action: HistoryAction;
  actorId?: string | null;    // user_id
  payload?: Record<string, unknown>;
  createdAt: string;          // ISO datetime
}

// ---------- DTOs (requests/responses) ----------
// Create
export interface CreateEntityDTO {
  type: EntityType;
  name: string;
  description?: string | null;
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
  workspaceId: string;
  departmentId?: string | null;
  teamId?: string | null;
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
  expectedVersion?: number;
  newPosition?: number;
  publicId?: string;
  workspaceId?: string;
  departmentId?: string | null;
  teamId?: string | null;
}

// Querying the board
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
  workspaceId?: string;
  departmentId?: string;
  teamId?: string;
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

// ---------- UI specific types ----------
export interface DragItem {
  publicId: string;
  type: EntityType;
  currentWorkflow: Workflow;
  currentParentId?: string | null;
}

export interface DropTarget {
  parentPublicId?: string | null;
  parentId?: string | null;
  workflow: Workflow;
  position?: number;
}

// Helper types for UI components
export interface CardProps {
  entity: BoardEntity;
  onEdit?: (entity: BoardEntity) => void;
  onDelete?: (publicId: string) => void;
  isDragging?: boolean;
}

export interface TitleRowProps {
  title: BoardEntity;
  columns: BoardColumns;
  onCardEdit?: (entity: BoardEntity) => void;
  onCardDelete?: (publicId: string) => void;
  onDropCard?: (dragItem: DragItem, workflow: Workflow) => void;
}

// ---------- Sprint types (if needed) ----------
export interface Sprint {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'planned';
  startDate: string;
  endDate: string;
}

// ---------- User types (for assignee display) ----------
export interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// ---------- Utility types ----------
export type UUID = string;
export type PublicId = string;

// Helper for grouping by workflow
export type WorkflowBuckets = Record<Workflow, BoardEntity[]>;

// Error types
export interface BoardApiError {
  code: 'INVALID_PARENT' | 'CYCLE' | 'NOT_FOUND' | 'VERSION_CONFLICT' | 'VALIDATION' | 'FORBIDDEN';
  message: string;
  details?: unknown;
}

// Search and filter options
export interface SearchFilters {
  search: string;
  type: EntityType | 'any';
  room: string;
  assignedTo: string;
  sprintId: string;
  workflow: Workflow | 'any';
}

// View configuration
export interface BoardViewConfig {
  viewType: Extract<EntityType, 'mission' | 'project' | 'story'>;
  showOtherTasks: boolean;
  groupBy?: 'type' | 'assignee' | 'sprint' | 'room';
  sortBy?: 'name' | 'startDate' | 'estimate' | 'createdAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
}