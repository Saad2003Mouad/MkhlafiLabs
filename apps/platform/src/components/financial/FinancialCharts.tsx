import React from 'react';
import { LocaleMode } from '../../types';

interface FinancialChartsProps {
  locale: LocaleMode;
  analytics: {
    hasData: boolean;
    currency: string;
    summary: {
      totalRevenue: number;
      totalExpenses: number;
      netCashFlow: number;
      activeLeakage: number;
      protectedCapital: number;
      anomalyCount: number;
      periodVariance?: {
        currentPeriod: string;
        previousPeriod: string;
        absoluteVarianceSAR: number | null;
        percentageChange: number | null;
      } | null;
    };
    monthlyTrends: Array<{
      period: string;
      revenue: number;
      expenses: number;
      netFlow: number;
      transactionCount: number;
    }>;
    expenseBreakdown: Array<{
      account: string;
      category: string;
      amount: number;
      count: number;
    }>;
    topVendors: Array<{
      vendorName: string;
      totalSpend: number;
      invoiceCount: number;
      currency: string;
    }>;
    severityDistribution: Array<{
      severity: string;
      count: number;
      totalFlaggedSAR: number;
    }>;
    branchBreakdown: Array<{
      branchNameEn: string;
      branchNameAr: string;
      branchCode: string;
      totalSpend: number;
      invoiceCount: number;
    }>;
  } | null;
  isLoading?: boolean;
}

export const FinancialCharts: React.FC<FinancialChartsProps> = ({ locale, analytics, isLoading }) => {
  const isAr = locale === 'ar';

  if (isLoading) {
    return (
      <div className="decision-card" style={{ textAlign: 'center', padding: '40px 20px', marginTop: '16px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {isAr ? 'جاري تحميل التحليلات والرسوم البيانية المالية...' : 'Loading financial analytics and charts...'}
        </p>
      </div>
    );
  }

  if (!analytics || !analytics.hasData || ((analytics.monthlyTrends?.length || 0) === 0 && (analytics.topVendors?.length || 0) === 0)) {
    return (
      <div className="decision-card" style={{ textAlign: 'center', padding: '40px 20px', marginTop: '16px' }}>
        <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '8px' }}>
          {isAr ? 'لا تتوفر سجلات مالية كافية لتوليد الرسوم البيانية' : 'Insufficient Financial Data for Visualization'}
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto' }}>
          {isAr
            ? 'تتطلب التحليلات البيانية وجود فواتير مشتريات أو قيود دفتر أستاذ عام مسجلة. يمكنك استيراد ملف CSV أو مزامنة بيانات ERP لبدء التحليل.'
            : 'Visual analytics require ingested journal entries or verified purchase orders. Import a CSV batch or trigger ERP sync to render financial trends.'}
        </p>
      </div>
    );
  }

  const { monthlyTrends = [], expenseBreakdown = [], topVendors = [], severityDistribution = [], branchBreakdown = [], summary = {} as any } = analytics;

  // ── 1. Monthly Trends Chart Calculations ─────────────────────────────────
  const maxExpense = Math.max(...monthlyTrends.map((m) => Math.max(m.expenses, m.revenue, 1)));
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;
  const usableWidth = svgWidth - 2 * paddingX;
  const usableHeight = svgHeight - 2 * paddingY;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
      {/* Period-over-Period Performance Banner */}
      {summary.periodVariance && (
        <div
          className="content-panel"
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
              {isAr ? 'مقارنة الفترات المتتالية (Period-over-Period)' : 'Period-over-Period Variance Analysis'}
            </span>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              {isAr
                ? `مقارنة إنفاق ${summary.periodVariance.currentPeriod} مع ${summary.periodVariance.previousPeriod}`
                : `Spend comparison: ${summary.periodVariance.currentPeriod} vs ${summary.periodVariance.previousPeriod}`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{isAr ? 'الانحراف المالي' : 'Absolute Variance'}</span>
              <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: (summary.periodVariance.absoluteVarianceSAR || 0) <= 0 ? 'var(--status-success)' : 'var(--status-warning)' }}>
                {(summary.periodVariance.absoluteVarianceSAR || 0) > 0 ? '+' : ''}
                {(summary.periodVariance.absoluteVarianceSAR || 0).toLocaleString()} SAR
              </div>
            </div>
            {summary.periodVariance.percentageChange !== null && (
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{isAr ? 'نسبة التغير' : 'Percentage Change'}</span>
                <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: summary.periodVariance.percentageChange <= 0 ? 'var(--status-success)' : 'var(--status-warning)' }}>
                  {summary.periodVariance.percentageChange > 0 ? '+' : ''}
                  {summary.periodVariance.percentageChange}%
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid of Visualizations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
        {/* CHART 1: Monthly Cash Flows / Expense Trends */}
        {monthlyTrends.length > 0 && (
          <div className="content-panel">
            <div className="panel-header" style={{ marginBottom: '12px' }}>
              <div>
                <h3 className="panel-title" style={{ fontSize: '14px' }}>
                  {isAr ? 'الاتجاه الزمني للنفقات والتدفقات (ريال سعودي)' : 'Monthly Expenditure & Cash Trends (SAR)'}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  {isAr ? 'تتبع شهري للالتزامات المالية وحجم العمليات' : 'Monthly aggregated disbursement volumes'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', background: 'var(--accent-base)', borderRadius: '2px' }} />
                  {isAr ? 'النفقات' : 'Expenses'}
                </span>
                {monthlyTrends.some((m) => m.revenue > 0) && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', background: 'var(--status-success)', borderRadius: '2px' }} />
                    {isAr ? 'الإيرادات' : 'Revenue'}
                  </span>
                )}
              </div>
            </div>

            <div style={{ width: '100%', overflowX: 'auto' }}>
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', minWidth: '400px', maxHeight: '220px' }}>
                {/* Horizontal Grid lines */}
                <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="var(--border-subtle)" strokeDasharray="3 3" />
                <line x1={paddingX} y1={paddingY + usableHeight / 2} x2={svgWidth - paddingX} y2={paddingY + usableHeight / 2} stroke="var(--border-subtle)" strokeDasharray="3 3" />
                <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="var(--border-default)" />

                {/* Bars per month */}
                {monthlyTrends.map((item, idx) => {
                  const stepX = usableWidth / monthlyTrends.length;
                  const x = paddingX + idx * stepX + stepX * 0.2;
                  const barW = Math.max(12, stepX * 0.6);
                  const barH = (item.expenses / maxExpense) * usableHeight;
                  const y = svgHeight - paddingY - barH;

                  return (
                    <g key={item.period}>
                      <rect
                        x={x}
                        y={y}
                        width={barW}
                        height={barH}
                        fill="var(--accent-base)"
                        rx="3"
                        opacity="0.85"
                      />
                      {/* Period Label */}
                      <text
                        x={x + barW / 2}
                        y={svgHeight - 10}
                        fontSize="10"
                        fill="var(--text-tertiary)"
                        textAnchor="middle"
                        fontFamily="var(--font-mono)"
                      >
                        {item.period}
                      </text>
                      {/* Value label */}
                      <text
                        x={x + barW / 2}
                        y={y - 5}
                        fontSize="9"
                        fill="var(--text-primary)"
                        textAnchor="middle"
                        fontFamily="var(--font-mono)"
                        fontWeight="700"
                      >
                        {(item.expenses / 1e3).toFixed(0)}k
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* CHART 2: Forensic Anomalies by Severity Distribution */}
        {severityDistribution.length > 0 && (
          <div className="content-panel">
            <div className="panel-header" style={{ marginBottom: '12px' }}>
              <div>
                <h3 className="panel-title" style={{ fontSize: '14px' }}>
                  {isAr ? 'توزيع الانحرافات حسب مستوى الخطورة' : 'Leakage Severity Distribution'}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  {isAr ? 'تصنيف مالي للشبهات المرصودة ومبالغ التعرض' : 'Risk-weighted categorization of flagged disbursement cases'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              {severityDistribution.map((item) => {
                const totalFlagged = severityDistribution.reduce((sum, s) => sum + s.totalFlaggedSAR, 0);
                const sharePct = totalFlagged > 0 ? ((item.totalFlaggedSAR / totalFlagged) * 100).toFixed(1) : '0';
                const isCrit = item.severity.toUpperCase() === 'CRITICAL';
                const isHigh = item.severity.toUpperCase() === 'HIGH';

                return (
                  <div key={item.severity}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, color: isCrit ? 'var(--status-danger)' : isHigh ? 'var(--status-warning)' : 'var(--accent-base)' }}>
                        {item.severity.toUpperCase()} ({item.count} {isAr ? 'حالات' : 'cases'})
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.totalFlaggedSAR.toLocaleString()} SAR ({sharePct}%)
                      </span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(5, parseFloat(sharePct)))}%`,
                          height: '100%',
                          background: isCrit ? 'var(--status-danger)' : isHigh ? 'var(--status-warning)' : 'var(--accent-base)'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CHART 3: Top Supplier & Procurement Spending Analysis */}
        {topVendors.length > 0 && (
          <div className="content-panel">
            <div className="panel-header" style={{ marginBottom: '12px' }}>
              <div>
                <h3 className="panel-title" style={{ fontSize: '14px' }}>
                  {isAr ? 'تحليل كبار الموردين وحجم المشتريات' : 'Top Supplier Spend & Exposure (SAR)'}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  {isAr ? 'تركيز المشتريات على أهم الموردين المسجلين' : 'Concentration of accounts payable across key vendors'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topVendors.slice(0, 5).map((vendor, idx) => {
                const maxSpend = Math.max(...topVendors.map((v) => v.totalSpend), 1);
                const pct = ((vendor.totalSpend / maxSpend) * 100).toFixed(0);

                return (
                  <div key={vendor.vendorName} style={{ background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                        {idx + 1}. {vendor.vendorName}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', color: 'var(--accent-light)' }}>
                        {vendor.totalSpend.toLocaleString()} SAR
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                      <span>{vendor.invoiceCount} {isAr ? 'فواتير مسجلة' : 'invoices processed'}</span>
                      <span>{pct}% {isAr ? 'من أعلى مورد' : 'of max spend'}</span>
                    </div>
                    <div style={{ height: '4px', background: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-base)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CHART 4: Expense Breakdown by Account / Category */}
        {expenseBreakdown.length > 0 && (
          <div className="content-panel">
            <div className="panel-header" style={{ marginBottom: '12px' }}>
              <div>
                <h3 className="panel-title" style={{ fontSize: '14px' }}>
                  {isAr ? 'تبويب المصروفات حسب الحساب العام (General Ledger)' : 'General Ledger Expense Breakdown'}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  {isAr ? 'توزيع القيود حسب أرقام الحسابات وطبيعة التكلفة' : 'Account-level financial allocation'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {expenseBreakdown.slice(0, 5).map((acc) => (
                <div key={acc.account} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', fontSize: '12px' }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-light)', marginRight: '8px' }}>
                      {acc.account}
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>{acc.category}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {acc.amount.toLocaleString()} SAR
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHART 5: Branch / Entity Spend Comparison */}
        {branchBreakdown.length > 0 && (
          <div className="content-panel">
            <div className="panel-header" style={{ marginBottom: '12px' }}>
              <div>
                <h3 className="panel-title" style={{ fontSize: '14px' }}>
                  {isAr ? 'مقارنة الإنفاق بين الفروع والقطاعات' : 'Branch & Sector Expenditure Comparison'}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  {isAr ? 'مقارنة مراكز التكلفة والمقرات المسجلة' : 'Cost center breakdown across corporate branches'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {branchBreakdown.map((b) => (
                <div key={b.branchCode} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                      {isAr ? b.branchNameAr : b.branchNameEn}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      {b.branchCode} • {b.invoiceCount} {isAr ? 'فواتير' : 'invoices'}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '14px', color: 'var(--status-success)' }}>
                    {b.totalSpend.toLocaleString()} SAR
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
