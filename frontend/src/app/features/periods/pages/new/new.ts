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

  year = new Date().getFullYear();
  month = new Date().getMonth() + 1;
  saveMessage = '';
  saving = false;

  ngOnInit(): void {
    this.sidebarService.setPeriods();
  }

  async createPeriod(): Promise<void> {
    this.saving = true;
    this.saveMessage = '';
    try {
      await this.periodoService.create(this.year, this.month);
      this.saveMessage = '✓ Período creado';
      this.year = new Date().getFullYear();
      this.month = new Date().getMonth() + 1;
    } catch (e: any) {
      this.saveMessage = '✗ ' + (e?.error?.error?.message ?? 'Error al crear período');
    } finally {
      this.saving = false;
      setTimeout(() => (this.saveMessage = ''), 3000);
    }
  }
}
