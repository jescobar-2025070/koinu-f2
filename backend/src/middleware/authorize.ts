import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import { ErrorCodes } from '../errors/error-codes';
import { RoleName } from '../entities/role.entity';

export function requireRole(...allowedRoles: RoleName[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(
        new AppError(ErrorCodes.UNAUTHORIZED, {
          message: 'Autenticación requerida.',
          statusCode: 401,
        }),
      );
      return;
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      next(
        new AppError(ErrorCodes.FORBIDDEN, {
          message: 'No tienes permisos para acceder a este recurso.',
          statusCode: 403,
        }),
      );
      return;
    }

    next();
  };
}
