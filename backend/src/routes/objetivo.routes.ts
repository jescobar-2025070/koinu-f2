import { Router } from 'express';
import { ObjetivoController } from '../controllers/objetivo.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { validateCreateObjetivoRequest } from '../validators/objectives/create-objetivo.validator';
import { validateUpdateObjetivoRequest } from '../validators/objectives/update-objetivo.validator';
import { validateAmountRequest } from '../validators/objectives/amount.validator';

export function objetivoRouter(): Router {
  const router = Router();
  const controller = new ObjetivoController();

  router.get('/', authenticate, controller.list);
  router.post('/', authenticate, validate(validateCreateObjetivoRequest), controller.create);

  router.get('/period/:periodId', authenticate, controller.listByPeriod);
  router.post('/period/:periodId', authenticate, validate(validateCreateObjetivoRequest), controller.createByPeriod);

  router.get('/:id', authenticate, controller.getById);
  router.patch('/:id', authenticate, validate(validateUpdateObjetivoRequest), controller.update);
  router.delete('/:id', authenticate, controller.delete);
  router.post('/:id/contributions', authenticate, validate(validateAmountRequest), controller.deposit);
  router.post('/:id/withdrawals', authenticate, validate(validateAmountRequest), controller.withdraw);
  router.post('/:id/complete', authenticate, controller.complete);
  router.post('/:id/cancel', authenticate, controller.cancel);

  return router;
}