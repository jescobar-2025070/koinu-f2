import { Db, pool, PoolClient } from '../../config/db';
import { AppError } from '../../errors/app-error';
import { ErrorCodes } from '../../errors/error-codes';
import { Periodo } from '../../entities/periodo.entity';
import { MovimientoType } from '../../entities/movimiento.entity';
import { Objetivo } from '../../entities/objetivo.entity';
import { PeriodoRepository } from '../../repositories/periodo.repository';
import { MovimientoRepository } from '../../repositories/movimiento.repository';
import { PresupuestoRepository } from '../../repositories/presupuesto.repository';
import { AsignacionPresupuestoRepository } from '../../repositories/asignacion-presupuesto.repository';
import { ExcedentePresupuestoRepository } from '../../repositories/excedente-presupuesto.repository';
import { ObjetivoRepository } from '../../repositories/objetivo.repository';
import { SnapshotInformeRepository } from '../../repositories/snapshot-informe.repository';

export interface ReportCategoryRow {
  categoriaId: string | null;
  nombre: string;
  tipo: MovimientoType;
  total: number;
}

export interface ReportData {
  periodo: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    status: string;
  };
  totalIngresos: number;
  totalGastos: number;
  disponible: number;
  presupuesto: {
    total: number;
    asignado: number;
    disponible: number;
    excedente: number;
  } | null;
  porCategoria: ReportCategoryRow[];
  objetivos: {
    id: string;
    name: string;
    currentAmount: number;
    targetAmount: number;
    progress: number;
    status: string;
  }[];
  recomendaciones: string[];
  generadoEn: Date;
}

export class ReportService {
  constructor(private readonly db: Db = pool) {}

  async generatePreliminary(periodoId: string, userId: string): Promise<ReportData> {
    const periodoRepo = new PeriodoRepository(this.db);
    const periodo = await periodoRepo.findById(periodoId);
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
    return this.computeReportData(periodo, userId);
  }

  async getFinal(periodoId: string, userId: string): Promise<{ reportData: unknown; generadoEn: Date }> {
    const periodoRepo = new PeriodoRepository(this.db);
    const periodo = await periodoRepo.findById(periodoId);
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
    if (periodo.status !== 'FINISHED') {
      throw new AppError(ErrorCodes.PERIOD_NOT_FINALIZED, {
        message: 'El informe final solo está disponible cuando el período está finalizado.',
        statusCode: 409,
      });
    }

    const snapshotRepo = new SnapshotInformeRepository(this.db);
    const snapshot = await snapshotRepo.findByPeriodo(periodoId);
    if (!snapshot) {
      throw new AppError(ErrorCodes.NOT_FOUND, {
        message: 'Aún no existe un informe final para este período.',
        statusCode: 404,
      });
    }

    return { reportData: snapshot.reportData, generadoEn: snapshot.generatedAt };
  }

  async generateAndSaveSnapshot(client: PoolClient, periodoId: string, userId: string): Promise<void> {
    const periodoRepo = new PeriodoRepository(client);
    const periodo = await periodoRepo.findById(periodoId);
    if (!periodo) {
      throw new AppError(ErrorCodes.NOT_FOUND, {
        message: 'Período no encontrado.',
        statusCode: 404,
      });
    }
    const reportData = await this.computeReportData(periodo, userId, client);
    const snapshotRepo = new SnapshotInformeRepository(client);
    await snapshotRepo.create({ periodoId, reportData });
  }

  private async computeReportData(
    periodo: Periodo,
    userId: string,
    db: Db = this.db,
  ): Promise<ReportData> {
    const movimientoRepo = new MovimientoRepository(db);
    const presupuestoRepo = new PresupuestoRepository(db);
    const asignacionRepo = new AsignacionPresupuestoRepository(db);
    const excedenteRepo = new ExcedentePresupuestoRepository(db);
    const objetivoRepo = new ObjetivoRepository(db);

    const stats = await movimientoRepo.getStatsByPeriodo(periodo.id);
    const totalIngresos = Number(stats.totalIngresos);
    const totalGastos = Number(stats.totalGastos);
    const disponible = totalIngresos - totalGastos;

    const porCategoria: ReportCategoryRow[] = (
      await movimientoRepo.getCategoryBreakdown(periodo.id)
    ).map((row) => ({
      categoriaId: row.categoryId,
      nombre: row.nombre,
      tipo: row.type,
      total: row.total,
    }));

    const presupuesto = await presupuestoRepo.findByPeriodo(periodo.id);
    let presupuestoInfo: ReportData['presupuesto'] = null;
    let excedente = 0;
    if (presupuesto) {
      const asignaciones = await asignacionRepo.findByPresupuesto(presupuesto.id);
      const asignado = asignaciones.reduce((s, a) => s + Number(a.amount), 0);
      excedente = await excedenteRepo.findTotalByPresupuesto(presupuesto.id);
      presupuestoInfo = {
        total: totalIngresos,
        asignado,
        disponible: Math.max(0, totalIngresos - totalGastos),
        excedente: Number(excedente),
      };
    }

    const objetivos = await objetivoRepo.findForReport(userId, periodo.id);
    const objetivosInfo = objetivos.map((o: Objetivo) => ({
      id: o.id,
      name: o.name,
      currentAmount: o.currentAmount,
      targetAmount: o.targetAmount,
      progress: o.targetAmount > 0 ? Math.round((o.currentAmount / o.targetAmount) * 100) : 0,
      status: o.status,
    }));

    const recomendaciones = this.buildRecommendations({
      totalIngresos,
      totalGastos,
      disponible,
      presupuestoInfo,
      objetivos: objetivosInfo,
    });

    return {
      periodo: {
        id: periodo.id,
        name: periodo.name,
        startDate: periodo.startDate,
        endDate: periodo.endDate,
        status: periodo.status,
      },
      totalIngresos,
      totalGastos,
      disponible,
      presupuesto: presupuestoInfo,
      porCategoria,
      objetivos: objetivosInfo,
      recomendaciones,
      generadoEn: new Date(),
    };
  }

  private buildRecommendations(data: {
    totalIngresos: number;
    totalGastos: number;
    disponible: number;
    presupuestoInfo: ReportData['presupuesto'];
    objetivos: ReportData['objetivos'];
  }): string[] {
    const recomendaciones: string[] = [];

    if (data.totalIngresos <= 0) {
      recomendaciones.push('Aún no tienes ingresos registrados en este período. Considera registrar tus ingresos para obtener un análisis completo.');
    }

    const objetivoActivo = data.objetivos.some((o) => o.status === 'ACTIVE');
    if (data.disponible > 0 && objetivoActivo) {
      recomendaciones.push('Considera apartar una parte de tu ingreso disponible para tus objetivos.');
    } else if (data.disponible > 0 && !objetivoActivo) {
      recomendaciones.push('Tienes ingreso disponible. Define un objetivo financiero para canalizar tus ahorros.');
    } else if (data.disponible <= 0) {
      recomendaciones.push('Tu ingreso disponible es cero o negativo. Revisa tus gastos para equilibrar tu período.');
    }

    if (data.presupuestoInfo) {
      if (data.presupuestoInfo.excedente > 0) {
        recomendaciones.push(`Has superado tu presupuesto en Q ${data.presupuestoInfo.excedente.toFixed(2)}. Considera reducir gastos o ajustar tu presupuesto.`);
      } else {
        recomendaciones.push('Te mantienes dentro de tu presupuesto. Buen trabajo controlando tus gastos.');
      }
    } else {
      recomendaciones.push('Definir un presupuesto te ayudará a controlar mejor tus gastos del período.');
    }

    return recomendaciones;
  }
}