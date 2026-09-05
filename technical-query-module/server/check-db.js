const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
  });
  await client.connect();
  const q = await client.query('SELECT count(*) FROM technical_queries');
  console.log('technical_queries rows:', q.rows[0].count);
  const u = await client.query('SELECT count(*) FROM users');
  console.log('users rows:', u.rows[0].count);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
