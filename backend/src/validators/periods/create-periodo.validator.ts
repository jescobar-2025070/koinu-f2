import { ValidationResult, validationFailure, validationSuccess } from '../validator-result';

interface CreatePeriodoRequest {
  year: number;
  month: number;
}

export function validateCreatePeriodoRequest(body: unknown): ValidationResult<CreatePeriodoRequest> {
  const errors: Record<string, string> = {};
  const data = (body ?? {}) as Record<string, unknown>;

  const year = typeof data.year === 'number' ? data.year : parseInt(data.year as string, 10);
  const month = typeof data.month === 'number' ? data.month : parseInt(data.month as string, 10);

  const currentYear = new Date().getFullYear();

  if (isNaN(year) || year < 2000 || year > currentYear + 1) {
    errors.year = `El año debe estar entre 2000 y ${currentYear + 1}.`;
  }

  if (isNaN(month) || month < 1 || month > 12) {
    errors.month = 'El mes debe estar entre 1 y 12.';
  }

  if (Object.keys(errors).length > 0) {
    return validationFailure<CreatePeriodoRequest>(errors);
  }

  return validationSuccess<CreatePeriodoRequest>({ year, month });
}