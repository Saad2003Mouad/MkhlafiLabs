// MIKHLAFI LABS — Financial Leakage Detection & Forensic Audit Engine
// Algorithmic rules: Duplicate Invoice Hashes, PO Price Drift, Early Payment Discount Loss

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { query, transaction } from '../../db/connection.js';
import { recordAuditEvent } from '../../middleware/tenant.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BENCHMARK_MODEL_PATH = path.resolve(__dirname, './benchmarkModel.json');

export async function getBenchmarkStatus() {
  if (fs.existsSync(BENCHMARK_MODEL_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(BENCHMARK_MODEL_PATH, 'utf8'));
      return { success: true, benchmark: data };
    } catch {
      // Fall through
    }
  }
  return {
    success: false,
    message: 'Benchmark has not yet been executed or model file missing.'
  };
}

export async function getFinancialAnomalies(organizationId, filters = {}) {
  let sql = `
    SELECT
      id,
      case_number,
      rule_code,
      severity,
      confidence_pct,
      target_vendor,
      flagged_amount,
      currency,
      narrative_en,
      narrative_ar,
      status,
      created_at,
      resolved_at
    FROM financial_anomalies
    WHERE organization_id = $1
  `;
  const params = [organizationId];

  if (filters.severity && filters.severity !== 'all') {
    params.push(filters.severity.toUpperCase());
    sql += ` AND severity = $${params.length}`;
  }

  if (filters.status && filters.status !== 'all') {
    params.push(filters.status.toUpperCase());
    sql += ` AND status = $${params.length}`;
  }

  sql += ` ORDER BY flagged_amount DESC, created_at DESC`;

  const result = await query(sql, params);

  // Calculate aggregated metrics
  const totalsRes = await query(
    `SELECT
       COUNT(*) AS total_cases,
       COALESCE(SUM(CASE WHEN status = 'DETECTED' THEN flagged_amount ELSE 0 END), 0) AS active_leakage_sar,
       COALESCE(SUM(CASE WHEN status = 'FROZEN' THEN flagged_amount ELSE 0 END), 0) AS protected_amount_sar,
       COUNT(CASE WHEN severity = 'CRITICAL' OR severity = 'HIGH' THEN 1 END) AS high_severity_count
     FROM financial_anomalies
     WHERE organization_id = $1`,
    [organizationId]
  );

  const stats = totalsRes.rows[0];

  return {
    organizationId,
    totalCases: parseInt(stats.total_cases, 10),
    activeLeakageSAR: parseFloat(stats.active_leakage_sar),
    protectedAmountSAR: parseFloat(stats.protected_amount_sar),
    highSeverityCount: parseInt(stats.high_severity_count, 10),
    anomalies: result.rows
  };
}

export async function resolveFinancialAnomaly(organizationId, anomalyId, userId, action, notes = '') {
  const validActions = {
    FREEZE: 'FROZEN',
    LEGITIMATE: 'LEGITIMATE',
    RESOLVE: 'RESOLVED'
  };

  const newStatus = validActions[action.toUpperCase()];
  if (!newStatus) {
    throw new Error(`Invalid resolution action: ${action}`);
  }

    let auditPayload = null;

    const result = await transaction(async (tx) => {
      const check = await tx.query(
        `SELECT id, case_number, target_vendor, flagged_amount, primary_invoice_id
         FROM financial_anomalies
         WHERE id = $1 AND organization_id = $2`,
        [anomalyId, organizationId]
      );

      if (check.rows.length === 0) {
        return null;
      }

      const anomaly = check.rows[0];

      // Update anomaly status
      const updateRes = await tx.query(
        `UPDATE financial_anomalies
         SET status = $1, resolved_by = $2, resolved_at = now(), action_notes = $3, updated_at = now()
         WHERE id = $4 AND organization_id = $5
         RETURNING id, case_number, status, resolved_at`,
        [newStatus, userId, notes, anomalyId, organizationId]
      );

      // If frozen, freeze the associated primary invoice to prevent payout
      if (newStatus === 'FROZEN' && anomaly.primary_invoice_id) {
        await tx.query(
          `UPDATE financial_invoices
           SET status = 'FROZEN', updated_at = now()
           WHERE id = $1 AND organization_id = $2`,
          [anomaly.primary_invoice_id, organizationId]
        );
      }

      auditPayload = {
        organizationId,
        userId,
        action: `FINANCIAL_ANOMALY_${action.toUpperCase()}`,
        entityType: 'FINANCIAL_ANOMALY',
        entityId: anomalyId,
        details: {
          caseNumber: anomaly.case_number,
          vendor: anomaly.target_vendor,
          amount: anomaly.flagged_amount,
          action: newStatus
        }
      };

      return updateRes.rows[0];
    });

    if (result && auditPayload) {
      await recordAuditEvent(auditPayload);
    }

    return result;
  }

export async function seedInitialFinancialRecords(tx, organizationId, branchId) {
  // 1. Create realistic vendor invoices
  const inv1Res = await tx.query(
    `INSERT INTO financial_invoices
       (organization_id, branch_id, invoice_number, vendor_name, vendor_iban, issue_date, po_reference, grn_reference, total_amount, currency, status)
     VALUES
       ($1, $2, 'INV-2026-9022', 'Global Logistics Co.', 'SA4420000001234567890123', CURRENT_DATE - 3, 'PO-8812', 'GRN-4410', 48500.00, 'SAR', 'PAID'),
       ($1, $2, 'INV-2026-9041', 'Global Logistics Co.', 'SA4420000001234567890123', CURRENT_DATE - 1, 'PO-8812', 'GRN-4410', 48500.00, 'SAR', 'PENDING'),
       ($1, $2, 'INV-2026-1108', 'Al-Yamama Cement & Aggregates', 'SA8810000009876543210987', CURRENT_DATE - 5, 'PO-7704', 'GRN-3902', 82400.00, 'SAR', 'PENDING'),
       ($1, $2, 'INV-2026-3044', 'Red Sea Industrial Equipment', 'SA2250000004561237896541', CURRENT_DATE - 7, 'PO-6520', 'GRN-2811', 14200.00, 'SAR', 'PAID')
     RETURNING id, invoice_number`,
    [organizationId, branchId]
  );

  const invMap = {};
  for (const row of inv1Res.rows) {
    invMap[row.invoice_number] = row.id;
  }

  // 2. Insert detectable forensic anomaly cases
  await tx.query(
    `INSERT INTO financial_anomalies
       (organization_id, branch_id, case_number, rule_code, severity, confidence_pct, target_vendor, flagged_amount, currency, narrative_en, narrative_ar, status, primary_invoice_id, matched_invoice_id)
     VALUES
       ($1, $2, 'CASE-2026-081', 'RULE_DUP_INVOICE_HASH', 'HIGH', 94.20, 'Global Logistics Co.', 48500.00, 'SAR',
        'Two separate purchase orders matched identical line items, vendor IBAN, and monetary values (48,500 SAR) within a 36-hour timeframe. Server verification flags this for CFO review prior to batch payout.',
        'تم رصد فاتورتين مختلفتين بالرقم المرجعي (#INV-9022 و #INV-9041) تحملان نفس القيمة المالية، ونفس الحساب البنكي الآيبان، ونفس بنود التوريد خلال فترة 36 ساعة فقط. يُوصى بالتحقق المباشر قبل اعتماد الصرف.',
        'DETECTED', $3, $4),

       ($1, $2, 'CASE-2026-082', 'RULE_PO_PRICE_DRIFT', 'CRITICAL', 98.50, 'Al-Yamama Cement & Aggregates', 82400.00, 'SAR',
        'Invoice unit rate exceeds approved purchase order contract baseline by +16.5%. Unmitigated drift represents 11,680 SAR in unaccounted margin loss.',
        'سعر الوحدة في الفاتورة يتجاوز السعر المتفق عليه في أمر الشراء الأساسي بنسبة +16.5%. يمثل هذا الانحراف خسارة هامش غير مبررة بقيمة 11,680 ر.س.',
        'DETECTED', $5, NULL),

       ($1, $2, 'CASE-2026-083', 'RULE_EARLY_PAYMENT_DISCOUNT', 'MEDIUM', 89.10, 'Red Sea Industrial Equipment', 14200.00, 'SAR',
        'Vendor 2/10 Net 30 early settlement discount was missed due to 4-day approval queue latency, resulting in forfeited cash yield.',
        'تمت خسارة خصم السداد المبكر (2/10 صافي 30) بسبب تأخر مسار الاعتماد الإداري لمدة 4 أيام، مما تسبب في إهدار عائد سيولة متاح.',
        'DETECTED', $6, NULL)`,
    [
      organizationId,
      branchId,
      invMap['INV-2026-9041'],
      invMap['INV-2026-9022'],
      invMap['INV-2026-1108'],
      invMap['INV-2026-3044']
    ]
  );
}
