jest.mock('../src/db/pool', () => ({ pool: { query: jest.fn() } }));

const request = require('supertest');
const { pool } = require('../src/db/pool');
const { createApp } = require('../src/app');

const app = createApp();

beforeEach(() => {
  pool.query.mockReset();
  app.locals.shuttingDown = false;
});

it('GET /health is ok and does not touch the database', async () => {
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ status: 'ok' });
  expect(pool.query).not.toHaveBeenCalled();
});

it('GET /ready returns 200 when the database responds', async () => {
  pool.query.mockResolvedValue({ rows: [{ '?column?': 1 }] });
  const res = await request(app).get('/ready');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ status: 'ready' });
});

it('GET /ready returns 503 when the database fails', async () => {
  pool.query.mockRejectedValue(new Error('connection refused'));
  const res = await request(app).get('/ready');
  expect(res.status).toBe(503);
  expect(res.body).toEqual({ status: 'unavailable', reason: 'database' });
});

it('GET /ready returns 503 while the server is shutting down', async () => {
  app.locals.shuttingDown = true;
  const res = await request(app).get('/ready');
  expect(res.status).toBe(503);
  expect(res.body.reason).toBe('shutting_down');
  expect(pool.query).not.toHaveBeenCalled();
});

it('GET /metrics exposes default and HTTP metrics in Prometheus format', async () => {
  await request(app).get('/health');
  const res = await request(app).get('/metrics');

  expect(res.status).toBe(200);
  expect(res.headers['content-type']).toMatch(/^text\/plain/);
  expect(res.text).toContain('process_cpu_user_seconds_total');
  expect(res.text).toMatch(/http_requests_total\{[^}]*route="\/health"[^}]*\} \d+/);
  expect(res.text).toContain('http_request_duration_seconds_bucket');
});
