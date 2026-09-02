import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';
import { AppError } from '../errors/app-error';
import { ErrorCodes } from '../errors/error-codes';

export class SystemController {
  constructor() {}

  health = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await pool.query('SELECT 1');
      res.status(200).json({
        status: 'ok',
        db: 'ok',
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[health] error al conectar con la base de datos:', error);
      next(
        new AppError(ErrorCodes.INTERNAL_ERROR, {
          message: 'La base de datos no está disponible.',
          statusCode: 503,
        }),
      );
    }
  };
}