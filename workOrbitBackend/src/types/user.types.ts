export type UserRole = 'owner' | 'admin' | 'manager' | 'member';

export interface User {
  user_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  username: string;
  password_hash: string;
  role: UserRole;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserRequest {
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  username: string;
  password_hash: string;
  role?: UserRole;
}
