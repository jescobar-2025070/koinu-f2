import { Component, inject, OnInit } from '@angular/core';
import { SidebarService } from '../../../../core/services/sidebar.service';
import { PeriodoService } from '../../../../core/services/periodo.service';
import { MovimientoService } from '../../../../core/services/movimiento.service';
import { Periodo } from '../../../../core/models/api.models';

interface PeriodoHistorial {
  id: string;
  year: number;
  month: number;
  status: string;
  totalIngresos: number;
  totalGastos: number;
}

@Component({
  selector: 'app-periods-history',
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class PeriodsHistory implements OnInit {
  private readonly sidebarService = inject(SidebarService);
  private readonly periodoService = inject(PeriodoService);
  private readonly movimientoService = inject(MovimientoService);

  periods: PeriodoHistorial[] = [];

  ngOnInit(): void {
    this.sidebarService.setPeriods();
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      const periodos = await this.periodoService.list();
      const results: PeriodoHistorial[] = [];

      for (const p of periodos) {
        let totalIngresos = 0;
        let totalGastos = 0;
        try {
          const stats = await this.movimientoService.stats(p.id);
          totalIngresos = stats.totalIngresos;
          totalGastos = stats.totalGastos;
        } catch {}

        results.push({
          id: p.id,
          year: p.year,
          month: p.month,
          status: p.isOpen ? 'Abierto' : 'Finalizado',
          totalIngresos,
          totalGastos,
        });
      }

      this.periods = results;
    } catch (e) {
      console.error('Error loading period history:', e);
    }
  }

  formatCurrency(amount: number): string {
    return 'Q ' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getMonthName(month: number): string {
    const names = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return names[month] ?? '';
  }
}
