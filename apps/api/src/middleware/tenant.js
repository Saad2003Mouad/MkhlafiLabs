// MIKHLAFI LABS — Multi-Tenancy & RBAC Enforcement Middleware
// Enforces strict server-side tenant isolation, active membership verification, and permission checks

import { parseCookies, verifySession } from '../auth/sessions.js';
import { query } from '../db/connection.js';

export async function authenticateRequest(req) {
  const cookies = parseCookies(req.headers.cookie);
  let rawToken = cookies.ml_session;

  if (!rawToken && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      rawToken = authHeader.slice(7).trim();
    }
  }

  if (!rawToken) {
    return { authenticated: false, error: 'Authentication required. No session token provided.' };
  }

  const result = await verifySession(rawToken);
  if (!result) {
    return { authenticated: false, error: 'Invalid, revoked, or expired session.' };
  }

  return {
    authenticated: true,
    user: result.user,
    session: result.session,
    rawToken
  };
}

export async function resolveTenantContext(req, user) {
  // 1. Fetch all active memberships for this user
  const membershipsRes = await query(
    `SELECT
       m.id AS membership_id,
       m.organization_id,
       m.role,
       m.branch_id,
       m.status AS membership_status,
       o.slug AS org_slug,
       o.name_en AS org_name_en,
       o.name_ar AS org_name_ar,
       o.industry_type,
       o.default_currency,
       o.default_locale,
       o.timezone,
       o.status AS org_status
     FROM memberships m
     JOIN organizations o ON o.id = m.organization_id
     WHERE m.user_id = $1
       AND m.status = 'active'
       AND o.status = 'active'
     ORDER BY m.created_at ASC`,
    [user.id]
  );

  if (membershipsRes.rows.length === 0) {
    return {
      hasTenant: false,
      error: 'User has no active organization memberships.'
    };
  }

  const availableOrgs = membershipsRes.rows.map(row => ({
    id: row.organization_id,
    slug: row.org_slug,
    nameEn: row.org_name_en,
    nameAr: row.org_name_ar,
    role: row.role,
    currency: row.default_currency,
    timezone: row.timezone
  }));

  // 2. Identify the requested organization context
  // Header X-Organization-Id can request a specific tenant if user has access to multiple
  const requestedOrgId = req.headers['x-organization-id'];

  let activeMembership = null;

  if (requestedOrgId) {
    activeMembership = membershipsRes.rows.find(m => m.organization_id === requestedOrgId);
    if (!activeMembership) {
      // SECURITY GATE: Deny cross-tenant access attempt immediately!
      return {
        hasTenant: false,
        forbidden: true,
        error: 'Forbidden: You do not have an active membership in the requested organization.'
      };
    }
  } else {
    // Default to first active membership
    activeMembership = membershipsRes.rows[0];
  }

  // 3. Resolve permissions for the active role
  const permissionsRes = await query(
    `SELECT permission_id
     FROM role_permissions
     WHERE role_id = $1`,
    [activeMembership.role]
  );

  const permissions = permissionsRes.rows.map(r => r.permission_id);

  // 4. Resolve enabled service capabilities for this tenant from active subscription
  const capabilitiesRes = await query(
    `SELECT pc.capability_id
     FROM organization_subscriptions os
     JOIN package_capabilities pc ON pc.package_id = os.package_id
     WHERE os.organization_id = $1 AND os.status = 'active'`,
    [activeMembership.organization_id]
  );

  let capabilities = capabilitiesRes.rows.map(r => r.capability_id);
  if (capabilities.length === 0) {
    // Default fallback: Starter suite capabilities
    capabilities = ['financial-intelligence', 'executive-decisions', 'data-quality'];
  }

  return {
    hasTenant: true,
    tenant: {
      organizationId: activeMembership.organization_id,
      membershipId: activeMembership.membership_id,
      orgSlug: activeMembership.org_slug,
      orgNameEn: activeMembership.org_name_en,
      orgNameAr: activeMembership.org_name_ar,
      currency: activeMembership.default_currency,
      timezone: activeMembership.timezone,
      role: activeMembership.role,
      branchId: activeMembership.branch_id,
      permissions,
      capabilities,
      availableOrganizations: availableOrgs
    }
  };
}

export function hasPermission(tenantContext, permission) {
  if (!tenantContext || !tenantContext.permissions) return false;
  return tenantContext.permissions.includes(permission);
}

export function hasCapability(tenantContext, capabilityId) {
  if (!tenantContext || !tenantContext.capabilities) return false;
  return tenantContext.capabilities.includes(capabilityId);
}

export async function recordAuditEvent({
  organizationId = null,
  userId = null,
  action,
  entityType,
  entityId = null,
  details = {},
  ipAddress = null,
  userAgent = null
}) {
  try {
    await query(
      `INSERT INTO audit_logs (organization_id, user_id, action, entity_type, entity_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        organizationId,
        userId,
        action,
        entityType,
        entityId,
        JSON.stringify(details),
        ipAddress,
        userAgent
      ]
    );
  } catch (err) {
    console.error('[Audit Log Error]:', err.message);
  }
}
