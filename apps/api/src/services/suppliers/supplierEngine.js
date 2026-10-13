// MIKHLAFI LABS — Service 05: Supplier Intelligence & Procurement Scorecards
// Domain service for vendor performance, price creep tracking, and benchmark auditing

import { query } from '../../db/connection.js';
import { recordAuditEvent } from '../../middleware/tenant.js';

export async function getTenantSuppliers(orgId, statusFilter = null) {
  let sql = `SELECT id, code, name_en, name_ar, rating_score, price_creep_rate, price_creep_pct,
                    on_time_delivery_rate, active_contracts_val_sar, risk_status, is_audited, last_audit_notes
             FROM tenant_suppliers
             WHERE organization_id = $1`;
  const params = [orgId];

  if (statusFilter && statusFilter !== 'all') {
    sql += ` AND risk_status = $2`;
    params.push(statusFilter);
  }

  sql += ` ORDER BY active_contracts_val_sar DESC`;

  const suppliersRes = await query(sql, params);

  const totalContractsVal = suppliersRes.rows.reduce(
    (sum, s) => sum + parseFloat(s.active_contracts_val_sar || 0),
    0
  );

  return {
    organizationId: orgId,
    count: suppliersRes.rows.length,
    totalMonitoredContractsSAR: totalContractsVal,
    suppliers: suppliersRes.rows
  };
}

export async function auditTenantSupplier(orgId, supplierId, userId) {
  const updateRes = await query(
    `UPDATE tenant_suppliers
     SET is_audited = true, updated_at = now()
     WHERE id = $1 AND organization_id = $2
     RETURNING *`,
    [supplierId, orgId]
  );

  if (updateRes.rows.length === 0) {
    return null;
  }

  await recordAuditEvent({
    organizationId: orgId,
    userId,
    action: 'SUPPLIER_AUDIT_COMPLETED',
    entityType: 'TENANT_SUPPLIER',
    entityId: supplierId,
    details: { code: updateRes.rows[0].code, nameEn: updateRes.rows[0].name_en }
  });

  return updateRes.rows[0];
}
