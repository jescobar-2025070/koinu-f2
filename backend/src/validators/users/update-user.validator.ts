import { ValidationResult, validationFailure, validationSuccess } from '../validator-result';

export interface SetActiveRequest {
  isActive: boolean;
}

export interface SetRolesRequest {
  roles: string[];
}

export function validateSetActiveRequest(body: unknown): ValidationResult<SetActiveRequest> {
  const errors: Record<string, string> = {};
  const data = (body ?? {}) as Record<string, unknown>;

  const isActive = typeof data.isActive === 'boolean' ? data.isActive : undefined;

  if (isActive === undefined) {
    errors.isActive = 'El campo isActive debe ser un booleano.';
  }

  if (Object.keys(errors).length > 0) {
    return validationFailure<SetActiveRequest>(errors);
  }

  return validationSuccess<SetActiveRequest>({ isActive: isActive as boolean });
}

export function validateSetRolesRequest(body: unknown): ValidationResult<SetRolesRequest> {
  const errors: Record<string, string> = {};
  const data = (body ?? {}) as Record<string, unknown>;

  const roles = Array.isArray(data.roles) ? data.roles : [];

  if (roles.length === 0) {
    errors.roles = 'Debes indicar al menos un rol.';
  } else {
    for (const role of roles) {
      if (typeof role !== 'string' || !['ADMIN', 'USR'].includes(role)) {
        errors.roles = 'Los roles permitidos son: ADMIN, USR.';
        break;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return validationFailure<SetRolesRequest>(errors);
  }

  return validationSuccess<SetRolesRequest>({ roles: roles as string[] });
}