import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      const isAuthEndpoint = req.url.includes('/auth/');
      const errorCode = (error.error as any)?.error?.code;
      const hasRefreshToken = !!authService.getRefreshToken();

      if (!isAuthEndpoint && hasRefreshToken) {
        return from(authService.refreshSession()).pipe(
          switchMap((ok) => {
            if (!ok) {
              return throwError(() => error);
            }
            return next(req);
          }),
          catchError(() => {
            authService.clearSession();
            void router.navigate(['/login']);
            return throwError(() => error);
          }),
        );
      }

      if (errorCode === 'TOKEN_EXPIRED') {
        authService.markSessionExpired();
      } else if (!isAuthEndpoint) {
        authService.clearSession();
        void router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};