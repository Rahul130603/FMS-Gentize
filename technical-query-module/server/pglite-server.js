// Embedded PostgreSQL (PGlite) exposed over the real Postgres wire protocol
// on localhost:5432, backed by a persistent data directory. Used because no
// standalone PostgreSQL/Docker install is available in this environment;
// the app's own code (pg driver, node-postgres pool) is completely unaware
// this isn't a "real" Postgres server.
const path = require('path');
const { PGlite } = require('@electric-sql/pglite');
const { pg_trgm } = require('@electric-sql/pglite/contrib/pg_trgm');
const { pgcrypto } = require('@electric-sql/pglite/contrib/pgcrypto');
const { PGLiteSocketServer } = require('@electric-sql/pglite-socket');

const DATA_DIR = path.join(__dirname, 'pgdata');
const PORT = 5432;
const HOST = '127.0.0.1';

async function main() {
  const db = await PGlite.create({
    dataDir: DATA_DIR,
    extensions: { pg_trgm, pgcrypto },
  });

  const server = new PGLiteSocketServer({ db, port: PORT, host: HOST, maxConnections: 10 });
  await server.start();

  console.log(`[pglite] Postgres-compatible server listening on ${HOST}:${PORT}`);
  console.log(`[pglite] data dir: ${DATA_DIR}`);

  const shutdown = async () => {
    console.log('[pglite] shutting down...');
    await server.stop();
    await db.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('[pglite] failed to start:', err);
  process.exit(1);
});
