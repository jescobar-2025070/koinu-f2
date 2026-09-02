import { Request, Response, NextFunction } from 'express';
import { CategoriaService } from '../services/categories/categoria.service';
import { AppError } from '../errors/app-error';
import { ErrorCodes } from '../errors/error-codes';

export class CategoriaController {
  private readonly categoriaService: CategoriaService;

  constructor() {
    this.categoriaService = new CategoriaService();
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

  listIngreso = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.requireUser(req);
      const categorias = await this.categoriaService.listIngreso(userId);
      res.status(200).json({ categorias });
    } catch (error) {
      next(error);
    }
  };

  createIngreso = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.requireUser(req);
      const categoria = await this.categoriaService.createIngreso(userId, { name: req.body.name });
      res.status(201).json({ categoria });
    } catch (error) {
      next(error);
    }
  };

  listGasto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.requireUser(req);
      const categorias = await this.categoriaService.listGasto(userId);
      res.status(200).json({ categorias });
    } catch (error) {
      next(error);
    }
  };

  createGasto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.requireUser(req);
      const categoria = await this.categoriaService.createGasto(userId, { name: req.body.name });
      res.status(201).json({ categoria });
    } catch (error) {
      next(error);
    }
  };

  updateIngreso = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.requireUser(req);
      const categoria = await this.categoriaService.updateIngreso(userId, req.params.id, req.body.name);
      res.status(200).json({ categoria });
    } catch (error) {
      next(error);
    }
  };

  updateGasto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.requireUser(req);
      const categoria = await this.categoriaService.updateGasto(userId, req.params.id, req.body.name);
      res.status(200).json({ categoria });
    } catch (error) {
      next(error);
    }
  };

  deleteIngreso = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.requireUser(req);
      await this.categoriaService.deleteIngreso(userId, req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  deleteGasto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.requireUser(req);
      await this.categoriaService.deleteGasto(userId, req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}
