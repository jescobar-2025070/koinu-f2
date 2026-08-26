import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthUser } from '../entities/auth-user';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  iat: number;
  exp: number;
}

export function signAuthToken(user: AuthUser): string {
  const payload = {
    sub: user.id,
    email: user.email,
    roles: user.roles,
  };
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAuthToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}
