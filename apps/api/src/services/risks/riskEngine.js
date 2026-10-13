// MIKHLAFI LABS — Service 03: Predictive Risk Intelligence Engine
// Domain service for risk registry, probability matrices, financial exposure, and mitigation tracking

import { query } from '../../db/connection.js';
import { recordAuditEvent } from '../../middleware/tenant.js';

export async function getTenantRisks(orgId, categoryFilter = null) {
  let sql = `SELECT id, code, title_en, title_ar, category_en, category_ar, probability, severity,
                    financial_exposure_sar, exposure_formatted, status, is_mitigated,
                    mitigation_plan_en, mitigation_plan_ar, owner_name, created_at
             FROM tenant_risks
             WHERE organization_id = $1`;
  const params = [orgId];

  if (categoryFilter && categoryFilter !== 'all') {
    sql += ` AND LOWER(category_en) LIKE $2`;
    params.push(`%${categoryFilter.toLowerCase()}%`);
  }

  sql += ` ORDER BY financial_exposure_sar DESC, created_at DESC`;

  const risksRes = await query(sql, params);

  const totalExposure = risksRes.rows.reduce(
    (sum, r) => sum + (r.is_mitigated ? 0 : parseFloat(r.financial_exposure_sar || 0)),
    0
  );

  return {
    organizationId: orgId,
    count: risksRes.rows.length,
    totalMonitoredExposureSAR: totalExposure,
    risks: risksRes.rows
  };
}

export async function toggleRiskMitigation(orgId, riskId, userId) {
  const current = await query(
    'SELECT id, is_mitigated, code FROM tenant_risks WHERE id = $1 AND organization_id = $2',
    [riskId, orgId]
  );

  if (current.rows.length === 0) {
    return null;
  }

  const nextMitigated = !current.rows[0].is_mitigated;
  const nextStatus = nextMitigated ? 'MITIGATED' : 'ACTIVE';

  const updateRes = await query(
    `UPDATE tenant_risks
     SET is_mitigated = $1, status = $2, updated_at = now()
     WHERE id = $3 AND organization_id = $4
     RETURNING *`,
    [nextMitigated, nextStatus, riskId, orgId]
  );

  await recordAuditEvent({
    organizationId: orgId,
    userId,
    action: nextMitigated ? 'RISK_MITIGATION_ACTIVATED' : 'RISK_RESET_ACTIVE',
    entityType: 'TENANT_RISK',
    entityId: riskId,
    details: { code: current.rows[0].code, isMitigated: nextMitigated }
  });

  return updateRes.rows[0];
}
