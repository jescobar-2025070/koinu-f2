import { Router } from 'express';
import { ObjetivoController } from '../controllers/objetivo.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { validateCreateObjetivoRequest } from '../validators/objectives/create-objetivo.validator';

export function objetivoRouter(): Router {
  const router = Router();
  const controller = new ObjetivoController();

  router.get('/', authenticate, controller.list);
  router.post('/', authenticate, validate(validateCreateObjetivoRequest), controller.create);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);
  router.post('/:id/deposit', authenticate, controller.deposit);
  router.post('/:id/withdraw', authenticate, controller.withdraw);

  return router;
}