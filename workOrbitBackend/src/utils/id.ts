import { randomBytes } from 'crypto';

export type EntityType = 'mission' | 'project' | 'story' | 'task';

const prefixes: Record<EntityType, string> = {
  mission: 'M_',
  project: 'P_',
  story: 'S_',
  task: 'T_',
};

/**
 * Generate an obfuscated publicId for entities
 * Example: M_ab12cd, P_9xk3z1
 */
export function generatePublicId(type: EntityType): string {
  const prefix = prefixes[type];
  const token = randomBytes(4).toString('hex').slice(0, 6); // 6-char short id
  return `${prefix}${token}`;
}

/**
 * Check if a given publicId matches the correct format
 */
export function isValidPublicId(id: string): boolean {
  return /^(M_|P_|S_|T_)[a-z0-9]+$/i.test(id);
}

/**
 * Extract type from publicId prefix
 */
export function getTypeFromPublicId(id: string): EntityType | null {
  if (id.startsWith('M_')) return 'mission';
  if (id.startsWith('P_')) return 'project';
  if (id.startsWith('S_')) return 'story';
  if (id.startsWith('T_')) return 'task';
  return null;
}
