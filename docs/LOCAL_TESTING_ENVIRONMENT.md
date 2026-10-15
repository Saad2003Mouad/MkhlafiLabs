# MIKHLAFI LABS — Isolated Local Testing & Development Environment

## 1. Overview & Architecture Separation

The MIKHLAFI LABS platform enforces strict separation between environments:
- **Development (`NODE_ENV=development`)**: In-process PGlite or local PostgreSQL with hot-reloading.
- **Automated Testing (`NODE_ENV=test`)**: Dedicated isolated test database (`mikhlafi_platform_test` on port `5433` or in-process PGlite), isolated sessions, deterministic synthetic test fixtures only.
- **Production (`NODE_ENV=production`)**: Hardened PostgreSQL 16+ with verified TLS (`rejectUnauthorized: true`), secret validation (fails closed if passwords or secrets are missing), and strict tenant isolation.

---

## 2. Security & Production Isolation Safeguards

### Fail-Closed Production Protection Guard
The database connection layer in [`apps/api/src/db/connection.js`](file:///d:/mikhlafi-labs/apps/api/src/db/connection.js) incorporates a hard security guard:
```javascript
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
```

### Insecure Secret Eradication
- Production secrets are strictly removed from `docker-compose.yml`. Production deployment requires environment-provided secrets via `${POSTGRES_PASSWORD:?Error...}`, `${SESSION_SECRET:?Error...}`, and `${LICENSE_SIGNING_SECRET:?Error...}`.
- Test suites run with isolated, non-production keys and in-memory or ephemeral storage.

---

## 3. Synthetic Test Identities

The synthetic seeder provisions three distinct test personas with deterministically hashed passwords (`scrypt`):

| Persona | Role | Email | Documented Local Password |
| :--- | :--- | :--- | :--- |
| **Platform Administrator** | Super Admin (`is_platform_admin=true`) | `test.platform_admin@test.mikhlafi-labs.local` | `SyntheticPlatformAdminPass2026!` |
| **Organization Administrator** | Workspace Owner (`role=org_owner`) | `test.org_admin@test.mikhlafi-labs.local` | `SyntheticOrgAdminPass2026!` |
| **Customer Analyst** | Member / Analyst (`role=analyst`) | `test.user@test.mikhlafi-labs.local` | `SyntheticUserPass2026!` |

> [!CAUTION]
> These credentials are valid **ONLY** in local development and automated testing environments. They are completely absent and barred from production builds.

---

## 4. Reproducible Startup & Testing Guide

### A. Windows (PowerShell)

#### 1. Install Dependencies
```powershell
# Root & Workspaces
npm install
npm --prefix apps/api install
npm --prefix apps/platform install
```

#### 2. Start Isolated Test Database (Docker Compose)
```powershell
docker compose -f docker-compose.test.yml up -d mikhlafi-test-db
```

#### 3. Apply Migrations & Seed Deterministic Synthetic Data
```powershell
$env:NODE_ENV="test"
$env:DATABASE_URL="postgresql://mikhlafi_test_user:mikhlafi_test_password_local_only@localhost:5433/mikhlafi_platform_test?sslmode=disable"
node apps/api/src/db/seedSyntheticData.js
```

#### 4. Run Automated Test Suite
```powershell
$env:NODE_ENV="test"
npm test
```

#### 5. Build Frontend Workspace
```powershell
npm run build --prefix apps/platform
```

#### 6. Safely Reset Test Database
```powershell
docker compose -f docker-compose.test.yml down -v
```

---

### B. Linux / macOS (Bash)

#### 1. Install Dependencies
```bash
npm install
npm --prefix apps/api install
npm --prefix apps/platform install
```

#### 2. Start Isolated Test Database
```bash
docker compose -f docker-compose.test.yml up -d mikhlafi-test-db
```

#### 3. Apply Migrations & Seed Deterministic Synthetic Data
```bash
NODE_ENV=test DATABASE_URL="postgresql://mikhlafi_test_user:mikhlafi_test_password_local_only@localhost:5433/mikhlafi_platform_test?sslmode=disable" node apps/api/src/db/seedSyntheticData.js
```

#### 4. Run Automated Test Suite
```bash
NODE_ENV=test npm test
```

#### 5. Build Frontend Workspace
```bash
npm run build --prefix apps/platform
```

#### 6. Safely Reset Test Database
```bash
docker compose -f docker-compose.test.yml down -v
```

---

## 5. Pure Local In-Memory Testing (Without Docker)

The repository also supports **100% zero-dependency local testing** utilizing `@electric-sql/pglite` (an in-process WebAssembly PostgreSQL 16 engine):
```powershell
# In PowerShell:
$env:NODE_ENV="test"
Remove-Item Env:\DATABASE_URL -ErrorAction SilentlyContinue
npm test
```
Every test suite initializes an isolated, ephemeral in-memory PostgreSQL instance that automatically cleans itself up when the process terminates. No paid databases, cloud accounts, or external AI API keys are required.
