import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  showPassword = false;
  submitting = false;
  errorMessage = '';
  successMessage = '';
  sessionExpiredMessage = '';

  ngOnInit(): void {
    if (this.authService.sessionExpired) {
      this.sessionExpiredMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      this.authService.sessionExpired = false;
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { email, password } = this.form.value;

    try {
      await this.authService.login(email!, password!);
      await this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage = error?.error?.error?.message || 'Credenciales incorrectas. Intenta de nuevo.';
    } finally {
      this.submitting = false;
    }
  }
}
