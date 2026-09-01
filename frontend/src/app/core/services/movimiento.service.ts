import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { DetalleIngreso, Movimiento, MovimientoStats } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class MovimientoService {
  private readonly api = inject(ApiService);

  async list(periodoId?: string): Promise<Movimiento[]> {
    const query = periodoId ? `?periodoId=${periodoId}` : '';
    const res = await firstValueFrom(this.api.get<{ movimientos: Movimiento[] }>(`/movements${query}`));
    return res.movimientos;
  }

  async create(data: {
    periodId: string;
    type: 'INCOME' | 'EXPENSE';
    incomeCategoryId?: string;
    expenseCategoryId?: string;
    grossAmount?: number;
    retentionAmount?: number;
    taxTreatmentId?: string;
    amount?: number;
    description?: string;
    date?: string;
  }): Promise<{ movimiento: Movimiento; detalle?: DetalleIngreso }> {
    return await firstValueFrom(this.api.post<{ movimiento: Movimiento; detalle?: DetalleIngreso }>('/movements', data));
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.api.delete(`/movements/${id}`));
  }

  async stats(periodoId?: string): Promise<MovimientoStats> {
    const query = periodoId ? `?periodoId=${periodoId}` : '';
    return await firstValueFrom(this.api.get<MovimientoStats>(`/movements/stats${query}`));
  }
}
