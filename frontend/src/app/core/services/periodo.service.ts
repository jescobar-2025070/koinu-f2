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

  async getById(id: string): Promise<Periodo> {
    const res = await firstValueFrom(this.api.get<{ periodo: Periodo }>(`/periods/${id}`));
    return res.periodo;
  }

  async create(data: { name: string; startDate: string; endDate: string }): Promise<Periodo> {
    const res = await firstValueFrom(this.api.post<{ periodo: Periodo }>('/periods', data));
    return res.periodo;
  }

  async update(id: string, data: { name?: string; startDate?: string; endDate?: string }): Promise<Periodo> {
    const res = await firstValueFrom(this.api.put<{ periodo: Periodo }>(`/periods/${id}`, data));
    return res.periodo;
  }

  async activate(id: string): Promise<Periodo> {
    const res = await firstValueFrom(this.api.post<{ periodo: Periodo }>(`/periods/${id}/activate`));
    return res.periodo;
  }

  async finalize(id: string): Promise<Periodo> {
    const res = await firstValueFrom(this.api.post<{ periodo: Periodo }>(`/periods/${id}/finalize`));
    return res.periodo;
  }

  async cancel(id: string): Promise<Periodo> {
    const res = await firstValueFrom(this.api.post<{ periodo: Periodo }>(`/periods/${id}/cancel`));
    return res.periodo;
  }
}
