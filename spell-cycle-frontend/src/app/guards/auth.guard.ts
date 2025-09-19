import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '@auth/store';

export const authGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthStore);
    const router = inject(Router);
    return auth.isLoggedIn()
        ? true
        : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};