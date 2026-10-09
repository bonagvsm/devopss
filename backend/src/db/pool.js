const { Pool } = require('pg');
const config = require('../config');
const logger = require('../logger');

const pool = new Pool({
  ...config.db,
  // Tanpa batas ini, koneksi ke DB yang tidak merespons bisa menggantung selamanya,
  // dan /ready tidak pernah menjawab.
  connectionTimeoutMillis: 5000,
});

// Tanpa handler ini, error pada koneksi idle akan meng-crash proses.
pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected idle DB client error');
});

module.exports = { pool };
