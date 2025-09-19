import { Routes } from '@angular/router';
import { authGuard } from '@guards/auth.guard';
import { publicOnlyGuard } from '@guards/public-only.guard';


export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('@layouts/app-shell/app-shell').then(m => m.AppShell),
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'landing' }, 
            { path: 'landing', loadComponent: () => import('@features/landing/landing').then(m => m.Landing) },
            { path: 'restricted', canActivate: [authGuard],
                loadComponent: () => import('@features/restricted/restricted').then(m => m.Restricted) },
            {
                path: 'profile/:id',
                // canActivate: [authGuard],
                loadComponent: () => import('@features/profile/profile').then(m => m.Profile)
            }
        ]
    },
    {
        path: 'auth',
        loadComponent: () => import('@layouts/blank-shell/blank-shell').then(m => m.BlankShell),
        children: [
            { path: '', pathMatch: 'full', redirectTo: '/landing' }, 
            { path: 'login', canActivate: [publicOnlyGuard],
                loadComponent: () => import('@features/login/login').then(m => m.Login) },
            { path: 'register', loadComponent: () => import('@features/register/register').then(m => m.Register) }
        ]
    },
    { path: '**', redirectTo: 'landing' }
];
