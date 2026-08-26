import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarService } from '../../../../core/services/sidebar.service';
import { PeriodoService } from '../../../../core/services/periodo.service';
import { Periodo } from '../../../../core/models/api.models';

@Component({
  selector: 'app-periods-edit',
  imports: [FormsModule],
  templateUrl: './edit.html',
  styleUrl: './edit.css',
})
export class PeriodsEdit implements OnInit {
  private readonly sidebarService = inject(SidebarService);
  private readonly periodoService = inject(PeriodoService);

  currentPeriod: Periodo | null = null;
  year = new Date().getFullYear();
  month = new Date().getMonth() + 1;
  saveMessage = '';
  saving = false;

  ngOnInit(): void {
    this.sidebarService.setPeriods();
    this.loadPeriod();
  }

  private async loadPeriod(): Promise<void> {
    try {
      const periodos = await this.periodoService.list();
      this.currentPeriod = periodos.find((p) => p.isOpen) ?? null;
      if (this.currentPeriod) {
        this.year = this.currentPeriod.year;
        this.month = this.currentPeriod.month;
      }
    } catch (e) {
      console.error('Error loading period:', e);
    }
  }

  async saveChanges(): Promise<void> {
    if (!this.currentPeriod) return;
    this.saving = true;
    this.saveMessage = '';
    try {
      await this.periodoService.update(this.currentPeriod.id, { year: this.year, month: this.month });
      this.saveMessage = '✓ Cambios guardados';
    } catch (e: any) {
      this.saveMessage = '✗ ' + (e?.error?.error?.message ?? 'Error al guardar');
    } finally {
      this.saving = false;
      setTimeout(() => (this.saveMessage = ''), 3000);
    }
  }
}
