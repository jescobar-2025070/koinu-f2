import { before, after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app';
import { pool } from '../src/config/db';
import { setupTestDb, uniqueEmail, createUserWithRole } from './helpers';

const app = createApp();

before(async () => {
  await setupTestDb();
});

after(async () => {
  await pool.end();
});

async function loginAs(email: string, password: string) {
  const agent = request.agent(app);
  const res = await agent.post('/api/v1/auth/login').send({ email, password });
  assert.equal(res.status, 200);
  return agent;
}

describe('Autorización por roles', () => {
  it('permite a un ADMIN consultar los roles', async () => {
    const email = uniqueEmail();
    await createUserWithRole(email, 'AdminContrasena123', 'ADMIN');

    const agent = await loginAs(email, 'AdminContrasena123');
    const res = await agent.get('/api/v1/roles');

    assert.equal(res.status, 200);
    const names = res.body.roles.map((role: { name: string }) => role.name);
    assert.ok(names.includes('ADMIN'));
    assert.ok(names.includes('USR'));
  });

  it('deniega el acceso a un USR', async () => {
    const email = uniqueEmail();
    const register = await request(app).post('/api/v1/auth/register').send({
      email,
      password: 'Contrasena123',
    });
    assert.equal(register.status, 201);

    const agent = await loginAs(email, 'Contrasena123');
    const res = await agent.get('/api/v1/roles');

    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  it('deniega el acceso sin autenticación', async () => {
    const res = await request(app).get('/api/v1/roles');

    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, 'UNAUTHORIZED');
  });

  it('no permite a un usuario registrar el rol ADMIN', async () => {
    const email = uniqueEmail();
    const res = await request(app).post('/api/v1/auth/register').send({
      email,
      password: 'Contrasena123',
    });

    assert.equal(res.status, 201);
    assert.ok(res.body.user.roles.includes('USR'));
    assert.ok(!res.body.user.roles.includes('ADMIN'));
  });
});
