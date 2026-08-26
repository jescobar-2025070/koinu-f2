import { ValidationResult, validationFailure, validationSuccess } from '../validator-result';

interface CreateObjetivoRequest {
  name: string;
  targetAmount: number;
  deadline?: string;
}

export function validateCreateObjetivoRequest(body: unknown): ValidationResult<CreateObjetivoRequest> {
  const errors: Record<string, string> = {};
  const data = (body ?? {}) as Record<string, unknown>;

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const targetAmount = typeof data.targetAmount === 'number' ? data.targetAmount : parseFloat(data.targetAmount as string);
  const deadline = typeof data.deadline === 'string' ? data.deadline.trim() : undefined;

  if (!name) {
    errors.name = 'El nombre es obligatorio.';
  } else if (name.length > 100) {
    errors.name = 'El nombre no puede superar los 100 caracteres.';
  }

  if (isNaN(targetAmount) || targetAmount <= 0) {
    errors.targetAmount = 'El monto objetivo debe ser un número mayor a 0.';
  }

  if (deadline && isNaN(Date.parse(deadline))) {
    errors.deadline = 'La fecha límite no tiene un formato válido.';
  }

  if (Object.keys(errors).length > 0) {
    return validationFailure<CreateObjetivoRequest>(errors);
  }

  return validationSuccess<CreateObjetivoRequest>({
    name,
    targetAmount,
    deadline,
  });
}