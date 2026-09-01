import { Component, inject, OnInit } from '@angular/core';
import { SidebarService } from '../../../../core/services/sidebar.service';
import { PeriodoService } from '../../../../core/services/periodo.service';
import { DashboardService } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly sidebarService = inject(SidebarService);
  private readonly periodoService = inject(PeriodoService);
  private readonly dashboardService = inject(DashboardService);

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
      const periodos = await this.periodoService.list();
      const activePeriod = periodos.find((p) => p.status === 'ACTIVE');

      if (activePeriod) {
        this.periodEnd = this.formatDate(new Date(activePeriod.endDate));

        const data = await this.dashboardService.get(activePeriod.id);
        this.budgetTotal = data.totalIngresos;
        this.budgetAvailable = data.disponible;

        if (data.objetivos.length > 0) {
          const obj = data.objetivos[0];
          this.objectiveCurrent = obj.currentAmount;
          this.objectiveTarget = obj.targetAmount;
          this.objectiveProgress = obj.progress;
        }
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
