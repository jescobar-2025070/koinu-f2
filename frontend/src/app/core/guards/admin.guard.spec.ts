import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from '../auth/auth.service';

const route = {} as ActivatedRouteSnapshot;
const state = {} as RouterStateSnapshot;

interface AuthMock {
  ensureInitialized: ReturnType<typeof vi.fn>;
  isAuthenticated: ReturnType<typeof vi.fn>;
  hasRole: ReturnType<typeof vi.fn>;
}

function mockAuthService(overrides: Partial<AuthMock> = {}): AuthMock {
  return {
    ensureInitialized: vi.fn().mockResolvedValue(undefined),
    isAuthenticated: vi.fn(() => true),
    hasRole: vi.fn(() => true),
    ...overrides,
  };
}

async function runGuard(): Promise<unknown> {
  return await TestBed.runInInjectionContext(() => adminGuard(route, state));
}

describe('adminGuard', () => {
  it('permite el acceso a un ADMIN autenticado', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: mockAuthService() }],
    });

    await expect(runGuard()).resolves.toBe(true);
  });

  it('redirige a /dashboard cuando el usuario autenticado no es ADMIN', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: mockAuthService({ hasRole: vi.fn(() => false) }),
        },
      ],
    });

    const result = await runGuard();
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/dashboard');
  });

  it('redirige a /dashboard cuando no hay sesión', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: mockAuthService({ isAuthenticated: vi.fn(() => false) }),
        },
      ],
    });

    const result = await runGuard();
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/dashboard');
  });
});