import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarService } from '../../../../core/services/sidebar.service';
import { PeriodoService } from '../../../../core/services/periodo.service';

@Component({
  selector: 'app-periods-new',
  imports: [FormsModule],
  templateUrl: './new.html',
  styleUrl: './new.css',
})
export class PeriodsNew implements OnInit {
  private readonly sidebarService = inject(SidebarService);
  private readonly periodoService = inject(PeriodoService);

  name = '';
  startDate = new Date().toISOString().split('T')[0];
  endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];
  saveMessage = '';
  saving = false;

  ngOnInit(): void {
    this.sidebarService.setPeriods();
  }

  async createPeriod(): Promise<void> {
    if (!this.name) {
      this.saveMessage = '✗ El nombre del período es obligatorio';
      setTimeout(() => (this.saveMessage = ''), 3000);
      return;
    }
    this.saving = true;
    this.saveMessage = '';
    try {
      await this.periodoService.create({ name: this.name, startDate: this.startDate, endDate: this.endDate });
      this.saveMessage = '✓ Período creado y activado. Ya puedes registrar ingresos y gastos.';
      this.name = '';
      this.startDate = new Date().toISOString().split('T')[0];
      this.endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];
    } catch (e: any) {
      this.saveMessage = '✗ ' + (e?.error?.error?.message ?? 'Error al crear período');
    } finally {
      this.saving = false;
      setTimeout(() => (this.saveMessage = ''), 4000);
    }
  }
}
