import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service'; // adjust path as necessary
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);

  // Determine whether to intercept the request
  const shouldIntercept = req.headers.has('X-Intercept');

  if (shouldIntercept) {
    const authToken = authService.getToken();
    let authReq = req;

    if (authToken) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${authToken}`)
      });
    }

    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized errors
        if (error.status === 401) {
          authService.logout();
          // Optionally, redirect to login or show a message
        }
        return throwError(() => error);
      })
    );
  } else {
    return next(req);
  }
};
