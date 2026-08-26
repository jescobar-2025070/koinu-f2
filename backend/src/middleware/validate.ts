import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import { ErrorCodes } from '../errors/error-codes';

type Validator<T> = (body: unknown) => { valid: boolean; value: T; errors: Record<string, string> };

export function validate<T>(validator: Validator<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = validator(req.body);
    if (!result.valid) {
      next(
        new AppError(ErrorCodes.VALIDATION_ERROR, {
          message: 'Los datos proporcionados no son válidos.',
          statusCode: 422,
          details: { errors: result.errors },
        }),
      );
      return;
    }
    req.body = result.value;
    next();
  };
}
