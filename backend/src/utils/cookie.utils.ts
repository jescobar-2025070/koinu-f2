import { CookieOptions, Response } from 'express';
import { config } from '../config/env';

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: config.cookieSecure,
  sameSite: 'lax',
  path: '/',
};

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(config.cookieName, token, baseCookieOptions);
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(config.cookieName, baseCookieOptions);
}
