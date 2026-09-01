import { ValidationResult, validationFailure, validationSuccess } from '../validator-result';

export interface CreatePeriodoRequest {
  name: string;
  startDate: string;
  endDate: string;
}

export function validateCreatePeriodoRequest(body: unknown): ValidationResult<CreatePeriodoRequest> {
  const errors: Record<string, string> = {};
  const data = (body ?? {}) as Record<string, unknown>;

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const startDate = typeof data.startDate === 'string' ? data.startDate.trim() : '';
  const endDate = typeof data.endDate === 'string' ? data.endDate.trim() : '';

  if (!name) {
    errors.name = 'El nombre del período es obligatorio.';
  } else if (name.length > 100) {
    errors.name = 'El nombre no puede superar los 100 caracteres.';
  }

  if (!startDate || isNaN(Date.parse(startDate))) {
    errors.startDate = 'La fecha de inicio es obligatoria y debe tener un formato válido.';
  }

  if (!endDate || isNaN(Date.parse(endDate))) {
    errors.endDate = 'La fecha de fin es obligatoria y debe tener un formato válido.';
  }

  if (startDate && endDate && !isNaN(Date.parse(startDate)) && !isNaN(Date.parse(endDate))) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      errors.endDate = 'La fecha de fin debe ser posterior o igual a la fecha de inicio.';
    }
  }

  if (Object.keys(errors).length > 0) {
    return validationFailure<CreatePeriodoRequest>(errors);
  }

  return validationSuccess<CreatePeriodoRequest>({ name, startDate, endDate });
}
