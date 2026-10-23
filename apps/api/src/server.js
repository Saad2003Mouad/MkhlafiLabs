// MIKHLAFI LABS — Central REST API & Security Gateway
// Implements authenticated, tenant-isolated API endpoints conforming to Master Architecture v1.0

import http from 'node:http';
import crypto from 'node:crypto';
import { query, transaction, runMigrations } from './db/connection.js';
import { hashPassword, verifyPassword } from './auth/passwords.js';
import {
  createSession,
  revokeSession,
  serializeSessionCookie,
  clearSessionCookie,
  parseCookies
} from './auth/sessions.js';
import {
  authenticateRequest,
  resolveTenantContext,
  hasPermission,
  hasCapability,
  recordAuditEvent
} from './middleware/tenant.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { tenantManager } from './db/tenantManager.js';
import { licenseManager } from './services/billing/licenseManager.js';
import {
  getFinancialAnomalies,
  resolveFinancialAnomaly,
  seedInitialFinancialRecords,
  getBenchmarkStatus
} from './services/financial/leakDetection.js';
import { getFinancialAnalytics } from './services/financial/financialAnalyticsEngine.js';
import {
  getTenantDecisions,
  createTenantDecision,
  getTenantDecisionById,
  executeTenantDecision
} from './services/decisions/decisionsEngine.js';
import {
  getTenantRisks,
  toggleRiskMitigation
} from './services/risks/riskEngine.js';
import {
  getTenantProjects,
  verifyProjectClaims
} from './services/projects/projectEngine.js';
import {
  getTenantSuppliers,
  auditTenantSupplier
} from './services/suppliers/supplierEngine.js';
import {
  getTenantCustomers,
  scheduleCustomerReview
} from './services/customers/customerEngine.js';
import {
  getDataQualityAudits,
  runDataQualityScan
} from './services/data-quality/qualityEngine.js';
import { processAssistantQuery } from './services/ai/assistantEngine.js';
import {
  getCommercialPackages,
  getTenantBillingDetails
} from './services/billing/billingEngine.js';
import {
  getTenantIntegrations,
  createTenantIntegration,
  updateTenantIntegration,
  deleteTenantIntegration,
  testTenantIntegration,
  syncTenantIntegration,
  getTenantWorkflows,
  toggleTenantWorkflow,
  executeTenantWorkflow,
  getTenantAlerts,
  toggleAlertAcknowledge,
  getTenantSettings,
  updateTenantSettings,
  ingestJournalEntries
} from './services/operations/operationsEngine.js';
import {
  getPlatformOverview,
  listTenants,
  createTenant,
  updateTenantDetails,
  deleteTenant,
  updateTenantStatus,
  addManualSubscription,
  confirmOrganizationPayment,
  listPackages,
  createCustomPackage,
  updatePackageDetails,
  deleteCustomPackage,
  listPlatformUsers,
  createPlatformUser,
  updatePlatformUserDetails,
  deletePlatformUser,
  listLeadInquiries,
  updateLeadStatus,
  listPlatformServices,
  updatePlatformService,
  listPublishedServices,
  listPlatformAuditLogs
} from './services/admin/adminEngine.js';

export function getAllowedOrigin(incomingOrigin) {
  if (!incomingOrigin) return null;
  const configured = process.env.WEB_BASE_URL;
  if (configured) {
    try {
      if (incomingOrigin === new URL(configured).origin) return incomingOrigin;
    } catch (_) {}
  }
  try {
    const parsed = new URL(incomingOrigin);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return incomingOrigin;
    }
  } catch (_) {}
  return null;
}

export function jsonResponse(res, statusCode, data, headers = {}) {
  const allowedOrigin = res._allowedOrigin || (headers['Access-Control-Allow-Origin'] !== '*' ? headers['Access-Control-Allow-Origin'] : null);
  const responseHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Vary': 'Origin',
    ...headers
  };
  if (allowedOrigin) {
    responseHeaders['Access-Control-Allow-Origin'] = allowedOrigin;
    responseHeaders['Access-Control-Allow-Credentials'] = 'true';
    responseHeaders['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    responseHeaders['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Organization-Id';
  }
  res.writeHead(statusCode, responseHeaders);
  res.end(JSON.stringify(data, null, 2));
}

export function readJsonBody(req) {
  // 1. If Vercel or an upstream middleware has already parsed req.body
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object') {
      return Promise.resolve(req.body);
    }
    if (typeof req.body === 'string') {
      try {
        return Promise.resolve(JSON.parse(req.body));
      } catch (err) {
        return Promise.reject(new Error('Invalid JSON payload'));
      }
    }
  }

  // 2. If the request stream has already ended or is not readable
  if (req.readableEnded) {
    return Promise.resolve({});
  }

  // 3. Fallback to standard Node.js streaming body consumption
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) { // 1MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

// Main API Request Dispatcher
export async function handleApiRequest(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  const incomingOrigin = req.headers.origin;
  const allowedOrigin = getAllowedOrigin(incomingOrigin);
  res._allowedOrigin = allowedOrigin;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    const preflightHeaders = {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Organization-Id',
      'Vary': 'Origin'
    };
    if (allowedOrigin) {
      preflightHeaders['Access-Control-Allow-Origin'] = allowedOrigin;
      preflightHeaders['Access-Control-Allow-Credentials'] = 'true';
    }
    res.writeHead(204, preflightHeaders);
    return res.end();
  }

  try {
    // ── HEALTH CHECK ────────────────────────────────────────────────────────
    if (method === 'GET' && (pathname === '/api/health' || pathname === '/api/v1/health')) {
      let dbStatus = 'unknown';
      let dbError = null;
      let rolesCount = 0;
      try {
        const dbCheck = await query('SELECT count(*) FROM roles');
        dbStatus = 'connected';
        rolesCount = parseInt(dbCheck.rows[0].count, 10);
      } catch (err) {
        dbStatus = 'error';
        dbError = err.message;
      }

      const availableEnvKeys = Object.keys(process.env).filter(k => /URL|POSTGRES|DB|STORAGE|NEON/i.test(k));

      return jsonResponse(res, dbStatus === 'connected' ? 200 : 503, {
        status: dbStatus === 'connected' ? 'healthy' : 'degraded',
        database: dbStatus,
        databaseError: dbError,
        rolesConfigured: rolesCount,
        environment: {
          nodeEnv: process.env.NODE_ENV,
          isVercel: !!process.env.VERCEL,
          hasDatabaseUrl: Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.STORAGE_URL || process.env.STORAGE_DATABASE_URL || process.env.STORAGE_POSTGRES_URL || process.env.NEON_DATABASE_URL),
          databaseKeysFound: availableEnvKeys
        },
        timestamp: new Date().toISOString()
      });
    }

    // ── PUBLIC: INBOUND LEAD INQUIRIES (/api/v1/inquiries) ──────────────────
    if (method === 'POST' && pathname === '/api/v1/inquiries') {
      const clientKey = rateLimiter.getClientKey(req, 'inquiries');
      const limitCheck = rateLimiter.isRateLimited(clientKey, 15, 60000);
      if (limitCheck.limited) {
        return jsonResponse(res, 429, {
          error: 'Too many inquiry requests. Please wait before submitting another request.',
          retryAfter: limitCheck.retryAfterSeconds
        }, { 'Retry-After': String(limitCheck.retryAfterSeconds) });
      }

      const body = await readJsonBody(req);
      const { name, email, companyName, phone, message, inquiryType = 'demo_request' } = body;
      if (!name || !email) {
        return jsonResponse(res, 400, { error: 'Name and email are required.' });
      }
      const leadRes = await query(
        `INSERT INTO lead_inquiries (name, email, company_name, phone, message, inquiry_type, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'NEW')
         RETURNING id, name, email, company_name, inquiry_type, status, created_at`,
        [name, email.trim().toLowerCase(), companyName || null, phone || null, message || null, inquiryType]
      );
      return jsonResponse(res, 201, {
        success: true,
        message: 'Your inquiry has been received. Our solutions team will contact you shortly.',
        inquiry: leadRes.rows[0]
      });
    }

    // ── PUBLIC: COMMERCIAL PACKAGES CATALOG (/api/v1/packages) ───────────────
    if (method === 'GET' && pathname === '/api/v1/packages') {
      const packages = await getCommercialPackages();
      return jsonResponse(res, 200, { packages });
    }

    // ── EMPIRICAL BENCHMARKS & SCIENTIFIC DATASET ────────────────────────────
    if (method === 'GET' && pathname === '/api/v1/benchmarks/financial') {
      const benchmarkStatus = await getBenchmarkStatus();
      return jsonResponse(res, 200, benchmarkStatus);
    }

    // ── AUTHENTICATION: REGISTER ───────────────────────────────────────────
    if (method === 'POST' && pathname === '/api/v1/auth/register') {
      const clientKey = rateLimiter.getClientKey(req, 'register');
      const limitCheck = rateLimiter.isRateLimited(clientKey, 10, 60000);
      if (limitCheck.limited) {
        return jsonResponse(res, 429, {
          error: 'Too many registration requests. Please wait before retrying.',
          retryAfter: limitCheck.retryAfterSeconds
        }, { 'Retry-After': String(limitCheck.retryAfterSeconds) });
      }

      const body = await readJsonBody(req);
      const { email, password, nameEn, nameAr, orgNameEn, orgNameAr } = body;

      if (!email || !password || !nameEn || !orgNameEn) {
        return jsonResponse(res, 400, {
          error: 'Missing required registration fields: email, password, nameEn, and orgNameEn are required.'
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
      if (existingUser.rows.length > 0) {
        return jsonResponse(res, 409, {
          error: 'An account with this email address already exists.'
        });
      }

      const passwordHash = await hashPassword(password);
      const baseSlug = orgNameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'org';
      const slugSuffix = crypto.randomBytes(3).toString('hex');
      const orgSlug = `${baseSlug}-${slugSuffix}`;

      let user, org, sessionInfo;

      try {
        await transaction(async (tx) => {
        // 1. Create User
        const userRes = await tx.query(
          `INSERT INTO users (email, password_hash, name_en, name_ar, is_verified, status)
           VALUES ($1, $2, $3, $4, true, 'active')
           RETURNING id, email, name_en, name_ar, status, created_at`,
          [normalizedEmail, passwordHash, nameEn, nameAr || nameEn]
        );
        user = userRes.rows[0];

        // 2. Create Organization
        const orgRes = await tx.query(
          `INSERT INTO organizations (slug, name_en, name_ar, default_currency, status)
           VALUES ($1, $2, $3, 'SAR', 'active')
           RETURNING id, slug, name_en, name_ar, default_currency`,
          [orgSlug, orgNameEn, orgNameAr || orgNameEn]
        );
        org = orgRes.rows[0];

        // 3. Create Main HQ Branch
        const branchRes = await tx.query(
          `INSERT INTO branches (organization_id, code, name_en, name_ar, is_main_hq, status)
           VALUES ($1, 'HQ-01', 'Headquarters', 'المقر الرئيسي', true, 'active')
           RETURNING id`,
          [org.id]
        );
        const branchId = branchRes.rows[0].id;

        // 4. Create Owner Membership
        await tx.query(
          `INSERT INTO memberships (user_id, organization_id, role, branch_id, status)
           VALUES ($1, $2, 'org_owner', $3, 'active')`,
          [user.id, org.id, branchId]
        );

        // 5. Seed Initial Tenant Decision Records for this new organization
        await tx.query(
          `INSERT INTO tenant_decisions (organization_id, branch_id, title, category, impact_amount, currency, risk_level, status)
           VALUES
             ($1, $2, 'Single-Source Cement Supplier Price Drift (+16.5%)', 'Procurement', 362400.00, 'SAR', 'CRITICAL', 'PENDING'),
             ($1, $2, 'Early Payment Discount Capture on Q3 Batches', 'Working Capital', 145000.00, 'SAR', 'HIGH', 'PENDING'),
             ($1, $2, 'Subcontractor Milestone Variance Delay Claim', 'Project Governance', 540000.00, 'SAR', 'MEDIUM', 'PENDING')`,
          [org.id, branchId]
        );

        // 6. Seed Initial Financial Intelligence Records (Invoices & Anomalies)
        await seedInitialFinancialRecords(tx, org.id, branchId);

        // 7. Provision Default Enterprise Subscription
        await tx.query(
          `INSERT INTO organization_subscriptions (organization_id, package_id, status, billing_interval)
           VALUES ($1, 'plan_enterprise', 'active', 'annual')
           ON CONFLICT (organization_id) DO NOTHING`,
          [org.id]
        );
      });
      } catch (regErr) {
        if (regErr.code === '23505' || regErr.message?.includes('duplicate key') || regErr.message?.includes('unique constraint')) {
          return jsonResponse(res, 409, {
            error: 'An account or organization with these details already exists.'
          });
        }
        throw regErr;
      }

      // Provision isolated tenant storage namespace
      try {
        await tenantManager.provisionTenantStorage(org.id);
      } catch (storageErr) {
        console.error('[Tenant Storage Allocation Warning]:', storageErr.message);
      }

      // 6. Create Session
      sessionInfo = await createSession(user.id, {
        ipAddress: req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });

      const cookieHeader = serializeSessionCookie(sessionInfo.rawToken);

      await recordAuditEvent({
        organizationId: org.id,
        userId: user.id,
        action: 'USER_REGISTERED',
        entityType: 'USER',
        entityId: user.id,
        details: { email: user.email, orgName: org.name_en }
      });

      return jsonResponse(res, 201, {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          nameEn: user.name_en,
          nameAr: user.name_ar
        },
        organization: org
      }, { 'Set-Cookie': cookieHeader });
    }

    // ── AUTHENTICATION: LOGIN ──────────────────────────────────────────────
    if (method === 'POST' && pathname === '/api/v1/auth/login') {
      const clientKey = rateLimiter.getClientKey(req, 'login');
      const limitCheck = rateLimiter.isRateLimited(clientKey, 20, 60000);
      if (limitCheck.limited) {
        return jsonResponse(res, 429, {
          error: 'Too many login attempts. Please wait before retrying.',
          retryAfter: limitCheck.retryAfterSeconds
        }, { 'Retry-After': String(limitCheck.retryAfterSeconds) });
      }

      const body = await readJsonBody(req);
      const { email, password } = body;

      if (!email || !password) {
        return jsonResponse(res, 400, { error: 'Email and password are required.' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const userRes = await query(
        `SELECT id, email, password_hash, name_en, name_ar, status, is_platform_admin
         FROM users
         WHERE email = $1`,
        [normalizedEmail]
      );

      if (userRes.rows.length === 0) {
        return jsonResponse(res, 401, { error: 'Invalid email or password.' });
      }

      const user = userRes.rows[0];

      if (user.status !== 'active') {
        return jsonResponse(res, 403, { error: 'Account is deactivated or suspended. Please contact administrator.' });
      }

      const isValidPassword = await verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return jsonResponse(res, 401, { error: 'Invalid email or password.' });
      }

      // Create session
      const sessionInfo = await createSession(user.id, {
        ipAddress: req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });

      const cookieHeader = serializeSessionCookie(sessionInfo.rawToken);

      // Fetch user's organizations
      const tenantCheck = await resolveTenantContext(req, user);

      await recordAuditEvent({
        userId: user.id,
        action: 'USER_LOGIN',
        entityType: 'USER',
        entityId: user.id,
        details: { email: user.email }
      });

      return jsonResponse(res, 200, {
        success: true,
        sessionToken: sessionInfo.rawToken,
        user: {
          id: user.id,
          email: user.email,
          nameEn: user.name_en,
          nameAr: user.name_ar,
          status: user.status,
          isPlatformAdmin: Boolean(user.is_platform_admin)
        },
        tenant: tenantCheck.hasTenant ? tenantCheck.tenant : null,
        activeTenant: tenantCheck.hasTenant ? tenantCheck.tenant : null,
        availableOrganizations: tenantCheck.hasTenant ? tenantCheck.tenant.availableOrganizations : []
      }, { 'Set-Cookie': cookieHeader });
    }

    // ── AUTHENTICATION: LOGOUT ─────────────────────────────────────────────
    if (method === 'POST' && pathname === '/api/v1/auth/logout') {
      const auth = await authenticateRequest(req);
      if (auth.authenticated && auth.rawToken) {
        await revokeSession(auth.rawToken);
        await recordAuditEvent({
          userId: auth.user.id,
          action: 'USER_LOGOUT',
          entityType: 'USER',
          entityId: auth.user.id
        });
      }

      return jsonResponse(res, 200, { success: true, message: 'Logged out successfully.' }, {
        'Set-Cookie': clearSessionCookie()
      });
    }

    // ── EMPIRICAL BENCHMARKS & SCIENTIFIC TRAINING ──────────────────────────
    if (method === 'GET' && pathname === '/api/v1/benchmarks/financial') {
      const benchmarkStatus = await getBenchmarkStatus();
      return jsonResponse(res, 200, benchmarkStatus);
    }

    if (method === 'POST' && pathname === '/api/v1/benchmarks/financial/train') {
      const { trainAndValidateBenchmark } = await import('./services/financial/trainBenchmark.js');
      const result = await trainAndValidateBenchmark();
      return jsonResponse(res, 200, { success: true, benchmark: result });
    }

    // ── PUBLIC PACKAGES & TIERS CATALOG ─────────────────────────────────────
    if (method === 'GET' && pathname === '/api/v1/packages') {
      const packages = await listPackages();
      return jsonResponse(res, 200, { packages });
    }

    // ── PUBLIC SERVICES (ENGINES) CATALOG ───────────────────────────────────
    // The public website renders the engine index from the operator-owned
    // catalog rather than a hard-coded list, so disabling or renaming an engine
    // in the admin console is visible on the site immediately.
    if (method === 'GET' && pathname === '/api/v1/services') {
      const services = await listPublishedServices();
      return jsonResponse(res, 200, { services });
    }

    // ── AUTHENTICATION: CURRENT USER & TENANT CONTEXT ───────────────────────
    if (method === 'GET' && pathname === '/api/v1/auth/me') {
      const auth = await authenticateRequest(req);
      if (!auth.authenticated) {
        return jsonResponse(res, 401, { error: auth.error });
      }

      const tenantCheck = await resolveTenantContext(req, auth.user);
      if (tenantCheck.forbidden) {
        return jsonResponse(res, 403, { error: tenantCheck.error });
      }

      return jsonResponse(res, 200, {
        user: auth.user,
        tenant: tenantCheck.hasTenant ? tenantCheck.tenant : null,
        availableOrganizations: tenantCheck.hasTenant ? tenantCheck.tenant.availableOrganizations : []
      });
    }

    // ── PROTECTED ZONE: ALL ROUTES BELOW REQUIRE VALID AUTHENTICATION
    const auth = await authenticateRequest(req);
    if (!auth.authenticated) {
      return jsonResponse(res, 401, { error: auth.error });
    }

    // ── PLATFORM ADMINISTRATION (/api/v1/admin/*) ──────────────────────────
    // Does NOT require customer tenant context: strictly guarded by is_platform_admin = true
    if (pathname.startsWith('/api/v1/admin')) {
      const opCheck = await query('SELECT is_platform_admin FROM users WHERE id = $1', [auth.user.id]);
      if (!opCheck.rows[0]?.is_platform_admin) {
        return jsonResponse(res, 403, { error: 'Forbidden: Platform operator authorization required.' });
      }

      // 1. Overview
      if (method === 'GET' && pathname === '/api/v1/admin/overview') {
        const overview = await getPlatformOverview();
        return jsonResponse(res, 200, overview);
      }

      // 2. Tenants (List, Create, Update, Delete, Status)
      if (method === 'GET' && pathname === '/api/v1/admin/organizations') {
        const organizations = await listTenants();
        return jsonResponse(res, 200, { organizations });
      }

      if (method === 'POST' && pathname === '/api/v1/admin/organizations') {
        const body = await readJsonBody(req);
        try {
          const result = await createTenant({
            ...body,
            operatorId: auth.user.id,
            remoteIp: req.socket.remoteAddress
          });
          return jsonResponse(res, 201, { success: true, ...result });
        } catch (err) {
          return jsonResponse(res, 400, { error: err.message });
        }
      }

      if (method === 'PUT' && pathname.startsWith('/api/v1/admin/organizations/') && pathname.endsWith('/status')) {
        const parts = pathname.split('/');
        const targetOrgId = parts[parts.indexOf('organizations') + 1];
        const body = await readJsonBody(req);
        const { status, reason } = body;
        if (!['active', 'suspended', 'archived'].includes(status)) {
          return jsonResponse(res, 400, { error: 'Invalid organization status.' });
        }
        const updatedOrg = await updateTenantStatus(targetOrgId, status, reason, auth.user.id, req.socket.remoteAddress);
        if (!updatedOrg) return jsonResponse(res, 404, { error: 'Organization not found.' });
        return jsonResponse(res, 200, { success: true, organization: updatedOrg });
      }

      if (method === 'PUT' && pathname.startsWith('/api/v1/admin/organizations/') && !pathname.endsWith('/status') && !pathname.endsWith('/confirm-payment') && !pathname.endsWith('/subscription')) {
        const parts = pathname.split('/');
        const targetOrgId = parts[parts.indexOf('organizations') + 1];
        const body = await readJsonBody(req);
        try {
          const updated = await updateTenantDetails(targetOrgId, {
            ...body,
            operatorId: auth.user.id,
            remoteIp: req.socket.remoteAddress
          });
          return jsonResponse(res, 200, { success: true, organization: updated });
        } catch (err) {
          return jsonResponse(res, 400, { error: err.message });
        }
      }

      if (method === 'DELETE' && pathname.startsWith('/api/v1/admin/organizations/')) {
        const parts = pathname.split('/');
        const targetOrgId = parts[parts.indexOf('organizations') + 1];
        try {
          const result = await deleteTenant(targetOrgId, auth.user.id, req.socket.remoteAddress);
          return jsonResponse(res, 200, result);
        } catch (err) {
          return jsonResponse(res, 400, { error: err.message });
        }
      }

      // 3. Manual Subscriptions & Payments
      if (method === 'POST' && pathname.startsWith('/api/v1/admin/organizations/') && pathname.endsWith('/subscription')) {
        const parts = pathname.split('/');
        const targetOrgId = parts[parts.indexOf('organizations') + 1];
        const body = await readJsonBody(req);
        try {
          const sub = await addManualSubscription(targetOrgId, {
            ...body,
            operatorId: auth.user.id,
            remoteIp: req.socket.remoteAddress
          });
          return jsonResponse(res, 200, { success: true, subscription: sub });
        } catch (err) {
          return jsonResponse(res, 400, { error: err.message });
        }
      }

      if (method === 'POST' && pathname.startsWith('/api/v1/admin/organizations/') && pathname.endsWith('/confirm-payment')) {
        const parts = pathname.split('/');
        const targetOrgId = parts[parts.indexOf('organizations') + 1];
        const body = await readJsonBody(req);
        const { amount, referenceNumber, notes } = body;
        const sub = await confirmOrganizationPayment(targetOrgId, {
          amount,
          referenceNumber,
          notes,
          operatorId: auth.user.id,
          remoteIp: req.socket.remoteAddress
        });
        if (!sub) return jsonResponse(res, 404, { error: 'Organization subscription not found.' });
        return jsonResponse(res, 200, { success: true, subscription: sub });
      }

      // 4. Commercial Packages (List, Create, Update, Delete)
      if (method === 'GET' && pathname === '/api/v1/admin/packages') {
        const packages = await listPackages();
        return jsonResponse(res, 200, { packages });
      }

      if (method === 'POST' && pathname === '/api/v1/admin/packages') {
        const body = await readJsonBody(req);
        try {
          const pkg = await createCustomPackage({
            ...body,
            operatorId: auth.user.id,
            remoteIp: req.socket.remoteAddress
          });
          return jsonResponse(res, 201, { success: true, package: pkg });
        } catch (err) {
          return jsonResponse(res, 400, { error: err.message });
        }
      }

      if (method === 'PUT' && pathname.startsWith('/api/v1/admin/packages/')) {
        const parts = pathname.split('/');
        const packageId = parts[parts.indexOf('packages') + 1];
        const body = await readJsonBody(req);
        try {
          const pkg = await updatePackageDetails(packageId, {
            ...body,
            operatorId: auth.user.id,
            remoteIp: req.socket.remoteAddress
          });
          return jsonResponse(res, 200, { success: true, package: pkg });
        } catch (err) {
          return jsonResponse(res, 400, { error: err.message });
        }
      }

      if (method === 'DELETE' && pathname.startsWith('/api/v1/admin/packages/')) {
        const parts = pathname.split('/');
        const packageId = parts[parts.indexOf('packages') + 1];
        try {
          const result = await deleteCustomPackage(packageId, auth.user.id, req.socket.remoteAddress);
          return jsonResponse(res, 200, result);
        } catch (err) {
          return jsonResponse(res, 400, { error: err.message });
        }
      }

      // 5. Platform Services Catalog (List, Update)
      // The eight engines are operator-owned data: rename, re-order, re-write
      // the summary, or disable an engine. Every change is audit-logged and is
      // what the public website then serves.
      if (method === 'GET' && pathname === '/api/v1/admin/services') {
        const services = await listPlatformServices();
        return jsonResponse(res, 200, { services });
      }

      if (method === 'PUT' && pathname.startsWith('/api/v1/admin/services/')) {
        const serviceId = decodeURIComponent(
          pathname.slice('/api/v1/admin/services/'.length)
        );
        const body = await readJsonBody(req);
        try {
          const result = await updatePlatformService(serviceId, {
            ...body,
            operatorId: auth.user.id,
            remoteIp: req.socket.remoteAddress
          });
          return jsonResponse(res, 200, result);
        } catch (err) {
          return jsonResponse(res, 400, { error: err.message });
        }
      }

      // 6. Global Users (List, Create, Update, Delete)
      if (method === 'GET' && pathname === '/api/v1/admin/users') {
        const users = await listPlatformUsers();
        return jsonResponse(res, 200, { users });
      }

      if (method === 'POST' && pathname === '/api/v1/admin/users') {
        const body = await readJsonBody(req);
        try {
          const newUser = await createPlatformUser({
            ...body,
            operatorId: auth.user.id,
            remoteIp: req.socket.remoteAddress
          });
          return jsonResponse(res, 201, { success: true, user: newUser });
        } catch (err) {
          return jsonResponse(res, 400, { error: err.message });
        }
      }

      if (method === 'PUT' && pathname.startsWith('/api/v1/admin/users/')) {
        const parts = pathname.split('/');
        const userId = parts[parts.indexOf('users') + 1];
        const body = await readJsonBody(req);
        try {
          const updated = await updatePlatformUserDetails(userId, {
            ...body,
            operatorId: auth.user.id,
            remoteIp: req.socket.remoteAddress
          });
          return jsonResponse(res, 200, { success: true, user: updated });
        } catch (err) {
          return jsonResponse(res, 400, { error: err.message });
        }
      }

      if (method === 'DELETE' && pathname.startsWith('/api/v1/admin/users/')) {
        const parts = pathname.split('/');
        const userId = parts[parts.indexOf('users') + 1];
        try {
          const result = await deletePlatformUser(userId, auth.user.id, req.socket.remoteAddress);
          return jsonResponse(res, 200, result);
        } catch (err) {
          return jsonResponse(res, 400, { error: err.message });
        }
      }

      // 6. Inbound Leads & CRM
      if (method === 'GET' && pathname === '/api/v1/admin/leads') {
        const leads = await listLeadInquiries();
        return jsonResponse(res, 200, { leads });
      }

      if (method === 'PUT' && pathname.startsWith('/api/v1/admin/leads/') && pathname.endsWith('/status')) {
        const parts = pathname.split('/');
        const leadId = parts[parts.indexOf('leads') + 1];
        const body = await readJsonBody(req);
        try {
          const updated = await updateLeadStatus(leadId, body.status, body.notes, auth.user.id, req.socket.remoteAddress);
          return jsonResponse(res, 200, { success: true, lead: updated });
        } catch (err) {
          return jsonResponse(res, 400, { error: err.message });
        }
      }

      // 7. Security Audit Trail
      if (method === 'GET' && pathname === '/api/v1/admin/audit') {
        const auditLogs = await listPlatformAuditLogs();
        return jsonResponse(res, 200, { auditLogs });
      }

      // 8. Offline License Generator & Verifier
      if (method === 'POST' && pathname === '/api/v1/admin/licenses/issue') {
        const body = await readJsonBody(req);
        const { customerSlug, customerName, edition = 'PRIVATE_EDITION', tier = 'plan_enterprise', licensedCapabilities, maxMembers = 100 } = body;
        if (!customerSlug || !customerName) {
          return jsonResponse(res, 400, { error: 'customerSlug and customerName are required.' });
        }
        const signedLicense = licenseManager.generateSignedLicense({
          customerSlug,
          customerName,
          edition,
          tier,
          licensedCapabilities,
          maxMembers
        });
        await recordAuditEvent({
          userId: auth.user.id,
          action: 'OFFLINE_LICENSE_ISSUED',
          entityType: 'LICENSE',
          entityId: signedLicense.licenseId,
          details: { customerSlug, tier, edition }
        });
        return jsonResponse(res, 201, { success: true, license: signedLicense });
      }

      if (method === 'POST' && pathname === '/api/v1/admin/licenses/verify') {
        const body = await readJsonBody(req);
        const verification = licenseManager.verifyOfflineLicense(body);
        return jsonResponse(res, 200, verification);
      }

      // Reject any unhandled admin API endpoint immediately
      return jsonResponse(res, 404, { error: 'Admin API endpoint not found.' });
    }

    // ── PROTECTED CUSTOMER APPLICATION: REQUIRES RESOLVED TENANT CONTEXT ────
    const tenantRes = await resolveTenantContext(req, auth.user);
    if (!tenantRes.hasTenant) {
      const statusCode = tenantRes.forbidden ? 403 : 400;
      return jsonResponse(res, statusCode, { error: tenantRes.error });
    }

    const tenant = tenantRes.tenant;
    const orgId = tenant.organizationId; // GUARANTEED VALIDATED TENANT ID

    // ── ORGANIZATIONS LIST ──────────────────────────────────────────────────
    if (method === 'GET' && pathname === '/api/v1/organizations') {
      return jsonResponse(res, 200, {
        organizations: tenant.availableOrganizations,
        currentOrganizationId: orgId
      });
    }

    // ── CURRENT ORGANIZATION DETAILS ────────────────────────────────────────
    if (method === 'GET' && pathname === '/api/v1/organizations/current') {
      const orgQuery = await query(
        `SELECT id, slug, name_en, name_ar, industry_type, default_currency, timezone, status, created_at
         FROM organizations
         WHERE id = $1`,
        [orgId]
      );

      const branchCountRes = await query(
        `SELECT count(*) FROM branches WHERE organization_id = $1`,
        [orgId]
      );

      const memberCountRes = await query(
        `SELECT count(*) FROM memberships WHERE organization_id = $1 AND status = 'active'`,
        [orgId]
      );

      return jsonResponse(res, 200, {
        organization: orgQuery.rows[0],
        userRole: tenant.role,
        permissions: tenant.permissions,
        branchCount: parseInt(branchCountRes.rows[0].count, 10),
        memberCount: parseInt(memberCountRes.rows[0].count, 10)
      });
    }

    // ── MEMBERS LIST (SCOPED TO TENANT) ─────────────────────────────────────
    if (method === 'GET' && pathname === '/api/v1/organizations/members') {
      if (!hasPermission(tenant, 'member:view')) {
        return jsonResponse(res, 403, { error: 'Forbidden: Insufficient permissions to view members.' });
      }

      const membersRes = await query(
        `SELECT
           m.id AS membership_id,
           m.role,
           m.status,
           m.department,
           m.job_title,
           m.created_at,
           u.id AS user_id,
           u.email,
           u.name_en,
           u.name_ar,
           u.phone,
           b.id AS branch_id,
           b.name_en AS branch_name,
           b.name_ar AS branch_name_ar
         FROM memberships m
         JOIN users u ON u.id = m.user_id
         LEFT JOIN branches b ON b.id = m.branch_id
         WHERE m.organization_id = $1
         ORDER BY m.created_at ASC`,
        [orgId]
      );

      return jsonResponse(res, 200, {
        organizationId: orgId,
        members: membersRes.rows
      });
    }

    // ── PROVISION EMPLOYEE / ADD MEMBER (SCOPED TO TENANT, RBAC CHECK) ────────
    if (method === 'POST' && pathname === '/api/v1/organizations/members') {
      if (!hasPermission(tenant, 'member:invite') && tenant.role !== 'org_owner' && tenant.role !== 'org_admin') {
        return jsonResponse(res, 403, { error: 'Forbidden: Insufficient permissions to add employees.' });
      }

      const body = await readJsonBody(req);
      const {
        email,
        password,
        nameAr,
        nameEn,
        phone,
        role = 'analyst',
        department,
        jobTitle,
        branchId = null
      } = body;

      if (!email) {
        return jsonResponse(res, 400, { error: 'Employee email is required.' });
      }

      // Privilege escalation check: cannot assign org_owner unless you are org_owner
      if (role === 'org_owner' && tenant.role !== 'org_owner') {
        return jsonResponse(res, 403, { error: 'Forbidden: Cannot grant owner role.' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const resolvedNameEn = (nameEn && nameEn.trim()) || normalizedEmail.split('@')[0];
      const resolvedNameAr = (nameAr && nameAr.trim()) || resolvedNameEn;

      // Ensure password has at least 8 chars or generate a secure one
      let effectivePassword = password && password.trim().length >= 8
        ? password.trim()
        : 'Mikhlafi@' + crypto.randomBytes(4).toString('hex') + '!';

      const passwordHash = await hashPassword(effectivePassword);

      let targetUser = (await query('SELECT id, email, name_en, name_ar FROM users WHERE email = $1', [normalizedEmail])).rows[0];

      if (!targetUser) {
        // Create user with active verified status and specified credentials
        const newUserRes = await query(
          `INSERT INTO users (email, password_hash, name_en, name_ar, phone, is_verified, status)
           VALUES ($1, $2, $3, $4, $5, true, 'active')
           RETURNING id, email, name_en, name_ar, phone`,
          [normalizedEmail, passwordHash, resolvedNameEn, resolvedNameAr, phone ? phone.trim() : null]
        );
        targetUser = newUserRes.rows[0];
      } else {
        // User exists: update credentials and details if requested
        await query(
          `UPDATE users
           SET password_hash = $1,
               name_en = COALESCE($2, name_en),
               name_ar = COALESCE($3, name_ar),
               phone = COALESCE($4, phone),
               status = 'active',
               updated_at = now()
           WHERE id = $5`,
          [passwordHash, nameEn ? nameEn.trim() : null, nameAr ? nameAr.trim() : null, phone ? phone.trim() : null, targetUser.id]
        );
      }

      // Check duplicate membership in this organization
      const existing = await query(
        'SELECT id FROM memberships WHERE user_id = $1 AND organization_id = $2',
        [targetUser.id, orgId]
      );

      if (existing.rows.length > 0) {
        return jsonResponse(res, 409, { error: 'This user is already a registered member of this organization.' });
      }

      // Insert membership with department and job title
      const newMembership = await query(
        `INSERT INTO memberships (user_id, organization_id, role, branch_id, department, job_title, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'active')
         RETURNING id, user_id, organization_id, role, branch_id, department, job_title, status, created_at`,
        [targetUser.id, orgId, role, branchId, department ? department.trim() : null, jobTitle ? jobTitle.trim() : null]
      );

      await recordAuditEvent({
        organizationId: orgId,
        userId: auth.user.id,
        action: 'MEMBER_PROVISIONED',
        entityType: 'MEMBERSHIP',
        entityId: newMembership.rows[0].id,
        details: { targetEmail: normalizedEmail, role, department, jobTitle }
      });

      return jsonResponse(res, 201, {
        success: true,
        membership: newMembership.rows[0],
        credentials: {
          email: normalizedEmail,
          password: effectivePassword,
          nameAr: resolvedNameAr,
          nameEn: resolvedNameEn,
          role,
          department: department || null,
          jobTitle: jobTitle || null
        }
      });
    }

    // ── RESET EMPLOYEE PASSWORD (SCOPED TO TENANT) ───────────────────────────
    if (method === 'PATCH' && pathname.startsWith('/api/v1/organizations/members/') && pathname.endsWith('/password')) {
      if (!hasPermission(tenant, 'member:update') && tenant.role !== 'org_owner' && tenant.role !== 'org_admin') {
        return jsonResponse(res, 403, { error: 'Forbidden: Insufficient permissions to reset employee passwords.' });
      }

      const parts = pathname.split('/');
      const memberId = parts[parts.indexOf('members') + 1];
      const body = await readJsonBody(req);

      const memberRes = await query(
        'SELECT m.id, m.user_id, m.role, u.email FROM memberships m JOIN users u ON u.id = m.user_id WHERE m.id = $1 AND m.organization_id = $2',
        [memberId, orgId]
      );

      if (memberRes.rows.length === 0) {
        return jsonResponse(res, 404, { error: 'Member not found.' });
      }

      const targetMember = memberRes.rows[0];
      if (targetMember.role === 'org_owner' && tenant.role !== 'org_owner') {
        return jsonResponse(res, 403, { error: 'Forbidden: Only an organization owner can reset an owner password.' });
      }

      const effectivePassword = body.password && body.password.trim().length >= 8
        ? body.password.trim()
        : 'Mikhlafi@' + crypto.randomBytes(4).toString('hex') + '!';

      const newHash = await hashPassword(effectivePassword);

      await query(
        'UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2',
        [newHash, targetMember.user_id]
      );

      await recordAuditEvent({
        organizationId: orgId,
        userId: auth.user.id,
        action: 'MEMBER_PASSWORD_RESET',
        entityType: 'MEMBERSHIP',
        entityId: memberId,
        details: { targetEmail: targetMember.email, resetBy: auth.user.email }
      });

      return jsonResponse(res, 200, {
        success: true,
        email: targetMember.email,
        newPassword: effectivePassword
      });
    }

    // ── UPDATE MEMBER ROLE / PROFILE (SCOPED TO TENANT) ─────────────────────
    if (method === 'PATCH' && pathname.startsWith('/api/v1/organizations/members/') && !pathname.endsWith('/password')) {
      if (!hasPermission(tenant, 'member:update') && tenant.role !== 'org_owner' && tenant.role !== 'org_admin') {
        return jsonResponse(res, 403, { error: 'Forbidden: Insufficient permissions to update employee roles.' });
      }

      const parts = pathname.split('/');
      const memberId = parts[parts.indexOf('members') + 1];
      const body = await readJsonBody(req);
      const { role, department, jobTitle, branchId, status } = body;

      const memberRes = await query('SELECT * FROM memberships WHERE id = $1 AND organization_id = $2', [memberId, orgId]);
      if (memberRes.rows.length === 0) {
        return jsonResponse(res, 404, { error: 'Member not found.' });
      }

      const current = memberRes.rows[0];

      if (role === 'org_owner' && tenant.role !== 'org_owner') {
        return jsonResponse(res, 403, { error: 'Forbidden: Only an owner can assign the owner role.' });
      }

      if (current.role === 'org_owner' && role && role !== 'org_owner') {
        const ownerCount = await query("SELECT count(*) FROM memberships WHERE organization_id = $1 AND role = 'org_owner' AND status = 'active'", [orgId]);
        if (parseInt(ownerCount.rows[0].count, 10) <= 1) {
          return jsonResponse(res, 400, { error: 'Cannot remove or demote the last remaining organization owner.' });
        }
      }

      const updated = await query(
        `UPDATE memberships
         SET role = COALESCE($1, role),
             department = COALESCE($2, department),
             job_title = COALESCE($3, job_title),
             branch_id = COALESCE($4, branch_id),
             status = COALESCE($5, status),
             updated_at = now()
         WHERE id = $6 AND organization_id = $7
         RETURNING id, user_id, organization_id, role, department, job_title, branch_id, status, updated_at`,
        [
          role || null,
          department !== undefined ? department : null,
          jobTitle !== undefined ? jobTitle : null,
          branchId !== undefined ? branchId : null,
          status || null,
          memberId,
          orgId
        ]
      );

      await recordAuditEvent({
        organizationId: orgId,
        userId: auth.user.id,
        action: 'MEMBER_UPDATED',
        entityType: 'MEMBERSHIP',
        entityId: memberId,
        details: { role, department, jobTitle, status }
      });

      return jsonResponse(res, 200, {
        success: true,
        membership: updated.rows[0]
      });
    }

    // ── REMOVE MEMBER (SCOPED TO TENANT) ────────────────────────────────────
    if (method === 'DELETE' && pathname.startsWith('/api/v1/organizations/members/')) {
      if (!hasPermission(tenant, 'member:remove') && tenant.role !== 'org_owner' && tenant.role !== 'org_admin') {
        return jsonResponse(res, 403, { error: 'Forbidden: Insufficient permissions to remove employees.' });
      }

      const parts = pathname.split('/');
      const memberId = parts[parts.indexOf('members') + 1];

      const memberRes = await query('SELECT * FROM memberships WHERE id = $1 AND organization_id = $2', [memberId, orgId]);
      if (memberRes.rows.length === 0) {
        return jsonResponse(res, 404, { error: 'Member not found.' });
      }

      const target = memberRes.rows[0];

      if (target.user_id === auth.user.id && target.role === 'org_owner') {
        return jsonResponse(res, 400, { error: 'Cannot delete your own organization owner membership.' });
      }

      await query('DELETE FROM memberships WHERE id = $1 AND organization_id = $2', [memberId, orgId]);

      await recordAuditEvent({
        organizationId: orgId,
        userId: auth.user.id,
        action: 'MEMBER_REMOVED',
        entityType: 'MEMBERSHIP',
        entityId: memberId,
        details: { removedUserId: target.user_id, role: target.role }
      });

      return jsonResponse(res, 200, { success: true, message: 'Member removed successfully.' });
    }

    // ── TEAM COLLABORATION: CHANNELS (/api/v1/team/channels) ────────────────
    if (method === 'GET' && pathname === '/api/v1/team/channels') {
      let channelsRes = await query(
        `SELECT
           c.id, c.slug, c.name_ar, c.name_en, c.description_ar, c.description_en, c.is_default, c.created_at,
           (SELECT count(*) FROM team_messages WHERE channel_id = c.id)::int AS message_count,
           (SELECT max(created_at) FROM team_messages WHERE channel_id = c.id) AS last_message_at
         FROM team_channels c
         WHERE c.organization_id = $1
         ORDER BY c.is_default DESC, c.created_at ASC`,
        [orgId]
      );

      if (channelsRes.rows.length === 0) {
        // Seed default channels on the fly if not yet populated
        await query(
          `INSERT INTO team_channels (organization_id, slug, name_ar, name_en, description_ar, description_en, is_default)
           VALUES
             ($1, 'general', 'النقاشات العامة', 'General Discussion', 'القناة الرسمية لنقاشات وتوجيهات فريق العمل', 'Official channel for team updates and announcements', true),
             ($1, 'audit-finance', 'التدقيق والعمليات المالية', 'Audit & Financial Operations', 'متابعة ومراجعة القيود المشبوهة وفروقات الموردين ومطابقات الصرف', 'Reviewing audit variances, supplier pricing, and disbursement holds', false),
             ($1, 'tasks-reports', 'المهام والتقارير التنفيذية', 'Tasks & Executive Reports', 'مشاركة وتكليف المهام بين الموظفين ومتابعة إنجازها', 'Collaborative task assignments, executive briefs, and sign-offs', false)
           ON CONFLICT (organization_id, slug) DO NOTHING`,
          [orgId]
        );
        channelsRes = await query(
          `SELECT
             c.id, c.slug, c.name_ar, c.name_en, c.description_ar, c.description_en, c.is_default, c.created_at,
             0 AS message_count,
             null AS last_message_at
           FROM team_channels c
           WHERE c.organization_id = $1
           ORDER BY c.is_default DESC, c.created_at ASC`,
          [orgId]
        );
      }

      return jsonResponse(res, 200, {
        organizationId: orgId,
        channels: channelsRes.rows
      });
    }

    if (method === 'POST' && pathname === '/api/v1/team/channels') {
      if (tenant.role === 'viewer') {
        return jsonResponse(res, 403, { error: 'Forbidden: Insufficient permissions to create channels.' });
      }
      const body = await readJsonBody(req);
      const { nameAr, nameEn, descriptionAr, descriptionEn, slug } = body;
      if (!nameAr && !nameEn) {
        return jsonResponse(res, 400, { error: 'Channel name is required.' });
      }
      const safeSlug = (slug || nameEn || nameAr).toLowerCase().replace(/[^a-z0-9\u0621-\u064A_-]+/g, '-').replace(/^-|-$/g, '') || `chan-${Date.now().toString(36)}`;
      const newChan = await query(
        `INSERT INTO team_channels (organization_id, slug, name_ar, name_en, description_ar, description_en)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, slug, name_ar, name_en, description_ar, description_en, is_default, created_at`,
        [orgId, safeSlug, nameAr || nameEn, nameEn || nameAr, descriptionAr || null, descriptionEn || null]
      );
      return jsonResponse(res, 201, { success: true, channel: newChan.rows[0] });
    }

    // ── TEAM COLLABORATION: MESSAGES ─────────────────────────────────────────
    if (method === 'GET' && pathname.startsWith('/api/v1/team/channels/') && pathname.endsWith('/messages')) {
      const parts = pathname.split('/');
      const channelId = parts[parts.indexOf('channels') + 1];

      const chanCheck = await query('SELECT id FROM team_channels WHERE id = $1 AND organization_id = $2', [channelId, orgId]);
      if (chanCheck.rows.length === 0) {
        return jsonResponse(res, 404, { error: 'Channel not found.' });
      }

      const messagesRes = await query(
        `SELECT
           m.id,
           m.channel_id,
           m.content,
           m.attachment_type,
           m.attachment_data,
           m.created_at,
           m.user_id,
           u.email AS sender_email,
           u.name_ar AS sender_name_ar,
           u.name_en AS sender_name_en,
           mem.role AS sender_role,
           mem.job_title AS sender_job_title,
           mem.department AS sender_department
         FROM team_messages m
         JOIN users u ON u.id = m.user_id
         LEFT JOIN memberships mem ON mem.user_id = m.user_id AND mem.organization_id = $1
         WHERE m.channel_id = $2 AND m.organization_id = $1
         ORDER BY m.created_at ASC
         LIMIT 150`,
        [orgId, channelId]
      );

      return jsonResponse(res, 200, {
        channelId,
        messages: messagesRes.rows
      });
    }

    if (method === 'POST' && pathname.startsWith('/api/v1/team/channels/') && pathname.endsWith('/messages')) {
      const parts = pathname.split('/');
      const channelId = parts[parts.indexOf('channels') + 1];

      const chanCheck = await query('SELECT id FROM team_channels WHERE id = $1 AND organization_id = $2', [channelId, orgId]);
      if (chanCheck.rows.length === 0) {
        return jsonResponse(res, 404, { error: 'Channel not found.' });
      }

      const body = await readJsonBody(req);
      const { content, attachmentType = 'none', attachmentData = null } = body;

      if (!content || !content.trim()) {
        return jsonResponse(res, 400, { error: 'Message content cannot be empty.' });
      }

      const newMsg = await query(
        `INSERT INTO team_messages (organization_id, channel_id, user_id, content, attachment_type, attachment_data)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, channel_id, user_id, content, attachment_type, attachment_data, created_at`,
        [orgId, channelId, auth.user.id, content.trim(), attachmentType, attachmentData ? JSON.stringify(attachmentData) : null]
      );

      const senderInfo = await query(
        `SELECT
           u.email AS sender_email,
           u.name_ar AS sender_name_ar,
           u.name_en AS sender_name_en,
           mem.role AS sender_role,
           mem.job_title AS sender_job_title,
           mem.department AS sender_department
         FROM users u
         LEFT JOIN memberships mem ON mem.user_id = u.id AND mem.organization_id = $1
         WHERE u.id = $2`,
        [orgId, auth.user.id]
      );

      return jsonResponse(res, 201, {
        success: true,
        message: {
          ...newMsg.rows[0],
          ...senderInfo.rows[0]
        }
      });
    }

    // ── TEAM COLLABORATION: TASKS (/api/v1/team/tasks) ──────────────────────
    if (method === 'GET' && pathname === '/api/v1/team/tasks') {
      const statusFilter = parsedUrl.searchParams.get('status');
      const assignedFilter = parsedUrl.searchParams.get('assignedTo');

      let sql = `
        SELECT
          t.id,
          t.organization_id,
          t.title,
          t.description,
          t.assigned_to,
          t.created_by,
          t.priority,
          t.status,
          t.due_date,
          t.related_report_ref,
          t.created_at,
          t.updated_at,
          u_assignee.name_ar AS assignee_name_ar,
          u_assignee.name_en AS assignee_name_en,
          u_assignee.email AS assignee_email,
          mem_assignee.job_title AS assignee_job_title,
          mem_assignee.department AS assignee_department,
          u_creator.name_ar AS creator_name_ar,
          u_creator.name_en AS creator_name_en
        FROM team_tasks t
        LEFT JOIN users u_assignee ON u_assignee.id = t.assigned_to
        LEFT JOIN memberships mem_assignee ON mem_assignee.user_id = t.assigned_to AND mem_assignee.organization_id = $1
        LEFT JOIN users u_creator ON u_creator.id = t.created_by
        WHERE t.organization_id = $1
      `;
      const params = [orgId];

      if (statusFilter && statusFilter !== 'all') {
        params.push(statusFilter);
        sql += ` AND t.status = $${params.length}`;
      }
      if (assignedFilter) {
        params.push(assignedFilter);
        sql += ` AND t.assigned_to = $${params.length}`;
      }

      sql += ` ORDER BY CASE t.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END ASC, t.created_at DESC`;

      const tasksRes = await query(sql, params);
      return jsonResponse(res, 200, {
        organizationId: orgId,
        tasks: tasksRes.rows
      });
    }

    if (method === 'POST' && pathname === '/api/v1/team/tasks') {
      const body = await readJsonBody(req);
      const { title, description, assignedTo, priority = 'medium', status = 'pending', dueDate, relatedReportRef } = body;

      if (!title || !title.trim()) {
        return jsonResponse(res, 400, { error: 'Task title is required.' });
      }

      const newTaskRes = await query(
        `INSERT INTO team_tasks (organization_id, title, description, assigned_to, created_by, priority, status, due_date, related_report_ref)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, organization_id, title, description, assigned_to, created_by, priority, status, due_date, related_report_ref, created_at, updated_at`,
        [orgId, title.trim(), description || null, assignedTo || null, auth.user.id, priority, status, dueDate || null, relatedReportRef || null]
      );

      const task = newTaskRes.rows[0];

      // Auto-post notification into tasks-reports channel
      try {
        const taskChan = await query("SELECT id FROM team_channels WHERE organization_id = $1 AND slug = 'tasks-reports'", [orgId]);
        if (taskChan.rows.length > 0) {
          await query(
            `INSERT INTO team_messages (organization_id, channel_id, user_id, content, attachment_type, attachment_data)
             VALUES ($1, $2, $3, $4, 'task', $5)`,
            [
              orgId,
              taskChan.rows[0].id,
              auth.user.id,
              `تم إنشاء مهمة عمل جديدة: "${task.title}"`,
              JSON.stringify({
                taskId: task.id,
                title: task.title,
                priority: task.priority,
                status: task.status,
                dueDate: task.due_date,
                relatedReportRef: task.related_report_ref
              })
            ]
          );
        }
      } catch (postErr) {
        console.error('[Task Broadcast Notification Warning]:', postErr.message);
      }

      return jsonResponse(res, 201, { success: true, task });
    }

    if (method === 'PATCH' && pathname.startsWith('/api/v1/team/tasks/')) {
      const parts = pathname.split('/');
      const taskId = parts[parts.indexOf('tasks') + 1];
      const body = await readJsonBody(req);
      const { title, description, assignedTo, priority, status, dueDate, relatedReportRef } = body;

      const checkTask = await query('SELECT id FROM team_tasks WHERE id = $1 AND organization_id = $2', [taskId, orgId]);
      if (checkTask.rows.length === 0) {
        return jsonResponse(res, 404, { error: 'Task not found.' });
      }

      const updatedTaskRes = await query(
        `UPDATE team_tasks
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             assigned_to = COALESCE($3, assigned_to),
             priority = COALESCE($4, priority),
             status = COALESCE($5, status),
             due_date = COALESCE($6, due_date),
             related_report_ref = COALESCE($7, related_report_ref),
             updated_at = now()
         WHERE id = $8 AND organization_id = $9
         RETURNING *`,
        [
          title !== undefined ? title : null,
          description !== undefined ? description : null,
          assignedTo !== undefined ? assignedTo : null,
          priority || null,
          status || null,
          dueDate !== undefined ? dueDate : null,
          relatedReportRef !== undefined ? relatedReportRef : null,
          taskId,
          orgId
        ]
      );

      return jsonResponse(res, 200, { success: true, task: updatedTaskRes.rows[0] });
    }

    if (method === 'DELETE' && pathname.startsWith('/api/v1/team/tasks/')) {
      const parts = pathname.split('/');
      const taskId = parts[parts.indexOf('tasks') + 1];

      const deleted = await query('DELETE FROM team_tasks WHERE id = $1 AND organization_id = $2 RETURNING id', [taskId, orgId]);
      if (deleted.rows.length === 0) {
        return jsonResponse(res, 404, { error: 'Task not found.' });
      }
      return jsonResponse(res, 200, { success: true, message: 'Task deleted successfully.' });
    }

    // ── BRANCHES LIST (SCOPED TO TENANT) ────────────────────────────────────
    if (method === 'GET' && pathname === '/api/v1/branches') {
      const branchesRes = await query(
        `SELECT id, code, name_en, name_ar, city, is_main_hq, status, created_at
         FROM branches
         WHERE organization_id = $1
         ORDER BY is_main_hq DESC, name_en ASC`,
        [orgId]
      );

      return jsonResponse(res, 200, {
        organizationId: orgId,
        branches: branchesRes.rows
      });
    }

    // ── CREATE BRANCH (SCOPED TO TENANT) ────────────────────────────────────
    if (method === 'POST' && pathname === '/api/v1/branches') {
      if (!hasPermission(tenant, 'branch:manage')) {
        return jsonResponse(res, 403, { error: 'Forbidden: Insufficient permissions to manage branches.' });
      }

      const body = await readJsonBody(req);
      const { nameEn, nameAr, code, city, isMainHq = false } = body;

      if (!nameEn) {
        return jsonResponse(res, 400, { error: 'Branch name (nameEn) is required.' });
      }

      const branchRes = await query(
        `INSERT INTO branches (organization_id, code, name_en, name_ar, city, is_main_hq, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'active')
         RETURNING id, code, name_en, name_ar, city, is_main_hq, status, created_at`,
        [orgId, code || `BR-${Date.now().toString(36).toUpperCase()}`, nameEn, nameAr || nameEn, city || 'Riyadh', isMainHq]
      );

      return jsonResponse(res, 201, {
        success: true,
        branch: branchRes.rows[0]
      });
    }

    // ── TENANT DECISIONS LIST (SCOPED STRICTLY TO TENANT) ────────────────────
    if (method === 'GET' && pathname === '/api/v1/records/decisions') {
      const statusFilter = parsedUrl.searchParams.get('status');
      const result = await getTenantDecisions(orgId, statusFilter);
      return jsonResponse(res, 200, result);
    }

    // ── CREATE TENANT DECISION RECORD ───────────────────────────────────────
    if (method === 'POST' && pathname === '/api/v1/records/decisions') {
      const body = await readJsonBody(req);
      const { title, category, impactAmount = 0, riskLevel = 'MEDIUM', branchId = null } = body;

      if (!title || !category) {
        return jsonResponse(res, 400, { error: 'Title and category are required.' });
      }

      const decision = await createTenantDecision(orgId, { title, category, impactAmount, riskLevel, branchId });
      return jsonResponse(res, 201, {
        success: true,
        decision
      });
    }

    // ── GET SINGLE DECISION (IDOR PROTECTION TEST) ──────────────────────────
    if (method === 'GET' && pathname.startsWith('/api/v1/records/decisions/')) {
      const recordId = pathname.slice('/api/v1/records/decisions/'.length);
      const decision = await getTenantDecisionById(orgId, recordId);
      if (!decision) {
        return jsonResponse(res, 404, { error: 'Decision record not found.' });
      }
      return jsonResponse(res, 200, { decision });
    }

    // ── EXECUTE DECISION (RBAC & TENANT ENFORCED) ───────────────────────────
    if (method === 'POST' && pathname.includes('/execute') && pathname.startsWith('/api/v1/records/decisions/')) {
      if (!hasPermission(tenant, 'decision:execute')) {
        return jsonResponse(res, 403, { error: 'Forbidden: Insufficient permissions to execute decisions.' });
      }

      const parts = pathname.split('/');
      const recordId = parts[parts.indexOf('decisions') + 1];

      const executed = await executeTenantDecision(orgId, recordId, auth.user.id);
      if (!executed) {
        return jsonResponse(res, 404, { error: 'Decision record not found or inaccessible.' });
      }

      return jsonResponse(res, 200, {
        success: true,
        decision: executed
      });
    }

    // ── LIVE DASHBOARD SUMMARY (AGGREGATED STRICTLY FOR ACTIVE TENANT) ───────
    if (method === 'GET' && pathname === '/api/v1/dashboard/summary') {
      const pendingRes = await query(
        `SELECT
           count(*) AS pending_count,
           COALESCE(SUM(impact_amount), 0) AS pending_impact
         FROM tenant_decisions
         WHERE organization_id = $1 AND status = 'PENDING'`,
        [orgId]
      );

      const executedRes = await query(
        `SELECT
           count(*) AS executed_count,
           COALESCE(SUM(impact_amount), 0) AS executed_impact
         FROM tenant_decisions
         WHERE organization_id = $1 AND status = 'EXECUTED'`,
        [orgId]
      );

      const branchCountRes = await query(
        `SELECT count(*) FROM branches WHERE organization_id = $1`,
        [orgId]
      );

      const auditCountRes = await query(
        `SELECT count(*) FROM audit_logs WHERE organization_id = $1`,
        [orgId]
      );

      return jsonResponse(res, 200, {
        organization: {
          id: orgId,
          nameEn: tenant.orgNameEn,
          nameAr: tenant.orgNameAr,
          slug: tenant.orgSlug,
          currency: tenant.currency
        },
        user: {
          id: auth.user.id,
          nameEn: auth.user.nameEn,
          role: tenant.role
        },
        kpis: {
          pendingDecisionsCount: parseInt(pendingRes.rows[0].pending_count, 10),
          pendingImpactSAR: parseFloat(pendingRes.rows[0].pending_impact),
          executedDecisionsCount: parseInt(executedRes.rows[0].executed_count, 10),
          executedImpactSAR: parseFloat(executedRes.rows[0].executed_impact),
          totalBranches: parseInt(branchCountRes.rows[0].count, 10),
          auditEventsLogged: parseInt(auditCountRes.rows[0].count, 10)
        },
        databaseEngine: 'PostgreSQL 16 (Verified Relational Schema)',
        isolationStatus: 'STRICT_TENANT_ISOLATION_ENFORCED'
      });
    }

    // ── TENANT AUDIT LOGS (/api/v1/tenant/audit-logs) ─────────────────────────
    if (method === 'GET' && (pathname === '/api/v1/tenant/audit-logs' || pathname === '/api/tenant/audit-logs')) {
      const logsRes = await query(
        `SELECT id, action, entity_type, entity_id, details, ip_address, created_at
         FROM audit_logs
         WHERE organization_id = $1
         ORDER BY created_at DESC
         LIMIT 100`,
        [orgId]
      );
      return jsonResponse(res, 200, { success: true, logs: logsRes.rows });
    }

    // ── FINANCIAL LEAK DETECTION ENDPOINTS (/api/v1/records/financial-leaks) ─
    if (method === 'GET' && pathname === '/api/v1/records/financial-leaks') {
      const severity = parsedUrl.searchParams.get('severity') || 'all';
      const status = parsedUrl.searchParams.get('status') || 'all';
      const result = await getFinancialAnomalies(orgId, { severity, status });
      return jsonResponse(res, 200, result);
    }

    if (method === 'GET' && pathname === '/api/v1/records/financial-analytics') {
      const startDate = parsedUrl.searchParams.get('startDate');
      const endDate = parsedUrl.searchParams.get('endDate');
      const branchId = parsedUrl.searchParams.get('branchId');
      const result = await getFinancialAnalytics(orgId, { startDate, endDate, branchId });
      return jsonResponse(res, 200, result);
    }

    if (method === 'POST' && pathname.startsWith('/api/v1/records/financial-leaks/') && pathname.endsWith('/resolve')) {
      const parts = pathname.split('/');
      const anomalyId = parts[parts.indexOf('financial-leaks') + 1];
      const body = await readJsonBody(req);
      const { action = 'RESOLVE', notes = '' } = body;

      const updated = await resolveFinancialAnomaly(orgId, anomalyId, auth.user.id, action, notes);
      if (!updated) {
        return jsonResponse(res, 404, { error: 'Anomaly record not found or inaccessible.' });
      }
      return jsonResponse(res, 200, { success: true, anomaly: updated });
    }

    // ── CURRENT SUBSCRIPTION & BILLING (/api/v1/billing/current) ─────────────
    if (method === 'GET' && pathname === '/api/v1/billing/current') {
      const billing = await getTenantBillingDetails(orgId);
      return jsonResponse(res, 200, billing);
    }

    // ── RISK INTELLIGENCE (/api/v1/records/risks) ───────────────────────────
    if (method === 'GET' && pathname === '/api/v1/records/risks') {
      if (!hasCapability(tenant, 'risk-intelligence')) {
        return jsonResponse(res, 403, { error: 'Forbidden: Risk Intelligence is not enabled for your subscription tier. Upgrade required.' });
      }
      const category = parsedUrl.searchParams.get('category');
      const result = await getTenantRisks(orgId, category);
      return jsonResponse(res, 200, result);
    }

    if (method === 'POST' && pathname.startsWith('/api/v1/records/risks/') && pathname.endsWith('/mitigate')) {
      if (!hasCapability(tenant, 'risk-intelligence')) {
        return jsonResponse(res, 403, { error: 'Forbidden: Risk Intelligence is not enabled for your subscription tier. Upgrade required.' });
      }
      const parts = pathname.split('/');
      const riskId = parts[parts.indexOf('risks') + 1];

      const updated = await toggleRiskMitigation(orgId, riskId, auth.user.id);
      if (!updated) {
        return jsonResponse(res, 404, { error: 'Risk record not found.' });
      }
      return jsonResponse(res, 200, { success: true, risk: updated });
    }

    // ── PROJECT PERFORMANCE INTELLIGENCE (/api/v1/records/projects) ─────────
    if (method === 'GET' && pathname === '/api/v1/records/projects') {
      if (!hasCapability(tenant, 'project-intelligence')) {
        return jsonResponse(res, 403, { error: 'Forbidden: Project Intelligence is not enabled for your subscription tier. Upgrade required.' });
      }
      const health = parsedUrl.searchParams.get('health');
      const result = await getTenantProjects(orgId, health);
      return jsonResponse(res, 200, result);
    }

    if (method === 'POST' && pathname.startsWith('/api/v1/records/projects/') && pathname.endsWith('/verify-claims')) {
      if (!hasCapability(tenant, 'project-intelligence')) {
        return jsonResponse(res, 403, { error: 'Forbidden: Project Intelligence is not enabled for your subscription tier. Upgrade required.' });
      }
      const parts = pathname.split('/');
      const projectId = parts[parts.indexOf('projects') + 1];

      const updated = await verifyProjectClaims(orgId, projectId, auth.user.id);
      if (!updated) {
        return jsonResponse(res, 404, { error: 'Project not found.' });
      }
      return jsonResponse(res, 200, { success: true, project: updated });
    }

    // ── SUPPLIER INTELLIGENCE (/api/v1/records/suppliers) ───────────────────
    if (method === 'GET' && pathname === '/api/v1/records/suppliers') {
      if (!hasCapability(tenant, 'supplier-intelligence')) {
        return jsonResponse(res, 403, { error: 'Forbidden: Supplier Intelligence is not enabled for your subscription tier. Upgrade required.' });
      }
      const status = parsedUrl.searchParams.get('status');
      const result = await getTenantSuppliers(orgId, status);
      return jsonResponse(res, 200, result);
    }

    if (method === 'POST' && pathname.startsWith('/api/v1/records/suppliers/') && pathname.endsWith('/audit')) {
      if (!hasCapability(tenant, 'supplier-intelligence')) {
        return jsonResponse(res, 403, { error: 'Forbidden: Supplier Intelligence is not enabled for your subscription tier. Upgrade required.' });
      }
      const parts = pathname.split('/');
      const supplierId = parts[parts.indexOf('suppliers') + 1];

      const updated = await auditTenantSupplier(orgId, supplierId, auth.user.id);
      if (!updated) {
        return jsonResponse(res, 404, { error: 'Supplier not found.' });
      }
      return jsonResponse(res, 200, { success: true, supplier: updated });
    }

    // ── CUSTOMER INTELLIGENCE (/api/v1/records/customers) ───────────────────
    if (method === 'GET' && pathname === '/api/v1/records/customers') {
      if (!hasCapability(tenant, 'customer-intelligence')) {
        return jsonResponse(res, 403, { error: 'Forbidden: Customer Intelligence is not enabled for your subscription tier. Upgrade required.' });
      }
      const result = await getTenantCustomers(orgId);
      return jsonResponse(res, 200, result);
    }

    if (method === 'POST' && pathname.startsWith('/api/v1/records/customers/') && pathname.endsWith('/review')) {
      if (!hasCapability(tenant, 'customer-intelligence')) {
        return jsonResponse(res, 403, { error: 'Forbidden: Customer Intelligence is not enabled for your subscription tier. Upgrade required.' });
      }
      const parts = pathname.split('/');
      const customerId = parts[parts.indexOf('customers') + 1];

      const updated = await scheduleCustomerReview(orgId, customerId, auth.user.id);
      if (!updated) {
        return jsonResponse(res, 404, { error: 'Customer record not found.' });
      }
      return jsonResponse(res, 200, { success: true, customer: updated });
    }

    // ── DATA QUALITY INTELLIGENCE (/api/v1/data-quality) ─────────────────────
    if (method === 'GET' && pathname === '/api/v1/data-quality/audits') {
      if (!hasCapability(tenant, 'data-quality')) {
        return jsonResponse(res, 403, { error: 'Forbidden: Data Quality Intelligence is not enabled for your subscription tier. Upgrade required.' });
      }
      const result = await getDataQualityAudits(orgId);
      return jsonResponse(res, 200, result);
    }

    if (method === 'POST' && pathname === '/api/v1/data-quality/scan') {
      if (!hasCapability(tenant, 'data-quality')) {
        return jsonResponse(res, 403, { error: 'Forbidden: Data Quality Intelligence is not enabled for your subscription tier. Upgrade required.' });
      }
      const result = await runDataQualityScan(orgId, auth.user.id, auth.user.email);
      return jsonResponse(res, 200, result);
    }

    // ── AI BUSINESS ASSISTANT ENGINE (/api/v1/assistant/chat) ────────────────
    if (method === 'POST' && pathname === '/api/v1/assistant/chat') {
      if (!hasCapability(tenant, 'ai-assistant')) {
        return jsonResponse(res, 403, { error: 'Forbidden: AI Business Assistant is not enabled for your subscription tier. Upgrade required.' });
      }
      const body = await readJsonBody(req);
      const { query: queryText, locale = 'ar', personaConfig } = body || {};

      if (!queryText || !queryText.trim()) {
        return jsonResponse(res, 400, { error: 'Query text is required.' });
      }

      const result = await processAssistantQuery(orgId, auth.user.id, queryText, locale, personaConfig);
      return jsonResponse(res, 200, {
        success: true,
        ...result
      });
    }

    // ── ERP INTEGRATIONS (/api/v1/integrations) ─────────────────────────────
    if (method === 'GET' && pathname === '/api/v1/integrations') {
      const integrations = await getTenantIntegrations(orgId);
      return jsonResponse(res, 200, { organizationId: orgId, integrations });
    }

    if (method === 'POST' && pathname === '/api/v1/integrations') {
      const body = await readJsonBody(req);
      try {
        const integration = await createTenantIntegration(orgId, body || {});
        return jsonResponse(res, 201, { success: true, integration });
      } catch (err) {
        return jsonResponse(res, err.status || 400, { error: err.message });
      }
    }

    if (pathname.startsWith('/api/v1/integrations/')) {
      const parts = pathname.split('/');
      const targetIntegrationId = parts[4];
      const action = parts[5] || null;

      // POST /:id/sync — execute a real outbound connector read and ingest what returns
      if (method === 'POST' && action === 'sync') {
        const result = await syncTenantIntegration(orgId, targetIntegrationId);
        if (!result) return jsonResponse(res, 404, { error: 'Data source not found.' });
        return jsonResponse(res, 200, result);
      }

      // POST /:id/test — verify reachability and payload shape without ingesting
      if (method === 'POST' && action === 'test') {
        const body = await readJsonBody(req);
        const overrideConfig = body && body.config && typeof body.config === 'object' ? body.config : null;
        const probe = await testTenantIntegration(orgId, targetIntegrationId, overrideConfig);
        if (probe === null) return jsonResponse(res, 404, { error: 'Data source not found.' });
        return jsonResponse(res, 200, probe);
      }

      if (!action && method === 'PUT') {
        const body = await readJsonBody(req);
        try {
          const integration = await updateTenantIntegration(orgId, targetIntegrationId, body || {});
          if (!integration) return jsonResponse(res, 404, { error: 'Data source not found.' });
          return jsonResponse(res, 200, { success: true, integration });
        } catch (err) {
          return jsonResponse(res, err.status || 400, { error: err.message });
        }
      }

      if (!action && method === 'DELETE') {
        const removed = await deleteTenantIntegration(orgId, targetIntegrationId);
        if (!removed) return jsonResponse(res, 404, { error: 'Data source not found.' });
        return jsonResponse(res, 200, { success: true });
      }

      return jsonResponse(res, 404, { error: 'Integration action not found' });
    }

    // ── AUTOMATED WORKFLOWS (/api/v1/workflows) ─────────────────────────────
    if (method === 'GET' && pathname === '/api/v1/workflows') {
      const workflows = await getTenantWorkflows(orgId);
      return jsonResponse(res, 200, { organizationId: orgId, workflows });
    }

    if (method === 'POST' && pathname.startsWith('/api/v1/workflows/') && pathname.endsWith('/toggle')) {
      const parts = pathname.split('/');
      const workflowId = parts[parts.indexOf('workflows') + 1];
      const toggled = await toggleTenantWorkflow(orgId, workflowId);
      if (!toggled) return jsonResponse(res, 404, { error: 'Workflow policy not found.' });
      return jsonResponse(res, 200, { success: true, workflow: toggled });
    }

    if (method === 'POST' && pathname.startsWith('/api/v1/workflows/') && pathname.endsWith('/execute')) {
      const parts = pathname.split('/');
      const workflowId = parts[parts.indexOf('workflows') + 1];
      const body = await readJsonBody(req);
      try {
        const executionResult = await executeTenantWorkflow(orgId, workflowId, {
          triggeredBy: auth.user.email,
          triggerType: body.triggerType || 'MANUAL_EXECUTIVE_TRIGGER',
          dryRun: Boolean(body.dryRun),
          idempotencyKey: body.idempotencyKey,
          conditions: body.conditions || {},
          userRole: tenant.role || 'org_owner'
        });
        return jsonResponse(res, 200, executionResult);
      } catch (err) {
        return jsonResponse(res, 400, { error: err.message });
      }
    }

    // ── REAL-TIME ALERTS (/api/v1/alerts) ───────────────────────────────────
    if (method === 'GET' && pathname === '/api/v1/alerts') {
      const alerts = await getTenantAlerts(orgId);
      return jsonResponse(res, 200, { organizationId: orgId, alerts });
    }

    if (method === 'POST' && pathname.startsWith('/api/v1/alerts/') && pathname.endsWith('/acknowledge')) {
      const parts = pathname.split('/');
      const alertId = parts[parts.indexOf('alerts') + 1];
      const updated = await toggleAlertAcknowledge(orgId, alertId, auth.user.id);
      if (!updated) return jsonResponse(res, 404, { error: 'Alert not found.' });
      return jsonResponse(res, 200, { success: true, alert: updated });
    }

    // ── WORKSPACE SETTINGS (/api/v1/organization/settings) ──────────────────
    if (method === 'GET' && pathname === '/api/v1/organization/settings') {
      const settings = await getTenantSettings(orgId);
      return jsonResponse(res, 200, settings);
    }

    if (method === 'PUT' && pathname === '/api/v1/organization/settings') {
      const body = await readJsonBody(req);
      try {
        const settings = await updateTenantSettings(orgId, body);
        return jsonResponse(res, 200, { success: true, settings });
      } catch (err) {
        return jsonResponse(res, 400, { error: err.message });
      }
    }

    // ── ERP JOURNAL ENTRY INGESTION (/api/v1/ingest/journal-entries) ────────
    if (method === 'POST' && pathname === '/api/v1/ingest/journal-entries') {
      const body = await readJsonBody(req);
      const { entries, batchId } = body;
      if (!entries || !Array.isArray(entries) || entries.length === 0) {
        return jsonResponse(res, 400, { error: 'entries must be a non-empty array of journal records.' });
      }
      try {
        const result = await ingestJournalEntries(orgId, entries, batchId);
        return jsonResponse(res, 201, result);
      } catch (err) {
        return jsonResponse(res, 400, { error: err.message });
      }
    }

    // ── CSV EXPORT INGESTION (/api/v1/ingest/journal-csv) ───────────────────
    // Lets a tenant connect any system by uploading a spreadsheet/CSV export.
    // RFC-4180 parsing and row-level validation run server-side; rejected rows are
    // reported with their line number rather than being silently coerced.
    if (method === 'POST' && pathname === '/api/v1/ingest/journal-csv') {
      const body = await readJsonBody(req);
      const { csv, batchId } = body;
      if (!csv || typeof csv !== 'string' || !csv.trim()) {
        return jsonResponse(res, 400, { error: 'csv must be a non-empty string of RFC-4180 encoded data.' });
      }
      if (csv.length > 10 * 1024 * 1024) {
        return jsonResponse(res, 413, { error: 'CSV exceeds the 10 MB ingestion limit.' });
      }
      try {
        const result = await ingestJournalEntries(orgId, csv, batchId);
        return jsonResponse(res, 201, result);
      } catch (err) {
        return jsonResponse(res, 400, { error: err.message });
      }
    }

    // 404 for unknown API paths
    return jsonResponse(res, 404, { error: 'API endpoint not found', requested: `${method} ${pathname}` });
  } catch (err) {
    console.error(`[API Internal Error] ${method} ${pathname}:`, err);
    return jsonResponse(res, 500, {
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message
    });
  }
}
