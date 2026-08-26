import { before, after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app';
import { pool } from '../src/config/db';
import { setupTestDb, uniqueEmail } from './helpers';

const app = createApp();

before(async () => {
  await setupTestDb();
});

after(async () => {
  await pool.end();
});

describe('Registro de usuarios', () => {
  it('registra un usuario con rol USR y no expone la contraseña', async () => {
    const email = uniqueEmail();
    const res = await request(app).post('/api/v1/auth/register').send({
      email,
      password: 'Contrasena123',
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.user.email, email);
    assert.equal(res.body.user.isActive, true);
    assert.ok(res.body.user.roles.includes('USR'));
    assert.ok(!res.body.user.roles.includes('ADMIN'));
    assert.equal(res.body.user.passwordHash, undefined);
    assert.equal(res.body.user.password, undefined);
    assert.ok(res.body.user.id);
  });

  it('rechaza un correo con formato inválido', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'correo-invalido',
      password: 'Contrasena123',
    });

    assert.equal(res.status, 422);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    assert.ok(res.body.error.details.errors.email);
  });

  it('rechaza una contraseña demasiado corta', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: uniqueEmail(),
      password: 'A1',
    });

    assert.equal(res.status, 422);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    assert.ok(res.body.error.details.errors.password);
  });

  it('rechaza una contraseña sin letra y número', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: uniqueEmail(),
      password: 'sololetras',
    });

    assert.equal(res.status, 422);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    assert.ok(res.body.error.details.errors.password);
  });

  it('rechaza la solicitud sin campos obligatorios', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({});

    assert.equal(res.status, 422);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    assert.ok(res.body.error.details.errors.email);
    assert.ok(res.body.error.details.errors.password);
  });

  it('rechaza un correo duplicado', async () => {
    const email = uniqueEmail();
    const first = await request(app).post('/api/v1/auth/register').send({
      email,
      password: 'Contrasena123',
    });
    assert.equal(first.status, 201);

    const second = await request(app).post('/api/v1/auth/register').send({
      email,
      password: 'OtraContrasena456',
    });

    assert.equal(second.status, 409);
    assert.equal(second.body.error.code, 'EMAIL_ALREADY_REGISTERED');
  });

  it('normaliza el correo eliminando espacios', async () => {
    const email = uniqueEmail();
    const res = await request(app).post('/api/v1/auth/register').send({
      email: `  ${email}  `,
      password: 'Contrasena123',
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.user.email, email);
  });
});
