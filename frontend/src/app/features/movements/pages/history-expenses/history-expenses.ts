import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { SidebarService } from '../../../../core/services/sidebar.service';
import { MovimientoService } from '../../../../core/services/movimiento.service';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { Movimiento, Categoria } from '../../../../core/models/api.models';

@Component({
  selector: 'app-movements-history-expenses',
  templateUrl: './history-expenses.html',
  styleUrl: './history-expenses.css',
})
export class MovementsHistoryExpenses implements OnInit {
  private readonly sidebarService = inject(SidebarService);
  private readonly movimientoService = inject(MovimientoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly cdr = inject(ChangeDetectorRef);

  movements: Movimiento[] = [];
  private categories: Categoria[] = [];

  ngOnInit(): void {
    this.sidebarService.setMovements();
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      const [movimientos, categorias] = await Promise.all([
        this.movimientoService.list(),
        this.categoriaService.listExpense(),
      ]);
      this.categories = categorias;
      this.movements = movimientos.filter((m) => m.type === 'EXPENSE');
      this.cdr.markForCheck();
    } catch (e) {
      console.error('Error loading expenses history:', e);
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

  async deleteMovement(id: string): Promise<void> {
    try {
      await this.movimientoService.delete(id);
      this.movements = this.movements.filter((m) => m.id !== id);
      this.cdr.markForCheck();
    } catch (e) {
      console.error('Error deleting movement:', e);
    }
  }
}
