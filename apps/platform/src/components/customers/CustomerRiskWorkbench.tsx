// MIKHLAFI LABS — Enterprise Customer Health, Receivables Aging & Silent Churn Workbench (Service 06)
// Deterministic Algorithms: Multivariate Customer Health Score (CHS 0-100),
// Order Frequency Velocity Decay Telemetry, DSO Aging & Credit Limit Ceiling Alarms,
// Executive Account Retention Revenue Simulator, and Board-Ready Commercial Governance Dossiers.

import React, { useState, useMemo } from 'react';
import { LocaleMode } from '../../types';
import {
  CustomerAccountRecord,
  PRESET_CUSTOMER_SCENARIOS,
  calculatePortfolioCustomerMetrics,
  parseCustomerLedgerCsv
} from '../../services/customers/customerRiskEngine';
import {
  IconDownload,
  IconX,
  IconCustomer,
  IconFileText,
  IconClock,
  IconTrendingUp
} from '../Icons';

interface CustomerRiskWorkbenchProps {
  locale: LocaleMode;
  initialScenario?: string;
  isEmbeddedInPublicPage?: boolean;
  onRequestAssistance?: (accountDetails: string) => void;
}

export const CustomerRiskWorkbench: React.FC<CustomerRiskWorkbenchProps> = ({
  locale,
  initialScenario = 'b2b_tech',
  isEmbeddedInPublicPage = false,
  onRequestAssistance
}) => {
  const isAr = locale === 'ar';

  // Scenario State
  const [activeScenarioKey, setActiveScenarioKey] = useState<string>(initialScenario);
  const [accounts, setAccounts] = useState<CustomerAccountRecord[]>(() => {
    return PRESET_CUSTOMER_SCENARIOS[initialScenario]?.accounts || PRESET_CUSTOMER_SCENARIOS.b2b_tech.accounts;
  });

  const scenarioMeta = PRESET_CUSTOMER_SCENARIOS[activeScenarioKey] || PRESET_CUSTOMER_SCENARIOS.b2b_tech;

  // Retention Remediation Success Rate Slider (0% to 100%)
  const [retentionRate, setRetentionRate] = useState<number>(80);

  // Tabs State
  const [activeTab, setActiveTab] = useState<'radar' | 'velocity' | 'aging' | 'decree'>('radar');
  const [healthFilter, setHealthFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State for Deep Inspection
  const [selectedAccount, setSelectedAccount] = useState<CustomerAccountRecord | null>(null);
  const [actionFeedbackMsg, setActionFeedbackMsg] = useState<string | null>(null);

  // Custom File Name
  const [customFileName, setCustomFileName] = useState<string | null>(null);

  // Switch Scenario
  const handleSelectScenario = (key: string) => {
    setActiveScenarioKey(key);
    setCustomFileName(null);
    if (PRESET_CUSTOMER_SCENARIOS[key]) {
      setAccounts(PRESET_CUSTOMER_SCENARIOS[key].accounts);
    }
  };

  // CSV Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const parsed = parseCustomerLedgerCsv(content);
        if (parsed.length > 0) {
          setAccounts(parsed);
          setActiveScenarioKey('custom');
        }
      }
    };
    reader.readAsText(file);
  };

  // Recompute portfolio metrics with current retention rate slider
  const portfolioMetrics = useMemo(() => {
    return calculatePortfolioCustomerMetrics(accounts, retentionRate);
  }, [accounts, retentionRate]);

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((a) => {
      if (healthFilter !== 'all' && a.healthStatus !== healthFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = a.code.toLowerCase().includes(q);
        const matchName = a.nameAr.toLowerCase().includes(q) || a.nameEn.toLowerCase().includes(q);
        const matchIndustry = a.industryAr.toLowerCase().includes(q) || a.industryEn.toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchIndustry) return false;
      }
      return true;
    });
  }, [accounts, healthFilter, searchQuery]);

  // Download Sample CSV
  const handleDownloadSampleCsv = () => {
    const headers = 'code,name,industry,annual_revenue,dso_days,overdue_sar,velocity_drop_pct,renewal_days\n';
    const rows = [
      'ACC-901,شركة الخدمات المالية المتطورة,الخدمات المصرفية,24000000,55,1800000,-18.5,90',
      'ACC-902,مجموعة الرواد لتجارة التجزئة,سلاسل السوبرماركت,38000000,85,4200000,-32.0,45',
      'ACC-903,شركة الصناعات اللوجستية الحديثة,النقل والشحن,16000000,32,0,5.0,180'
    ].join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mikhlafi_customer_receivables_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Audit CSV
  const handleExportAuditCsv = () => {
    const headers = 'Code,Customer Name,Industry,Tier,Annual Contract (SAR),Health Score,Health Status,DSO Days,Credit Limit (SAR),Outstanding (SAR),Overdue >60D (SAR),Velocity Decay %,Renewal in Days,Disputes,Credit Risk,Director,CR Number\n';
    const rows = accounts.map((a) => {
      return `"${a.code}","${isAr ? a.nameAr : a.nameEn}","${isAr ? a.industryAr : a.industryEn}","${a.tier}",${a.annualContractValueSAR},${a.healthScore},"${a.healthStatus}",${a.daysSalesOutstanding},${a.creditLimitSAR},${a.outstandingReceivablesSAR},${a.overdueReceivablesSAR},${a.spendVelocityDecayPct}%,${a.daysUntilContractRenewal},${a.activeDisputedInvoicesCount},"${a.creditRisk}","${a.assignedAccountDirector}","${a.commercialRegistrationCR}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer_health_churn_audit_${activeScenarioKey}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        maxWidth: isEmbeddedInPublicPage ? '1140px' : '100%',
        margin: '0 auto',
        background: '#0B0F19',
        border: '1px solid rgba(236, 72, 153, 0.35)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: isEmbeddedInPublicPage ? '0 25px 65px rgba(0,0,0,0.7), 0 0 35px rgba(236, 72, 153, 0.18)' : 'none',
        fontFamily: 'inherit'
      }}
    >
      {/* ── Top Cockpit Status Bar ────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(90deg, #4A044E 0%, #180326 100%)',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(236, 72, 153, 0.25)',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          </div>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 800,
              color: '#EC4899',
              letterSpacing: '0.08em'
            }}
          >
            MIKHLAFI_LABS // ENGINE_06 // CUSTOMER_HEALTH_RADAR_V2.3
          </span>
          <span
            style={{
              fontSize: '11px',
              background: 'rgba(236, 72, 153, 0.15)',
              border: '1px solid rgba(236, 72, 153, 0.4)',
              color: '#F472B6',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 700
            }}
          >
            SILENT CHURN & RECEIVABLES
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleDownloadSampleCsv}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#94A3B8',
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <IconDownload size={13} />
            <span>{isAr ? 'نموذج العملاء CSV' : 'Sample CSV'}</span>
          </button>
          <label
            style={{
              background: 'rgba(236, 72, 153, 0.15)',
              border: '1px solid rgba(236, 72, 153, 0.4)',
              color: '#FBCFE8',
              padding: '5px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'inline-block'
            }}
          >
            {customFileName ? (
              <span>📁 {customFileName}</span>
            ) : (
              <span>{isAr ? 'رفع سجل المبيعات والمدينين' : 'Upload AR Ledger CSV'}</span>
            )}
            <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* ── Scenario Switcher & Header ────────────────────────────────────── */}
      <div
        style={{
          padding: '22px 24px',
          background: 'rgba(15, 23, 42, 0.65)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '18px'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#EC4899', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              {isAr ? 'سيناريوهات محافظ العملاء والتحصيل الائتماني' : 'B2B CUSTOMER TELEMETRY SCENARIOS'}
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#F8FAFC', margin: 0 }}>
              {customFileName
                ? (isAr ? `سجل العملاء المرفوع: ${customFileName}` : `Custom AR Ledger: ${customFileName}`)
                : (isAr ? scenarioMeta.nameAr : scenarioMeta.nameEn)}
            </h2>
            <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>
              {isAr ? scenarioMeta.descriptionAr : scenarioMeta.descriptionEn}
            </div>
          </div>

          {/* Scenario Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              background: 'rgba(0, 0, 0, 0.35)',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {Object.keys(PRESET_CUSTOMER_SCENARIOS).map((key) => {
              const sc = PRESET_CUSTOMER_SCENARIOS[key];
              const isSelected = activeScenarioKey === key && !customFileName;
              return (
                <button
                  key={key}
                  onClick={() => handleSelectScenario(key)}
                  style={{
                    background: isSelected ? '#EC4899' : 'transparent',
                    color: isSelected ? '#FFFFFF' : '#94A3B8',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease'
                  }}
                >
                  {isAr ? sc.nameAr.split('(')[0] : sc.nameEn.split('&')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Interactive Account Retention Remediation Slider ─────────────── */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.12) 0%, rgba(15, 23, 42, 0.7) 100%)',
            border: '1px solid rgba(236, 72, 153, 0.35)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginTop: '12px'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '10px'
            }}
          >
            <div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#FBCFE8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EC4899' }} />
                {isAr ? 'مُحاكي التدخل التنفيذي لاستبقاء العملاء المعرضين للفقدان (Retention Remediation Rate)' : 'Executive Account Retention & Churn Recovery Simulator'}
              </span>
              <span style={{ fontSize: '11px', color: '#94A3B8', marginInlineStart: '16px' }}>
                {isAr
                  ? 'يحدد نسبة نجاح التدخل الاستباقي للرئيس التنفيذي وفريق المبيعات في استبقاء الحسابات المعرضة للانسحاب الصامت وتجديد عقودها'
                  : 'Models retained Annual Recurring Revenue (ARR) secured when executing proactive C-level account remediation'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>{isAr ? 'نسبة نجاح الاستبقاء' : 'Retention Rate'}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#F472B6', fontFamily: 'var(--font-mono, monospace)' }}>
                  {retentionRate}%
                </div>
              </div>
              <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>{isAr ? 'الإيرادات المحمية من الفقدان' : 'Protected ARR'}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-mono, monospace)' }}>
                  +{(portfolioMetrics.projectedRetainedRevenueSAR / 1_000_000).toFixed(2)}M SAR
                </div>
              </div>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={retentionRate}
            onChange={(e) => setRetentionRate(parseInt(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#EC4899',
              cursor: 'pointer',
              height: '6px'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748B', marginTop: '6px', fontFamily: 'var(--font-mono, monospace)' }}>
            <span>0% ({isAr ? 'خسارة كاملة للحسابات المنسحبة' : 'Total Churn Write-off'})</span>
            <span>50% ({isAr ? 'استبقاء جزئي / تسوية اعتيادية' : 'Baseline Sales Effort'})</span>
            <span>80% ({isAr ? 'معيار تدخل مخلافي لابس الاستباقي' : 'Mikhlafi Labs Proactive Intervention'})</span>
            <span>100% ({isAr ? 'استبقاء وتجديد كامل لكافة العقود' : '100% Account Preservation'})</span>
          </div>
        </div>
      </div>

      {/* ── Executive KPI Telemetry Bar ───────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1px',
          background: 'rgba(255, 255, 255, 0.06)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* KPI 1: Monitored Contract Portfolio ARR */}
        <div style={{ background: '#0F172A', padding: '18px 22px' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, marginBottom: '6px' }}>
            {isAr ? 'إجمالي قيمة عقود العملاء السنوية' : 'MONITORED ANNUAL ARR'}
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#F8FAFC', fontFamily: 'var(--font-mono, monospace)' }}>
            {(portfolioMetrics.totalMonitoredRevenueSAR / 1_000_000).toFixed(1)}M
            <span style={{ fontSize: '12px', color: '#64748B', marginInlineStart: '6px' }}>SAR</span>
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
            {isAr
              ? `عبر ${portfolioMetrics.totalAccountCount} حسابات استراتيجية`
              : `Across ${portfolioMetrics.totalAccountCount} strategic client accounts`}
          </div>
        </div>

        {/* KPI 2: Revenue At Risk & Critical Accounts */}
        <div style={{ background: '#0F172A', padding: '18px 22px' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, marginBottom: '6px' }}>
            {isAr ? 'الإيرادات المعرضة لخطر الفقدان الصامت' : 'REVENUE AT CHURN RISK'}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.65rem', fontWeight: 900, color: '#EF4444', fontFamily: 'var(--font-mono, monospace)' }}>
              {(portfolioMetrics.totalRevenueAtRiskSAR / 1_000_000).toFixed(1)}M
              <span style={{ fontSize: '12px', color: '#64748B', marginInlineStart: '6px' }}>SAR</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: 700 }}>
              {portfolioMetrics.criticalChurnAccountCount} {isAr ? 'حساب حرج' : 'Critical'}
            </span>
            <span style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 700 }}>
              {portfolioMetrics.atRiskAccountCount} {isAr ? 'قيد التراجع' : 'At Risk'}
            </span>
            <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>
              {portfolioMetrics.healthyAccountCount} {isAr ? 'سليم' : 'Healthy'}
            </span>
          </div>
        </div>

        {/* KPI 3: Overdue Receivables (>60 Days) */}
        <div style={{ background: '#0F172A', padding: '18px 22px' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, marginBottom: '6px' }}>
            {isAr ? 'المديونيات المتأخرة والديون المتعثرة' : 'OVERDUE RECEIVABLES (>60D)'}
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#F59E0B', fontFamily: 'var(--font-mono, monospace)' }}>
            {(portfolioMetrics.totalOverdueReceivablesSAR / 1_000_000).toFixed(2)}M
            <span style={{ fontSize: '12px', color: '#64748B', marginInlineStart: '6px' }}>SAR</span>
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
            {isAr
              ? `متوسط زمن التحصيل (DSO): ${portfolioMetrics.avgDaysSalesOutstanding} يوماً`
              : `Average DSO Aging: ${portfolioMetrics.avgDaysSalesOutstanding} Days`}
          </div>
        </div>

        {/* KPI 4: Portfolio Health Index */}
        <div style={{ background: '#0F172A', padding: '18px 22px' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, marginBottom: '6px' }}>
            {isAr ? 'مؤشر صحة علاقات العملاء العام (CHS)' : 'PORTFOLIO HEALTH SCORE'}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span
              style={{
                fontSize: '1.65rem',
                fontWeight: 900,
                fontFamily: 'var(--font-mono, monospace)',
                color: portfolioMetrics.portfolioAvgHealthScore >= 75 ? '#10B981' : portfolioMetrics.portfolioAvgHealthScore >= 55 ? '#F59E0B' : '#EF4444'
              }}
            >
              {portfolioMetrics.portfolioAvgHealthScore}
              <span style={{ fontSize: '13px', color: '#64748B' }}>/100</span>
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#F472B6', marginTop: '4px' }}>
            {isAr
              ? `محمي بوفر استبقاء +${(portfolioMetrics.projectedRetainedRevenueSAR / 1_000_000).toFixed(1)}M SAR`
              : `Protected via retention playbook: +${(portfolioMetrics.projectedRetainedRevenueSAR / 1_000_000).toFixed(1)}M`}
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ──────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#0B0F19',
          padding: '0 24px',
          overflowX: 'auto',
          gap: '8px'
        }}
      >
        <button
          onClick={() => setActiveTab('radar')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'radar' ? '2px solid #EC4899' : '2px solid transparent',
            color: activeTab === 'radar' ? '#EC4899' : '#94A3B8',
            padding: '16px 18px',
            fontSize: '13px',
            fontWeight: activeTab === 'radar' ? 800 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <IconCustomer size={15} />
          <span>{isAr ? 'رادار صحة العملاء ومكافحة الانسحاب الصامت' : 'Customer Health & Silent Churn Radar'}</span>
          <span
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '999px',
              background: 'rgba(236, 72, 153, 0.2)',
              color: '#FBCFE8'
            }}
          >
            {filteredAccounts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('velocity')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'velocity' ? '2px solid #EC4899' : '2px solid transparent',
            color: activeTab === 'velocity' ? '#EC4899' : '#94A3B8',
            padding: '16px 18px',
            fontSize: '13px',
            fontWeight: activeTab === 'velocity' ? 800 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <IconTrendingUp size={15} />
          <span>{isAr ? 'مصفوفة وتيرة الطلبات وتآكل الإيراد (Velocity Decay)' : 'Order Velocity Decay Telemetry'}</span>
        </button>

        <button
          onClick={() => setActiveTab('aging')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'aging' ? '2px solid #EC4899' : '2px solid transparent',
            color: activeTab === 'aging' ? '#EC4899' : '#94A3B8',
            padding: '16px 18px',
            fontSize: '13px',
            fontWeight: activeTab === 'aging' ? 800 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <IconClock size={15} />
          <span>{isAr ? 'مصفوفة أعمار الديون والتحصيل (DSO Aging Matrix)' : 'Receivables Aging & DSO Credit Exposure'}</span>
          <span
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '999px',
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#FCD34D'
            }}
          >
            {(portfolioMetrics.totalOverdueReceivablesSAR / 1_000_000).toFixed(1)}M SAR
          </span>
        </button>

        <button
          onClick={() => setActiveTab('decree')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'decree' ? '2px solid #EC4899' : '2px solid transparent',
            color: activeTab === 'decree' ? '#EC4899' : '#94A3B8',
            padding: '16px 18px',
            fontSize: '13px',
            fontWeight: activeTab === 'decree' ? 800 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <IconFileText size={15} />
          <span>{isAr ? 'محضر حوكمة الائتمان التجاري لمجلس الإدارة' : 'Commercial Governance & Credit Decree'}</span>
        </button>
      </div>

      {/* ── Main Tab Content ──────────────────────────────────────────────── */}
      <div style={{ padding: '24px' }}>
        {actionFeedbackMsg && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#6EE7B7',
              padding: '12px 18px',
              borderRadius: '8px',
              marginBottom: '18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{actionFeedbackMsg}</span>
            <button
              onClick={() => setActionFeedbackMsg(null)}
              style={{ background: 'none', border: 'none', color: '#6EE7B7', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ── TAB 1: CUSTOMER HEALTH RADAR ─────────────────────────────────── */}
        {activeTab === 'radar' && (
          <div>
            {/* Filter & Search Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px',
                marginBottom: '20px'
              }}
            >
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { key: 'all', labelAr: 'كافة العملاء', labelEn: 'All Accounts' },
                  { key: 'CRITICAL_CHURN', labelAr: 'انسحاب صامت وشيك (حرج)', labelEn: 'Critical Churn' },
                  { key: 'AT_RISK', labelAr: 'حسابات قيد التراجع والتباطؤ', labelEn: 'At Risk' },
                  { key: 'HEALTHY', labelAr: 'حسابات مستقرة ونامية', labelEn: 'Healthy Accounts' }
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setHealthFilter(f.key)}
                    style={{
                      background: healthFilter === f.key ? '#EC4899' : 'rgba(255, 255, 255, 0.05)',
                      border: healthFilter === f.key ? '1px solid #EC4899' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: healthFilter === f.key ? '#FFFFFF' : '#94A3B8',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {isAr ? f.labelAr : f.labelEn}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder={isAr ? 'بحث بالكود، اسم العميل، القطاع...' : 'Search account, code, industry...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                    width: '260px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={handleExportAuditCsv}
                  style={{
                    background: 'rgba(236, 72, 153, 0.15)',
                    border: '1px solid rgba(236, 72, 153, 0.4)',
                    color: '#F472B6',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <IconDownload size={14} />
                  <span>{isAr ? 'تصدير التدقيق' : 'Export Audit'}</span>
                </button>
              </div>
            </div>

            {/* Account Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                gap: '16px'
              }}
            >
              {filteredAccounts.map((a) => {
                const protectedARR = (a.annualContractValueSAR * retentionRate) / 100;
                return (
                  <div
                    key={a.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: a.healthStatus === 'CRITICAL_CHURN'
                        ? '1px solid rgba(239, 68, 68, 0.5)'
                        : a.healthStatus === 'AT_RISK'
                        ? '1px solid rgba(245, 158, 11, 0.4)'
                        : '1px solid rgba(236, 72, 153, 0.25)',
                      borderRadius: '12px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                    }}
                  >
                    {/* Top Accent Strip */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: a.healthStatus === 'CRITICAL_CHURN'
                          ? '#EF4444'
                          : a.healthStatus === 'AT_RISK'
                          ? '#F59E0B'
                          : '#10B981'
                      }}
                    />

                    <div>
                      {/* Code, Tier & Health Score */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono, monospace)',
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#EC4899',
                              background: 'rgba(236, 72, 153, 0.15)',
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}
                          >
                            {a.code}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748B' }}>
                            {a.tier.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 900,
                            padding: '3px 10px',
                            borderRadius: '999px',
                            background: a.healthScore < 50
                              ? 'rgba(239, 68, 68, 0.15)'
                              : a.healthScore < 75
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(16, 185, 129, 0.15)',
                            color: a.healthScore < 50
                              ? '#EF4444'
                              : a.healthScore < 75
                              ? '#F59E0B'
                              : '#10B981',
                            border: `1px solid ${
                              a.healthScore < 50
                                ? 'rgba(239, 68, 68, 0.3)'
                                : a.healthScore < 75
                                ? 'rgba(245, 158, 11, 0.3)'
                                : 'rgba(16, 185, 129, 0.3)'
                            }`,
                            fontFamily: 'var(--font-mono, monospace)'
                          }}
                        >
                          CHS: {a.healthScore}/100
                        </span>
                      </div>

                      {/* Account Name & Industry */}
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#F8FAFC', margin: '0 0 6px 0', lineHeight: 1.35 }}>
                        {isAr ? a.nameAr : a.nameEn}
                      </h3>
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '14px' }}>
                        🏢 {isAr ? a.industryAr : a.industryEn} (CR: {a.commercialRegistrationCR})
                      </div>

                      {/* Financial Metrics Grid */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '8px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          padding: '10px',
                          borderRadius: '8px',
                          marginBottom: '14px'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '10px', color: '#94A3B8' }}>{isAr ? 'قيمة العقد السنوي (ARR)' : 'Contract ARR'}</div>
                          <div style={{ fontSize: '14px', fontWeight: 900, fontFamily: 'var(--font-mono, monospace)', color: '#F8FAFC' }}>
                            {(a.annualContractValueSAR / 1_000_000).toFixed(1)}M SAR
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', color: '#94A3B8' }}>{isAr ? 'انحراف وتيرة الطلب' : 'Order Velocity Drop'}</div>
                          <div
                            style={{
                              fontSize: '14px',
                              fontWeight: 900,
                              fontFamily: 'var(--font-mono, monospace)',
                              color: a.spendVelocityDecayPct < -20 ? '#EF4444' : a.spendVelocityDecayPct < 0 ? '#F59E0B' : '#10B981'
                            }}
                          >
                            {a.spendVelocityDecayPct > 0 ? '+' : ''}{a.spendVelocityDecayPct}%
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', color: '#94A3B8' }}>{isAr ? 'متوسط فترة السداد (DSO)' : 'DSO Collection'}</div>
                          <div
                            style={{
                              fontSize: '14px',
                              fontWeight: 900,
                              fontFamily: 'var(--font-mono, monospace)',
                              color: a.daysSalesOutstanding > 75 ? '#EF4444' : a.daysSalesOutstanding > 50 ? '#F59E0B' : '#10B981'
                            }}
                          >
                            {a.daysSalesOutstanding} {isAr ? 'يوماً' : 'Days'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', color: '#94A3B8' }}>{isAr ? 'موعد التجديد القادم' : 'Renewal Horizon'}</div>
                          <div
                            style={{
                              fontSize: '14px',
                              fontWeight: 900,
                              fontFamily: 'var(--font-mono, monospace)',
                              color: a.daysUntilContractRenewal < 60 ? '#EF4444' : '#67E8F9'
                            }}
                          >
                            {a.daysUntilContractRenewal} {isAr ? 'يوماً متبقية' : 'Days Left'}
                          </div>
                        </div>
                      </div>

                      {/* Primary Decay Factor & Playbook */}
                      <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '14px' }}>
                        <div style={{ color: '#FCD34D', fontWeight: 700, marginBottom: '4px' }}>
                          ⚠️ {isAr ? a.primaryDecayFactorAr : a.primaryDecayFactorEn}
                        </div>
                        <div style={{ color: '#F472B6', fontSize: '11px' }}>
                          🎯 <strong>{isAr ? 'خطة الاستبقاء:' : 'Playbook:'}</strong> {isAr ? a.recommendedPlaybookAr : a.recommendedPlaybookEn}
                        </div>
                      </div>

                      {/* Overdue receivables warning if any */}
                      {a.overdueReceivablesSAR > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '8px', color: '#EF4444' }}>
                          <span>{isAr ? 'مستحقات متأخرة > 60 يوماً:' : 'Overdue Arrears (>60D):'}</span>
                          <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono, monospace)' }}>
                            {(a.overdueReceivablesSAR / 1_000_000).toFixed(2)}M SAR
                          </span>
                        </div>
                      )}

                      {/* Protected ARR via retention */}
                      {a.healthStatus !== 'HEALTHY' && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '14px', color: '#10B981' }}>
                          <span>{isAr ? 'الإيرادات المحمية بالاستبقاء:' : 'Protected ARR Target:'}</span>
                          <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono, monospace)' }}>
                            +{(protectedARR / 1_000_000).toFixed(2)}M SAR
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action & Account Owner */}
                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '10px' }}>
                        👤 {a.assignedAccountDirector}
                      </div>
                      <button
                        onClick={() => setSelectedAccount(a)}
                        style={{
                          width: '100%',
                          background: 'rgba(236, 72, 153, 0.15)',
                          border: '1px solid rgba(236, 72, 153, 0.4)',
                          color: '#F472B6',
                          borderRadius: '8px',
                          padding: '9px 0',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.18s ease'
                        }}
                      >
                        {isAr ? 'فحص بيانات العميل وتفعيل خطة الاستبقاء' : 'Inspect Account & Trigger Retention'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 2: ORDER VELOCITY DECAY TELEMETRY ────────────────────────── */}
        {activeTab === 'velocity' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC', margin: '0 0 6px 0' }}>
                {isAr ? 'مصفوفة رصد تآكل وتيرة الطلبات (Purchasing Velocity Telemetry)' : 'Order Velocity Contraction Telemetry Grid'}
              </h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                {isAr
                  ? 'مقارنة المتوسط التاريخي للاستهلاك الشهري مع الأشهر الثلاثة الأخيرة لرصد التحول الصامت نحو المنافسين قبل الإلغاء الرسمي.'
                  : 'Empirical comparison between 12-month baseline ordering volume and recent 90-day transactions to flag volume siphoning.'}
              </p>
            </div>

            <div style={{ overflowX: 'auto', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#4A044E', borderBottom: '1px solid rgba(236, 72, 153, 0.3)', color: '#FBCFE8' }}>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'الكود' : 'Code'}</th>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'العميل' : 'Customer Account'}</th>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'متوسط الصرف الشهري' : 'Monthly Baseline'}</th>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'الصرف الفعلي الحالي' : 'Trailing Actual'}</th>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'انحراف الوتيرة' : 'Velocity Decay %'}</th>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'صحة العميل' : 'Health Score'}</th>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'الإجراء التنفيذي' : 'Executive Action'}</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((a) => (
                    <tr key={a.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono, monospace)', color: '#EC4899', fontWeight: 700 }}>
                        {a.code}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#F8FAFC', fontWeight: 600 }}>
                        {isAr ? a.nameAr : a.nameEn}
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono, monospace)', color: '#94A3B8' }}>
                        {(a.monthlyBaselineSpendSAR / 1_000).toFixed(0)}K SAR
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono, monospace)', color: '#F8FAFC', fontWeight: 700 }}>
                        {(a.recentMonthlySpendSAR / 1_000).toFixed(0)}K SAR
                      </td>
                      <td
                        style={{
                          padding: '12px 14px',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontWeight: 800,
                          color: a.spendVelocityDecayPct < -20 ? '#EF4444' : a.spendVelocityDecayPct < 0 ? '#F59E0B' : '#10B981'
                        }}
                      >
                        {a.spendVelocityDecayPct > 0 ? '+' : ''}{a.spendVelocityDecayPct}%
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 800 }}>
                        <span style={{ color: a.healthScore < 50 ? '#EF4444' : a.healthScore < 75 ? '#F59E0B' : '#10B981' }}>
                          {a.healthScore}/100
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <button
                          onClick={() => {
                            setActionFeedbackMsg(
                              isAr
                                ? `تم إرسال بطاقة استبقاء الحساب [${a.code}] إلى مدير المبيعات التنفيذي لترتيب زيارة ميدانية عاجلة.`
                                : `Account retention mandate issued for [${a.code}]. Dedicated C-level taskforce deployed.`
                            );
                          }}
                          style={{
                            background: 'rgba(236, 72, 153, 0.15)',
                            border: '1px solid rgba(236, 72, 153, 0.4)',
                            color: '#F472B6',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {isAr ? 'تفعيل الاستبقاء' : 'Deploy Retention'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: RECEIVABLES AGING & DSO CREDIT MATRIX ──────────────────── */}
        {activeTab === 'aging' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC', margin: '0 0 6px 0' }}>
                {isAr ? 'مصفوفة أعمار الديون ومخاطر الائتمان التجاري (DSO Aging Matrix)' : 'Receivables Aging & Days Sales Outstanding (DSO) Matrix'}
              </h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                {isAr
                  ? 'مراقبة سقف الائتمان الممنوح لكل عميل، تراكم المستحقات المتأخرة، وإشارات التعثر قبل الوصول لمرحلة الديون المشكوك في تحصيلها.'
                  : 'Credit ceiling utilization, overdue aging cohorts (>60 and >90 days), and automated credit freeze enforcement.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {accounts.map((a) => {
                const creditUtilizationPct = a.creditLimitSAR > 0 ? (a.outstandingReceivablesSAR / a.creditLimitSAR) * 100 : 0;
                return (
                  <div
                    key={a.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: a.creditRisk === 'HIGH_DELINQUENCY'
                        ? '1px solid rgba(239, 68, 68, 0.5)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '18px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#EC4899', fontWeight: 800 }}>
                        {a.code}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: a.creditRisk === 'HIGH_DELINQUENCY' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: a.creditRisk === 'HIGH_DELINQUENCY' ? '#EF4444' : '#10B981'
                        }}
                      >
                        {a.creditRisk.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#F8FAFC', margin: '0 0 6px 0' }}>
                      {isAr ? a.nameAr : a.nameEn}
                    </h4>

                    {/* Credit Limit Progress */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>
                        <span>{isAr ? 'استغلال سقف الائتمان:' : 'Credit Utilization:'}</span>
                        <span style={{ fontWeight: 800, color: creditUtilizationPct > 90 ? '#EF4444' : '#F8FAFC', fontFamily: 'var(--font-mono, monospace)' }}>
                          {creditUtilizationPct.toFixed(1)}% ({(a.outstandingReceivablesSAR / 1_000_000).toFixed(2)}M / {(a.creditLimitSAR / 1_000_000).toFixed(1)}M SAR)
                        </span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(100, creditUtilizationPct)}%`,
                            background: creditUtilizationPct > 90 ? '#EF4444' : creditUtilizationPct > 70 ? '#F59E0B' : '#10B981',
                            borderRadius: '999px'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#94A3B8' }}>{isAr ? 'فترة السداد (DSO):' : 'DSO Collection:'}</span>
                        <span style={{ fontWeight: 800, color: a.daysSalesOutstanding > 75 ? '#EF4444' : '#F8FAFC', fontFamily: 'var(--font-mono, monospace)' }}>
                          {a.daysSalesOutstanding} {isAr ? 'يوماً' : 'Days'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94A3B8' }}>{isAr ? 'فواتير متنازع عليها:' : 'Disputed Invoices:'}</span>
                        <span style={{ fontWeight: 800, color: a.activeDisputedInvoicesCount > 0 ? '#F59E0B' : '#10B981', fontFamily: 'var(--font-mono, monospace)' }}>
                          {a.activeDisputedInvoicesCount}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActionFeedbackMsg(
                          isAr
                            ? `تم إصدار إشعار تعليق الائتمان المؤقت للعميل [${a.code}] حتى سداد المستحقات المتأخرة.`
                            : `Credit hold directive enacted for [${a.code}] pending overdue arrears settlement.`
                        );
                      }}
                      style={{
                        width: '100%',
                        background: a.creditRisk === 'HIGH_DELINQUENCY' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(236, 72, 153, 0.15)',
                        border: a.creditRisk === 'HIGH_DELINQUENCY' ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(236, 72, 153, 0.35)',
                        color: a.creditRisk === 'HIGH_DELINQUENCY' ? '#FCA5A5' : '#F472B6',
                        borderRadius: '6px',
                        padding: '8px 0',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {isAr ? 'تطبيق إجراءات تعليق الائتمان المشروط' : 'Enforce Conditional Credit Freeze'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 4: COMMERCIAL BOARD DECREE ───────────────────────────────── */}
        {activeTab === 'decree' && (
          <div
            style={{
              background: '#0F172A',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              borderRadius: '12px',
              padding: '28px',
              maxWidth: '960px',
              margin: '0 auto',
              color: '#F8FAFC'
            }}
          >
            {/* Header Memo */}
            <div
              style={{
                borderBottom: '2px solid rgba(236, 72, 153, 0.4)',
                paddingBottom: '20px',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#EC4899', fontFamily: 'var(--font-mono, monospace)', fontWeight: 800 }}>
                  KINGDOM OF SAUDI ARABIA // COMMERCIAL RETENTION & CREDIT COUNCIL
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#F8FAFC', margin: '4px 0' }}>
                  {isAr ? 'محضر وقرار حوكمة الائتمان التجاري واستبقاء العملاء لمجلس الإدارة' : 'Executive Board Commercial Credit Governance & Client Retention Decree'}
                </h2>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  {isAr ? `تاريخ الاعتماد: ${new Date().toLocaleDateString('ar-SA')} | المرجع: COMM-RET-2026-KSA` : `Issued: ${new Date().toLocaleDateString('en-US')} | Ref: COMM-RET-2026-KSA`}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#F8FAFC',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🖨 {isAr ? 'طباعة المحضر' : 'Print Decree'}
                </button>
                <button
                  onClick={handleExportAuditCsv}
                  style={{
                    background: '#EC4899',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <IconDownload size={14} />
                  <span>{isAr ? 'تصدير السجل كاملاً' : 'Export Full Audit'}</span>
                </button>
              </div>
            </div>

            {/* Decree Body */}
            <div style={{ fontSize: '13px', lineHeight: 1.7, color: '#CBD5E1', marginBottom: '22px' }}>
              <p>
                {isAr
                  ? `بناءً على الصلاحيات الممنوحة للجنة المراجعة التجارية والائتمانية، وفحص مؤشرات صحة العملاء لمحفظة بقيمة ${(portfolioMetrics.totalMonitoredRevenueSAR / 1_000_000).toFixed(1)} مليون ريال سعودي، ورصد مخاطر تراجع وانحراف سداد بقيمة ${(portfolioMetrics.totalRevenueAtRiskSAR / 1_000_000).toFixed(1)} مليون ر.س، يُقرر مجلس الإدارة القرارات التنفيذية الإلزامية التالية:`
                  : `Pursuant to Commercial Credit Committee mandate covering ${(portfolioMetrics.totalMonitoredRevenueSAR / 1_000_000).toFixed(1)}M SAR client portfolio, the board enacts the following binding directives:`}
              </p>
            </div>

            {/* Directive Clauses */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
              <div style={{ background: 'rgba(236, 72, 153, 0.1)', borderLeft: isAr ? 'none' : '4px solid #EC4899', borderRight: isAr ? '4px solid #EC4899' : 'none', padding: '14px 18px', borderRadius: '4px' }}>
                <div style={{ fontWeight: 800, color: '#F472B6', marginBottom: '4px' }}>
                  {isAr ? '1. إطلاق برنامج التدخل التنفيذي لاستبقاء الحسابات الحرجة (VIP Retention Taskforce)' : '1. Executive C-Level Intervention on All Accounts with CHS < 50'}
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  {isAr
                    ? `إلزام الإدارة التجارية بتنفيذ خطة استبقاء عاجلة لعدد ${portfolioMetrics.criticalChurnAccountCount} عملاء حرجين وتأمين إيرادات سنوية متكررة بقيمة +${(portfolioMetrics.projectedRetainedRevenueSAR / 1_000_000).toFixed(2)} مليون ر.س وفق نسبة نجاح ${retentionRate}%.`
                    : `Commercial VP must lead account remediation sprints for ${portfolioMetrics.criticalChurnAccountCount} critical accounts, protecting ${(portfolioMetrics.projectedRetainedRevenueSAR / 1_000_000).toFixed(2)}M SAR in contract ARR.`}
                </div>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: isAr ? 'none' : '4px solid #EF4444', borderRight: isAr ? '4px solid #EF4444' : 'none', padding: '14px 18px', borderRadius: '4px' }}>
                <div style={{ fontWeight: 800, color: '#FCA5A5', marginBottom: '4px' }}>
                  {isAr ? '2. تعليق سقف الائتمان التلقائي عند تجاوز فترة 90 يوماً (Credit Ceiling Freeze)' : '2. Automated Credit Stop on Receivables Exceeding 90 Days'}
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  {isAr
                    ? `تجميد السحب بالآجل لأي عميل تتجاوز مديونياته المتأخرة 60 يوماً لحماية السيولة النقدية البالغة ${(portfolioMetrics.totalOverdueReceivablesSAR / 1_000_000).toFixed(2)} مليون ر.س وإلزامهم بالسداد قبل شحن طلبيات إضافية.`
                    : `Immediate shipment hold on accounts crossing 60-day delinquency aging protecting ${(portfolioMetrics.totalOverdueReceivablesSAR / 1_000_000).toFixed(2)}M SAR working capital.`}
                </div>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: isAr ? 'none' : '4px solid #10B981', borderRight: isAr ? '4px solid #10B981' : 'none', padding: '14px 18px', borderRadius: '4px' }}>
                <div style={{ fontWeight: 800, color: '#6EE7B7', marginBottom: '4px' }}>
                  {isAr ? '3. التسوية السريعة للنزاعات الفنية للفواتير وإغلاق المطالبات' : '3. Rapid Dispute Arbitration & Joint SLA Resolution'}
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  {isAr
                    ? `إلزام فريقي العمليات والتحصيل بإنهاء كافة الفواتير المتنازع عليها خلال 7 أيام عمل وفصل الاعتراض التشغيلي عن التزام سداد أصل المستحقات.`
                    : `Mandatory 7-day technical SLA invoice dispute settlement window to isolate operational issues from core principal debt collection.`}
                </div>
              </div>
            </div>

            {/* Cryptographic Proof & Signatures */}
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                fontSize: '11px'
              }}
            >
              <div>
                <div style={{ color: '#64748B' }}>{isAr ? 'نائب الرئيس للشؤون التجارية والمبيعات:' : 'VP of Commercial Sales:'}</div>
                <div style={{ fontWeight: 800, color: '#F8FAFC', marginTop: '4px' }}>أ. بدر بن عبدالعزيز الرشيد</div>
                <div style={{ color: '#EC4899', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>SIG-COMM-8192-VERIFIED</div>
              </div>
              <div>
                <div style={{ color: '#64748B' }}>{isAr ? 'المدير المالي ورئيس التدقيق الائتماني:' : 'Chief Financial Officer:'}</div>
                <div style={{ fontWeight: 800, color: '#F8FAFC', marginTop: '4px' }}>أ. ريان بن طلال القحطاني</div>
                <div style={{ color: '#EC4899', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>SIG-CFO-9081-VERIFIED</div>
              </div>
              <div>
                <div style={{ color: '#64748B' }}>{isAr ? 'البصمة المشفرة للاعتماد:' : 'Cryptographic Hash:'}</div>
                <div style={{ color: '#10B981', fontFamily: 'var(--font-mono, monospace)', marginTop: '4px', wordBreak: 'break-all' }}>
                  SHA256: 9b2d881e...a409f872
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── DEEP INSPECTION MODAL ─────────────────────────────────────────── */}
      {selectedAccount && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#0F172A',
              border: '1px solid rgba(236, 72, 153, 0.4)',
              borderRadius: '16px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(236, 72, 153, 0.25)',
              color: '#F8FAFC'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#EC4899',
                    background: 'rgba(236, 72, 153, 0.15)',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}
                >
                  {selectedAccount.code}
                </span>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>{selectedAccount.tier}</span>
              </div>
              <button
                onClick={() => setSelectedAccount(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <IconX size={20} />
              </button>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F8FAFC', margin: '0 0 8px 0' }}>
              {isAr ? selectedAccount.nameAr : selectedAccount.nameEn}
            </h3>
            <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '20px' }}>
              🏢 {isAr ? selectedAccount.industryAr : selectedAccount.industryEn} | CR: {selectedAccount.commercialRegistrationCR} | مدير الحساب: {selectedAccount.assignedAccountDirector}
            </div>

            {/* Metrics Breakdown */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '16px',
                borderRadius: '10px',
                marginBottom: '20px'
              }}
            >
              <div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>{isAr ? 'قيمة العقد السنوي' : 'Annual Contract ARR'}</div>
                <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)' }}>
                  {(selectedAccount.annualContractValueSAR / 1_000_000).toFixed(2)}M SAR
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>{isAr ? 'مؤشر صحة العميل' : 'Health Score (CHS)'}</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: selectedAccount.healthScore < 50 ? '#EF4444' : selectedAccount.healthScore < 75 ? '#F59E0B' : '#10B981', fontFamily: 'var(--font-mono, monospace)' }}>
                  {selectedAccount.healthScore}/100
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>{isAr ? 'انحراف وتيرة الطلب' : 'Velocity Decay'}</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: selectedAccount.spendVelocityDecayPct < -20 ? '#EF4444' : '#F59E0B', fontFamily: 'var(--font-mono, monospace)' }}>
                  {selectedAccount.spendVelocityDecayPct}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>{isAr ? 'موعد التجديد القادم' : 'Renewal In'}</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: selectedAccount.daysUntilContractRenewal < 60 ? '#EF4444' : '#F472B6', fontFamily: 'var(--font-mono, monospace)' }}>
                  {selectedAccount.daysUntilContractRenewal} {isAr ? 'يوماً' : 'Days'}
                </div>
              </div>
            </div>

            {/* Operational Directive Details */}
            <div style={{ background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontWeight: 800, color: '#F472B6', fontSize: '13px', marginBottom: '8px' }}>
                💡 {isAr ? 'أسباب الانسحاب الصامت وخطة الاستبقاء المعتمدة' : 'Decay Root Cause & Prescriptive Retention Playbook'}
              </div>
              <div style={{ fontSize: '12px', color: '#CBD5E1', lineHeight: 1.6 }}>
                <strong>{isAr ? 'سبب الانسحاب الصامت:' : 'Decay Factor:'}</strong> {isAr ? selectedAccount.primaryDecayFactorAr : selectedAccount.primaryDecayFactorEn}<br />
                <strong>{isAr ? 'خطة العمل:' : 'Retention Action:'}</strong> {isAr ? selectedAccount.recommendedPlaybookAr : selectedAccount.recommendedPlaybookEn}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedAccount(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#94A3B8',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
              <button
                onClick={() => {
                  const details = `Account ${selectedAccount.code} - ${selectedAccount.nameEn} (ARR: ${(selectedAccount.annualContractValueSAR / 1_000_000).toFixed(1)}M SAR, Health: ${selectedAccount.healthScore}/100, Renewal: ${selectedAccount.daysUntilContractRenewal} days)`;
                  if (onRequestAssistance) {
                    onRequestAssistance(details);
                  } else {
                    setActionFeedbackMsg(
                      isAr
                        ? `تم تفعيل خطة الاستبقاء التنفيذية للعميل [${selectedAccount.code}] وجدولة لقاء قيادي مع صانع القرار.`
                        : `Executive retention playbook deployed for [${selectedAccount.code}]. Dedicated C-level taskforce alerted.`
                    );
                  }
                  setSelectedAccount(null);
                }}
                style={{
                  background: '#EC4899',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '10px 22px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {isAr ? 'إطلاق فريق الاستبقاء واللقاء القيادي' : 'Deploy C-Level Retention Taskforce'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
