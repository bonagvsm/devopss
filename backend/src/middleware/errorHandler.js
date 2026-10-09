const { AppError } = require('../errors');

// Semua error berakhir di sini dengan format: { error: { code, message, details?, requestId } }
// requestId memudahkan mencocokkan keluhan user dengan baris log.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  const requestId = req.id;

  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details, requestId },
    });
  }

  // Error 4xx dari body-parser (mis. JSON rusak, payload terlalu besar).
  if (err.expose && err.status >= 400 && err.status < 500) {
    return res
      .status(err.status)
      .json({ error: { code: 'BAD_REQUEST', message: err.message, requestId } });
  }

  // Bug / error tak terduga: detail hanya di log, jangan bocor ke client.
  req.log.error({ err }, 'Unhandled error');
  res
    .status(500)
    .json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error', requestId } });
}

module.exports = { errorHandler };
