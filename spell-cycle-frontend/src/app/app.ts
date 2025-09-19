import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from '@auth/store';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class App implements OnInit {
  private auth = inject(AuthStore);
  ngOnInit(): void {
    this.auth.bootstrap();
  }
}
