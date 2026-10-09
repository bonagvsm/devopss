const taskService = require('../services/taskService');
const { AppError } = require('../errors');

const notFound = () => new AppError(404, 'TASK_NOT_FOUND', 'Task not found');

// Express 5 meneruskan error dari async handler ke errorHandler secara otomatis.
async function list(req, res) {
  res.json(await taskService.list(req.validated.query));
}

async function get(req, res) {
  const task = await taskService.getById(req.validated.params.id);
  if (!task) throw notFound();
  res.json(task);
}

async function create(req, res) {
  const task = await taskService.create(req.validated.body);
  res.status(201).json(task);
}

async function update(req, res) {
  const task = await taskService.update(req.validated.params.id, req.validated.body);
  if (!task) throw notFound();
  res.json(task);
}

async function remove(req, res) {
  const deleted = await taskService.remove(req.validated.params.id);
  if (!deleted) throw notFound();
  res.status(204).end();
}

module.exports = { list, get, create, update, remove };
