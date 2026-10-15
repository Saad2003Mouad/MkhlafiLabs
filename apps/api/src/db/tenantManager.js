// MIKHLAFI LABS — Multi-Tenant Operational Isolation & Environment Manager
// Implements Control Plane vs. Per-Company Isolated Operational Environments
// Canonical identity enforcement, path containment, and fail-closed database isolation

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { PGlite } from '@electric-sql/pglite';
import { getPostgresSslConfig } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_ROOT = path.resolve(__dirname, '../../../../data');
const TENANTS_DIR = path.join(DATA_ROOT, 'tenants');

// In-memory cache of tenant connection pools / PGlite instances
// tenantId -> { db, type: 'pg'|'pglite', client: any, lastUsed: number }
const tenantPools = new Map();

/**
 * Validates tenant identifier against canonical UUID or strict slug.
 * PROHIBITS silent character stripping to prevent identity collisions.
 */
export function validateCanonicalTenantId(tenantId) {
  if (!tenantId || typeof tenantId !== 'string') {
    throw new Error('[Tenant Isolation Error]: Tenant identifier must be a non-empty string.');
  }

  const trimmed = tenantId.trim().toLowerCase();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmed);
  const isSlug = /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/.test(trimmed);

  if (!isUuid && !isSlug) {
    throw new Error(
      `[Tenant Isolation Error]: Invalid tenant identifier "${tenantId}". ` +
      'Identifier must be a canonical UUID or kebab-case slug ([a-z0-9-]). Silent character stripping is prohibited to prevent tenant collisions.'
    );
  }

  return trimmed;
}

export class TenantManager {
  constructor() {
    this.ensureTenantsDirectory();
  }

  ensureTenantsDirectory() {
    if (!fs.existsSync(TENANTS_DIR)) {
      fs.mkdirSync(TENANTS_DIR, { recursive: true });
    }
  }

  /**
   * Resolves tenant storage path with strict path containment checks.
   */
  getTenantStoragePath(tenantId, subDir = '') {
    const canonicalId = validateCanonicalTenantId(tenantId);
    const resolvedRoot = path.resolve(TENANTS_DIR);
    const tenantPath = path.resolve(resolvedRoot, canonicalId);

    // Verify containment within TENANTS_DIR
    if (!tenantPath.startsWith(resolvedRoot + path.sep) && tenantPath !== resolvedRoot) {
      throw new Error(`[Tenant Isolation Error]: Storage path traversal detected for tenant "${tenantId}".`);
    }

    if (subDir) {
      const fullPath = path.resolve(tenantPath, subDir);
      if (!fullPath.startsWith(tenantPath + path.sep)) {
        throw new Error(`[Tenant Isolation Error]: Subdirectory path traversal detected: "${subDir}".`);
      }
      return fullPath;
    }

    return tenantPath;
  }

  async provisionTenantStorage(tenantId) {
    const base = this.getTenantStoragePath(tenantId);
    const subDirs = ['uploads', 'exports', 'backups', 'secrets', 'db'];
    for (const dir of subDirs) {
      const fullPath = path.join(base, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    }
    return base;
  }

  /**
   * Resolves or establishes an isolated database connection for a specific tenant.
   * In PostgreSQL mode: connects to tenant-specific database/credentials.
   * In Embedded mode: establishes an isolated PGlite database scoped to data/tenants/<tenantId>/db/
   * FAILS CLOSED in production if dedicated credentials are required but missing.
   */
  async getTenantDb(tenantId) {
    const canonicalId = validateCanonicalTenantId(tenantId);

    if (tenantPools.has(canonicalId)) {
      const entry = tenantPools.get(canonicalId);
      entry.lastUsed = Date.now();
      return entry.db;
    }

    const envKey = `DATABASE_URL_TENANT_${canonicalId.toUpperCase().replace(/-/g, '_')}`;
    const dedicatedTenantDbUrl = process.env[envKey];

    // 1. External PostgreSQL Mode (Cloud Edition with isolated DB credentials)
    if (!process.env.USE_EMBEDDED_PG && process.env.ENABLE_PER_TENANT_POSTGRES_POOLS === 'true') {
      if (!dedicatedTenantDbUrl) {
        // FAIL CLOSED: Do not silently fall back to shared database in production
        throw new Error(
          `[Tenant Isolation Error]: Dedicated database credentials required for tenant "${canonicalId}" via ${envKey}. ` +
          'Silent fallback to global database in multi-tenant production mode is prohibited.'
        );
      }

      const sslConfig = getPostgresSslConfig();

      const pool = new pg.Pool({
        connectionString: dedicatedTenantDbUrl,
        max: 5, // Capped per tenant to prevent resource starvation
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: sslConfig
      });

      pool.on('error', (err) => {
        console.error(`[Tenant Pool Error ${canonicalId}]:`, err.message);
      });

      const adapter = {
        query: async (sql, params = []) => {
          const res = await pool.query(sql, params);
          return { rows: res.rows, rowCount: res.rowCount };
        },
        exec: async (sql) => pool.query(sql),
        close: async () => pool.end()
      };

      tenantPools.set(canonicalId, { db: adapter, type: 'pg', lastUsed: Date.now() });
      return adapter;
    }

    // 2. Isolated Storage Engine Mode (PGlite per-tenant storage directory)
    await this.provisionTenantStorage(canonicalId);
    const tenantDbDir = this.getTenantStoragePath(canonicalId, 'db');

    const pglite = new PGlite(tenantDbDir);
    await pglite.waitReady;

    const adapter = {
      query: async (sql, params = []) => {
        const res = await pglite.query(sql, params);
        return { rows: res.rows, rowCount: res.affectedRows ?? res.rows.length };
      },
      exec: async (sql) => pglite.exec(sql),
      transaction: async (cb) => pglite.transaction(async (tx) => {
        return await cb({
          query: async (sql, params) => {
            const res = await tx.query(sql, params);
            return { rows: res.rows, rowCount: res.affectedRows ?? res.rows.length };
          }
        });
      }),
      close: async () => pglite.close()
    };

    tenantPools.set(canonicalId, { db: adapter, type: 'pglite', lastUsed: Date.now() });
    return adapter;
  }

  /**
   * Executes tenant-specific schema migrations on a tenant's isolated database.
   */
  async runTenantMigrations(tenantId) {
    const db = await this.getTenantDb(tenantId);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS _tenant_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) return [];

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    const applied = [];
    for (const file of files) {
      const check = await db.query('SELECT id FROM _migrations WHERE name = $1', [file]);
      if (check.rows.length > 0) continue;

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await db.exec(sql);
      await db.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
      applied.push(file);
    }

    return applied;
  }

  /**
   * Automates the full idempotent provisioning workflow for a new company environment.
   */
  async provisionCompanyEnvironment({ tenantId, slug, nameEn, nameAr, ownerEmail, initialPassword }) {
    const canonicalId = validateCanonicalTenantId(tenantId || slug);
    let db = null;

    try {
      // 1. Provision isolated storage namespace
      await this.provisionTenantStorage(canonicalId);

      // 2. Initialize isolated database
      db = await this.getTenantDb(canonicalId);

      // 3. Run migrations on the isolated tenant database
      await this.runTenantMigrations(canonicalId);

      return {
        success: true,
        tenantId: canonicalId,
        storagePath: this.getTenantStoragePath(canonicalId),
        status: 'ACTIVE'
      };
    } catch (err) {
      console.error(`[Provisioning Error for Tenant ${canonicalId}]:`, err.message);
      // Rollback on failure: close DB and clean up directory to prevent orphaned state
      if (tenantPools.has(canonicalId)) {
        const poolEntry = tenantPools.get(canonicalId);
        try { await poolEntry.db.close(); } catch (_) {}
        tenantPools.delete(canonicalId);
      }
      const tenantDir = this.getTenantStoragePath(canonicalId);
      if (fs.existsSync(tenantDir)) {
        try { fs.rmSync(tenantDir, { recursive: true, force: true }); } catch (_) {}
      }
      throw err;
    }
  }

  /**
   * Safely suspends tenant environment by closing its pool.
   */
  async suspendTenantEnvironment(tenantId) {
    const canonicalId = validateCanonicalTenantId(tenantId);
    if (tenantPools.has(canonicalId)) {
      const entry = tenantPools.get(canonicalId);
      try { await entry.db.close(); } catch (_) {}
      tenantPools.delete(canonicalId);
    }
    return { success: true, tenantId: canonicalId, status: 'SUSPENDED' };
  }

  /**
   * Cleans up all tenant connection pools upon application shutdown.
   */
  async closeAll() {
    for (const [tenantId, entry] of tenantPools.entries()) {
      try {
        await entry.db.close();
      } catch (err) {
        console.error(`[Error Closing Tenant Pool ${tenantId}]:`, err.message);
      }
    }
    tenantPools.clear();
  }
}

export const tenantManager = new TenantManager();
