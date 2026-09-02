import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { ForgotPasswordResponse } from '../../../../core/auth/auth.models';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected submitting = false;
  protected errorMessage = '';
  protected infoMessage = '';
  protected devToken: string | null = null;

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.infoMessage = '';

    try {
      const response: ForgotPasswordResponse = await this.authService.requestPasswordReset(
        this.form.getRawValue().email!,
      );
      this.infoMessage = response.message;
      this.devToken = response.resetToken ?? null;
      this.cdr.markForCheck();
    } catch (error: any) {
      this.errorMessage = error?.error?.error?.message || 'No se pudo procesar la solicitud.';
      this.cdr.markForCheck();
    } finally {
      this.submitting = false;
      this.cdr.markForCheck();
    }
  }
}