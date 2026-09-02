import { Router } from 'express';
import { SystemController } from '../controllers/system.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/authorize';

export function systemRouter(): Router {
  const router = Router();
  const controller = new SystemController();

  router.get('/health', authenticate, requireRole('ADMIN'), controller.health);

  return router;
}