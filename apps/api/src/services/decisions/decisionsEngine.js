// MIKHLAFI LABS — Service 02: Executive Decisions Engine
// Domain service for managing executive decision queues, trade-offs, and execution tracking

import { query } from '../../db/connection.js';
import { recordAuditEvent } from '../../middleware/tenant.js';

export async function getTenantDecisions(orgId, statusFilter = null) {
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

  return {
    organizationId: orgId,
    count: decisionsRes.rows.length,
    totalPendingImpactSAR: parseFloat(impactSumRes.rows[0].total_impact),
    decisions: decisionsRes.rows
  };
}

export async function createTenantDecision(orgId, { title, category, impactAmount = 0, riskLevel = 'MEDIUM', branchId = null }) {
  const resInsert = await query(
    `INSERT INTO tenant_decisions (organization_id, branch_id, title, category, impact_amount, risk_level, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
     RETURNING id, organization_id, title, category, impact_amount, risk_level, status, created_at`,
    [orgId, branchId, title, category, parseFloat(impactAmount), riskLevel.toUpperCase()]
  );

  return resInsert.rows[0];
}

export async function getTenantDecisionById(orgId, recordId) {
  const recRes = await query(
    `SELECT id, organization_id, title, category, impact_amount, currency, risk_level, status, created_at
     FROM tenant_decisions
     WHERE id = $1 AND organization_id = $2`,
    [recordId, orgId]
  );

  return recRes.rows[0] || null;
}

export async function executeTenantDecision(orgId, recordId, userId) {
  const updateRes = await query(
    `UPDATE tenant_decisions
     SET status = 'EXECUTED', updated_at = now()
     WHERE id = $1 AND organization_id = $2
     RETURNING id, title, impact_amount, status`,
    [recordId, orgId]
  );

  if (updateRes.rows.length === 0) {
    return null;
  }

  await recordAuditEvent({
    organizationId: orgId,
    userId,
    action: 'DECISION_EXECUTED',
    entityType: 'TENANT_DECISION',
    entityId: recordId,
    details: { title: updateRes.rows[0].title }
  });

  return updateRes.rows[0];
}
