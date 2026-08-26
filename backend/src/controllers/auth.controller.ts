import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth/auth.service';
import { UserService } from '../services/users/user.service';
import { pool } from '../config/db';
import { AppError } from '../errors/app-error';
import { ErrorCodes } from '../errors/error-codes';
import { signAuthToken } from '../utils/jwt.utils';
import { setAuthCookie, clearAuthCookie } from '../utils/cookie.utils';
import { toUserResponse } from '../mappers/user.mapper';

export class AuthController {
  private readonly authService: AuthService;
  private readonly userService: UserService;

  constructor() {
    this.authService = new AuthService();
    this.userService = new UserService(pool);
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, roles } = await this.authService.register(req.body);
      res.status(201).json({ user: toUserResponse(user, roles) });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { authUser, user } = await this.authService.login(req.body);
      const token = signAuthToken(authUser);
      setAuthCookie(res, token);
      res.status(200).json({ user: toUserResponse(user, authUser.roles) });
    } catch (error) {
      next(error);
    }
  };

  logout = (_req: Request, res: Response): void => {
    clearAuthCookie(res);
    res.status(204).end();
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(ErrorCodes.UNAUTHORIZED, {
          message: 'Autenticación requerida.',
          statusCode: 401,
        });
      }
      const account = await this.userService.getUserWithRoles(req.user.id);
      if (!account) {
        throw new AppError(ErrorCodes.TOKEN_INVALID, {
          message: 'La sesión ya no es válida.',
          statusCode: 401,
        });
      }
      res.status(200).json({ user: toUserResponse(account.user, account.roles) });
    } catch (error) {
      next(error);
    }
  };
}
