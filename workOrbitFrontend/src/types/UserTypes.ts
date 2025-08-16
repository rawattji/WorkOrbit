export type UserRole = 'owner' | 'admin' | 'manager' | 'member';

export interface User {
  user_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  username: string;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}