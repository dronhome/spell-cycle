import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-blank-shell',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class BlankShell {

}
