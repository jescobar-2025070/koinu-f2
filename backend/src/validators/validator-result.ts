export interface ValidationResult<T> {
  valid: boolean;
  value: T;
  errors: Record<string, string>;
}

export function validationSuccess<T>(value: T): ValidationResult<T> {
  return { valid: true, value, errors: {} };
}

export function validationFailure<T>(errors: Record<string, string>): ValidationResult<T> {
  return { valid: false, value: {} as T, errors };
}
