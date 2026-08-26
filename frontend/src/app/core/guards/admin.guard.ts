import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const adminGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.ensureInitialized();
  if (authService.isAuthenticated() && authService.hasRole('ADMIN')) {
    return true;
  }
  return router.createUrlTree(['/dashboard']);
};
