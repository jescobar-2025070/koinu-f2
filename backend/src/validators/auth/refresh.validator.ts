import { ValidationResult, validationFailure, validationSuccess } from '../validator-result';

export interface RefreshRequest {
  refreshToken: string;
}

export function validateRefreshRequest(body: unknown): ValidationResult<RefreshRequest> {
  const errors: Record<string, string> = {};
  const data = (body ?? {}) as Record<string, unknown>;

  const refreshToken = typeof data.refreshToken === 'string' ? data.refreshToken.trim() : '';

  if (!refreshToken) {
    errors.refreshToken = 'El token de refresco es obligatorio.';
  }

  if (Object.keys(errors).length > 0) {
    return validationFailure<RefreshRequest>(errors);
  }

  return validationSuccess<RefreshRequest>({ refreshToken });
}