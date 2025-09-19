import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';

export interface LoginDto { email: string; password: string; }
export interface SessionUser { email: string; }

@Injectable({ providedIn: 'root' })
    export class AuthStore {
    private http = inject(HttpClient);

    private _loggedIn = signal(false);
    private _hydrated = signal(false);
    private _user = signal<SessionUser | null>(null);

    hydrated(): boolean { return this._hydrated(); }
    isLoggedIn(): boolean { return this._loggedIn(); }
    user() { return this._user(); }

    private fetchSession() {
        return this.http.get<SessionUser>('/api/v1/auth/session').pipe(
            tap(u => { this._user.set(u); this._loggedIn.set(true); }),
            catchError(() => { this._user.set(null); this._loggedIn.set(false); return of(null); })
        );
    }

    bootstrap(): void {
        this.fetchSession()
            .pipe(finalize(() => this._hydrated.set(true)))
            .subscribe();
    }

    login(dto: LoginDto) {
        return this.http.post<void>('/api/v1/auth/authenticate', dto).pipe(
            switchMap(() => this.fetchSession())
        );
    }

    logout() {
        return this.http.post<void>('/api/v1/auth/logout', {}).pipe(
            tap(() => {
                this._loggedIn.set(false);
                this._user.set(null);
                this._hydrated.set(true);
            })
        );
    }
}
