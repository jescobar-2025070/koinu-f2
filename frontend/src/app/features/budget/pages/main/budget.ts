import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarService } from '../../../../core/services/sidebar.service';
import { BudgetService } from '../../../../core/services/budget.service';
import { PeriodoService } from '../../../../core/services/periodo.service';
import { CategoriaService } from '../../../../core/services/categoria.service';
import {
  AsignacionPresupuesto,
  BudgetData,
  Categoria,
  Periodo,
} from '../../../../core/models/api.models';

@Component({
  selector: 'app-budget-main',
  imports: [FormsModule],
  templateUrl: './budget.html',
  styleUrl: './budget.css',
})
export class BudgetMain implements OnInit {
  private readonly sidebarService = inject(SidebarService);
  private readonly budgetService = inject(BudgetService);
  private readonly periodoService = inject(PeriodoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly cdr = inject(ChangeDetectorRef);

  periodos: Periodo[] = [];
  selectedPeriodId = '';
  budget: BudgetData | null = null;
  totalInput = 0;
  savingTotal = false;
  msg = '';

  categoriasGasto: Categoria[] = [];
  allocationCategoryId = '';
  allocationAmount = 0;
  savingAllocation = false;
  allocationMsg = '';

  overruns: { id: string; amount: number; createdAt: string }[] = [];
  overrunsTotal = 0;

  ngOnInit(): void {
    this.sidebarService.setDashboard();
    this.loadPeriods();
  }

  private async loadPeriods(): Promise<void> {
    try {
      this.periodos = await this.periodoService.list();
      const active = this.periodos.find((p) => p.status === 'ACTIVE');
      this.selectedPeriodId = active?.id ?? this.periodos[0]?.id ?? '';
      this.categoriasGasto = await this.categoriaService.listExpense();
      await this.loadBudget();
    } catch (e) {
      console.error('Error loading periods:', e);
    }
  }

  selectPeriod(): void {
    this.budget = null;
    this.overruns = [];
    this.msg = '';
    this.allocationMsg = '';
    void this.loadBudget();
  }

  private async loadBudget(): Promise<void> {
    if (!this.selectedPeriodId) {
      return;
    }
    try {
      const [budget, overruns] = await Promise.all([
        this.budgetService.getBudget(this.selectedPeriodId),
        this.budgetService.getOverruns(this.selectedPeriodId),
      ]);
      this.budget = budget;
      this.totalInput = budget.presupuesto ? Number(budget.presupuesto.totalAmount) : 0;
      this.overrunsTotal = overruns.excedenteTotal;
      this.overruns = overruns.excedentes.map((e) => ({
        id: e.id,
        amount: e.amount,
        createdAt: e.createdAt,
      }));
      this.cdr.markForCheck();
    } catch (e) {
      console.error('Error loading budget:', e);
    }
  }

  isActivePeriod(): boolean {
    const p = this.periodos.find((x) => x.id === this.selectedPeriodId);
    return p?.status === 'ACTIVE' || p?.status === 'DRAFT';
  }

  async saveTotal(): Promise<void> {
    if (this.totalInput < 0 || !this.selectedPeriodId) {
      return;
    }
    this.savingTotal = true;
    this.msg = '';
    try {
      if (this.budget?.presupuesto) {
        await this.budgetService.updateBudget(this.selectedPeriodId, this.totalInput);
      } else {
        await this.budgetService.createBudget(this.selectedPeriodId, this.totalInput);
      }
      this.msg = 'Presupuesto guardado correctamente.';
      await this.loadBudget();
    } catch (e: any) {
      this.msg = e?.error?.error?.message || 'No se pudo guardar el presupuesto.';
    } finally {
      this.savingTotal = false;
      this.cdr.markForCheck();
    }
  }

  getCategoryName(id: string): string {
    return this.categoriasGasto.find((c) => c.id === id)?.name ?? '—';
  }

  async addAllocation(): Promise<void> {
    if (!this.allocationCategoryId || this.allocationAmount <= 0 || !this.selectedPeriodId) {
      this.allocationMsg = 'Selecciona una categoría e indica un monto mayor a 0.';
      return;
    }
    this.savingAllocation = true;
    this.allocationMsg = '';
    try {
      await this.budgetService.createAllocation(this.selectedPeriodId, this.allocationCategoryId, this.allocationAmount);
      this.allocationAmount = 0;
      this.allocationMsg = 'Asignación registrada.';
      await this.loadBudget();
    } catch (e: any) {
      this.allocationMsg = e?.error?.error?.message || 'No se pudo registrar la asignación.';
    } finally {
      this.savingAllocation = false;
      this.cdr.markForCheck();
    }
  }

  async updateAllocation(a: AsignacionPresupuesto): Promise<void> {
    const next = window.prompt('Nuevo monto (Q):', String(a.amount));
    const parsed = parseFloat(next ?? '');
    if (isNaN(parsed) || parsed <= 0) {
      return;
    }
    try {
      await this.budgetService.updateAllocation(a.id, parsed);
      await this.loadBudget();
    } catch (e: any) {
      this.allocationMsg = e?.error?.error?.message || 'No se pudo actualizar la asignación.';
      this.cdr.markForCheck();
    }
  }

  async deleteAllocation(a: AsignacionPresupuesto): Promise<void> {
    try {
      await this.budgetService.deleteAllocation(a.id);
      await this.loadBudget();
    } catch (e: any) {
      this.allocationMsg = e?.error?.error?.message || 'No se pudo eliminar la asignación.';
      this.cdr.markForCheck();
    }
  }

  formatCurrency(amount: number): string {
    return 'Q ' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }
}