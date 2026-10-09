const { Router } = require('express');
const controller = require('../controllers/taskController');
const { validate } = require('../middleware/validate');
const { idParams, listQuery, taskBody } = require('./taskSchemas');

const router = Router();

// Path ditulis lengkap (bukan lewat app.use('/api/tasks', ...)) agar label route
// di metrics selalu konsisten, termasuk saat request berakhir di error handler.
const BASE = '/api/tasks';

router.get(BASE, validate({ query: listQuery }), controller.list);
router.post(BASE, validate({ body: taskBody }), controller.create);
router.get(`${BASE}/:id`, validate({ params: idParams }), controller.get);
router.put(`${BASE}/:id`, validate({ params: idParams, body: taskBody }), controller.update);
router.delete(`${BASE}/:id`, validate({ params: idParams }), controller.remove);

module.exports = router;
