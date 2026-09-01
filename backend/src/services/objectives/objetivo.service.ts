import { pool } from '../../config/db';
import { AppError } from '../../errors/app-error';
import { ErrorCodes } from '../../errors/error-codes';
import { Objetivo } from '../../entities/objetivo.entity';
import { ObjetivoRepository } from '../../repositories/objetivo.repository';

export class ObjetivoService {
  private readonly objetivoRepository: ObjetivoRepository;

  constructor() {
    this.objetivoRepository = new ObjetivoRepository(pool);
  }

  async findByUser(userId: string): Promise<Objetivo[]> {
    return this.objetivoRepository.findByUser(userId);
  }

  async create(userId: string, data: {
    name: string;
    targetAmount: number;
    deadline?: string;
  }): Promise<Objetivo> {
    return this.objetivoRepository.create({
      userId,
      name: data.name,
      targetAmount: data.targetAmount,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
    });
  }

  async update(id: string, userId: string, data: {
    name?: string;
    targetAmount?: number;
    deadline?: string;
  }): Promise<Objetivo> {
    const objetivo = await this.objetivoRepository.findById(id);
    if (!objetivo) {
      throw new AppError(ErrorCodes.NOT_FOUND, {
        message: 'Objetivo no encontrado.',
        statusCode: 404,
      });
    }

    if (objetivo.userId !== userId) {
      throw new AppError(ErrorCodes.FORBIDDEN, {
        message: 'No tienes acceso a este objetivo.',
        statusCode: 403,
      });
    }

    const updated = await this.objetivoRepository.update(id, {
      name: data.name,
      targetAmount: data.targetAmount,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
    });

    if (!updated) {
      throw new AppError(ErrorCodes.INTERNAL_ERROR, {
        message: 'Error al actualizar el objetivo.',
        statusCode: 500,
      });
    }

    return updated;
  }

  async delete(id: string, userId: string): Promise<void> {
    const objetivo = await this.objetivoRepository.findById(id);
    if (!objetivo) {
      throw new AppError(ErrorCodes.NOT_FOUND, {
        message: 'Objetivo no encontrado.',
        statusCode: 404,
      });
    }

    if (objetivo.userId !== userId) {
      throw new AppError(ErrorCodes.FORBIDDEN, {
        message: 'No tienes acceso a este objetivo.',
        statusCode: 403,
      });
    }

    const deleted = await this.objetivoRepository.delete(id);
    if (!deleted) {
      throw new AppError(ErrorCodes.INTERNAL_ERROR, {
        message: 'Error al eliminar el objetivo.',
        statusCode: 500,
      });
    }
  }

  async deposit(id: string, userId: string, amount: number): Promise<Objetivo> {
    const objetivo = await this.objetivoRepository.findById(id);
    if (!objetivo) {
      throw new AppError(ErrorCodes.NOT_FOUND, {
        message: 'Objetivo no encontrado.',
        statusCode: 404,
      });
    }

    if (objetivo.userId !== userId) {
      throw new AppError(ErrorCodes.FORBIDDEN, {
        message: 'No tienes acceso a este objetivo.',
        statusCode: 403,
      });
    }

    if (amount <= 0) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, {
        message: 'El monto debe ser mayor a 0.',
        statusCode: 400,
      });
    }

    const updated = await this.objetivoRepository.deposit(id, amount);
    if (!updated) {
      throw new AppError(ErrorCodes.INTERNAL_ERROR, {
        message: 'Error al depositar en el objetivo.',
        statusCode: 500,
      });
    }

    return updated;
  }

  async withdraw(id: string, userId: string, amount: number): Promise<Objetivo> {
    const objetivo = await this.objetivoRepository.findById(id);
    if (!objetivo) {
      throw new AppError(ErrorCodes.NOT_FOUND, {
        message: 'Objetivo no encontrado.',
        statusCode: 404,
      });
    }

    if (objetivo.userId !== userId) {
      throw new AppError(ErrorCodes.FORBIDDEN, {
        message: 'No tienes acceso a este objetivo.',
        statusCode: 403,
      });
    }

    if (amount <= 0) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, {
        message: 'El monto debe ser mayor a 0.',
        statusCode: 400,
      });
    }

    if (amount > objetivo.currentAmount) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, {
        message: 'No tienes suficiente dinero en este objetivo.',
        statusCode: 400,
      });
    }

    const updated = await this.objetivoRepository.withdraw(id, amount);
    if (!updated) {
      throw new AppError(ErrorCodes.INTERNAL_ERROR, {
        message: 'Error al retirar del objetivo.',
        statusCode: 500,
      });
    }

    return updated;
  }
}