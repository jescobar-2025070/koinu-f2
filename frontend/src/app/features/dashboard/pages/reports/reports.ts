import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { SidebarService } from '../../../../core/services/sidebar.service';
import { MovimientoService } from '../../../../core/services/movimiento.service';
import { PeriodoService } from '../../../../core/services/periodo.service';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { Movimiento, Categoria, MovimientoStats } from '../../../../core/models/api.models';

@Component({
  selector: 'app-dashboard-reports',
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class DashboardReports implements OnInit {
  private readonly sidebarService = inject(SidebarService);
  private readonly movimientoService = inject(MovimientoService);
  private readonly periodoService = inject(PeriodoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly cdr = inject(ChangeDetectorRef);

  activePeriodName = '—';
  stats: MovimientoStats = { totalIngresos: 0, totalGastos: 0 };
  available = 0;
  movements: Movimiento[] = [];
  private categories: Categoria[] = [];
  private activePeriodId: string | undefined;

  ngOnInit(): void {
    this.sidebarService.setDashboard();
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      const periodos = await this.periodoService.list();
      const activePeriod = periodos.find((p) => p.status === 'ACTIVE');
      this.activePeriodId = activePeriod?.id;
      this.activePeriodName = activePeriod?.name ?? '—';

      const [stats, movimientos, ingresos, gastos] = await Promise.all([
        this.movimientoService.stats(this.activePeriodId),
        this.movimientoService.list(this.activePeriodId),
        this.categoriaService.listIncome(),
        this.categoriaService.listExpense(),
      ]);
      this.stats = stats;
      this.available = stats.totalIngresos - stats.totalGastos;
      this.categories = [...ingresos, ...gastos];
      this.movements = movimientos;
      this.cdr.markForCheck();
    } catch (e) {
      console.error('Error loading reports:', e);
    }
  }

  getCategoryName(id: string | null): string {
    return this.categories.find((c) => c.id === id)?.name ?? '—';
  }

  formatCurrency(amount: number): string {
    return 'Q ' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }

  exportCsv(): void {
    const headers = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto'];
    const rows = this.movements.map((m) => [
      this.formatDate(m.date),
      m.type === 'INCOME' ? 'Ingreso' : 'Gasto',
      this.getCategoryName(m.type === 'INCOME' ? m.incomeCategoryId : m.expenseCategoryId),
      m.description ?? '',
      m.amount.toFixed(2),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const period = this.activePeriodName !== '—' ? this.activePeriodName.replace(/\s+/g, '_') : 'general';
    a.href = url;
    a.download = `informe_${period}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}