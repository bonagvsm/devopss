// Mengisi data contoh agar demo tidak kosong. Aman dijalankan berulang: hanya jalan jika tabel kosong.
const { pool } = require('../src/db/pool');

const SAMPLE_TASKS = [
  ['Set up CI pipeline', 'Lint, test and build on every push', 'done'],
  ['Containerize the app', 'Multi-stage Dockerfiles and docker-compose', 'done'],
  ['Write Kubernetes manifests', 'Deployment, Service, probes and resource limits', 'in_progress'],
  ['Add Prometheus monitoring', 'Scrape /metrics and build a Grafana dashboard', 'in_progress'],
  ['Provision AWS infrastructure', 'Terraform for VPC, EKS and RDS', 'todo'],
  ['Document the architecture', 'README with diagrams and runbook', 'todo'],
];

async function main() {
  const { rows } = await pool.query('SELECT count(*)::int AS n FROM tasks');
  if (rows[0].n > 0) {
    console.log('Tasks table is not empty, skipping seed');
    return;
  }
  for (const [title, description, status] of SAMPLE_TASKS) {
    await pool.query('INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3)', [
      title,
      description,
      status,
    ]);
  }
  console.log(`Seeded ${SAMPLE_TASKS.length} tasks`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
