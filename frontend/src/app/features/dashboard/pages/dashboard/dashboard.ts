import { Component, inject, OnInit } from '@angular/core';
import { SidebarService } from '../../../../core/services/sidebar.service';
import { PeriodoService } from '../../../../core/services/periodo.service';
import { MovimientoService } from '../../../../core/services/movimiento.service';
import { ObjetivoService } from '../../../../core/services/objetivo.service';
import { Periodo, Objetivo } from '../../../../core/models/api.models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly sidebarService = inject(SidebarService);
  private readonly periodoService = inject(PeriodoService);
  private readonly movimientoService = inject(MovimientoService);
  private readonly objetivoService = inject(ObjetivoService);

  budgetTotal = 0;
  budgetAvailable = 0;
  objectiveCurrent = 0;
  objectiveTarget = 0;
  objectiveProgress = 0;
  periodEnd = '—';
  loading = true;

  ngOnInit(): void {
    this.sidebarService.setDashboard();
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      const [periodos, objetivos] = await Promise.all([
        this.periodoService.list(),
        this.objetivoService.list(),
      ]);

      const openPeriod = periodos.find((p) => p.isOpen);
      const periodoId = openPeriod?.id;

      if (openPeriod) {
        const endDate = new Date(openPeriod.year, openPeriod.month, 0);
        this.periodEnd = this.formatDate(endDate);
      }

      const stats = await this.movimientoService.stats(periodoId);
      this.budgetTotal = stats.totalIngresos;
      this.budgetAvailable = stats.totalIngresos - stats.totalGastos;

      if (objetivos.length > 0) {
        const obj = objetivos[0];
        this.objectiveCurrent = obj.currentAmount;
        this.objectiveTarget = obj.targetAmount;
        this.objectiveProgress = obj.targetAmount > 0
          ? Math.round((obj.currentAmount / obj.targetAmount) * 100)
          : 0;
      }
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      this.loading = false;
    }
  }

  formatCurrency(amount: number): string {
    return 'Q ' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private formatDate(date: Date): string {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }
}
