import { ResetPasswordRequest } from '../../dto/requests/auth/reset-password.dto';
import { ValidationResult, validationFailure, validationSuccess } from '../validator-result';

export function validateResetPasswordRequest(body: unknown): ValidationResult<ResetPasswordRequest> {
  const errors: Record<string, string> = {};
  const data = (body ?? {}) as Record<string, unknown>;

  const token = typeof data.token === 'string' ? data.token.trim() : '';
  const password = typeof data.password === 'string' ? data.password : '';

  if (!token) {
    errors.token = 'El token de recuperación es obligatorio.';
  }

  if (!password) {
    errors.password = 'La contraseña es obligatoria.';
  } else if (password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres.';
  } else if (password.length > 72) {
    errors.password = 'La contraseña no puede superar los 72 caracteres.';
  } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.password = 'La contraseña debe contener al menos una letra y un número.';
  }

  if (Object.keys(errors).length > 0) {
    return validationFailure<ResetPasswordRequest>(errors);
  }

  return validationSuccess<ResetPasswordRequest>({ token, password });
}