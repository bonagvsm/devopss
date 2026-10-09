// Menjalankan node-pg-migrate memakai kredensial DB_* dari config aplikasi.
// Pemakaian: npm run migrate  (up)  |  npm run migrate:down  (rollback satu migrasi)
const { spawnSync } = require('node:child_process');
const { db } = require('../src/config');

// node-pg-migrate membaca koneksi dari DATABASE_URL, jadi kita susun dari variabel DB_*.
const url =
  `postgres://${encodeURIComponent(db.user)}:${encodeURIComponent(db.password)}` +
  `@${db.host}:${db.port}/${encodeURIComponent(db.database)}`;

const direction = process.argv[2] ?? 'up';

const result = spawnSync('npx', ['node-pg-migrate', direction], {
  stdio: 'inherit',
  shell: true, // supaya `npx` juga jalan di Windows
  env: { ...process.env, DATABASE_URL: url },
});

process.exit(result.status ?? 1);
