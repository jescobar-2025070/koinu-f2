import { before, after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app';
import { pool } from '../src/config/db';
import { config } from '../src/config/env';
import {
  setupTestDb,
  uniqueEmail,
  getUserIdByEmail,
  deactivateUser,
} from './helpers';

const app = createApp();

before(async () => {
  await setupTestDb();
});

after(async () => {
  await pool.end();
});

async function registerAndLogin(password = 'Contrasena123') {
  const email = uniqueEmail();
  const register = await request(app).post('/api/v1/auth/register').send({ email, password });
  assert.equal(register.status, 201);

  const agent = request.agent(app);
  const login = await agent.post('/api/v1/auth/login').send({ email, password });
  return { email, agent, login };
}

describe('Inicio de sesión', () => {
  it('inicia sesión correctamente y establece la cookie HttpOnly', async () => {
    const { agent, login, email } = await registerAndLogin();

    assert.equal(login.status, 200);
    assert.equal(login.body.user.email, email);
    assert.ok(login.body.user.roles.includes('USR'));

    const setCookie = login.headers['set-cookie'];
    assert.ok(Array.isArray(setCookie));
    const cookie = setCookie.find((c: string) => c.includes(config.cookieName));
    assert.ok(cookie, 'Debe existir la cookie de sesión');
    assert.match(cookie, /HttpOnly/i);
  });

  it('rechaza credenciales incorrectas con mensaje genérico', async () => {
    const { email } = await registerAndLogin();

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'PasswordIncorrecta999' });

    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, 'INVALID_CREDENTIALS');
    assert.equal(res.body.error.message, 'Credenciales incorrectas.');
  });

  it('rechaza un correo inexistente con la misma respuesta genérica', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'noexiste@test.local', password: 'Contrasena123' });

    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, 'INVALID_CREDENTIALS');
    assert.equal(res.body.error.message, 'Credenciales incorrectas.');
  });

  it('rechaza una solicitud con datos inválidos', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({});

    assert.equal(res.status, 422);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  it('rechaza el inicio de sesión de una cuenta desactivada', async () => {
    const { email } = await registerAndLogin();
    const userId = await getUserIdByEmail(email);
    assert.ok(userId);
    await deactivateUser(userId!);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'Contrasena123' });

    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'ACCOUNT_DISABLED');
  });

  it('genera un JWT que permite obtener la sesión en /auth/me', async () => {
    const { agent, email } = await registerAndLogin();

    const me = await agent.get('/api/v1/auth/me');
    assert.equal(me.status, 200);
    assert.equal(me.body.user.email, email);
    assert.ok(me.body.user.roles.includes('USR'));
  });

  it('cierra sesión y deja de poder acceder a /auth/me', async () => {
    const { agent } = await registerAndLogin();

    const logout = await agent.post('/api/v1/auth/logout');
    assert.equal(logout.status, 204);

    const me = await agent.get('/api/v1/auth/me');
    assert.equal(me.status, 401);
  });
});
