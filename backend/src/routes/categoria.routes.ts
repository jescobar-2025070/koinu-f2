import { Router } from 'express';
import { CategoriaController } from '../controllers/categoria.controller';
import { authenticate } from '../middleware/authenticate';

export function categoriaRouter(): Router {
  const router = Router();
  const controller = new CategoriaController();

  router.get('/income', authenticate, controller.listIngreso);
  router.post('/income', authenticate, controller.createIngreso);
  router.get('/expense', authenticate, controller.listGasto);
  router.post('/expense', authenticate, controller.createGasto);

  return router;
}
