// MIKHLAFI LABS — Centralized Financial & Statistical Integrity Calculation Engine
// Adheres strictly to Priority 9 & Priority 10 requirements:
// Zero-denominator guards, explicit null handling, deterministic rounding, and explainable models.

/**
 * Calculates absolute variance: Actual - Planned.
 * Positive variance represents cost overrun or schedule delay depending on metric.
 * 
 * @param {number|null} actual 
 * @param {number|null} planned 
 * @returns {number|null}
 */
export function calculateVariance(actual, planned) {
  if (actual === null || actual === undefined || isNaN(actual) ||
      planned === null || planned === undefined || isNaN(planned)) {
    return null;
  }
  return Number((actual - planned).toFixed(2));
}

/**
 * Calculates percentage variance: ((Actual - Planned) / Planned) * 100.
 * Strictly prevents zero-denominator division (never returns NaN or Infinity).
 * 
 * @param {number|null} actual 
 * @param {number|null} planned 
 * @returns {number|null}
 */
export function calculateVariancePercentage(actual, planned) {
  if (actual === null || actual === undefined || isNaN(actual) ||
      planned === null || planned === undefined || isNaN(planned)) {
    return null;
  }
  if (planned === 0) {
    // If planned is zero and actual is zero, variance is 0%. If actual is non-zero, return null (undefined rate)
    return actual === 0 ? 0 : null;
  }
  const pct = ((actual - planned) / Math.abs(planned)) * 100;
  return Number(pct.toFixed(2));
}

/**
 * Calculates budget utilization: (Spent / TotalBudget) * 100.
 * Guards against zero budget.
 * 
 * @param {number} spent 
 * @param {number} totalBudget 
 * @returns {number|null}
 */
export function calculateBudgetUtilization(spent, totalBudget) {
  if (spent === null || spent === undefined || isNaN(spent) ||
      totalBudget === null || totalBudget === undefined || isNaN(totalBudget)) {
    return null;
  }
  if (totalBudget <= 0) {
    return null; // Undefined utilization when no budget allocated
  }
  return Number(((spent / totalBudget) * 100).toFixed(2));
}

/**
 * Project Earned Value Management (EVM) Metrics:
 * Schedule Variance: SV = EV - PV
 * Cost Variance: CV = EV - AC
 * Schedule Performance Index: SPI = EV / PV (guards PV === 0)
 * Cost Performance Index: CPI = EV / AC (guards AC === 0)
 * 
 * @param {{ earnedValue: number, plannedValue: number, actualCost: number }} evmInputs 
 */
export function calculateEvmMetrics({ earnedValue, plannedValue, actualCost }) {
  const ev = Number(earnedValue || 0);
  const pv = Number(plannedValue || 0);
  const ac = Number(actualCost || 0);

  const sv = Number((ev - pv).toFixed(2));
  const cv = Number((ev - ac).toFixed(2));

  const spi = pv > 0 ? Number((ev / pv).toFixed(3)) : null;
  const cpi = ac > 0 ? Number((ev / ac).toFixed(3)) : null;

  return {
    earnedValue: ev,
    plannedValue: pv,
    actualCost: ac,
    scheduleVariance: sv,
    costVariance: cv,
    spi, // > 1.0 ahead of schedule, < 1.0 delayed
    cpi  // > 1.0 under budget, < 1.0 over budget
  };
}

/**
 * Calculates supplier unit price deviation against contractual baseline:
 * Deviation = ((InvoicedPrice - ContractPrice) / ContractPrice) * 100.
 * 
 * @param {number} invoicedUnitPrice 
 * @param {number} contractBaselinePrice 
 * @returns {number|null}
 */
export function calculateSupplierPriceDeviation(invoicedUnitPrice, contractBaselinePrice) {
  if (invoicedUnitPrice === null || contractBaselinePrice === null ||
      isNaN(invoicedUnitPrice) || isNaN(contractBaselinePrice)) {
    return null;
  }
  if (contractBaselinePrice <= 0) {
    return null;
  }
  return Number((((invoicedUnitPrice - contractBaselinePrice) / contractBaselinePrice) * 100).toFixed(2));
}

/**
 * Calculates Customer Revenue Concentration:
 * 1. Top 3 Revenue Share Percentage
 * 2. Herfindahl-Hirschman Index (HHI) for market concentration
 * 
 * @param {number[]} customerRevenues 
 * @returns {{ totalRevenue: number, top3SharePct: number, hhi: number }|null}
 */
export function calculateCustomerConcentration(customerRevenues) {
  if (!Array.isArray(customerRevenues) || customerRevenues.length === 0) {
    return null;
  }

  const validRevenues = customerRevenues
    .map(r => Number(r))
    .filter(r => !isNaN(r) && r > 0)
    .sort((a, b) => b - a);

  const totalRevenue = validRevenues.reduce((sum, r) => sum + r, 0);
  if (totalRevenue === 0) {
    return { totalRevenue: 0, top3SharePct: 0, hhi: 0 };
  }

  const top3Revenue = validRevenues.slice(0, 3).reduce((sum, r) => sum + r, 0);
  const top3SharePct = Number(((top3Revenue / totalRevenue) * 100).toFixed(2));

  // HHI = Sum of squared market shares (each share as percentage 0-100)
  const hhi = validRevenues.reduce((sum, r) => {
    const share = (r / totalRevenue) * 100;
    return sum + (share * share);
  }, 0);

  return {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    top3SharePct,
    hhi: Number(hhi.toFixed(1)) // e.g. < 1500 unconcentrated, 1500-2500 moderate, > 2500 highly concentrated
  };
}

/**
 * Calculates success rate percentage with zero denominator protection.
 * 
 * @param {number} successCount 
 * @param {number} totalCount 
 * @returns {number}
 */
export function calculateSuccessRate(successCount, totalCount) {
  const s = Number(successCount || 0);
  const t = Number(totalCount || 0);
  if (t <= 0) return 0;
  return Number(((s / t) * 100).toFixed(1));
}

/**
 * Composite Risk Score Calculator:
 * Weighted average of normalized sub-scores (0 to 100 scale).
 * 
 * @param {Array<{ name: string, score: number, weight: number }>} components 
 * @returns {{ compositeScore: number, classification: string }}
 */
export function calculateCompositeRiskScore(components) {
  if (!Array.isArray(components) || components.length === 0) {
    return { compositeScore: 0, classification: 'MINIMAL' };
  }

  let totalWeight = 0;
  let weightedSum = 0;

  for (const c of components) {
    const score = Math.max(0, Math.min(100, Number(c.score || 0)));
    const weight = Math.max(0, Number(c.weight || 0));
    weightedSum += score * weight;
    totalWeight += weight;
  }

  const compositeScore = totalWeight > 0 ? Number((weightedSum / totalWeight).toFixed(1)) : 0;

  let classification = 'LOW';
  if (compositeScore >= 75) classification = 'CRITICAL';
  else if (compositeScore >= 50) classification = 'HIGH';
  else if (compositeScore >= 25) classification = 'MODERATE';

  return { compositeScore, classification };
}
