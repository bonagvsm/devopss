const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register }); // CPU, memori, event loop, GC, dll.

const labelNames = ['method', 'route', 'status'];

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames,
  registers: [register],
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

function metricsMiddleware(req, res, next) {
  const stopTimer = httpRequestDuration.startTimer();
  res.on('finish', () => {
    // Label route memakai pola ("/api/tasks/:id"), bukan URL asli. Kalau tidak, setiap UUID
    // atau URL ngawur membuat deret metrik baru dan memori Prometheus membengkak.
    const route = req.route ? req.route.path : 'unmatched';
    const labels = { method: req.method, route, status: res.statusCode };
    httpRequestsTotal.inc(labels);
    stopTimer(labels);
  });
  next();
}

module.exports = { register, metricsMiddleware };
