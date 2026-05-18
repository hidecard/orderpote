import type { User } from './schema';

export const ADMIN_EMAIL = 'hidecard1500@gmail.com';

export function isAdminEmail(email: string): boolean {
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}

export function isAdminUser(user: User | null): boolean {
  return user ? isAdminEmail(user.email) : false;
}
