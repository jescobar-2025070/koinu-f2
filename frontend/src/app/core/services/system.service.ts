import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { SystemHealth } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class SystemService {
  private readonly api = inject(ApiService);

  async health(): Promise<SystemHealth> {
    return await firstValueFrom(this.api.get<SystemHealth>('/system/health'));
  }
}