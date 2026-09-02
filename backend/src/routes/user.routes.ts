import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import {
  validateSetActiveRequest,
  validateSetRolesRequest,
} from '../validators/users/update-user.validator';

export function userRouter(): Router {
  const router = Router();
  const controller = new UserController();

  router.use(authenticate, requireRole('ADMIN'));

  router.get('/', controller.list);
  router.patch('/:id/active', validate(validateSetActiveRequest), controller.setActive);
  router.put('/:id/roles', validate(validateSetRolesRequest), controller.setRoles);
  router.delete('/:id', controller.delete);

  return router;
}