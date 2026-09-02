import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiService } from '../services/api.service';
import { User } from './auth.models';

@Component({ template: '' })
class LoginStub {}

const user: User = {
  id: 'u-1',
  email: 'a@b.c',
  isActive: true,
  roles: ['ADMIN', 'USR'],
  createdAt: '2026-01-01T00:00:00.000Z',
};

type MockFn = ReturnType<typeof vi.fn>;

interface MockApi {
  get: MockFn;
  post: MockFn;
}

describe('AuthService', () => {
  let service: AuthService;
  let api: MockApi;

  beforeEach(() => {
    localStorage.clear();
    api = { get: vi.fn(), post: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', component: LoginStub }]),
        { provide: ApiService, useValue: api },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    service.clearSession();
  });

  it('login autentica, persiste el refresh token y guarda el usuario', async () => {
    api.post.mockReturnValue(of({ user, refreshToken: 'rt-1' }));

    await service.login('a@b.c', 'secreto');

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'a@b.c',
      password: 'secreto',
    });
    expect(service.getRefreshToken()).toBe('rt-1');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.user()).toEqual(user);
  });

  it('login no rompe cuando la respuesta no trae refresh token', async () => {
    api.post.mockReturnValue(of({ user }));

    await service.login('a@b.c', 'secreto');

    expect(service.isAuthenticated()).toBe(true);
    expect(service.getRefreshToken()).toBeNull();
  });

  it('hasRole devuelve true solo si el usuario tiene el rol', async () => {
    api.post.mockReturnValue(of({ user }));
    await service.login('a@b.c', 'secreto');

    expect(service.hasRole('ADMIN')).toBe(true);
    expect(service.hasRole('USR')).toBe(true);
    expect(service.hasRole('SUPER')).toBe(false);
  });

  it('refreshSession devuelve false sin refresh token almacenado', async () => {
    expect(await service.refreshSession()).toBe(false);
  });

  it('refreshSession rota el token y restablece la sesión', async () => {
    localStorage.setItem('koinu_refresh_token', 'rt-1');
    api.post.mockReturnValue(of({ user, refreshToken: 'rt-2' }));

    expect(await service.refreshSession()).toBe(true);

    expect(api.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'rt-1' });
    expect(service.getRefreshToken()).toBe('rt-2');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.user()).toEqual(user);
  });

  it('refreshSession limpiando la sesión cuando falla', async () => {
    localStorage.setItem('koinu_refresh_token', 'rt-1');
    api.post.mockReturnValue(throwError(() => new Error('red')));
    service.user.set(user);

    expect(await service.refreshSession()).toBe(false);

    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();
  });

  it('ensureInitialized restaura la sesión vía /auth/me', async () => {
    api.get.mockReturnValue(of({ user }));

    await service.ensureInitialized();

    expect(api.get).toHaveBeenCalledWith('/auth/me');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.user()).toEqual(user);
  });

  it('ensureInitialized deja la sesión como guest cuando el backend falla sin token', async () => {
    api.get.mockReturnValue(throwError(() => new Error('red')));

    await service.ensureInitialized();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.status()).toBe('guest');
  });

  it('clearSession elimina el refresh token y resetea el estado', () => {
    localStorage.setItem('koinu_refresh_token', 'rt-1');
    service.user.set(user);
    service.status.set('authenticated');

    service.clearSession();

    expect(service.getRefreshToken()).toBeNull();
    expect(service.user()).toBeNull();
    expect(service.status()).toBe('guest');
  });

  it('logout limpia la sesión y navega a login', async () => {
    api.post.mockReturnValue(of(undefined));
    const router = TestBed.inject(Router);
    service.user.set(user);
    service.status.set('authenticated');

    await service.logout();

    expect(api.post).toHaveBeenCalledWith('/auth/logout');
    expect(service.status()).toBe('guest');
    expect(router.url).toBe('/login');
  });

  it('markSessionExpired y clearSessionExpired controlan la señal de sesión expirada', () => {
    service.markSessionExpired();
    expect(service.sessionExpired()).toBe(true);

    service.clearSessionExpired();
    expect(service.sessionExpired()).toBe(false);
  });
});