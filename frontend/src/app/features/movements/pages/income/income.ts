import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarService } from '../../../../core/services/sidebar.service';
import { PeriodoService } from '../../../../core/services/periodo.service';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { MovimientoService } from '../../../../core/services/movimiento.service';
import { Periodo, Categoria } from '../../../../core/models/api.models';

@Component({
  selector: 'app-movements-income',
  imports: [FormsModule],
  templateUrl: './income.html',
  styleUrl: './income.css',
})
export class MovementsIncome implements OnInit {
  private readonly sidebarService = inject(SidebarService);
  private readonly periodoService = inject(PeriodoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly movimientoService = inject(MovimientoService);

  periodos: Periodo[] = [];
  categorias: Categoria[] = [];
  selectedPeriodoId = '';
  selectedCategoriaId = '';
  monto = 0;
  impuestoPct = 5;
  descripcion = '';
  fecha = new Date().toISOString().split('T')[0];
  saveMessage = '';
  saving = false;

  ngOnInit(): void {
    this.sidebarService.setMovements();
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      const [periodos, categorias] = await Promise.all([
        this.periodoService.list(),
        this.categoriaService.list(),
      ]);
      this.periodos = periodos.filter((p) => p.isOpen);
      this.categorias = categorias.filter((c) => c.type === 'ingreso');

      if (this.periodos.length > 0) {
        this.selectedPeriodoId = this.periodos[0].id;
      }
    } catch (e) {
      console.error('Error loading data:', e);
    }
  }

  get retencion(): number {
    return (this.monto * this.impuestoPct) / 100;
  }

  get montoNeto(): number {
    return this.monto - this.retencion;
  }

  formatCurrency(amount: number): string {
    return 'Q ' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  async saveIncome(): Promise<void> {
    if (!this.selectedPeriodoId || !this.selectedCategoriaId || this.monto <= 0) {
      this.saveMessage = '✗ Complete todos los campos obligatorios';
      setTimeout(() => (this.saveMessage = ''), 3000);
      return;
    }
    this.saving = true;
    this.saveMessage = '';
    try {
      await this.movimientoService.create({
        periodoId: this.selectedPeriodoId,
        categoriaId: this.selectedCategoriaId,
        type: 'ingreso',
        amount: this.monto,
        description: this.descripcion || undefined,
        date: this.fecha || undefined,
      });
      this.saveMessage = '✓ Ingreso guardado';
      this.monto = 0;
      this.descripcion = '';
    } catch (e: any) {
      this.saveMessage = '✗ ' + (e?.error?.error?.message ?? 'Error al guardar');
    } finally {
      this.saving = false;
      setTimeout(() => (this.saveMessage = ''), 3000);
    }
  }
}
