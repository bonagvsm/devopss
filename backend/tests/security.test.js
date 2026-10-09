// Env diatur sebelum app dimuat karena config dibaca saat require.
process.env.CORS_ORIGIN = 'http://allowed.test';
process.env.RATE_LIMIT_MAX = '3';

jest.mock('../src/db/pool', () => ({ pool: { query: jest.fn() } }));

const request = require('supertest');
const { pool } = require('../src/db/pool');
const { createApp } = require('../src/app');

const app = createApp();

it('sets security headers and hides x-powered-by', async () => {
  const res = await request(app).get('/health');
  expect(res.headers['x-content-type-options']).toBe('nosniff');
  expect(res.headers['x-powered-by']).toBeUndefined();
});

it('allows only the configured CORS origins', async () => {
  const allowed = await request(app).get('/health').set('Origin', 'http://allowed.test');
  expect(allowed.headers['access-control-allow-origin']).toBe('http://allowed.test');

  const blocked = await request(app).get('/health').set('Origin', 'http://evil.test');
  expect(blocked.headers['access-control-allow-origin']).toBeUndefined();
});

it('rate limits /api but never the health probes', async () => {
  pool.query.mockResolvedValue({ rows: [] });

  for (let i = 0; i < 3; i++) {
    await request(app).get('/api/tasks').expect(200);
  }
  const limited = await request(app).get('/api/tasks');
  expect(limited.status).toBe(429);
  expect(limited.body.error.code).toBe('RATE_LIMITED');

  await request(app).get('/health').expect(200);
});
