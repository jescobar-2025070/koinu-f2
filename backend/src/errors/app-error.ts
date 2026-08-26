import { ErrorCode } from './error-codes';

interface AppErrorOptions {
  message: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly details: Record<string, unknown>;

  constructor(code: ErrorCode, options: AppErrorOptions) {
    super(options.message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = options.statusCode ?? 500;
    this.details = options.details ?? {};
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
