const { randomUUID } = require('node:crypto');
const pinoHttp = require('pino-http');
const logger = require('../logger');

const PROBE_PATHS = ['/health', '/ready', '/metrics'];
const SAFE_ID = /^[\w-]{1,64}$/;

// Setiap request punya ID: dipakai ulang dari header X-Request-Id jika valid
// (jejak lintas layanan), atau dibuat baru. ID dikirim balik di header respons.
const requestLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const incoming = req.headers['x-request-id'];
    const id = typeof incoming === 'string' && SAFE_ID.test(incoming) ? incoming : randomUUID();
    res.setHeader('X-Request-Id', id);
    return id;
  },
  // Probe Kubernetes dan scrape Prometheus berjalan tiap beberapa detik: jangan menuh-menuhi log.
  autoLogging: { ignore: (req) => PROBE_PATHS.includes(req.url) },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
});

module.exports = { requestLogger };
