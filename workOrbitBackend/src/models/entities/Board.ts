import { EntityType, Workflow, BoardEntity as BoardEntityType } from '../../types/board.types';

/**
 * BoardEntity class mirrors the `board_entities` table schema.
 */
export class BoardEntity implements BoardEntityType {
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
  parentPublicId?: string | null; // NEW
  childrenCountOpen: number;
  childrenCountTotal: number;
  status?: string;
  metadata?: Record<string, unknown>;

  version: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;

  constructor(data: BoardEntityType) {
    this.entityId = data.entityId;
    this.publicId = data.publicId;
    this.type = data.type;
    this.name = data.name;
    this.description = data.description ?? '';
    this.room = data.room ?? null;
    this.createdBy = data.createdBy;
    this.assignedTo = data.assignedTo ?? null;
    this.startDate = data.startDate ?? null;
    this.endDate = data.endDate ?? null;
    this.estimateHours = data.estimateHours ?? null;
    this.sprintId = data.sprintId ?? null;
    this.workflow = data.workflow;
    this.parentId = data.parentId ?? null;
    this.parentPublicId = data.parentPublicId ?? null;
    this.childrenCountOpen = data.childrenCountOpen ?? 0;
    this.childrenCountTotal = data.childrenCountTotal ?? 0;
    this.status = data.status ?? data.workflow;
    this.metadata = data.metadata ?? {};

    this.version = data.version ?? 1;
    this.isDeleted = data.isDeleted ?? false;
    this.createdAt = data.createdAt ?? new Date().toISOString();
    this.updatedAt = data.updatedAt ?? new Date().toISOString();
  }
}
