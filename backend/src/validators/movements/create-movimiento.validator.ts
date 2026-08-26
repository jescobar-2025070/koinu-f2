import { ValidationResult, validationFailure, validationSuccess } from '../validator-result';

interface CreateMovimientoRequest {
  periodoId: string;
  categoriaId: string;
  type: 'ingreso' | 'gasto';
  amount: number;
  description?: string;
  date?: string;
}

export function validateCreateMovimientoRequest(body: unknown): ValidationResult<CreateMovimientoRequest> {
  const errors: Record<string, string> = {};
  const data = (body ?? {}) as Record<string, unknown>;

  const periodoId = typeof data.periodoId === 'string' ? data.periodoId.trim() : '';
  const categoriaId = typeof data.categoriaId === 'string' ? data.categoriaId.trim() : '';
  const type = typeof data.type === 'string' ? data.type.trim() : '';
  const amount = typeof data.amount === 'number' ? data.amount : parseFloat(data.amount as string);
  const description = typeof data.description === 'string' ? data.description.trim() : undefined;
  const date = typeof data.date === 'string' ? data.date.trim() : undefined;

  if (!periodoId) {
    errors.periodoId = 'El período es obligatorio.';
  }

  if (!categoriaId) {
    errors.categoriaId = 'La categoría es obligatoria.';
  }

  if (!type || !['ingreso', 'gasto'].includes(type)) {
    errors.type = 'El tipo debe ser "ingreso" o "gasto".';
  }

  if (isNaN(amount) || amount <= 0) {
    errors.amount = 'El monto debe ser un número mayor a 0.';
  }

  if (description && description.length > 500) {
    errors.description = 'La descripción no puede superar los 500 caracteres.';
  }

  if (date && isNaN(Date.parse(date))) {
    errors.date = 'La fecha no tiene un formato válido.';
  }

  if (Object.keys(errors).length > 0) {
    return validationFailure<CreateMovimientoRequest>(errors);
  }

  return validationSuccess<CreateMovimientoRequest>({
    periodoId,
    categoriaId,
    type: type as 'ingreso' | 'gasto',
    amount,
    description,
    date,
  });
}