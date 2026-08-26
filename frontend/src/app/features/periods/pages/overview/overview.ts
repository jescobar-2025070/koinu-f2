import { Component, inject, OnInit } from '@angular/core';
import { SidebarService } from '../../../../core/services/sidebar.service';
import { PeriodoService } from '../../../../core/services/periodo.service';
import { MovimientoService } from '../../../../core/services/movimiento.service';
import { Periodo } from '../../../../core/models/api.models';

@Component({
  selector: 'app-periods-overview',
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class PeriodsOverview implements OnInit {
  private readonly sidebarService = inject(SidebarService);
  private readonly periodoService = inject(PeriodoService);
  private readonly movimientoService = inject(MovimientoService);

  periodStart = '—';
  periodEnd = '—';
  currentDate = '—';
  daysRemaining = 0;
  gastosActual = 0;
  ingresosActual = 0;
  maxChartValue = 25000;

  ngOnInit(): void {
    this.sidebarService.setPeriods();
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      const periodos = await this.periodoService.list();
      const openPeriod = periodos.find((p) => p.isOpen);

      if (openPeriod) {
        const start = new Date(openPeriod.year, openPeriod.month - 1, 1);
        const end = new Date(openPeriod.year, openPeriod.month, 0);
        const today = new Date();

        this.periodStart = this.formatDate(start);
        this.periodEnd = this.formatDate(end);
        this.currentDate = this.formatDate(today);

        const diffMs = end.getTime() - today.getTime();
        this.daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

        const stats = await this.movimientoService.stats(openPeriod.id);
        this.gastosActual = stats.totalGastos;
        this.ingresosActual = stats.totalIngresos;
        this.maxChartValue = Math.max(stats.totalIngresos, stats.totalGastos, 25000);
      }
    } catch (e) {
      console.error('Error loading periods overview:', e);
    }
  }

  get gastosHeight(): number {
    return this.maxChartValue > 0 ? (this.gastosActual / this.maxChartValue) * 100 : 0;
  }

  get ingresosHeight(): number {
    return this.maxChartValue > 0 ? (this.ingresosActual / this.maxChartValue) * 100 : 0;
  }

  private formatDate(date: Date): string {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }
}
