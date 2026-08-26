import { LoginRequest } from '../../dto/requests/auth/login.dto';
import { ValidationResult, validationFailure, validationSuccess } from '../validator-result';

export function validateLoginRequest(body: unknown): ValidationResult<LoginRequest> {
  const errors: Record<string, string> = {};
  const data = (body ?? {}) as Record<string, unknown>;

  const email = typeof data.email === 'string' ? data.email.trim() : '';
  const password = typeof data.password === 'string' ? data.password : '';

  if (!email) {
    errors.email = 'El correo electrónico es obligatorio.';
  }

  if (!password) {
    errors.password = 'La contraseña es obligatoria.';
  }

  if (Object.keys(errors).length > 0) {
    return validationFailure<LoginRequest>(errors);
  }

  return validationSuccess<LoginRequest>({ email, password });
}
