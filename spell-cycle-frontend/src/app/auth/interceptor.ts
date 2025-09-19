import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthHttpService } from '@auth/service';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { AuthStore } from './store';

const AUTH_PATHS = [
    '/api/v1/auth/authenticate',
    '/api/v1/auth/refresh',
    '/api/v1/auth/logout',
];

function isAuthPath(url: string) {
    return AUTH_PATHS.some(p => url.includes(p));
}

export const authInterceptor: HttpInterceptorFn = (
    req: HttpRequest<any>, 
    next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
    const authHttp = inject(AuthHttpService);
    const router = inject(Router);
    const auth = inject(AuthStore);

    console.log(req.url);

    return next(req).pipe(
        catchError((err: HttpErrorResponse) => {
            const isAuthFailure = (err.status === 401 || err.status === 403);
            if (!isAuthFailure || isAuthPath(req.url)) {
                return throwError(() => err);
            }

            return authHttp.refresh().pipe(
                switchMap(() => next(req)),
                catchError(refreshErr => {
                    auth.logout().subscribe()
                    router.navigate(['/auth/login'])
                    return throwError(() => refreshErr);
                })
            );
        })
    );
};
