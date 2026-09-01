import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { Objetivo } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ObjetivoService {
  private readonly api = inject(ApiService);

  async list(): Promise<Objetivo[]> {
    const res = await firstValueFrom(this.api.get<{ objetivos: Objetivo[] }>('/objectives'));
    return res.objetivos;
  }

  async create(data: { name: string; targetAmount: number; deadline?: string }): Promise<Objetivo> {
    const res = await firstValueFrom(this.api.post<{ objetivo: Objetivo }>('/objectives', data));
    return res.objetivo;
  }

  async update(id: string, data: { name?: string; targetAmount?: number; deadline?: string }): Promise<Objetivo> {
    const res = await firstValueFrom(this.api.put<{ objetivo: Objetivo }>(`/objectives/${id}`, data));
    return res.objetivo;
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.api.delete(`/objectives/${id}`));
  }

  async deposit(id: string, amount: number): Promise<Objetivo> {
    const res = await firstValueFrom(this.api.post<{ objetivo: Objetivo }>(`/objectives/${id}/deposit`, { amount }));
    return res.objetivo;
  }

  async withdraw(id: string, amount: number): Promise<Objetivo> {
    const res = await firstValueFrom(this.api.post<{ objetivo: Objetivo }>(`/objectives/${id}/withdraw`, { amount }));
    return res.objetivo;
  }
}
