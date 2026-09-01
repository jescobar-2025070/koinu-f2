import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { validateRegisterRequest } from '../validators/auth/register.validator';
import { validateLoginRequest } from '../validators/auth/login.validator';

export function authRouter(): Router {
  const router = Router();
  const controller = new AuthController();

  router.post('/register', validate(validateRegisterRequest), controller.register);
  router.post('/login', validate(validateLoginRequest), controller.login);
  router.post('/logout', authenticate, controller.logout);
  router.get('/me', authenticate, controller.me);

  return router;
}
