import { query } from '../../db/connection.js';
import { tenantManager } from '../../db/tenantManager.js';

export async function getPlatformOverview() {
  const orgStats = await query(
    `SELECT
       COUNT(*) AS total_orgs,
       COUNT(CASE WHEN status = 'active' THEN 1 END) AS active_orgs,
       COUNT(CASE WHEN status = 'suspended' THEN 1 END) AS suspended_orgs
     FROM organizations`
  );
  const userStats = await query(`SELECT COUNT(*) AS total_users FROM users`);
  const subStats = await query(
    `SELECT package_id, COUNT(*) AS count
     FROM organization_subscriptions
     GROUP BY package_id`
  );
  const leaksStats = await query(
    `SELECT
       COUNT(*) AS total_leaks,
       COALESCE(SUM(flagged_amount), 0) AS total_leakage_sar
     FROM financial_anomalies`
  );
  const leadsStats = await query(
    `SELECT COUNT(*) AS total_leads, COUNT(CASE WHEN status = 'NEW' THEN 1 END) AS new_leads FROM lead_inquiries`
  );

  return {
    organizations: {
      total: parseInt(orgStats.rows[0]?.total_orgs || '0', 10),
      active: parseInt(orgStats.rows[0]?.active_orgs || '0', 10),
      suspended: parseInt(orgStats.rows[0]?.suspended_orgs || '0', 10)
    },
    users: { total: parseInt(userStats.rows[0]?.total_users || '0', 10) },
    subscriptions: subStats.rows,
    financialIntelligence: {
      totalCases: parseInt(leaksStats.rows[0]?.total_leaks || '0', 10),
      totalFlaggedSAR: parseFloat(leaksStats.rows[0]?.total_leakage_sar || '0')
    },
    leads: {
      total: parseInt(leadsStats.rows[0]?.total_leads || '0', 10),
      new: parseInt(leadsStats.rows[0]?.new_leads || '0', 10)
    },
    platformStatus: 'OPERATIONAL'
  };
}

export async function listTenants() {
  const orgsRes = await query(
    `SELECT
       o.id, o.slug, o.name_en, o.name_ar, o.status, o.created_at,
       s.package_id, s.status AS subscription_status,
       COUNT(DISTINCT m.id) AS member_count,
       COUNT(DISTINCT b.id) AS branch_count
     FROM organizations o
     LEFT JOIN organization_subscriptions s ON s.organization_id = o.id
     LEFT JOIN memberships m ON m.organization_id = o.id
     LEFT JOIN branches b ON b.organization_id = o.id
     GROUP BY o.id, s.package_id, s.status
     ORDER BY o.created_at DESC`
  );

  return orgsRes.rows;
}

export async function updateTenantStatus(targetOrgId, status, reason, operatorId, remoteIp) {
  const updateOrg = await query(
    `UPDATE organizations SET status = $1, updated_at = now() WHERE id = $2 RETURNING id, name_en, status`,
    [status, targetOrgId]
  );

  if (updateOrg.rows.length === 0) {
    return null;
  }

  if (status === 'suspended') {
    try {
      await tenantManager.suspendTenantEnvironment(targetOrgId);
    } catch (e) {
      console.error('[Tenant Suspension Warning]:', e.message);
    }
  }

  await query(
    `INSERT INTO platform_audit_logs (operator_id, action, target_tenant_id, details, ip_address)
     VALUES ($1, 'ORGANIZATION_STATUS_CHANGED', $2, $3, $4)`,
    [operatorId, targetOrgId, JSON.stringify({ newStatus: status, reason }), remoteIp]
  );

  return updateOrg.rows[0];
}

export async function listPlatformUsers(limit = 100) {
  const usersRes = await query(
    `SELECT id, email, name_en, name_ar, is_verified, is_platform_admin, status, created_at
     FROM users ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );

  return usersRes.rows;
}

export async function listLeadInquiries(limit = 100) {
  const leadsRes = await query(
    `SELECT * FROM lead_inquiries ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );

  return leadsRes.rows;
}

export async function listPlatformAuditLogs(limit = 100) {
  const auditRes = await query(
    `SELECT a.*, u.email AS operator_email
     FROM platform_audit_logs a
     LEFT JOIN users u ON u.id = a.operator_id
     ORDER BY a.created_at DESC LIMIT $1`,
    [limit]
  );

  return auditRes.rows;
}

export async function confirmOrganizationPayment(orgId, { amount = 0, referenceNumber = 'MANUAL-WIRE', notes = '', operatorId, remoteIp }) {
  const subUpdate = await query(
    `UPDATE organization_subscriptions
     SET status = 'active',
         current_period_end = now() + interval '365 days',
         updated_at = now()
     WHERE organization_id = $1
     RETURNING id, package_id, status, current_period_end`,
    [orgId]
  );

  await query(
    `INSERT INTO platform_audit_logs (operator_id, action, target_tenant_id, details, ip_address)
     VALUES ($1, 'MANUAL_PAYMENT_CONFIRMED', $2, $3, $4)`,
    [operatorId, orgId, JSON.stringify({ amount, referenceNumber, notes, confirmedAt: new Date().toISOString() }), remoteIp]
  );

  return subUpdate.rows[0] || null;
}
