import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  let expiredRedirected = false;

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const isAuthEndpoint = req.url.includes('/auth/');
        const errorCode = (error.error as any)?.error?.code;
        if (errorCode === 'TOKEN_EXPIRED') {
          authService.markSessionExpired();
        } else if (!isAuthEndpoint && !expiredRedirected) {
          expiredRedirected = true;
          authService.clearSession();
          void router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    }),
  );
};
