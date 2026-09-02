import { Request, Response, NextFunction } from 'express';
import { ObjetivoService, CrearObjetivoInput } from '../services/objectives/objetivo.service';
import { AppError } from '../errors/app-error';
import { ErrorCodes } from '../errors/error-codes';

export class ObjetivoController {
  private readonly objetivoService: ObjetivoService;

  constructor() {
    this.objetivoService = new ObjetivoService();
  }

  private requireUser(req: Request): string {
    if (!req.user) {
      throw new AppError(ErrorCodes.UNAUTHORIZED, {
        message: 'Autenticación requerida.',
        statusCode: 401,
      });
    }
    return req.user.id;
  }

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.requireUser(req);
      const objetivos = await this.objetivoService.findByUser(userId);
      res.status(200).json({ objetivos });
    } catch (error) {
      next(error);
    }
  };

  listByPeriod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.requireUser(req);
      const objetivos = await this.objetivoService.findByPeriodo(userId, req.params.periodId);
      res.status(200).json({ objetivos });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.requireUser(req);
      const objetivo = await this.objetivoService.create(userId, req.body);
      res.status(201).json({ objetivo });
    } catch (error) {
      next(error);
    }
  };

  createByPeriod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.requireUser(req);
      const data: CrearObjetivoInput = { ...req.body, periodoId: req.params.periodId };
      const objetivo = await this.objetivoService.create(userId, data);
      res.status(201).json({ objetivo });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.requireUser(req);
      const objetivo = await this.objetivoService.getById(req.params.id, userId);
      res.status(200).json({ objetivo });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.requireUser(req);
      const objetivo = await this.objetivoService.update(req.params.id, userId, req.body);
      res.status(200).json({ objetivo });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.requireUser(req);
      await this.objetivoService.delete(req.params.id, userId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  deposit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.requireUser(req);
      const objetivo = await this.objetivoService.deposit(req.params.id, userId, req.body.amount);
      res.status(200).json({ objetivo });
    } catch (error) {
      next(error);
    }
  };

  withdraw = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.requireUser(req);
      const objetivo = await this.objetivoService.withdraw(req.params.id, userId, req.body.amount);
      res.status(200).json({ objetivo });
    } catch (error) {
      next(error);
    }
  };

  complete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.requireUser(req);
      const objetivo = await this.objetivoService.complete(req.params.id, userId);
      res.status(200).json({ objetivo });
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.requireUser(req);
      const objetivo = await this.objetivoService.cancel(req.params.id, userId);
      res.status(200).json({ objetivo });
    } catch (error) {
      next(error);
    }
  };
}