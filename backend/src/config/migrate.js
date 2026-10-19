'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mudik_gratis',
    multipleStatements: true,
  });

  const migrationsDir = path.resolve(__dirname, '../../migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} migration file(s).`);

  for (const file of files) {
    console.log(`Running: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    try {
      await connection.query(sql);
      console.log(`  ✓ ${file} done`);
    } catch (err) {
      console.error(`  ✗ ${file} failed:`, err.message);
      await connection.end();
      process.exit(1);
    }
  }

  await connection.end();
  console.log('All migrations completed successfully.');
  process.exit(0);
}

runMigrations().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
