import { Router } from 'express';
import { CategoriaRepository } from '../repositories/categoria.repository';
import { pool } from '../config/db';
import { authenticate } from '../middleware/authenticate';

export function categoriaRouter(): Router {
  const router = Router();
  const repo = new CategoriaRepository(pool);

  router.get('/', authenticate, async (_req, res, next) => {
    try {
      const categorias = await repo.findAll();
      res.status(200).json({ categorias });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
