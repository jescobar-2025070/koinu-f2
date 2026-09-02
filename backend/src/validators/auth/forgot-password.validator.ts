import { ForgotPasswordRequest } from '../../dto/requests/auth/forgot-password.dto';
import { ValidationResult, validationFailure, validationSuccess } from '../validator-result';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateForgotPasswordRequest(body: unknown): ValidationResult<ForgotPasswordRequest> {
  const errors: Record<string, string> = {};
  const data = (body ?? {}) as Record<string, unknown>;

  const email = typeof data.email === 'string' ? data.email.trim() : '';

  if (!email) {
    errors.email = 'El correo electrónico es obligatorio.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'El correo electrónico no tiene un formato válido.';
  }

  if (Object.keys(errors).length > 0) {
    return validationFailure<ForgotPasswordRequest>(errors);
  }

  return validationSuccess<ForgotPasswordRequest>({ email });
}