import { before, after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app';
import { pool } from '../src/config/db';
import { config } from '../src/config/env';
import { setupTestDb, uniqueEmail } from './helpers';

const app = createApp();

before(async () => {
  await setupTestDb();
});

after(async () => {
  await pool.end();
});

async function registerAndGetToken() {
  const email = uniqueEmail();
  const register = await request(app).post('/api/v1/auth/register').send({
    email,
    password: 'Contrasena123',
  });
  assert.equal(register.status, 201);

  const login = await request(app).post('/api/v1/auth/login').send({
    email,
    password: 'Contrasena123',
  });
  assert.equal(login.status, 200);

  const setCookie = login.headers['set-cookie'] as string[];
  const cookie = setCookie.find((c) => c.includes(config.cookieName));
  const token = cookie!.split(';')[0].split('=').slice(1).join('=');
  return token;
}

describe('Autenticación de endpoints protegidos', () => {
  it('permite acceder a /auth/me con un token válido', async () => {
    const token = await registerAndGetToken();

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.user.email);
  });

  it('rechaza /auth/me sin token', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, 'UNAUTHORIZED');
  });

  it('rechaza /auth/me con un token inválido', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer token-invalido');

    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, 'TOKEN_INVALID');
  });

  it('rechaza /auth/me con un token expirado', async () => {
    const payload = { sub: 'no-existe', email: 'x@test.local', roles: ['USR'] };
    const expiredToken = jwt.sign(payload, config.jwtSecret, { expiresIn: '-1s' });

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, 'TOKEN_EXPIRED');
  });

  it('rechaza /auth/me con un token firmado con otro secreto', async () => {
    const payload = { sub: 'no-existe', email: 'x@test.local', roles: ['USR'] };
    const token = jwt.sign(payload, 'otro-secreto-distinto', { expiresIn: '1h' });

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, 'TOKEN_INVALID');
  });
});
