const pino = require('pino');
const config = require('./config');

// Log JSON satu baris per event: mudah dibaca mesin (CloudWatch, Loki, ELK).
module.exports = pino({
  level: config.env === 'test' ? 'silent' : config.logLevel,
  base: { service: 'taskflow-backend' },
});
