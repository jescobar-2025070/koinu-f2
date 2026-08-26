import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { Periodo } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class PeriodoService {
  private readonly api = inject(ApiService);

  async list(): Promise<Periodo[]> {
    const res = await firstValueFrom(this.api.get<{ periodos: Periodo[] }>('/periods'));
    return res.periodos;
  }

  async create(year: number, month: number): Promise<Periodo> {
    const res = await firstValueFrom(this.api.post<{ periodo: Periodo }>('/periods', { year, month }));
    return res.periodo;
  }

  async update(id: string, data: { year?: number; month?: number }): Promise<Periodo> {
    const res = await firstValueFrom(this.api.put<{ periodo: Periodo }>(`/periods/${id}`, data));
    return res.periodo;
  }

  async finalize(id: string): Promise<Periodo> {
    const res = await firstValueFrom(this.api.put<{ periodo: Periodo }>(`/periods/${id}/finalize`));
    return res.periodo;
  }
}
