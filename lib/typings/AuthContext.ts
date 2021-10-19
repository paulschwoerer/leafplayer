import { User } from '@/common';

export interface AuthContext {
  getUser(): User;
  getUserId(): string;
  getSessionId(): string;
  isValidPassword(password: string): boolean;
}
