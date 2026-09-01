import { pool } from '../../config/db';
import { AppError } from '../../errors/app-error';
import { ErrorCodes } from '../../errors/error-codes';
import { CategoriaIngresoRepository } from '../../repositories/categoria-ingreso.repository';
import { CategoriaGastoRepository } from '../../repositories/categoria-gasto.repository';
import { CategoriaIngreso } from '../../entities/categoria-ingreso.entity';
import { CategoriaGasto } from '../../entities/categoria-gasto.entity';

export class CategoriaService {
  private readonly ingresoRepository: CategoriaIngresoRepository;
  private readonly gastoRepository: CategoriaGastoRepository;

  constructor() {
    this.ingresoRepository = new CategoriaIngresoRepository(pool);
    this.gastoRepository = new CategoriaGastoRepository(pool);
  }

  async listIngreso(userId: string): Promise<CategoriaIngreso[]> {
    return this.ingresoRepository.findByUser(userId);
  }

  async listGasto(userId: string): Promise<CategoriaGasto[]> {
    return this.gastoRepository.findByUser(userId);
  }

  async createIngreso(userId: string, data: { name: string }): Promise<CategoriaIngreso> {
    const name = data.name.trim();
    if (!name) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, {
        message: 'El nombre de la categoría es obligatorio.',
        statusCode: 400,
      });
    }
    return this.ingresoRepository.create({ userId, name });
  }

  async createGasto(userId: string, data: { name: string }): Promise<CategoriaGasto> {
    const name = data.name.trim();
    if (!name) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, {
        message: 'El nombre de la categoría es obligatorio.',
        statusCode: 400,
      });
    }
    return this.gastoRepository.create({ userId, name });
  }

  async createDefaultsForUser(userId: string): Promise<void> {
    await this.ingresoRepository.createDefaultsForUser(userId);
    await this.gastoRepository.createDefaultsForUser(userId);
  }
}
