import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('get emite una petición GET contra la URL base', () => {
    service.get<{ ok: boolean }>('/ping').subscribe((res) => expect(res).toEqual({ ok: true }));

    const req = http.expectOne('http://localhost:3000/api/v1/ping');
    expect(req.request.method).toBe('GET');
    req.flush({ ok: true });
  });

  it('post emite una petición POST con el cuerpo', () => {
    const body = { email: 'a@b.c', password: 'pass' };
    service.post<{ id: string }>('/auth/login', body).subscribe((res) => expect(res.id).toBe('x'));

    const req = http.expectOne('http://localhost:3000/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ id: 'x' });
  });

  it('put emite una petición PUT con el cuerpo', () => {
    service.put<{ roles: string[] }>('/users/1/roles', { roles: ['ADMIN'] }).subscribe((res) => expect(res.roles).toEqual(['ADMIN']));

    const req = http.expectOne('http://localhost:3000/api/v1/users/1/roles');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ roles: ['ADMIN'] });
    req.flush({ roles: ['ADMIN'] });
  });

  it('patch emite una petición PATCH con el cuerpo', () => {
    service.patch<{ totalAmount: number }>('/periods/1/budget', { totalAmount: 5000 }).subscribe((res) => expect(res.totalAmount).toBe(5000));

    const req = http.expectOne('http://localhost:3000/api/v1/periods/1/budget');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ totalAmount: 5000 });
    req.flush({ totalAmount: 5000 });
  });

  it('delete emite una petición DELETE a la ruta indicada', () => {
    service.delete<void>('/periods/budget-allocations/9').subscribe();

    const req = http.expectOne('http://localhost:3000/api/v1/periods/budget-allocations/9');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});