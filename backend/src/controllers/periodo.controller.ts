import { Request, Response, NextFunction } from 'express';
import { PeriodoService } from '../services/periods/periodo.service';
import { AppError } from '../errors/app-error';
import { ErrorCodes } from '../errors/error-codes';

export class PeriodoController {
  private readonly periodoService: PeriodoService;

  constructor() {
    this.periodoService = new PeriodoService();
  }

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(ErrorCodes.UNAUTHORIZED, {
          message: 'Autenticación requerida.',
          statusCode: 401,
        });
      }
      const periodos = await this.periodoService.findByUser(req.user.id);
      res.status(200).json({ periodos });
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
      const periodo = await this.periodoService.create(req.user.id, req.body);
      res.status(201).json({ periodo });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(ErrorCodes.UNAUTHORIZED, {
          message: 'Autenticación requerida.',
          statusCode: 401,
        });
      }
      const periodo = await this.periodoService.update(req.params.id, req.user.id, req.body);
      res.status(200).json({ periodo });
    } catch (error) {
      next(error);
    }
  };

  finalize = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(ErrorCodes.UNAUTHORIZED, {
          message: 'Autenticación requerida.',
          statusCode: 401,
        });
      }
      const periodo = await this.periodoService.finalize(req.params.id, req.user.id);
      res.status(200).json({ periodo });
    } catch (error) {
      next(error);
    }
  };
}