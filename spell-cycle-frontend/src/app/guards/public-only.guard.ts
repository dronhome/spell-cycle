import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '@auth/store';

export const publicOnlyGuard: CanActivateFn = () => {
    const auth = inject(AuthStore);
    const router = inject(Router);
    return auth.isLoggedIn() ? router.createUrlTree(['/landing']) : true;
};