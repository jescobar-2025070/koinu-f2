import { ValidationResult, validationFailure, validationSuccess } from '../validator-result';

export function validateAllocationRequest(
  body: unknown,
): ValidationResult<{ categoriaGastoId: string; amount: number }> {
  const errors: Record<string, string> = {};
  const data = (body ?? {}) as Record<string, unknown>;

  const categoriaGastoId = typeof data.categoriaGastoId === 'string' ? data.categoriaGastoId.trim() : '';
  const amount = typeof data.amount === 'number' ? data.amount : parseFloat(data.amount as string);

  if (!categoriaGastoId) {
    errors.categoriaGastoId = 'La categoría de gasto es obligatoria.';
  }

  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    errors.amount = 'La asignación debe ser un número mayor a 0.';
  }

  if (Object.keys(errors).length > 0) {
    return validationFailure<{ categoriaGastoId: string; amount: number }>(errors);
  }

  return validationSuccess<{ categoriaGastoId: string; amount: number }>({ categoriaGastoId, amount });
}

export function validateUpdateAllocationRequest(body: unknown): ValidationResult<{ amount: number }> {
  const errors: Record<string, string> = {};
  const data = (body ?? {}) as Record<string, unknown>;
  const amount = typeof data.amount === 'number' ? data.amount : parseFloat(data.amount as string);

  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    errors.amount = 'La asignación debe ser un número mayor a 0.';
  }

  if (Object.keys(errors).length > 0) {
    return validationFailure<{ amount: number }>(errors);
  }

  return validationSuccess<{ amount: number }>({ amount });
}