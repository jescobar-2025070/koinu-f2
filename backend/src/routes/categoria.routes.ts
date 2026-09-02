import { Router } from 'express';
import { CategoriaController } from '../controllers/categoria.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { validateCategoryNameRequest } from '../validators/categories/category-name.validator';

export function categoriaRouter(): Router {
  const router = Router();
  const controller = new CategoriaController();

  router.get('/income', authenticate, controller.listIngreso);
  router.post('/income', authenticate, validate(validateCategoryNameRequest), controller.createIngreso);
  router.patch('/income/:id', authenticate, validate(validateCategoryNameRequest), controller.updateIngreso);
  router.delete('/income/:id', authenticate, controller.deleteIngreso);

  router.get('/expense', authenticate, controller.listGasto);
  router.post('/expense', authenticate, validate(validateCategoryNameRequest), controller.createGasto);
  router.patch('/expense/:id', authenticate, validate(validateCategoryNameRequest), controller.updateGasto);
  router.delete('/expense/:id', authenticate, controller.deleteGasto);

  return router;
}