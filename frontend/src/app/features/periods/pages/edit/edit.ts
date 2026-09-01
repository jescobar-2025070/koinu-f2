import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
  private readonly cdr = inject(ChangeDetectorRef);

  currentPeriod: Periodo | null = null;
  name = '';
  startDate = '';
  endDate = '';
  saveMessage = '';
  saving = false;

  ngOnInit(): void {
    this.sidebarService.setPeriods();
    this.loadPeriod();
  }

  private async loadPeriod(): Promise<void> {
    try {
      const periodos = await this.periodoService.list();
      this.currentPeriod = periodos.find((p) => p.status === 'ACTIVE') ?? null;
      if (this.currentPeriod) {
        this.name = this.currentPeriod.name;
        this.startDate = this.currentPeriod.startDate.slice(0, 10);
        this.endDate = this.currentPeriod.endDate.slice(0, 10);
      }
      this.cdr.markForCheck();
    } catch (e) {
      console.error('Error loading period:', e);
    }
  }

  async saveChanges(): Promise<void> {
    if (!this.currentPeriod) return;
    this.saving = true;
    this.saveMessage = '';
    try {
      await this.periodoService.update(this.currentPeriod.id, {
        name: this.name,
        startDate: this.startDate,
        endDate: this.endDate,
      });
      this.saveMessage = '✓ Cambios guardados';
    } catch (e: any) {
      this.saveMessage = '✗ ' + (e?.error?.error?.message ?? 'Error al guardar');
    } finally {
      this.saving = false;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.saveMessage = '';
        this.cdr.markForCheck();
      }, 3000);
    }
  }
}
