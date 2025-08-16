import { User } from '../../types/user.types';

export class UserEntity implements User {
  constructor(
    public user_id: string,
    public first_name: string,
    public last_name: string,
    public email: string,
    public username: string,
    public password_hash: string,
    public role: 'owner' | 'admin' | 'manager' | 'member',
    public is_verified: boolean,
    public created_at: Date,
    public updated_at: Date,
    public middle_name?: string
  ) {}

  public getFullName(): string {
    return this.middle_name 
      ? `${this.first_name} ${this.middle_name} ${this.last_name}`
      : `${this.first_name} ${this.last_name}`;
  }

  public toJSON(): Omit<User, 'password_hash'> {
    const { password_hash, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}