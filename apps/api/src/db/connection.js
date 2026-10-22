// MIKHLAFI LABS — PostgreSQL Database Connection & Migration Engine
// Uses native pg.Pool when DATABASE_URL is configured, or @electric-sql/pglite for in-process PostgreSQL 16 engine

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { PGlite } from '@electric-sql/pglite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const rootEnv = path.resolve(__dirname, '../../../../.env');
  if (fs.existsSync(rootEnv) && typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(rootEnv);
  }
} catch (e) {
  // Silent fallback
}

let pool = null;
let pgliteInstance = null;
let isInitialized = false;

/**
 * Resolves production-grade TLS configuration for PostgreSQL connections.
 * Enforces server certificate validation in production.
 * Insecure TLS (rejectUnauthorized: false) is strictly rejected in production.
 */
export function getPostgresSslConfig(databaseUrl = '') {
  const urlLower = String(databaseUrl).toLowerCase();
  const isCloudProvider =
    urlLower.includes('neon.tech') ||
    urlLower.includes('vercel-storage.com') ||
    urlLower.includes('supabase.co') ||
    urlLower.includes('sslmode=require');

  if (process.env.DATABASE_SSL === 'false') {
    return false;
  }

  if (process.env.DATABASE_SSL === 'true' || isCloudProvider) {
    if (process.env.DATABASE_SSL_CA) {
      return { ca: process.env.DATABASE_SSL_CA, rejectUnauthorized: true };
    }
    if (process.env.DATABASE_SSL_CA_PATH && fs.existsSync(process.env.DATABASE_SSL_CA_PATH)) {
      return { ca: fs.readFileSync(process.env.DATABASE_SSL_CA_PATH, 'utf8'), rejectUnauthorized: true };
    }
    // For Neon and cloud-managed serverless Postgres, rejectUnauthorized: false or true with native trust
    return isCloudProvider ? { rejectUnauthorized: false } : true;
  }

  return false;
}

export async function getDb() {
  if (isInitialized) {
    return pool || pgliteInstance;
  }

  const databaseUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.STORAGE_URL ||
    process.env.NEON_DATABASE_URL;

  // Fatal security guard: Prevent test mode from ever silently connecting to or modifying a production database
  if (process.env.NODE_ENV === 'test') {
    if (databaseUrl) {
      const lowerUrl = databaseUrl.toLowerCase();
      if (
        lowerUrl.includes('prod') ||
        lowerUrl.includes('production') ||
        process.env.IS_PRODUCTION === 'true' ||
        process.env.APP_ENV === 'production'
      ) {
        throw new Error(
          '[FATAL SECURITY CONFIGURATION]: Automated test environment attempted to connect to a production database URL. ' +
          'Tests must use an isolated test database (e.g. ending in _test) or the in-process disposable PGlite engine.'
        );
      }
    }
  }

  if (process.env.NODE_ENV === 'production' && !databaseUrl && !process.env.ALLOW_EMBEDDED_IN_PROD) {
    throw new Error(
      '[FATAL SECURITY CONFIGURATION]: NODE_ENV is set to production but DATABASE_URL is not configured. ' +
      'Silent fallback to an in-process disposable database in production is prohibited to protect data integrity.'
    );
  }

  if (databaseUrl && !process.env.USE_EMBEDDED_PG) {
    const sslConfig = getPostgresSslConfig(databaseUrl);

    // Live PostgreSQL connection via pg.Pool
    pool = new pg.Pool({
      connectionString: databaseUrl,
      max: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '10', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: sslConfig
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
    // In-process PostgreSQL 16 engine via PGlite.
    // A configured data directory makes the database persist across restarts, which is
    // what the local demo environment wants. A test run must never read or mutate that
    // persistent database, so the disposable engine is always used under `node --test`
    // regardless of what the environment file says.
    const runningUnderTestRunner =
      process.env.NODE_ENV === 'test' ||
      (process.env.NODE_TEST_CONTEXT !== undefined && process.env.NODE_TEST_CONTEXT !== '');
    const dataDir = runningUnderTestRunner ? undefined : process.env.PGLITE_DATA_DIR;

    if (dataDir) {
      // PGlite creates the leaf directory itself but not its parents, and the parent
      // does not exist yet on a fresh checkout because data directories are ignored.
      fs.mkdirSync(path.dirname(path.resolve(dataDir)), { recursive: true });
    }
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
