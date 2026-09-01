import { Component, inject, OnInit } from '@angular/core';
import { SidebarService } from '../../../../core/services/sidebar.service';
import { MovimientoService } from '../../../../core/services/movimiento.service';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { Movimiento, Categoria } from '../../../../core/models/api.models';

@Component({
  selector: 'app-dashboard-income',
  templateUrl: './income.html',
  styleUrl: './income.css',
})
export class DashboardIncome implements OnInit {
  private readonly sidebarService = inject(SidebarService);
  private readonly movimientoService = inject(MovimientoService);
  private readonly categoriaService = inject(CategoriaService);

  movements: Movimiento[] = [];
  private categories: Categoria[] = [];

  ngOnInit(): void {
    this.sidebarService.setDashboard();
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      const [movimientos, categorias] = await Promise.all([
        this.movimientoService.list(),
        this.categoriaService.listIncome(),
      ]);
      this.categories = categorias;
      this.movements = movimientos.filter((m) => m.type === 'INCOME').slice(0, 5);
    } catch (e) {
      console.error('Error loading income:', e);
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
