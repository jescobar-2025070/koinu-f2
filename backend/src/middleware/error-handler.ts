import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import { ErrorCodes } from '../errors/error-codes';

interface ErrorBody {
  error: {
    code: string;
    message: string;
    details: Record<string, unknown>;
  };
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: ErrorCodes.NOT_FOUND,
      message: 'El recurso solicitado no existe.',
      details: {},
    },
  } satisfies ErrorBody);
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    } satisfies ErrorBody);
    return;
  }

  const isBodyParseError =
    err instanceof SyntaxError &&
    'body' in err &&
    (req as Request & { body?: unknown }).body !== undefined;

  if (isBodyParseError) {
    res.status(400).json({
      error: {
        code: ErrorCodes.INVALID_REQUEST,
        message: 'El cuerpo de la solicitud contiene JSON no válido.',
        details: {},
      },
    } satisfies ErrorBody);
    return;
  }

  console.error('[ERROR]', err);
  res.status(500).json({
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: 'Ocurrió un error inesperado en el servidor.',
      details: {},
    },
  } satisfies ErrorBody);
}
