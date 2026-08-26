import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { Categoria } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly api = inject(ApiService);

  async list(): Promise<Categoria[]> {
    const res = await firstValueFrom(this.api.get<{ categorias: Categoria[] }>('/categories'));
    return res.categorias;
  }
}
