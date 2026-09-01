import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { SidebarService } from '../../../../core/services/sidebar.service';
import { PeriodoService } from '../../../../core/services/periodo.service';
import { MovimientoService } from '../../../../core/services/movimiento.service';
import { Periodo } from '../../../../core/models/api.models';

interface PeriodoHistorial {
  id: string;
  name: string;
  range: string;
  status: string;
  statusLabel: string;
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
  private readonly cdr = inject(ChangeDetectorRef);

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
          name: p.name,
          range: `${this.formatDate(new Date(p.startDate))} — ${this.formatDate(new Date(p.endDate))}`,
          status: p.status,
          statusLabel: this.statusLabel(p.status),
          totalIngresos,
          totalGastos,
        });
      }

      this.periods = results;
      this.cdr.markForCheck();
    } catch (e) {
      console.error('Error loading period history:', e);
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

  private statusLabel(status: string): string {
    switch (status) {
      case 'DRAFT': return 'Borrador';
      case 'ACTIVE': return 'Activo';
      case 'FINISHED': return 'Finalizado';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  }
}
