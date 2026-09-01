import { Router } from 'express';
import { PeriodoController } from '../controllers/periodo.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { validateCreatePeriodoRequest } from '../validators/periods/create-periodo.validator';

export function periodoRouter(): Router {
  const router = Router();
  const controller = new PeriodoController();

  router.get('/', authenticate, controller.list);
  router.get('/:id', authenticate, controller.getById);
  router.post('/', authenticate, validate(validateCreatePeriodoRequest), controller.create);
  router.put('/:id', authenticate, controller.update);
  router.post('/:id/activate', authenticate, controller.activate);
  router.post('/:id/finalize', authenticate, controller.finalize);
  router.post('/:id/cancel', authenticate, controller.cancel);

  return router;
}
