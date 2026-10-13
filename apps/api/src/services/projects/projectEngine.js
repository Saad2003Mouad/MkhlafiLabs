// MIKHLAFI LABS — Service 04: Project Performance & Contract Intelligence Engine
// Domain service for capital budgets, earned value tracking, and contractor claims auditing

import { query } from '../../db/connection.js';
import { recordAuditEvent } from '../../middleware/tenant.js';

export async function getTenantProjects(orgId, healthFilter = null) {
  let sql = `SELECT id, code, name_en, name_ar, client_name, budget_total_sar, spent_sar, variance_sar,
                    planned_progress, actual_progress, health, change_orders_count, contractor_claims_audited
             FROM tenant_projects
             WHERE organization_id = $1`;
  const params = [orgId];

  if (healthFilter && healthFilter !== 'all') {
    sql += ` AND health = $2`;
    params.push(healthFilter);
  }

  sql += ` ORDER BY budget_total_sar DESC`;

  const projectsRes = await query(sql, params);

  const totalBudget = projectsRes.rows.reduce(
    (sum, p) => sum + parseFloat(p.budget_total_sar || 0),
    0
  );

  return {
    organizationId: orgId,
    count: projectsRes.rows.length,
    totalCapitalBudgetSAR: totalBudget,
    projects: projectsRes.rows
  };
}

export async function verifyProjectClaims(orgId, projectId, userId) {
  const updateRes = await query(
    `UPDATE tenant_projects
     SET contractor_claims_audited = true, updated_at = now()
     WHERE id = $1 AND organization_id = $2
     RETURNING *`,
    [projectId, orgId]
  );

  if (updateRes.rows.length === 0) {
    return null;
  }

  await recordAuditEvent({
    organizationId: orgId,
    userId,
    action: 'PROJECT_CLAIMS_VERIFIED',
    entityType: 'TENANT_PROJECT',
    entityId: projectId,
    details: { code: updateRes.rows[0].code }
  });

  return updateRes.rows[0];
}
