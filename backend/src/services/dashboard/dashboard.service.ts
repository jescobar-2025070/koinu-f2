import { PeriodoService } from '../periods/periodo.service';
import { MovimientoService } from '../movements/movimiento.service';
import { ObjetivoService } from '../objectives/objetivo.service';
import { BudgetService } from '../budgets/budget.service';
import { AsignacionPresupuesto } from '../../entities/asignacion-presupuesto.entity';

export interface DashboardObjetivo {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  progress: number;
  status: string;
  periodoId: string | null;
}

export interface DashboardData {
  periodoActivo: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
  } | null;
  totalIngresos: number;
  totalGastos: number;
  disponiblePorIngresos: number;
  presupuesto: {
    id: string;
    totalAmount: number;
    asignadoTotal: number;
    excedenteTotal: number;
    asignaciones: AsignacionPresupuesto[];
  } | null;
  disponiblePorPresupuesto: number | null;
  disponible: number;
  recomendaciones: string[];
  objetivos: DashboardObjetivo[];
}

export class DashboardService {
  private readonly periodoService: PeriodoService;
  private readonly movimientoService: MovimientoService;
  private readonly objetivoService: ObjetivoService;
  private readonly budgetService: BudgetService;

  constructor() {
    this.periodoService = new PeriodoService();
    this.movimientoService = new MovimientoService();
    this.objetivoService = new ObjetivoService();
    this.budgetService = new BudgetService();
  }

  async getDashboard(userId: string, periodId?: string): Promise<DashboardData> {
    const periodoActivo = periodId
      ? await this.periodoService.findById(periodId, userId)
      : await this.periodoService.findActive(userId);

    if (!periodoActivo) {
      return {
        periodoActivo: null,
        totalIngresos: 0,
        totalGastos: 0,
        disponiblePorIngresos: 0,
        presupuesto: null,
        disponiblePorPresupuesto: null,
        disponible: 0,
        recomendaciones: [],
        objetivos: [],
      };
    }

    const [stats, budget, objetivos] = await Promise.all([
      this.movimientoService.getStats(userId, periodoActivo.id),
      this.budgetService.getBudget(periodoActivo.id, userId),
      this.objetivoService.findByUser(userId),
    ]);

    const totalIngresos = stats.totalIngresos;
    const totalGastos = stats.totalGastos;
    const disponiblePorIngresos = totalIngresos - totalGastos;

    const presupuesto = budget.presupuesto
      ? {
          id: budget.presupuesto.id,
          totalAmount: Number(budget.presupuesto.totalAmount),
          asignadoTotal: budget.asignadoTotal,
          excedenteTotal: budget.excedenteTotal,
          asignaciones: budget.asignaciones,
        }
      : null;

    const disponiblePorPresupuesto =
      presupuesto !== null ? Number(presupuesto.totalAmount) - totalGastos : null;

    const disponible =
      disponiblePorPresupuesto !== null ? disponiblePorPresupuesto : disponiblePorIngresos;

    const objetivosFiltrados = objetivos.filter(
      (o) => o.periodoId === null || o.periodoId === periodoActivo.id,
    );

    return {
      periodoActivo: {
        id: periodoActivo.id,
        name: periodoActivo.name,
        startDate: periodoActivo.startDate,
        endDate: periodoActivo.endDate,
      },
      totalIngresos,
      totalGastos,
      disponiblePorIngresos,
      presupuesto,
      disponiblePorPresupuesto,
      disponible,
      recomendaciones: this.buildRecomendaciones({
        presupuesto,
        totalGastos,
        totalIngresos,
        disponiblePorIngresos,
      }),
      objetivos: objetivosFiltrados.map((o) => ({
        id: o.id,
        name: o.name,
        currentAmount: o.currentAmount,
        targetAmount: o.targetAmount,
        progress: o.targetAmount > 0 ? Math.round((o.currentAmount / o.targetAmount) * 100) : 0,
        status: o.status,
        periodoId: o.periodoId,
      })),
    };
  }

  private buildRecomendaciones(input: {
    presupuesto: DashboardData['presupuesto'];
    totalGastos: number;
    totalIngresos: number;
    disponiblePorIngresos: number;
  }): string[] {
    const recomendaciones: string[] = [];

    if (input.presupuesto) {
      if (input.totalGastos > Number(input.presupuesto.totalAmount)) {
        const excedente = input.totalGastos - Number(input.presupuesto.totalAmount);
        recomendaciones.push(
          `Llevas ${excedente.toFixed(2)} por encima de tu presupuesto: revisa tus gastos y ajusta las asignaciones.`,
        );
      } else if (Number(input.presupuesto.totalAmount) - input.totalGastos > 0) {
        recomendaciones.push(
          'Tienes margen dentro de tu presupuesto: puedes asignar el sobrante a un objetivo de ahorro.',
        );
      }
      if (input.presupuesto.asignadoTotal < Number(input.presupuesto.totalAmount)) {
        recomendaciones.push(
          `Tienes ${Number(input.presupuesto.totalAmount) - input.presupuesto.asignadoTotal} sin asignar en el presupuesto.`,
        );
      }
    } else if (input.disponiblePorIngresos > 0) {
      recomendaciones.push(
        'Aún no defines presupuesto para este período: crearlo te ayuda a controlar tus gastos mejor.',
      );
    }

    if (input.disponiblePorIngresos < 0) {
      recomendaciones.push(
        'Tus gastos superan tus ingresos: considera recortar gastos o aplazar compras no esenciales.',
      );
    }

    return recomendaciones;
  }
}