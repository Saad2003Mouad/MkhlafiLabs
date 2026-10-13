// MIKHLAFI LABS — Service 06: Customer Intelligence & Churn Radar
// Domain service for purchasing volume velocity, renewal monitoring, and churn risk mitigation

import { query } from '../../db/connection.js';
import { recordAuditEvent } from '../../middleware/tenant.js';

export async function getTenantCustomers(orgId) {
  const customersRes = await query(
    `SELECT id, code, account_name_en, account_name_ar, volume_trend, renewal_date,
            churn_probability, revenue_at_risk_sar, review_scheduled, status
     FROM tenant_customers
     WHERE organization_id = $1
     ORDER BY revenue_at_risk_sar DESC`,
    [orgId]
  );

  const totalRevenueAtRisk = customersRes.rows.reduce(
    (sum, c) => sum + parseFloat(c.revenue_at_risk_sar || 0),
    0
  );

  return {
    organizationId: orgId,
    count: customersRes.rows.length,
    totalRevenueAtRiskSAR: totalRevenueAtRisk,
    customers: customersRes.rows
  };
}

export async function scheduleCustomerReview(orgId, customerId, userId) {
  const updateRes = await query(
    `UPDATE tenant_customers
     SET review_scheduled = true, updated_at = now()
     WHERE id = $1 AND organization_id = $2
     RETURNING *`,
    [customerId, orgId]
  );

  if (updateRes.rows.length === 0) {
    return null;
  }

  await recordAuditEvent({
    organizationId: orgId,
    userId,
    action: 'CUSTOMER_EXECUTIVE_REVIEW_SCHEDULED',
    entityType: 'TENANT_CUSTOMER',
    entityId: customerId,
    details: { code: updateRes.rows[0].code, nameEn: updateRes.rows[0].account_name_en }
  });

  return updateRes.rows[0];
}
