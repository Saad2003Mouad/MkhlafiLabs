// MIKHLAFI LABS — PostgreSQL Database Connection & Migration Engine
// Uses native pg.Pool when DATABASE_URL is configured, or @electric-sql/pglite for in-process PostgreSQL 16 engine

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { PGlite } from '@electric-sql/pglite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool = null;
let pgliteInstance = null;
let isInitialized = false;

export async function getDb() {
  if (isInitialized) {
    return pool || pgliteInstance;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && !process.env.USE_EMBEDDED_PG) {
    // Live PostgreSQL connection via pg.Pool
    pool = new pg.Pool({
      connectionString: databaseUrl,
      max: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '10', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
    });

    pool.on('error', (err) => {
      console.error('[PostgreSQL Pool Error]:', err.message);
    });

    // Test connectivity
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
    } finally {
      client.release();
    }
    console.log('[Database] Connected to external PostgreSQL at', databaseUrl.replace(/:[^:@]+@/, ':****@'));
  } else {
    // In-process PostgreSQL 16 engine via PGlite
    const dataDir = process.env.PGLITE_DATA_DIR;
    pgliteInstance = dataDir ? new PGlite(dataDir) : new PGlite();
    await pgliteInstance.waitReady;
    console.log('[Database] Initialized in-process PostgreSQL 16 engine (PGlite)');
  }

  isInitialized = true;
  return pool || pgliteInstance;
}

export async function query(sql, params = []) {
  const db = await getDb();

  if (pool) {
    const result = await pool.query(sql, params);
    return { rows: result.rows, rowCount: result.rowCount };
  } else {
    const result = await pgliteInstance.query(sql, params);
    return { rows: result.rows, rowCount: result.affectedRows ?? result.rows.length };
  }
}

export async function exec(sql) {
  await getDb();
  if (pool) {
    return await pool.query(sql);
  } else {
    return await pgliteInstance.exec(sql);
  }
}

export async function transaction(callback) {
  const db = await getDb();

  if (pool) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback({
        query: (sql, params) => client.query(sql, params)
      });
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } else {
    // PGlite transaction support
    return await pgliteInstance.transaction(async (tx) => {
      return await callback({
        query: async (sql, params) => {
          const res = await tx.query(sql, params);
          return { rows: res.rows, rowCount: res.affectedRows ?? res.rows.length };
        }
      });
    });
  }
}

export async function runMigrations() {
  await getDb();

  // Ensure migrations tracking table exists
  if (pool) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  } else {
    await pgliteInstance.exec(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  }

  const migrationsDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) return [];

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const appliedMigrations = [];

  for (const file of files) {
    const check = await query('SELECT id FROM _migrations WHERE name = $1', [file]);
    if (check.rows.length > 0) {
      continue; // Already applied
    }

    console.log(`[Migrations] Applying ${file}...`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    if (pool) {
      await pool.query(sql);
    } else {
      await pgliteInstance.exec(sql);
    }
    await query('INSERT INTO _migrations (name) VALUES ($1)', [file]);

    appliedMigrations.push(file);
    console.log(`[Migrations] Successfully applied ${file}`);
  }

  return appliedMigrations;
}

export async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
  }
  if (pgliteInstance) {
    await pgliteInstance.close();
    pgliteInstance = null;
  }
  isInitialized = false;
}
