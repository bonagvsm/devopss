const { Router } = require('express');
const { pool } = require('../db/pool');
const { register } = require('../middleware/metrics');

const router = Router();

// Liveness: "proses masih hidup". Sengaja tidak menyentuh DB; kalau DB mati,
// me-restart aplikasi tidak menolong dan hanya memperparah keadaan.
router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Readiness: "siap menerima traffic". 503 membuat Kubernetes berhenti mengirim request
// ke instance ini tanpa me-restart-nya.
router.get('/ready', async (req, res) => {
  if (req.app.locals.shuttingDown) {
    return res.status(503).json({ status: 'unavailable', reason: 'shutting_down' });
  }
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ready' });
  } catch (err) {
    req.log.warn({ err }, 'Readiness check failed');
    res.status(503).json({ status: 'unavailable', reason: 'database' });
  }
});

router.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});

module.exports = router;
