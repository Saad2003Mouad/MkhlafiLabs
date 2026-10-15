// MIKHLAFI LABS — Financial Calculation & Statistical Integrity Test Suite
// Validates Priority 9: Zero-division protections, EVM metrics, HHI concentration, and deterministic rounding

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateVariance,
  calculateVariancePercentage,
  calculateBudgetUtilization,
  calculateEvmMetrics,
  calculateSupplierPriceDeviation,
  calculateCustomerConcentration,
  calculateSuccessRate,
  calculateCompositeRiskScore
} from '../src/services/financial/calculations.js';

test.describe('Priority 9: Statistical and Financial Integrity Engine', () => {

  test('1. calculateVariance handles nulls and computes exact differences', () => {
    assert.equal(calculateVariance(125000, 100000), 25000);
    assert.equal(calculateVariance(80000, 100000), -20000);
    assert.equal(calculateVariance(null, 100000), null);
    assert.equal(calculateVariance(100000, undefined), null);
  });

  test('2. calculateVariancePercentage strictly guards against zero-denominator division', () => {
    // Normal cases
    assert.equal(calculateVariancePercentage(120, 100), 20);
    assert.equal(calculateVariancePercentage(80, 100), -20);

    // Zero planned (zero denominator)
    assert.equal(calculateVariancePercentage(0, 0), 0);
    assert.equal(calculateVariancePercentage(500, 0), null); // Returns null rather than Infinity or NaN!
    assert.notEqual(calculateVariancePercentage(500, 0), Infinity);
    assert.notEqual(calculateVariancePercentage(500, 0), NaN);
  });

  test('3. calculateBudgetUtilization handles boundary values cleanly', () => {
    assert.equal(calculateBudgetUtilization(750000, 1000000), 75);
    assert.equal(calculateBudgetUtilization(1200000, 1000000), 120); // 120% budget overrun
    assert.equal(calculateBudgetUtilization(50000, 0), null); // Zero budget guards division
  });

  test('4. calculateEvmMetrics computes EV, PV, AC, SV, CV, SPI, CPI with zero-denominator guards', () => {
    const evm = calculateEvmMetrics({
      earnedValue: 800000,
      plannedValue: 1000000,
      actualCost: 900000
    });

    assert.equal(evm.scheduleVariance, -200000); // SV = EV - PV = -200k (behind schedule)
    assert.equal(evm.costVariance, -100000);     // CV = EV - AC = -100k (over budget)
    assert.equal(evm.spi, 0.8);                 // SPI = 800k / 1000k = 0.8
    assert.equal(evm.cpi, 0.889);               // CPI = 800k / 900k = 0.889

    // Zero PV / AC test
    const zeroEvm = calculateEvmMetrics({ earnedValue: 0, plannedValue: 0, actualCost: 0 });
    assert.equal(zeroEvm.spi, null);
    assert.equal(zeroEvm.cpi, null);
  });

  test('5. calculateSupplierPriceDeviation computes percentage contract price creeping', () => {
    assert.equal(calculateSupplierPriceDeviation(115, 100), 15);   // +15% creep
    assert.equal(calculateSupplierPriceDeviation(95, 100), -5);    // -5% favorable
    assert.equal(calculateSupplierPriceDeviation(100, 0), null);   // Zero contract price guarded
  });

  test('6. calculateCustomerConcentration computes Top 3 Share and Herfindahl-Hirschman Index', () => {
    const revenues = [400000, 300000, 200000, 100000]; // Total = 1,000,000
    const concentration = calculateCustomerConcentration(revenues);

    assert.equal(concentration.totalRevenue, 1000000);
    assert.equal(concentration.top3SharePct, 90); // 900k / 1M = 90%
    // HHI = 40^2 + 30^2 + 20^2 + 10^2 = 1600 + 900 + 400 + 100 = 3000
    assert.equal(concentration.hhi, 3000);
  });

  test('7. calculateSuccessRate guards against zero runs', () => {
    assert.equal(calculateSuccessRate(95, 100), 95);
    assert.equal(calculateSuccessRate(0, 0), 0); // No division by zero
  });

  test('8. calculateCompositeRiskScore computes weighted scores and correct classification', () => {
    const components = [
      { name: 'financial', score: 80, weight: 0.5 },
      { name: 'operational', score: 40, weight: 0.3 },
      { name: 'compliance', score: 60, weight: 0.2 }
    ];
    // (80*0.5 + 40*0.3 + 60*0.2) / 1.0 = (40 + 12 + 12) = 64
    const result = calculateCompositeRiskScore(components);
    assert.equal(result.compositeScore, 64);
    assert.equal(result.classification, 'HIGH');
  });

});
