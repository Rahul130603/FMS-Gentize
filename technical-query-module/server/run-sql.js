// Runs a .sql file against the local PGlite server using the same `pg`
// driver the app uses (stands in for `psql`, which isn't installed here).
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node run-sql.js <path-to-sql-file>');
    process.exit(1);
  }
  const sql = fs.readFileSync(path.resolve(file), 'utf8');

  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
  });
  await client.connect();
  try {
    await client.query(sql);
    console.log(`OK: ${file}`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
