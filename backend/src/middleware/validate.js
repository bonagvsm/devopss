const { AppError } = require('../errors');

// Pemakaian: validate({ body: schema, query: schema, params: schema })
// Hasil yang sudah tervalidasi ada di req.validated (req.query di Express 5 read-only).
function validate(schemas) {
  return (req, _res, next) => {
    req.validated = {};
    for (const [part, schema] of Object.entries(schemas)) {
      const result = schema.safeParse(req[part] ?? {});
      if (!result.success) {
        const details = result.error.issues.map((i) => ({
          field: [part, ...i.path].join('.'),
          message: i.message,
        }));
        return next(new AppError(400, 'VALIDATION_ERROR', 'Invalid request', details));
      }
      req.validated[part] = result.data;
    }
    next();
  };
}

module.exports = { validate };
