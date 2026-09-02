import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { AsignacionPresupuesto, BudgetData, OverrunsData } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly api = inject(ApiService);

  async getBudget(periodoId: string): Promise<BudgetData> {
    return await firstValueFrom(this.api.get<BudgetData>(`/periods/${periodoId}/budget`));
  }

  async createBudget(periodoId: string, totalAmount: number): Promise<void> {
    await firstValueFrom(this.api.post(`/periods/${periodoId}/budget`, { totalAmount }));
  }

  async updateBudget(periodoId: string, totalAmount: number): Promise<void> {
    await firstValueFrom(this.api.patch(`/periods/${periodoId}/budget`, { totalAmount }));
  }

  async createAllocation(periodoId: string, categoriaGastoId: string, amount: number): Promise<AsignacionPresupuesto> {
    return await firstValueFrom(
      this.api.post<AsignacionPresupuesto>(`/periods/${periodoId}/budget/allocations`, {
        categoriaGastoId,
        amount,
      }),
    );
  }

  async updateAllocation(id: string, amount: number): Promise<AsignacionPresupuesto> {
    return await firstValueFrom(
      this.api.patch<AsignacionPresupuesto>(`/periods/budget-allocations/${id}`, { amount }),
    );
  }

  async deleteAllocation(id: string): Promise<void> {
    await firstValueFrom(this.api.delete(`/periods/budget-allocations/${id}`));
  }

  async getOverruns(periodoId: string): Promise<OverrunsData> {
    return await firstValueFrom(
      this.api.get<OverrunsData>(`/periods/${periodoId}/budget/overruns`),
    );
  }
}