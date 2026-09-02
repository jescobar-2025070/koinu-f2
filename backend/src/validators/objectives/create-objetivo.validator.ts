import { ValidationResult, validationFailure, validationSuccess } from '../validator-result';

export interface CreateObjetivoRequest {
  periodoId?: string;
  name: string;
  description?: string;
  targetAmount: number;
  deadline?: string;
  startDate?: string;
}

export function validateCreateObjetivoRequest(body: unknown): ValidationResult<CreateObjetivoRequest> {
  const errors: Record<string, string> = {};
  const data = (body ?? {}) as Record<string, unknown>;

  const periodoId = typeof data.periodoId === 'string' && data.periodoId.trim() ? data.periodoId.trim() : undefined;
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const description = typeof data.description === 'string' ? data.description.trim() : undefined;
  const targetAmount = typeof data.targetAmount === 'number' ? data.targetAmount : parseFloat(data.targetAmount as string);
  const deadline = typeof data.deadline === 'string' && data.deadline.trim() ? data.deadline.trim() : undefined;
  const startDate = typeof data.startDate === 'string' && data.startDate.trim() ? data.startDate.trim() : undefined;

  if (!name) {
    errors.name = 'El nombre es obligatorio.';
  } else if (name.length > 100) {
    errors.name = 'El nombre no puede superar los 100 caracteres.';
  }

  if (isNaN(targetAmount) || targetAmount <= 0) {
    errors.targetAmount = 'El monto objetivo debe ser un número mayor a 0.';
  }

  if (description !== undefined && description.length > 500) {
    errors.description = 'La descripción no puede superar los 500 caracteres.';
  }

  if (deadline && isNaN(Date.parse(deadline))) {
    errors.deadline = 'La fecha límite no tiene un formato válido.';
  }

  if (startDate && isNaN(Date.parse(startDate))) {
    errors.startDate = 'La fecha de inicio no tiene un formato válido.';
  }

  if (Object.keys(errors).length > 0) {
    return validationFailure<CreateObjetivoRequest>(errors);
  }

  return validationSuccess<CreateObjetivoRequest>({
    periodoId,
    name,
    description,
    targetAmount,
    deadline,
    startDate,
  });
}