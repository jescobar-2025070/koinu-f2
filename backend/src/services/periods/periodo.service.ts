import { pool } from '../../config/db';
import { AppError } from '../../errors/app-error';
import { ErrorCodes } from '../../errors/error-codes';
import { Periodo } from '../../entities/periodo.entity';
import { PeriodoRepository } from '../../repositories/periodo.repository';

export class PeriodoService {
  private readonly periodoRepository: PeriodoRepository;

  constructor() {
    this.periodoRepository = new PeriodoRepository(pool);
  }

  async findByUser(userId: string): Promise<Periodo[]> {
    return this.periodoRepository.findByUser(userId);
  }

  async create(userId: string, data: { year: number; month: number }): Promise<Periodo> {
    const existing = await this.periodoRepository.findByUserAndPeriod(userId, data.year, data.month);
    if (existing) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, {
        message: 'Ya existe un período para este mes y año.',
        statusCode: 409,
      });
    }

    return this.periodoRepository.create({
      userId,
      year: data.year,
      month: data.month,
    });
  }

  async update(id: string, userId: string, data: { year?: number; month?: number }): Promise<Periodo> {
    const periodo = await this.periodoRepository.findById(id);
    if (!periodo) {
      throw new AppError(ErrorCodes.NOT_FOUND, {
        message: 'Período no encontrado.',
        statusCode: 404,
      });
    }

    if (periodo.userId !== userId) {
      throw new AppError(ErrorCodes.FORBIDDEN, {
        message: 'No tienes acceso a este período.',
        statusCode: 403,
      });
    }

    if (!periodo.isOpen) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, {
        message: 'No se puede modificar un período cerrado.',
        statusCode: 400,
      });
    }

    const updated = await this.periodoRepository.update(id, data);
    if (!updated) {
      throw new AppError(ErrorCodes.INTERNAL_ERROR, {
        message: 'Error al actualizar el período.',
        statusCode: 500,
      });
    }

    return updated;
  }

  async finalize(id: string, userId: string): Promise<Periodo> {
    const periodo = await this.periodoRepository.findById(id);
    if (!periodo) {
      throw new AppError(ErrorCodes.NOT_FOUND, {
        message: 'Período no encontrado.',
        statusCode: 404,
      });
    }

    if (periodo.userId !== userId) {
      throw new AppError(ErrorCodes.FORBIDDEN, {
        message: 'No tienes acceso a este período.',
        statusCode: 403,
      });
    }

    if (!periodo.isOpen) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, {
        message: 'El período ya está cerrado.',
        statusCode: 400,
      });
    }

    const closed = await this.periodoRepository.close(id);
    if (!closed) {
      throw new AppError(ErrorCodes.INTERNAL_ERROR, {
        message: 'Error al cerrar el período.',
        statusCode: 500,
      });
    }

    return closed;
  }
}