import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/authorize';

export function roleRouter(): Router {
  const router = Router();
  const controller = new RoleController();

  router.get('/', authenticate, requireRole('ADMIN'), controller.list);

  return router;
}
