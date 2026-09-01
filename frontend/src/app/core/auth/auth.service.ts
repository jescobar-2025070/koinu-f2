import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../services/api.service';
import { AuthResponse, User } from './auth.models';

export type AuthStatus = 'checking' | 'authenticated' | 'guest';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly user = signal<User | null>(null);
  readonly status = signal<AuthStatus>('checking');
  readonly isAuthenticated = computed(() => this.status() === 'authenticated');

  private initPromise: Promise<void> | null = null;
  readonly sessionExpired = signal(false);

  private readonly HEARTBEAT_INTERVAL_MS = 15000;
  private heartbeat: ReturnType<typeof setInterval> | null = null;
  private redirectingToLogin = false;

  markSessionExpired(): void {
    if (this.redirectingToLogin) {
      return;
    }
    this.sessionExpired.set(true);
  }

  clearSessionExpired(): void {
    this.sessionExpired.set(false);
  }

  confirmExpiredRedirect(): void {
    this.redirectingToLogin = true;
    this.sessionExpired.set(false);
    this.clearSession();
  }

  ensureInitialized(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.init();
    }
    return this.initPromise;
  }

  private async init(): Promise<void> {
    try {
      const response = await firstValueFrom(this.api.get<AuthResponse>('/auth/me'));
      this.user.set(response.user);
      this.status.set('authenticated');
      this.redirectingToLogin = false;
      this.startHeartbeat();
    } catch (error: any) {
      if (error?.error?.error?.code === 'TOKEN_EXPIRED') {
        this.markSessionExpired();
      }
      this.clearSession();
    }
  }

  async login(email: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.api.post<AuthResponse>('/auth/login', { email, password }),
    );
    this.user.set(response.user);
    this.status.set('authenticated');
    this.redirectingToLogin = false;
    this.startHeartbeat();
  }

  async register(email: string, password: string): Promise<void> {
    await firstValueFrom(this.api.post<AuthResponse>('/auth/register', { email, password }));
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.api.post<void>('/auth/logout'));
    } finally {
      this.clearSession();
      await this.router.navigate(['/login']);
    }
  }

  clearSession(): void {
    this.stopHeartbeat();
    this.user.set(null);
    this.status.set('guest');
    this.initPromise = null;
  }

  hasRole(role: string): boolean {
    return this.user()?.roles.includes(role) ?? false;
  }

  private startHeartbeat(): void {
    if (this.heartbeat) {
      return;
    }
    this.heartbeat = setInterval(() => void this.pingSession(), this.HEARTBEAT_INTERVAL_MS);
  }

  private stopHeartbeat(): void {
    if (this.heartbeat) {
      clearInterval(this.heartbeat);
      this.heartbeat = null;
    }
  }

  private async pingSession(): Promise<void> {
    try {
      await firstValueFrom(this.api.get<AuthResponse>('/auth/me'));
    } catch {
      // Si el token expiró, el interceptor marca la expiración y se muestra el modal.
    }
  }
}
