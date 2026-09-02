import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly form = new FormGroup(
    {
      token: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8), this.letterAndNumber],
      }),
      confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    },
    { validators: this.passwordsMatch },
  );

  protected submitting = false;
  protected errorMessage = '';
  protected successMessage = '';

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.errorMessage = 'Por favor, revise los campos marcados antes de continuar.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { token, password } = this.form.getRawValue();

    try {
      await this.authService.resetPassword(token, password);
      this.successMessage = 'Contraseña actualizada correctamente.';
      this.form.reset();
      this.cdr.markForCheck();
    } catch (error: any) {
      this.errorMessage = error?.error?.error?.message || 'No se pudo restablecer la contraseña.';
      this.cdr.markForCheck();
    } finally {
      this.submitting = false;
      this.cdr.markForCheck();
    }
  }

  private letterAndNumber(control: AbstractControl): Record<string, boolean> | null {
    const value = control.value as string;
    if (!value) {
      return null;
    }
    const hasLetter = /[A-Za-z]/.test(value);
    const hasNumber = /\d/.test(value);
    return hasLetter && hasNumber ? null : { letterAndNumber: true };
  }

  private passwordsMatch(group: AbstractControl): Record<string, boolean> | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }
}