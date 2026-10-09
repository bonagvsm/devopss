exports.up = (pgm) => {
  pgm.createTable('tasks', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    title: { type: 'varchar(200)', notNull: true },
    description: { type: 'text', notNull: true, default: '' },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'todo',
      check: "status IN ('todo', 'in_progress', 'done')",
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('tasks', 'status');
};

exports.down = (pgm) => {
  pgm.dropTable('tasks');
};
