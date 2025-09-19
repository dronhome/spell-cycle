import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthStore } from '@auth/store';

@Component({
  standalone: true,
  selector: 'app-app-shell',
  imports: [RouterLink, RouterOutlet, MatToolbarModule, MatIconModule],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss'
})
export class AppShell {
  // test 
  userId = signal('1');
  firstName = signal('Andrii');
  lastName = signal('Kostiushko');
  role_icon = signal('manager_icon');
  // <- 

  auth = inject(AuthStore);
  router = inject(Router);
  onLogout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: err => console.error('logout failed', err),
  });
}
}
