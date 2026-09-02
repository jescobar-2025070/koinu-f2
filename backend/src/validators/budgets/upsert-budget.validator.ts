import { ValidationResult, validationFailure, validationSuccess } from '../validator-result';

export function validateUpsertBudgetRequest(body: unknown): ValidationResult<{ totalAmount: number }> {
  const errors: Record<string, string> = {};
  const data = (body ?? {}) as Record<string, unknown>;
  const totalAmount = typeof data.totalAmount === 'number'
    ? data.totalAmount
    : parseFloat(data.totalAmount as string);

  if (typeof totalAmount !== 'number' || isNaN(totalAmount) || totalAmount < 0) {
    errors.totalAmount = 'El presupuesto total debe ser un número mayor o igual a 0.';
  }

  if (Object.keys(errors).length > 0) {
    return validationFailure<{ totalAmount: number }>(errors);
  }

  return validationSuccess<{ totalAmount: number }>({ totalAmount });
}