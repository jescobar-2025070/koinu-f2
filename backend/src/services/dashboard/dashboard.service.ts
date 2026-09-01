import { PeriodoService } from '../periods/periodo.service';
import { MovimientoService } from '../movements/movimiento.service';
import { ObjetivoService } from '../objectives/objetivo.service';

export interface DashboardData {
  periodoActivo: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
  } | null;
  totalIngresos: number;
  totalGastos: number;
  disponible: number;
  objetivos: {
    id: string;
    name: string;
    currentAmount: number;
    targetAmount: number;
    progress: number;
  }[];
}

export class DashboardService {
  private readonly periodoService: PeriodoService;
  private readonly movimientoService: MovimientoService;
  private readonly objetivoService: ObjetivoService;

  constructor() {
    this.periodoService = new PeriodoService();
    this.movimientoService = new MovimientoService();
    this.objetivoService = new ObjetivoService();
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
        disponible: 0,
        objetivos: [],
      };
    }

    const stats = await this.movimientoService.getStats(userId, periodoActivo.id);
    const objetivos = await this.objetivoService.findByUser(userId);

    return {
      periodoActivo: {
        id: periodoActivo.id,
        name: periodoActivo.name,
        startDate: periodoActivo.startDate,
        endDate: periodoActivo.endDate,
      },
      totalIngresos: stats.totalIngresos,
      totalGastos: stats.totalGastos,
      disponible: stats.totalIngresos - stats.totalGastos,
      objetivos: objetivos.map((o) => ({
        id: o.id,
        name: o.name,
        currentAmount: o.currentAmount,
        targetAmount: o.targetAmount,
        progress: o.targetAmount > 0 ? Math.round((o.currentAmount / o.targetAmount) * 100) : 0,
      })),
    };
  }
}
