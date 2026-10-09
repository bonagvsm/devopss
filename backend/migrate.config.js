// Dipakai oleh `npm run migrate`. Kredensial diambil dari config yang sama dengan aplikasi.
const config = require('./src/config');

module.exports = {
  databaseUrl: {
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
  },
  dir: 'migrations',
  migrationsTable: 'pgmigrations',
};
