import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/authenticate';

export function dashboardRouter(): Router {
  const router = Router();
  const controller = new DashboardController();

  router.get('/:periodId/dashboard', authenticate, controller.get);

  return router;
}
