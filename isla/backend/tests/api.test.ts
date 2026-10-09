import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { crearApp } from '../src/app';

const app = crearApp();

describe('api', () => {
  it('responde el estado de salud', async () => {
    const r = await request(app).get('/api/salud');
    expect(r.status).toBe(200);
    expect(r.body.estado).toBe('ok');
  });

  it('devuelve 401 en rutas protegidas sin sesión', async () => {
    const r = await request(app).get('/api/hogares');
    expect(r.status).toBe(401);
  });

  it('devuelve 404 en rutas inexistentes', async () => {
    const r = await request(app).get('/api/no-existe');
    expect(r.status).toBe(404);
    expect(r.body.error).toBeDefined();
  });

  it('devuelve 400 con detalles al registrar datos inválidos', async () => {
    const r = await request(app).post('/api/auth/registro').send({ nombre: 'a', email: 'x', clave: '1' });
    expect(r.status).toBe(400);
    expect(r.body.detalles.length).toBeGreaterThan(0);
  });
});
