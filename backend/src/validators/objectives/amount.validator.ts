import { ValidationResult, validationFailure, validationSuccess } from '../validator-result';

export interface AmountRequest {
  amount: number;
}

export function validateAmountRequest(body: unknown): ValidationResult<AmountRequest> {
  const errors: Record<string, string> = {};
  const data = (body ?? {}) as Record<string, unknown>;

  const amount = typeof data.amount === 'number' ? data.amount : parseFloat(data.amount as string);

  if (isNaN(amount) || amount <= 0) {
    errors.amount = 'El monto debe ser un número mayor a 0.';
  }

  if (Object.keys(errors).length > 0) {
    return validationFailure<AmountRequest>(errors);
  }

  return validationSuccess<AmountRequest>({ amount });
}