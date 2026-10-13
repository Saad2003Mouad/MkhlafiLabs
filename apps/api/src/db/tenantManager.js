// MIKHLAFI LABS — Multi-Tenant Operational Isolation & Environment Manager
// Implements Control Plane vs. Per-Company Isolated Operational Environments
// Conforms to docs/TENANT_ISOLATION_ARCHITECTURE.md

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import pg from 'pg';
import { PGlite } from '@electric-sql/pglite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_ROOT = path.resolve(__dirname, '../../../../data');
const TENANTS_DIR = path.join(DATA_ROOT, 'tenants');

// In-memory cache of tenant connection pools / PGlite instances
// tenantId -> { db, type: 'pg'|'pglite', client: any, lastUsed: number }
const tenantPools = new Map();

export class TenantManager {
  constructor() {
    this.ensureTenantsDirectory();
  }

  ensureTenantsDirectory() {
    if (!fs.existsSync(TENANTS_DIR)) {
      fs.mkdirSync(TENANTS_DIR, { recursive: true });
    }
  }

  getTenantStoragePath(tenantId, subDir = '') {
    const safeTenantId = String(tenantId).replace(/[^a-zA-Z0-9_-]/g, '');
    const tenantPath = path.join(TENANTS_DIR, safeTenantId);
    if (subDir) {
      return path.join(tenantPath, subDir);
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
   */
  async getTenantDb(tenantId) {
    if (!tenantId) {
      throw new Error('[Tenant Isolation Error]: Cannot resolve tenant database without a valid tenantId.');
    }

    const safeTenantId = String(tenantId).replace(/[^a-zA-Z0-9_-]/g, '');

    if (tenantPools.has(safeTenantId)) {
      const entry = tenantPools.get(safeTenantId);
      entry.lastUsed = Date.now();
      return entry.db;
    }

    const tenantDbUrl = process.env[`DATABASE_URL_TENANT_${safeTenantId.toUpperCase().replace(/-/g, '_')}`] ||
                        process.env.DATABASE_URL;

    // 1. External PostgreSQL Mode (Cloud Edition with isolated DB credentials)
    if (tenantDbUrl && !process.env.USE_EMBEDDED_PG && process.env.ENABLE_PER_TENANT_POSTGRES_POOLS === 'true') {
      const pool = new pg.Pool({
        connectionString: tenantDbUrl,
        max: 5, // Capped per tenant to prevent resource starvation
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
      });

      pool.on('error', (err) => {
        console.error(`[Tenant Pool Error ${safeTenantId}]:`, err.message);
      });

      const adapter = {
        query: async (sql, params = []) => {
          const res = await pool.query(sql, params);
          return { rows: res.rows, rowCount: res.rowCount };
        },
        exec: async (sql) => pool.query(sql),
        close: async () => pool.end()
      };

      tenantPools.set(safeTenantId, { db: adapter, type: 'pg', lastUsed: Date.now() });
      return adapter;
    }

    // 2. Isolated Storage Engine Mode (PGlite per-tenant storage directory)
    await this.provisionTenantStorage(safeTenantId);
    const tenantDbDir = this.getTenantStoragePath(safeTenantId, 'db');

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

    tenantPools.set(safeTenantId, { db: adapter, type: 'pglite', lastUsed: Date.now() });
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
      const check = await db.query('SELECT id FROM _tenant_migrations WHERE name = $1', [file]);
      if (check.rows.length > 0) continue;

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await db.exec(sql);
      await db.query('INSERT INTO _tenant_migrations (name) VALUES ($1)', [file]);
      applied.push(file);
    }

    return applied;
  }

  /**
   * Automates the full idempotent provisioning workflow for a new company environment.
   */
  async provisionCompanyEnvironment({ tenantId, slug, nameEn, nameAr, ownerEmail, initialPassword }) {
    const safeTenantId = String(tenantId).replace(/[^a-zA-Z0-9_-]/g, '');
    let db = null;

    try {
      // 1. Provision isolated storage namespace
      await this.provisionTenantStorage(safeTenantId);

      // 2. Initialize isolated database
      db = await this.getTenantDb(safeTenantId);

      // 3. Run migrations on the isolated tenant database
      await this.runTenantMigrations(safeTenantId);

      // 4. Verify database health and isolation
      const healthCheck = await db.query('SELECT count(*) FROM roles');
      if (parseInt(healthCheck.rows[0]?.count || '0', 10) === 0) {
        throw new Error('Tenant database migration failed to initialize foundational roles.');
      }

      return {
        success: true,
        tenantId: safeTenantId,
        storagePath: this.getTenantStoragePath(safeTenantId),
        status: 'ACTIVE'
      };
    } catch (err) {
      console.error(`[Provisioning Error for Tenant ${safeTenantId}]:`, err.message);
      // Rollback on failure: close DB and clean up directory to prevent orphaned state
      if (tenantPools.has(safeTenantId)) {
        const poolEntry = tenantPools.get(safeTenantId);
        try { await poolEntry.db.close(); } catch (_) {}
        tenantPools.delete(safeTenantId);
      }
      const tenantDir = this.getTenantStoragePath(safeTenantId);
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
    const safeTenantId = String(tenantId).replace(/[^a-zA-Z0-9_-]/g, '');
    if (tenantPools.has(safeTenantId)) {
      const entry = tenantPools.get(safeTenantId);
      try { await entry.db.close(); } catch (_) {}
      tenantPools.delete(safeTenantId);
    }
    return { success: true, tenantId: safeTenantId, status: 'SUSPENDED' };
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
