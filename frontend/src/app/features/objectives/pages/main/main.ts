import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarService } from '../../../../core/services/sidebar.service';
import { ObjetivoService } from '../../../../core/services/objetivo.service';
import { Objetivo } from '../../../../core/models/api.models';

@Component({
  selector: 'app-objectives-main',
  imports: [FormsModule],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class ObjectivesMain implements OnInit {
  private readonly sidebarService = inject(SidebarService);
  private readonly objetivoService = inject(ObjetivoService);
  private readonly cdr = inject(ChangeDetectorRef);

  objetivos: Objetivo[] = [];
  showForm = false;
  formName = '';
  formTarget = 0;
  formDeadline = '';
  saving = false;
  saveMessage = '';
  transaccion: { id: string; amount: number; tipo: 'DEPOSIT' | 'WITHDRAW' } | null = null;
  transactionMsg = '';

  ngOnInit(): void {
    this.sidebarService.setObjectives();
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      this.objetivos = await this.objetivoService.list();
      this.cdr.markForCheck();
    } catch (e) {
      console.error('Error loading objectives:', e);
    }
  }

  progressPercent(o: Objetivo): number {
    if (o.targetAmount <= 0) {
      return 0;
    }
    return Math.min(100, (o.currentAmount / o.targetAmount) * 100);
  }

  formatCurrency(amount: number): string {
    return 'Q ' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) {
      return '—';
    }
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }

  openForm(): void {
    this.showForm = true;
    this.formName = '';
    this.formTarget = 0;
    this.formDeadline = '';
    this.saveMessage = '';
    this.cdr.markForCheck();
  }

  async createObjetivo(): Promise<void> {
    if (!this.formName.trim() || this.formTarget <= 0) {
      this.saveMessage = 'El nombre y el monto objetivo son obligatorios.';
      this.cdr.markForCheck();
      return;
    }
    this.saving = true;
    try {
      await this.objetivoService.create({
        name: this.formName.trim(),
        targetAmount: this.formTarget,
        deadline: this.formDeadline || undefined,
      });
      this.saveMessage = 'Objetivo creado correctamente.';
      this.showForm = false;
      await this.loadData();
    } catch (e) {
      console.error('Error creating objective:', e);
      this.saveMessage = 'No se pudo crear el objetivo.';
    } finally {
      this.saving = false;
      this.cdr.markForCheck();
    }
  }

  openTransaction(o: Objetivo, tipo: 'DEPOSIT' | 'WITHDRAW'): void {
    this.transaccion = { id: o.id, amount: 0, tipo };
    this.transactionMsg = '';
    this.cdr.markForCheck();
  }

  async confirmarTransaccion(): Promise<void> {
    if (!this.transaccion || this.transaccion.amount <= 0) {
      return;
    }
    try {
      const { id, amount, tipo } = this.transaccion;
      if (tipo === 'DEPOSIT') {
        await this.objetivoService.deposit(id, amount);
      } else {
        await this.objetivoService.withdraw(id, amount);
      }
      this.transactionMsg = 'Transacción realizada correctamente.';
      this.transaccion = null;
      await this.loadData();
    } catch (e) {
      console.error('Error in transaction:', e);
      this.transactionMsg = 'No se pudo realizar la transacción.';
    } finally {
      this.cdr.markForCheck();
    }
  }

  async deleteObjetivo(id: string): Promise<void> {
    try {
      await this.objetivoService.delete(id);
      await this.loadData();
    } catch (e) {
      console.error('Error deleting objective:', e);
    }
  }
}