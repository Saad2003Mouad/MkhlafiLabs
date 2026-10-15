// MIKHLAFI LABS — Enterprise Financial Analytics & Multi-Dimensional Visualization Engine
// Aggregates journal entries, financial invoices, and forensic anomalies
// Enforces zero-division protection and deterministic calculation formulas

import { query } from '../../db/connection.js';
import {
  calculateVariance,
  calculateVariancePercentage
} from './calculations.js';

/**
 * Retrieves comprehensive financial analytics for an organization.
 * Returns honest metadata: if no financial records exist, hasData is false and arrays are empty.
 * 
 * @param {string} organizationId 
 * @param {object} filters - { startDate, endDate, branchId }
 */
export async function getFinancialAnalytics(organizationId, filters = {}) {
  const { startDate, endDate, branchId } = filters;

  // 1. Check if the tenant has any financial records (invoices or journal entries)
  const invoiceCountRes = await query(
    `SELECT COUNT(*) AS count FROM financial_invoices WHERE organization_id = $1`,
    [organizationId]
  );
  const journalCountRes = await query(
    `SELECT COUNT(*) AS count FROM tenant_journal_entries WHERE organization_id = $1`,
    [organizationId]
  );

  const totalInvoices = parseInt(invoiceCountRes.rows[0]?.count || '0', 10);
  const totalJournalEntries = parseInt(journalCountRes.rows[0]?.count || '0', 10);

  if (totalInvoices === 0 && totalJournalEntries === 0) {
    return {
      organizationId,
      hasData: false,
      currency: 'SAR',
      summary: {
        totalRevenue: 0,
        totalExpenses: 0,
        netCashFlow: 0,
        activeLeakage: 0,
        protectedCapital: 0,
        anomalyCount: 0
      },
      monthlyTrends: [],
      expenseBreakdown: [],
      topVendors: [],
      severityDistribution: [],
      branchBreakdown: []
    };
  }

  // 2. Aggregate monthly trend data (Revenue vs Expenses / Inflows vs Outflows)
  // Queries tenant_journal_entries with fallback to financial_invoices
  let monthlyTrends = [];
  if (totalJournalEntries > 0) {
    const monthlyJournalRes = await query(
      `SELECT
         TO_CHAR(posting_date, 'YYYY-MM') AS period,
         SUM(CASE WHEN debit_credit = 'S' THEN amount_sar ELSE 0 END) AS inflows,
         SUM(CASE WHEN debit_credit = 'H' THEN amount_sar ELSE 0 END) AS outflows,
         COUNT(*) AS transaction_count
       FROM tenant_journal_entries
       WHERE organization_id = $1
       GROUP BY TO_CHAR(posting_date, 'YYYY-MM')
       ORDER BY period ASC`,
      [organizationId]
    );

    monthlyTrends = monthlyJournalRes.rows.map(r => {
      const inflows = parseFloat(r.inflows || '0');
      const outflows = parseFloat(r.outflows || '0');
      return {
        period: r.period,
        revenue: inflows,
        expenses: outflows,
        netFlow: Number((inflows - outflows).toFixed(2)),
        transactionCount: parseInt(r.transaction_count, 10)
      };
    });
  } else {
    // Invoices-based monthly spending
    const monthlyInvoiceRes = await query(
      `SELECT
         TO_CHAR(issue_date, 'YYYY-MM') AS period,
         SUM(total_amount) AS expenses,
         COUNT(*) AS invoice_count
       FROM financial_invoices
       WHERE organization_id = $1
       GROUP BY TO_CHAR(issue_date, 'YYYY-MM')
       ORDER BY period ASC`,
      [organizationId]
    );

    monthlyTrends = monthlyInvoiceRes.rows.map(r => {
      const exp = parseFloat(r.expenses || '0');
      return {
        period: r.period,
        revenue: 0, // Revenue not tracked in invoice expense stream
        expenses: exp,
        netFlow: -exp,
        transactionCount: parseInt(r.invoice_count, 10)
      };
    });
  }

  // 3. Expense breakdown by account / category
  let expenseBreakdown = [];
  if (totalJournalEntries > 0) {
    const accountRes = await query(
      `SELECT
         account_number,
         COALESCE(text_narrative, 'General Expense') AS category,
         SUM(amount_sar) AS total_amount,
         COUNT(*) AS count
       FROM tenant_journal_entries
       WHERE organization_id = $1
       GROUP BY account_number, text_narrative
       ORDER BY total_amount DESC
       LIMIT 8`,
      [organizationId]
    );

    expenseBreakdown = accountRes.rows.map(r => ({
      account: r.account_number,
      category: r.category,
      amount: parseFloat(r.total_amount),
      count: parseInt(r.count, 10)
    }));
  }

  // 4. Top Suppliers / Vendors spending analysis
  const vendorRes = await query(
    `SELECT
       vendor_name,
       SUM(total_amount) AS total_spend,
       COUNT(*) AS invoice_count,
       MAX(currency) AS currency
     FROM financial_invoices
     WHERE organization_id = $1
     GROUP BY vendor_name
     ORDER BY total_spend DESC
     LIMIT 10`,
    [organizationId]
  );

  const topVendors = vendorRes.rows.map(r => ({
    vendorName: r.vendor_name,
    totalSpend: parseFloat(r.total_spend),
    invoiceCount: parseInt(r.invoice_count, 10),
    currency: r.currency || 'SAR'
  }));

  // 5. Forensic Anomalies & Severity distribution
  const severityRes = await query(
    `SELECT
       severity,
       COUNT(*) AS case_count,
       COALESCE(SUM(flagged_amount), 0) AS total_flagged_sar
     FROM financial_anomalies
     WHERE organization_id = $1
     GROUP BY severity
     ORDER BY total_flagged_sar DESC`,
    [organizationId]
  );

  const severityDistribution = severityRes.rows.map(r => ({
    severity: r.severity,
    count: parseInt(r.case_count, 10),
    totalFlaggedSAR: parseFloat(r.total_flagged_sar)
  }));

  // 6. Branch spending comparison
  const branchRes = await query(
    `SELECT
       COALESCE(b.name_en, 'HQ Main Organization') AS branch_name_en,
       COALESCE(b.name_ar, 'المقر الرئيسي') AS branch_name_ar,
       COALESCE(b.code, 'HQ') AS branch_code,
       SUM(fi.total_amount) AS total_spend,
       COUNT(*) AS invoice_count
     FROM financial_invoices fi
     LEFT JOIN branches b ON b.id = fi.branch_id
     WHERE fi.organization_id = $1
     GROUP BY b.name_en, b.name_ar, b.code
     ORDER BY total_spend DESC`,
    [organizationId]
  );

  const branchBreakdown = branchRes.rows.map(r => ({
    branchNameEn: r.branch_name_en,
    branchNameAr: r.branch_name_ar,
    branchCode: r.branch_code,
    totalSpend: parseFloat(r.total_spend),
    invoiceCount: parseInt(r.invoice_count, 10)
  }));

  // 7. Overall Summary Totals
  const totalRev = monthlyTrends.reduce((sum, m) => sum + m.revenue, 0);
  const totalExp = monthlyTrends.reduce((sum, m) => sum + m.expenses, 0);
  const netCashFlow = Number((totalRev - totalExp).toFixed(2));

  const anomalyTotalsRes = await query(
    `SELECT
       COALESCE(SUM(CASE WHEN status = 'DETECTED' THEN flagged_amount ELSE 0 END), 0) AS active_leakage,
       COALESCE(SUM(CASE WHEN status = 'FROZEN' THEN flagged_amount ELSE 0 END), 0) AS protected_capital,
       COUNT(*) AS total_cases
     FROM financial_anomalies
     WHERE organization_id = $1`,
    [organizationId]
  );

  const activeLeakage = parseFloat(anomalyTotalsRes.rows[0]?.active_leakage || '0');
  const protectedCapital = parseFloat(anomalyTotalsRes.rows[0]?.protected_capital || '0');
  const anomalyCount = parseInt(anomalyTotalsRes.rows[0]?.total_cases || '0', 10);

  // Period-over-period variance (comparing last two months if available)
  let periodVariance = null;
  if (monthlyTrends.length >= 2) {
    const current = monthlyTrends[monthlyTrends.length - 1];
    const previous = monthlyTrends[monthlyTrends.length - 2];
    const diff = calculateVariance(current.expenses, previous.expenses);
    const pct = calculateVariancePercentage(current.expenses, previous.expenses);
    periodVariance = {
      currentPeriod: current.period,
      previousPeriod: previous.period,
      absoluteVarianceSAR: diff,
      percentageChange: pct
    };
  }

  return {
    organizationId,
    hasData: true,
    currency: 'SAR',
    summary: {
      totalRevenue: totalRev,
      totalExpenses: totalExp,
      netCashFlow,
      activeLeakage,
      protectedCapital,
      anomalyCount,
      periodVariance
    },
    monthlyTrends,
    expenseBreakdown,
    topVendors,
    severityDistribution,
    branchBreakdown
  };
}
