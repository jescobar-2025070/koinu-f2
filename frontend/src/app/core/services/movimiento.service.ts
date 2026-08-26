import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { Movimiento, MovimientoStats } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class MovimientoService {
  private readonly api = inject(ApiService);

  async list(periodoId?: string): Promise<Movimiento[]> {
    const query = periodoId ? `?periodoId=${periodoId}` : '';
    const res = await firstValueFrom(this.api.get<{ movimientos: Movimiento[] }>(`/movements${query}`));
    return res.movimientos;
  }

  async create(data: {
    periodoId: string;
    categoriaId: string;
    type: 'ingreso' | 'gasto';
    amount: number;
    description?: string;
    date?: string;
  }): Promise<Movimiento> {
    const res = await firstValueFrom(this.api.post<{ movimiento: Movimiento }>('/movements', data));
    return res.movimiento;
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.api.delete(`/movements/${id}`));
  }

  async stats(periodoId?: string): Promise<MovimientoStats> {
    const query = periodoId ? `?periodoId=${periodoId}` : '';
    return await firstValueFrom(this.api.get<MovimientoStats>(`/movements/stats${query}`));
  }
}
