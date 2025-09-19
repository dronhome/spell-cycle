import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthHttpService {
    private refreshRequest$?: Observable<void>;

    constructor(private http: HttpClient) {}

    refresh(): Observable<void> {
        if (!this.refreshRequest$) {
            this.refreshRequest$ = this.http.post<void>('/api/v1/auth/refresh', {}, { withCredentials: true }).pipe(
                shareReplay(1),
                finalize(() => { this.refreshRequest$ = undefined; })
            );
        }
        return this.refreshRequest$;
    }
}
