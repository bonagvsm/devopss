jest.mock('../src/db/pool', () => ({ pool: { query: jest.fn() } }));

const request = require('supertest');
const { pool } = require('../src/db/pool');
const { createApp } = require('../src/app');

const app = createApp();
const ID = '0d12901e-03a8-48e8-b54c-8d52d31b578a';
const row = {
  id: ID,
  title: 'Learn Docker',
  description: '',
  status: 'todo',
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => pool.query.mockReset());

describe('POST /api/tasks', () => {
  it('creates a task using a parameterized query and trims the title', async () => {
    pool.query.mockResolvedValue({ rows: [row] });
    const res = await request(app).post('/api/tasks').send({ title: '  Learn Docker  ' });

    expect(res.status).toBe(201);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO tasks'), [
      'Learn Docker',
      '',
      'todo',
    ]);
  });

  it('rejects an empty title with a validation error', async () => {
    const res = await request(app).post('/api/tasks').send({ title: '' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details[0].field).toBe('body.title');
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('rejects an invalid status', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'x', status: 'finished' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/tasks', () => {
  it('passes filters as parameters and escapes LIKE wildcards', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    await request(app).get('/api/tasks').query({ status: 'done', q: '100%' });

    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toContain('status = $1');
    expect(params).toEqual(['done', '%100\\%%']);
  });

  it('never concatenates user input into the SQL text', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const evil = "'; DROP TABLE tasks;--";
    await request(app).get('/api/tasks').query({ q: evil });

    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).not.toContain('DROP');
    expect(params).toEqual([`%${evil}%`]);
  });

  it('rejects an unknown status filter', async () => {
    const res = await request(app).get('/api/tasks').query({ status: 'nope' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/tasks/:id', () => {
  it('returns 400 for an id that is not a UUID', async () => {
    const res = await request(app).get('/api/tasks/abc');
    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('returns 404 when the task does not exist', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const res = await request(app).get(`/api/tasks/${ID}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('TASK_NOT_FOUND');
  });

  it('returns the task when it exists', async () => {
    pool.query.mockResolvedValue({ rows: [row] });
    const res = await request(app).get(`/api/tasks/${ID}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Learn Docker');
  });
});

describe('PUT and DELETE /api/tasks/:id', () => {
  it('returns 404 when updating a missing task', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const res = await request(app).put(`/api/tasks/${ID}`).send({ title: 'x' });
    expect(res.status).toBe(404);
  });

  it('deletes an existing task with 204', async () => {
    pool.query.mockResolvedValue({ rowCount: 1 });
    const res = await request(app).delete(`/api/tasks/${ID}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 when deleting a missing task', async () => {
    pool.query.mockResolvedValue({ rowCount: 0 });
    const res = await request(app).delete(`/api/tasks/${ID}`);
    expect(res.status).toBe(404);
  });
});

describe('error handling', () => {
  it('hides internal error details and returns the request id', async () => {
    pool.query.mockRejectedValue(new Error('password=supersecret'));
    const res = await request(app).get('/api/tasks').set('X-Request-Id', 'test-123');

    expect(res.status).toBe(500);
    expect(res.body.error).toEqual({
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      requestId: 'test-123',
    });
    expect(res.headers['x-request-id']).toBe('test-123');
  });

  it('generates a request id when the client sends none', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const res = await request(app).get('/api/tasks');
    expect(res.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('returns 400 BAD_REQUEST for malformed JSON', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Content-Type', 'application/json')
      .send('{bad json');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('returns 404 NOT_FOUND for unknown routes', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
