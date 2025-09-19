import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthStore } from '@auth/store';
import { ErrorMessage } from 'app/ui/error-message/error-message';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatIconModule, ErrorMessage],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthStore);
  private router = inject(Router);
  private ar = inject(ActivatedRoute);

  loading = false;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  submit() {
    if (this.form.invalid || this.loading) return;

    this.loading = true;

    const { 
      email, 
      password 
    } = this.form.getRawValue();

    this.auth.login({email, password})
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          const returnUrl = this.ar.snapshot.queryParamMap.get('returnUrl') || '/landing';
          this.router.navigateByUrl(returnUrl);
        },
        error: (err) => {
          const msg = err?.status === 401 ? 'Invalid email or password.' : 'Login failed. Try again.';
          this.form.setErrors({ auth: msg });
        }
      });
  }
}
