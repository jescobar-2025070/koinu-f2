import { Request, Response, NextFunction } from 'express';
import { ObjetivoService } from '../services/objectives/objetivo.service';
import { AppError } from '../errors/app-error';
import { ErrorCodes } from '../errors/error-codes';

export class ObjetivoController {
  private readonly objetivoService: ObjetivoService;

  constructor() {
    this.objetivoService = new ObjetivoService();
  }

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(ErrorCodes.UNAUTHORIZED, {
          message: 'Autenticación requerida.',
          statusCode: 401,
        });
      }
      const objetivos = await this.objetivoService.findByUser(req.user.id);
      res.status(200).json({ objetivos });
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
      const objetivo = await this.objetivoService.create(req.user.id, req.body);
      res.status(201).json({ objetivo });
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
      const objetivo = await this.objetivoService.update(req.params.id, req.user.id, req.body);
      res.status(200).json({ objetivo });
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
      await this.objetivoService.delete(req.params.id, req.user.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  deposit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(ErrorCodes.UNAUTHORIZED, {
          message: 'Autenticación requerida.',
          statusCode: 401,
        });
      }
      const objetivo = await this.objetivoService.deposit(req.params.id, req.user.id, req.body.amount);
      res.status(200).json({ objetivo });
    } catch (error) {
      next(error);
    }
  };

  withdraw = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(ErrorCodes.UNAUTHORIZED, {
          message: 'Autenticación requerida.',
          statusCode: 401,
        });
      }
      const objetivo = await this.objetivoService.withdraw(req.params.id, req.user.id, req.body.amount);
      res.status(200).json({ objetivo });
    } catch (error) {
      next(error);
    }
  };
}