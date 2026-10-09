const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config');
const { requestLogger } = require('./middleware/requestLogger');
const { metricsMiddleware } = require('./middleware/metrics');
const { apiLimiter } = require('./middleware/rateLimit');
const { notFound } = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorHandler');
const healthRoutes = require('./routes/healthRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Dipisah dari server.js agar mudah dites dengan Supertest tanpa membuka port.
function createApp() {
  const app = express();

  // Agar req.ip (dipakai rate limit dan log) adalah IP client asli, bukan IP proxy di depan kita.
  app.set('trust proxy', config.trustProxy);

  app.use(requestLogger);
  app.use(metricsMiddleware);

  // Saat shutdown, minta client menutup koneksi keep-alive supaya server bisa berhenti cepat.
  app.use((_req, res, next) => {
    if (app.locals.shuttingDown) res.set('Connection', 'close');
    next();
  });

  app.use(helmet());
  if (config.corsOrigins.length > 0) app.use(cors({ origin: config.corsOrigins }));

  // Probe dan metrics ada sebelum rate limiter: tidak boleh ikut dibatasi.
  app.use(healthRoutes);

  app.use('/api', apiLimiter);
  app.use(express.json({ limit: '100kb' }));
  app.use(taskRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
