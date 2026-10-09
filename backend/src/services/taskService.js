const { pool } = require('../db/pool');

// Alias camelCase agar respons API konsisten dengan konvensi JS/frontend.
const COLUMNS = `id, title, description, status,
  created_at AS "createdAt", updated_at AS "updatedAt"`;

// Karakter % dan _ bersifat wildcard di LIKE; escape agar pencarian literal.
const escapeLike = (s) => s.replace(/[\\%_]/g, '\\$&');

async function list({ status, q }) {
  const conditions = [];
  const params = [];
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }
  if (q) {
    params.push(`%${escapeLike(q)}%`);
    conditions.push(`title ILIKE $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM tasks ${where} ORDER BY created_at DESC`,
    params,
  );
  return rows;
}

async function getById(id) {
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM tasks WHERE id = $1`, [id]);
  return rows[0];
}

async function create({ title, description, status }) {
  const { rows } = await pool.query(
    `INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING ${COLUMNS}`,
    [title, description, status],
  );
  return rows[0];
}

async function update(id, { title, description, status }) {
  const { rows } = await pool.query(
    `UPDATE tasks SET title = $1, description = $2, status = $3, updated_at = now()
     WHERE id = $4 RETURNING ${COLUMNS}`,
    [title, description, status, id],
  );
  return rows[0];
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { list, getById, create, update, remove };
