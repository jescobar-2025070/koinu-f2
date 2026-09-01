import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { SidebarService } from '../../../../core/services/sidebar.service';
import { MovimientoService } from '../../../../core/services/movimiento.service';
import { PeriodoService } from '../../../../core/services/periodo.service';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { Movimiento, Categoria } from '../../../../core/models/api.models';

@Component({
  selector: 'app-dashboard-expenses',
  templateUrl: './expenses.html',
  styleUrl: './expenses.css',
})
export class DashboardExpenses implements OnInit {
  private readonly sidebarService = inject(SidebarService);
  private readonly movimientoService = inject(MovimientoService);
  private readonly periodoService = inject(PeriodoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly cdr = inject(ChangeDetectorRef);

  movements: Movimiento[] = [];
  private categories: Categoria[] = [];

  ngOnInit(): void {
    this.sidebarService.setDashboard();
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      const periodos = await this.periodoService.list();
      const activePeriod = periodos.find((p) => p.status === 'ACTIVE');
      const [movimientos, categorias] = await Promise.all([
        this.movimientoService.list(activePeriod?.id),
        this.categoriaService.listExpense(),
      ]);
      this.categories = categorias;
      this.movements = movimientos.filter((m) => m.type === 'EXPENSE').slice(0, 5);
      this.cdr.markForCheck();
    } catch (e) {
      console.error('Error loading expenses:', e);
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
}
