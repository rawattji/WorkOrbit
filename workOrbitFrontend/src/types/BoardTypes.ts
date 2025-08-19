export type EntityType = 'mission' | 'project' | 'story' | 'task';
export type Workflow = 'inbox' | 'build' | 'review' | 'shipped';

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
  parentId?: string | null;
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
}

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
}

export interface BoardColumns<T = BoardEntity> {
  inbox: T[];
  build: T[];
  review: T[];
  shipped: T[];
}

export interface BoardRow {
  title: BoardEntity;   // the mission/project/story
  columns: BoardColumns;
}

export interface BoardResponse {
  rows: BoardRow[];
  otherTasks: BoardColumns;
  totalCount: number;
}
