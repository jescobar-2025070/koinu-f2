import bcrypt from 'bcryptjs';
import { config } from '../config/env';

export function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, config.bcryptRounds);
}

export function comparePassword(plainPassword: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}
