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
      const dbCheck = await query('SELECT count(*) FROM roles');
      return jsonResponse(res, 200, {
        status: 'healthy',
        database: 'postgresql_connected',
        rolesConfigured: parseInt(dbCheck.rows[0].count, 10),
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

      // 5. Global Users (List, Create, Update, Delete)
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
           m.created_at,
           u.id AS user_id,
           u.email,
           u.name_en,
           u.name_ar,
           b.name_en AS branch_name
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

    // ── ADD MEMBER (SCOPED TO TENANT, RBAC CHECK) ───────────────────────────
    if (method === 'POST' && pathname === '/api/v1/organizations/members') {
      if (!hasPermission(tenant, 'member:invite')) {
        return jsonResponse(res, 403, { error: 'Forbidden: Insufficient permissions to invite members.' });
      }

      const body = await readJsonBody(req);
      const { email, role = 'viewer', branchId = null } = body;

      if (!email) {
        return jsonResponse(res, 400, { error: 'Member email is required.' });
      }

      // Privilege escalation check: cannot assign org_owner unless you are org_owner
      if (role === 'org_owner' && tenant.role !== 'org_owner') {
        return jsonResponse(res, 403, { error: 'Forbidden: Cannot grant owner role.' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      let targetUser = (await query('SELECT id FROM users WHERE email = $1', [normalizedEmail])).rows[0];

      if (!targetUser) {
        // Create user with temporary password hash
        const tempHash = await hashPassword('MikhlafiTemp2026!');
        const newUserRes = await query(
          `INSERT INTO users (email, password_hash, name_en, name_ar, is_verified, status)
           VALUES ($1, $2, $3, $4, false, 'active')
           RETURNING id`,
          [normalizedEmail, tempHash, normalizedEmail.split('@')[0], normalizedEmail.split('@')[0]]
        );
        targetUser = newUserRes.rows[0];
      }

      // Check duplicate membership
      const existing = await query(
        'SELECT id FROM memberships WHERE user_id = $1 AND organization_id = $2',
        [targetUser.id, orgId]
      );

      if (existing.rows.length > 0) {
        return jsonResponse(res, 409, { error: 'User is already a member of this organization.' });
      }

      // Insert membership
      const newMembership = await query(
        `INSERT INTO memberships (user_id, organization_id, role, branch_id, status)
         VALUES ($1, $2, $3, $4, 'active')
         RETURNING id, user_id, organization_id, role, status, created_at`,
        [targetUser.id, orgId, role, branchId]
      );

      await recordAuditEvent({
        organizationId: orgId,
        userId: auth.user.id,
        action: 'MEMBER_INVITED',
        entityType: 'MEMBERSHIP',
        entityId: newMembership.rows[0].id,
        details: { targetEmail: normalizedEmail, role }
      });

      return jsonResponse(res, 201, {
        success: true,
        membership: newMembership.rows[0]
      });
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
      const { query: queryText, locale = 'ar' } = body;

      if (!queryText || !queryText.trim()) {
        return jsonResponse(res, 400, { error: 'Query text is required.' });
      }

      const result = await processAssistantQuery(orgId, auth.user.id, queryText, locale);
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

    if (method === 'POST' && pathname.startsWith('/api/v1/integrations/') && pathname.endsWith('/sync')) {
      const parts = pathname.split('/');
      const integrationId = parts[parts.indexOf('integrations') + 1];
      const result = await syncTenantIntegration(orgId, integrationId);
      if (!result) return jsonResponse(res, 404, { error: 'Integration source not found.' });
      return jsonResponse(res, 200, result);
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
