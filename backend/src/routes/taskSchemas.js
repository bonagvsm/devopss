const { z } = require('zod');

const STATUSES = ['todo', 'in_progress', 'done'];

const idParams = z.object({ id: z.string().uuid() });

const listQuery = z.object({
  status: z.enum(STATUSES).optional(),
  q: z.string().trim().max(100).optional(),
});

// Dipakai untuk POST dan PUT (PUT = ganti penuh; field yang dihilangkan kembali ke default).
const taskBody = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(2000).default(''),
  status: z.enum(STATUSES).default('todo'),
});

module.exports = { idParams, listQuery, taskBody };
