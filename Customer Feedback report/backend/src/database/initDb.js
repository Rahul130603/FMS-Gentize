const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function initDb() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await db.exec(schemaSql);
  console.log('Database tables and indexes initialized successfully.');
}

module.exports = initDb;

