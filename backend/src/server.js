const config = require('./config');
const logger = require('./logger');
const { createApp } = require('./app');
const { pool } = require('./db/pool');

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info({ port: config.port, env: config.env }, 'TaskFlow API listening');
});

server.on('error', (err) => {
  logger.fatal({ err }, 'Server failed to start');
  process.exit(1);
});

let shuttingDown = false;

// Kubernetes mengirim SIGTERM saat rolling update. Urutannya: tandai tidak siap, berhenti
// menerima koneksi baru, tunggu request berjalan selesai, tutup pool DB, lalu keluar.
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  app.locals.shuttingDown = true; // /ready langsung 503
  logger.info({ signal }, 'Shutdown started');

  // Pengaman: jika ada request yang menggantung, paksa keluar setelah batas waktu.
  setTimeout(() => {
    logger.error('Shutdown timed out, forcing exit');
    process.exit(1);
  }, config.shutdownTimeoutMs).unref();

  server.close(async (err) => {
    if (err) logger.error({ err }, 'Error while closing HTTP server');
    try {
      await pool.end();
    } catch (poolErr) {
      logger.error({ err: poolErr }, 'Error while closing DB pool');
    }
    logger.info('Shutdown complete');
    process.exit(err ? 1 : 0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
