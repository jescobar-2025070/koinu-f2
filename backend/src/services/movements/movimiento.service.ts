import { pool } from '../../config/db';
import { AppError } from '../../errors/app-error';
import { ErrorCodes } from '../../errors/error-codes';
import { Movimiento } from '../../entities/movimiento.entity';
import { MovimientoRepository } from '../../repositories/movimiento.repository';
import { PeriodoRepository } from '../../repositories/periodo.repository';
import { CategoriaRepository } from '../../repositories/categoria.repository';

export class MovimientoService {
  private readonly movimientoRepository: MovimientoRepository;
  private readonly periodoRepository: PeriodoRepository;
  private readonly categoriaRepository: CategoriaRepository;

  constructor() {
    this.movimientoRepository = new MovimientoRepository(pool);
    this.periodoRepository = new PeriodoRepository(pool);
    this.categoriaRepository = new CategoriaRepository(pool);
  }

  async findByUser(userId: string, periodoId?: string): Promise<Movimiento[]> {
    if (periodoId) {
      return this.movimientoRepository.findByPeriodo(periodoId);
    }
    return this.movimientoRepository.findByUser(userId);
  }

  async create(userId: string, data: {
    periodoId: string;
    categoriaId: string;
    type: 'ingreso' | 'gasto';
    amount: number;
    description?: string;
    date?: string;
  }): Promise<Movimiento> {
    const periodo = await this.periodoRepository.findById(data.periodoId);
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
        message: 'No se pueden agregar movimientos a un período cerrado.',
        statusCode: 400,
      });
    }

    const categoria = await this.categoriaRepository.findById(data.categoriaId);
    if (!categoria) {
      throw new AppError(ErrorCodes.NOT_FOUND, {
        message: 'Categoría no encontrada.',
        statusCode: 404,
      });
    }

    if (categoria.type !== data.type) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, {
        message: 'La categoría no coincide con el tipo de movimiento.',
        statusCode: 400,
      });
    }

    return this.movimientoRepository.create({
      userId,
      periodoId: data.periodoId,
      categoriaId: data.categoriaId,
      type: data.type,
      amount: data.amount,
      description: data.description,
      date: data.date ? new Date(data.date) : undefined,
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    const movimiento = await this.movimientoRepository.findById(id);
    if (!movimiento) {
      throw new AppError(ErrorCodes.NOT_FOUND, {
        message: 'Movimiento no encontrado.',
        statusCode: 404,
      });
    }

    if (movimiento.userId !== userId) {
      throw new AppError(ErrorCodes.FORBIDDEN, {
        message: 'No tienes acceso a este movimiento.',
        statusCode: 403,
      });
    }

    const periodo = await this.periodoRepository.findById(movimiento.periodoId);
    if (!periodo || !periodo.isOpen) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, {
        message: 'No se pueden eliminar movimientos de un período cerrado.',
        statusCode: 400,
      });
    }

    const deleted = await this.movimientoRepository.delete(id);
    if (!deleted) {
      throw new AppError(ErrorCodes.INTERNAL_ERROR, {
        message: 'Error al eliminar el movimiento.',
        statusCode: 500,
      });
    }
  }

  async getStats(userId: string, periodoId?: string): Promise<{ totalIngresos: number; totalGastos: number }> {
    return this.movimientoRepository.getStats(userId, periodoId);
  }
}