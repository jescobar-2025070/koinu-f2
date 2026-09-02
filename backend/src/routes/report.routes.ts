import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/authenticate';

export function reportRouter(): Router {
  const router = Router();
  const controller = new ReportController();

  router.get('/:periodId/reports/preliminary', authenticate, controller.preliminary);
  router.get('/:periodId/reports/final', authenticate, controller.final);

  return router;
}