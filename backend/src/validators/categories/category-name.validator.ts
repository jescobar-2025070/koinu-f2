import { ValidationResult, validationFailure, validationSuccess } from '../validator-result';

export interface CategoryNameRequest {
  name: string;
}

export function validateCategoryNameRequest(body: unknown): ValidationResult<CategoryNameRequest> {
  const errors: Record<string, string> = {};
  const data = (body ?? {}) as Record<string, unknown>;

  const name = typeof data.name === 'string' ? data.name.trim() : '';

  if (!name) {
    errors.name = 'El nombre de la categoría es obligatorio.';
  } else if (name.length > 100) {
    errors.name = 'El nombre no puede superar los 100 caracteres.';
  }

  if (Object.keys(errors).length > 0) {
    return validationFailure<CategoryNameRequest>(errors);
  }

  return validationSuccess<CategoryNameRequest>({ name });
}