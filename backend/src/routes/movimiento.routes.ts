import { Router } from 'express';
import { MovimientoController } from '../controllers/movimiento.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { validateCreateMovimientoRequest } from '../validators/movements/create-movimiento.validator';

export function movimientoRouter(): Router {
  const router = Router();
  const controller = new MovimientoController();

  router.get('/', authenticate, controller.list);
  router.get('/stats', authenticate, controller.stats);
  router.post('/', authenticate, validate(validateCreateMovimientoRequest), controller.create);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);
  router.get('/:id', authenticate, controller.getById);

  return router;
}
