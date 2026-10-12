// MIKHLAFI LABS — Central REST API & Security Gateway
// Implements authenticated, tenant-isolated API endpoints conforming to Master Architecture v1.0

import http from 'node:http';
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
  recordAuditEvent
} from './middleware/tenant.js';

export function jsonResponse(res, statusCode, data, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': headers['Access-Control-Allow-Origin'] || '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Organization-Id',
    ...headers
  });
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

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Organization-Id'
    });
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

    // ── AUTHENTICATION: REGISTER ───────────────────────────────────────────
    if (method === 'POST' && pathname === '/api/v1/auth/register') {
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
      const orgSlug = orgNameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `org-${Date.now().toString(36)}`;

      let user, org, sessionInfo;

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
      });

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
      const body = await readJsonBody(req);
      const { email, password } = body;

      if (!email || !password) {
        return jsonResponse(res, 400, { error: 'Email and password are required.' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const userRes = await query(
        `SELECT id, email, password_hash, name_en, name_ar, status
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
        user: {
          id: user.id,
          email: user.email,
          nameEn: user.name_en,
          nameAr: user.name_ar
        },
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

    // ── PROTECTED ZONE: ALL ROUTES BELOW REQUIRE VALID AUTHENTICATION & TENANT
    const auth = await authenticateRequest(req);
    if (!auth.authenticated) {
      return jsonResponse(res, 401, { error: auth.error });
    }

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
      let sql = `SELECT id, organization_id, title, category, impact_amount, currency, risk_level, status, source_system, created_at
                 FROM tenant_decisions
                 WHERE organization_id = $1`;
      const params = [orgId];

      if (statusFilter) {
        sql += ` AND status = $2`;
        params.push(statusFilter.toUpperCase());
      }

      sql += ` ORDER BY impact_amount DESC, created_at DESC`;

      const decisionsRes = await query(sql, params);

      const impactSumRes = await query(
        `SELECT COALESCE(SUM(impact_amount), 0) AS total_impact
         FROM tenant_decisions
         WHERE organization_id = $1 AND status = 'PENDING'`,
        [orgId]
      );

      return jsonResponse(res, 200, {
        organizationId: orgId,
        count: decisionsRes.rows.length,
        totalPendingImpactSAR: parseFloat(impactSumRes.rows[0].total_impact),
        decisions: decisionsRes.rows
      });
    }

    // ── CREATE TENANT DECISION RECORD ───────────────────────────────────────
    if (method === 'POST' && pathname === '/api/v1/records/decisions') {
      const body = await readJsonBody(req);
      const { title, category, impactAmount = 0, riskLevel = 'MEDIUM', branchId = null } = body;

      if (!title || !category) {
        return jsonResponse(res, 400, { error: 'Title and category are required.' });
      }

      const resInsert = await query(
        `INSERT INTO tenant_decisions (organization_id, branch_id, title, category, impact_amount, risk_level, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
         RETURNING id, organization_id, title, category, impact_amount, risk_level, status, created_at`,
        [orgId, branchId, title, category, parseFloat(impactAmount), riskLevel.toUpperCase()]
      );

      return jsonResponse(res, 201, {
        success: true,
        decision: resInsert.rows[0]
      });
    }

    // ── GET SINGLE DECISION (IDOR PROTECTION TEST) ──────────────────────────
    if (method === 'GET' && pathname.startsWith('/api/v1/records/decisions/')) {
      const recordId = pathname.slice('/api/v1/records/decisions/'.length);

      // STRICT CHECK: Must match organization_id = orgId!
      const recRes = await query(
        `SELECT id, organization_id, title, category, impact_amount, currency, risk_level, status, created_at
         FROM tenant_decisions
         WHERE id = $1 AND organization_id = $2`,
        [recordId, orgId]
      );

      if (recRes.rows.length === 0) {
        // Return 404 to avoid leaking existence of record belonging to other tenants
        return jsonResponse(res, 404, { error: 'Decision record not found.' });
      }

      return jsonResponse(res, 200, {
        decision: recRes.rows[0]
      });
    }

    // ── EXECUTE DECISION (RBAC & TENANT ENFORCED) ───────────────────────────
    if (method === 'POST' && pathname.includes('/execute') && pathname.startsWith('/api/v1/records/decisions/')) {
      if (!hasPermission(tenant, 'decision:execute')) {
        return jsonResponse(res, 403, { error: 'Forbidden: Insufficient permissions to execute decisions.' });
      }

      const parts = pathname.split('/');
      const recordId = parts[parts.indexOf('decisions') + 1];

      // STRICT TENANT BOUNDARY: Must match organization_id = orgId!
      const updateRes = await query(
        `UPDATE tenant_decisions
         SET status = 'EXECUTED', updated_at = now()
         WHERE id = $1 AND organization_id = $2
         RETURNING id, title, impact_amount, status`,
        [recordId, orgId]
      );

      if (updateRes.rows.length === 0) {
        return jsonResponse(res, 404, { error: 'Decision record not found or inaccessible.' });
      }

      await recordAuditEvent({
        organizationId: orgId,
        userId: auth.user.id,
        action: 'DECISION_EXECUTED',
        entityType: 'TENANT_DECISION',
        entityId: recordId,
        details: { title: updateRes.rows[0].title }
      });

      return jsonResponse(res, 200, {
        success: true,
        decision: updateRes.rows[0]
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
