import fs from 'fs';
import path from 'path';
import { pool } from './pool';

async function migrate() {
  const migrationsDir = path.join(__dirname, '..', '..', 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  // ensure migrations tracking table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name       TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  for (const file of files) {
    const { rows } = await pool.query('SELECT 1 FROM _migrations WHERE name = $1', [file]);
    if (rows.length > 0) {
      console.log(`  skip  ${file}`);
      continue;
    }
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    await pool.query(sql);
    await pool.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
    console.log(`  apply ${file}`);
  }

  console.log('migrations complete');
  await pool.end();
}

migrate().catch(err => { console.error(err); process.exit(1); });
