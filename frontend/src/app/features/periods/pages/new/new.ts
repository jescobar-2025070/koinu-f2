import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarService } from '../../../../core/services/sidebar.service';
import { PeriodoService } from '../../../../core/services/periodo.service';
import { endOfCurrentMonthISO, todayLocalISO } from '../../../../core/utils/date.util';

@Component({
  selector: 'app-periods-new',
  imports: [FormsModule],
  templateUrl: './new.html',
  styleUrl: './new.css',
})
export class PeriodsNew implements OnInit {
  private readonly sidebarService = inject(SidebarService);
  private readonly periodoService = inject(PeriodoService);
  private readonly cdr = inject(ChangeDetectorRef);

  name = '';
  startDate = todayLocalISO();
  endDate = endOfCurrentMonthISO();
  saveMessage = '';
  saving = false;

  ngOnInit(): void {
    this.sidebarService.setPeriods();
  }

  async createPeriod(): Promise<void> {
    if (!this.name) {
      this.saveMessage = '✗ El nombre del período es obligatorio';
      this.cdr.markForCheck();
      setTimeout(() => {
        this.saveMessage = '';
        this.cdr.markForCheck();
      }, 3000);
      return;
    }
    this.saving = true;
    this.saveMessage = '';
    try {
      await this.periodoService.create({ name: this.name, startDate: this.startDate, endDate: this.endDate });
      this.saveMessage = '✓ Período creado y activado. Ya se pueden registrar ingresos y gastos.';
      this.name = '';
      this.startDate = todayLocalISO();
      this.endDate = endOfCurrentMonthISO();
    } catch (e: any) {
      this.saveMessage = '✗ ' + (e?.error?.error?.message ?? 'Error al crear período');
    } finally {
      this.saving = false;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.saveMessage = '';
        this.cdr.markForCheck();
      }, 4000);
    }
  }
}
