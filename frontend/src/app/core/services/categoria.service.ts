import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { Categoria } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly api = inject(ApiService);

  async listIncome(): Promise<Categoria[]> {
    const res = await firstValueFrom(this.api.get<{ categorias: Categoria[] }>('/categories/income'));
    return res.categorias;
  }

  async listExpense(): Promise<Categoria[]> {
    const res = await firstValueFrom(this.api.get<{ categorias: Categoria[] }>('/categories/expense'));
    return res.categorias;
  }

  async createIncome(name: string): Promise<Categoria> {
    const res = await firstValueFrom(this.api.post<{ categoria: Categoria }>('/categories/income', { name }));
    return res.categoria;
  }

  async createExpense(name: string): Promise<Categoria> {
    const res = await firstValueFrom(this.api.post<{ categoria: Categoria }>('/categories/expense', { name }));
    return res.categoria;
  }

  async updateIncome(id: string, name: string): Promise<Categoria> {
    const res = await firstValueFrom(this.api.patch<{ categoria: Categoria }>(`/categories/income/${id}`, { name }));
    return res.categoria;
  }

  async updateExpense(id: string, name: string): Promise<Categoria> {
    const res = await firstValueFrom(this.api.patch<{ categoria: Categoria }>(`/categories/expense/${id}`, { name }));
    return res.categoria;
  }

  async deleteIncome(id: string): Promise<void> {
    await firstValueFrom(this.api.delete(`/categories/income/${id}`));
  }

  async deleteExpense(id: string): Promise<void> {
    await firstValueFrom(this.api.delete(`/categories/expense/${id}`));
  }
}