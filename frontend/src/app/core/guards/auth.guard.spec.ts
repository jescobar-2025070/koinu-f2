import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { authGuard } from './auth.guard';
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
  return await TestBed.runInInjectionContext(() => authGuard(route, state));
}

describe('authGuard', () => {
  it('permite el acceso cuando la sesión está autenticada', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: mockAuthService() }],
    });

    await expect(runGuard()).resolves.toBe(true);
  });

  it('redirige a /login cuando el usuario es guest', async () => {
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
    expect((result as UrlTree).toString()).toBe('/login');
  });

  it('espera la inicialización de la sesión antes de decidir', async () => {
    const auth = mockAuthService({ isAuthenticated: vi.fn(() => false) });
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });

    await runGuard();

    expect(auth.ensureInitialized).toHaveBeenCalledTimes(1);
  });
});