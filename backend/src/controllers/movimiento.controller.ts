import { Request, Response, NextFunction } from 'express';
import { MovimientoService } from '../services/movements/movimiento.service';
import { AppError } from '../errors/app-error';
import { ErrorCodes } from '../errors/error-codes';

export class MovimientoController {
  private readonly movimientoService: MovimientoService;

  constructor() {
    this.movimientoService = new MovimientoService();
  }

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(ErrorCodes.UNAUTHORIZED, {
          message: 'Autenticación requerida.',
          statusCode: 401,
        });
      }
      const periodoId = req.query.periodoId as string | undefined;
      const movimientos = await this.movimientoService.findByUser(req.user.id, periodoId);
      res.status(200).json({ movimientos });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(ErrorCodes.UNAUTHORIZED, {
          message: 'Autenticación requerida.',
          statusCode: 401,
        });
      }
      const movimiento = await this.movimientoService.create(req.user.id, req.body);
      res.status(201).json({ movimiento });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(ErrorCodes.UNAUTHORIZED, {
          message: 'Autenticación requerida.',
          statusCode: 401,
        });
      }
      await this.movimientoService.delete(req.params.id, req.user.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  stats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(ErrorCodes.UNAUTHORIZED, {
          message: 'Autenticación requerida.',
          statusCode: 401,
        });
      }
      const periodoId = req.query.periodoId as string | undefined;
      const stats = await this.movimientoService.getStats(req.user.id, periodoId);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  };
}