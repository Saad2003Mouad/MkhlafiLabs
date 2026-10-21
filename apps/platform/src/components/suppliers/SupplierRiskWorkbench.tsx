// MIKHLAFI LABS — Enterprise Supplier Intelligence & Procurement Risk Workbench (Service 05)
// Deterministic Algorithms: Herfindahl-Hirschman Index (HHI) Monopoly Radar,
// Cross-Branch Price Divergence Arbitrage, Lead-Time Drift SLA Telemetry,
// Volume Consolidation Discount Slider, and Board-Ready Vendor Governance Dossiers.

import React, { useState, useMemo } from 'react';
import { LocaleMode } from '../../types';
import { SandboxNotice } from '../common/SandboxNotice';
import {
  SupplierRecord,
  PRESET_SUPPLIER_SCENARIOS,
  calculatePortfolioSupplierMetrics,
  parseSupplierLedgerCsv
} from '../../services/suppliers/supplierRiskEngine';
import {
  IconDownload,
  IconX,
  IconTruck,
  IconAlertTriangle,
  IconFileText,
  IconTrendingUp
} from '../Icons';

interface SupplierRiskWorkbenchProps {
  locale: LocaleMode;
  initialScenario?: string;
  isEmbeddedInPublicPage?: boolean;
  onRequestAssistance?: (supplierDetails: string) => void;
}

export const SupplierRiskWorkbench: React.FC<SupplierRiskWorkbenchProps> = ({
  locale,
  initialScenario = 'fmcg_retail',
  isEmbeddedInPublicPage = false,
  onRequestAssistance
}) => {
  const isAr = locale === 'ar';

  // Scenario State
  const [activeScenarioKey, setActiveScenarioKey] = useState<string>(initialScenario);
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>(() => {
    return PRESET_SUPPLIER_SCENARIOS[initialScenario]?.suppliers || PRESET_SUPPLIER_SCENARIOS.fmcg_retail.suppliers;
  });

  const scenarioMeta = PRESET_SUPPLIER_SCENARIOS[activeScenarioKey] || PRESET_SUPPLIER_SCENARIOS.fmcg_retail;

  // Volume Consolidation Target Discount Slider (0% to 25%)
  const [discountRate, setDiscountRate] = useState<number>(14);

  // Tabs State
  const [activeTab, setActiveTab] = useState<'scorecard' | 'arbitrage' | 'concentration' | 'decree'>('scorecard');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State for Deep Inspection
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierRecord | null>(null);
  const [actionFeedbackMsg, setActionFeedbackMsg] = useState<string | null>(null);

  // Custom File Name
  const [customFileName, setCustomFileName] = useState<string | null>(null);

  // Switch Scenario
  const handleSelectScenario = (key: string) => {
    setActiveScenarioKey(key);
    setCustomFileName(null);
    if (PRESET_SUPPLIER_SCENARIOS[key]) {
      setSuppliers(PRESET_SUPPLIER_SCENARIOS[key].suppliers);
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
        const parsed = parseSupplierLedgerCsv(content);
        if (parsed.length > 0) {
          setSuppliers(parsed);
          setActiveScenarioKey('custom');
        }
      }
    };
    reader.readAsText(file);
  };

  // Portfolio Metrics recomputed dynamically with the discount slider
  const portfolioMetrics = useMemo(() => {
    return calculatePortfolioSupplierMetrics(suppliers, discountRate);
  }, [suppliers, discountRate]);

  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      if (riskFilter !== 'all' && s.riskLevel !== riskFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = s.code.toLowerCase().includes(q);
        const matchName = s.nameAr.toLowerCase().includes(q) || s.nameEn.toLowerCase().includes(q);
        const matchCategory = s.categoryAr.toLowerCase().includes(q) || s.categoryEn.toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchCategory) return false;
      }
      return true;
    });
  }, [suppliers, riskFilter, searchQuery]);

  // Download Sample CSV
  const handleDownloadSampleCsv = () => {
    const headers = 'code,name,category,annual_spend,branch_count,price_variance_pct,lead_time_days,ontime_pct\n';
    const rows = [
      'VND-801,مصنع الكابلات السعودية الكبرى,كابلات وموصلات نحاسية,28000000,14,18.5,21,78',
      'VND-802,الشركة الوطنية لمواد التعبئة,كرتون وتغليف مرن,12500000,24,14.0,7,88',
      'VND-803,مؤسسة اللوجستيات وسيارات التبريد,شحن مبرد وخدمات نقل,9400000,18,9.5,4,92'
    ].join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mikhlafi_supplier_spend_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Audit CSV
  const handleExportAuditCsv = () => {
    const headers = 'Code,Supplier Name,Category,Tier,Annual Spend (SAR),Spend Share %,Branches,Price Variance %,Promised Lead (Days),Actual Lead (Days),Lead Drift (Days),SLA On-Time %,Quality Rejection %,Payment Terms,Risk Level,CR Number\n';
    const rows = suppliers.map((s) => {
      return `"${s.code}","${isAr ? s.nameAr : s.nameEn}","${isAr ? s.categoryAr : s.categoryEn}","${s.tier}",${s.annualSpendSAR},${s.spendSharePct}%,${s.branchCount},${s.priceVariancePct}%,${s.promisedLeadTimeDays},${s.actualAvgLeadTimeDays},${s.leadTimeDriftDays},${s.onTimeDeliveryPct}%,${s.qualityRejectionPct}%,${s.paymentTermsDays} Days,"${s.riskLevel}","${s.commercialRegistrationCR}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `procurement_supplier_audit_${activeScenarioKey}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        maxWidth: isEmbeddedInPublicPage ? '1140px' : '100%',
        margin: '0 auto',
        background: '#0B0F19',
        border: '1px solid rgba(6, 182, 212, 0.35)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: isEmbeddedInPublicPage ? '0 25px 65px rgba(0,0,0,0.7), 0 0 35px rgba(6, 182, 212, 0.18)' : 'none',
        fontFamily: 'inherit'
      }}
    >
      <SandboxNotice locale={locale} variant={isEmbeddedInPublicPage ? 'public' : 'app'} />

      {/* ── Top Cockpit Status Bar ────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(90deg, #082F49 0%, #0F172A 100%)',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(6, 182, 212, 0.25)',
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
              color: '#06B6D4',
              letterSpacing: '0.08em'
            }}
          >
            MIKHLAFI_LABS // ENGINE_05 // SUPPLIER_INTELLIGENCE_RADAR_V2.2
          </span>
          <span
            style={{
              fontSize: '11px',
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              color: '#67E8F9',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 700
            }}
          >
            HHI & SUPPLY CONTINUITY
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
            <span>{isAr ? 'نموذج الموردين CSV' : 'Sample CSV'}</span>
          </button>
          <label
            style={{
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              color: '#A5F3FC',
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
              <span>{isAr ? 'رفع سجل المشتريات CSV' : 'Upload Procurement CSV'}</span>
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
            <div style={{ fontSize: '11px', color: '#06B6D4', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              {isAr ? 'سيناريوهات سلاسل الإمداد والمشتريات السعودية' : 'PROCUREMENT RADAR SCENARIOS'}
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#F8FAFC', margin: 0 }}>
              {customFileName
                ? (isAr ? `سجل الموردين المرفوع: ${customFileName}` : `Custom Spend Ledger: ${customFileName}`)
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
            {Object.keys(PRESET_SUPPLIER_SCENARIOS).map((key) => {
              const sc = PRESET_SUPPLIER_SCENARIOS[key];
              const isSelected = activeScenarioKey === key && !customFileName;
              return (
                <button
                  key={key}
                  onClick={() => handleSelectScenario(key)}
                  style={{
                    background: isSelected ? '#06B6D4' : 'transparent',
                    color: isSelected ? '#082F49' : '#94A3B8',
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

        {/* ── Interactive Spend Consolidation & Group Negotiation Slider ───── */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(15, 23, 42, 0.7) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.35)',
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
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#A5F3FC', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06B6D4' }} />
                {isAr ? 'مُحاكي التفاوض والشراء المجمع الموحد (Group Spend Volume Consolidation)' : 'Master Spend Consolidation & Group Discount Simulator'}
              </span>
              <span style={{ fontSize: '11px', color: '#94A3B8', marginInlineStart: '16px' }}>
                {isAr
                  ? 'يحدد نسبة الخصم المستهدفة عند توحيد أوامر الشراء المنفصلة بين الفروع وإلزام المورد باتفاقية مركزية واحدة'
                  : 'Simulates achievable volume rebate discount when consolidating fragmented branch orders into master corporate contracts'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>{isAr ? 'نسبة الخصم المرجوة' : 'Target Volume Discount'}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#67E8F9', fontFamily: 'var(--font-mono, monospace)' }}>
                  {discountRate}%
                </div>
              </div>
              <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>{isAr ? 'الوفر السنوي المحقق' : 'Annual EBITDA Savings'}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-mono, monospace)' }}>
                  +{(portfolioMetrics.projectedVolumeConsolidationSavingsSAR / 1_000_000).toFixed(2)}M SAR
                </div>
              </div>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="25"
            step="1"
            value={discountRate}
            onChange={(e) => setDiscountRate(parseInt(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#06B6D4',
              cursor: 'pointer',
              height: '6px'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748B', marginTop: '6px', fontFamily: 'var(--font-mono, monospace)' }}>
            <span>0% ({isAr ? 'استمرار الوضع الحالي المتفرق' : 'Status Quo Fragmented'})</span>
            <span>8% ({isAr ? 'توحيد فواتير الفرع الرئيسي' : 'Main Entity Alignment'})</span>
            <span>14% ({isAr ? 'اتفاقية إطارية شاملة (Group Master Agreement)' : 'Corporate Master Contract'})</span>
            <span>25% ({isAr ? 'شراء سيادي مسبق الدفع / كميات كبرى' : 'Pre-paid Tier 1 Volume'})</span>
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
        {/* KPI 1: Total Monitored Spend */}
        <div style={{ background: '#0F172A', padding: '18px 22px' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, marginBottom: '6px' }}>
            {isAr ? 'إجمالي الإنفاق السنوي قيد المراقبة' : 'MONITORED ANNUAL SPEND'}
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#F8FAFC', fontFamily: 'var(--font-mono, monospace)' }}>
            {(portfolioMetrics.totalAnnualSpendSAR / 1_000_000).toFixed(1)}M
            <span style={{ fontSize: '12px', color: '#64748B', marginInlineStart: '6px' }}>SAR</span>
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
            {isAr
              ? `عبر ${portfolioMetrics.totalSupplierCount} موردين رئيسيين`
              : `Across ${portfolioMetrics.totalSupplierCount} audited primary vendors`}
          </div>
        </div>

        {/* KPI 2: HHI Concentration Index */}
        <div style={{ background: '#0F172A', padding: '18px 22px' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, marginBottom: '6px' }}>
            {isAr ? 'مؤشر تركز الموردين والاحتكار (HHI Index)' : 'HHI CONCENTRATION SCORE'}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span
              style={{
                fontSize: '1.65rem',
                fontWeight: 900,
                fontFamily: 'var(--font-mono, monospace)',
                color: portfolioMetrics.herfindahlHirschmanIndex > 2500 ? '#EF4444' : portfolioMetrics.herfindahlHirschmanIndex >= 1500 ? '#F59E0B' : '#10B981'
              }}
            >
              {portfolioMetrics.herfindahlHirschmanIndex}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                background: portfolioMetrics.herfindahlHirschmanIndex > 2500 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                color: portfolioMetrics.herfindahlHirschmanIndex > 2500 ? '#EF4444' : '#F59E0B'
              }}
            >
              {portfolioMetrics.herfindahlHirschmanIndex > 2500
                ? (isAr ? 'احتكار عالٍ' : 'High Monopoly')
                : (isAr ? 'تركز متوسط' : 'Moderate')}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
            {isAr
              ? `أكبر 3 موردين يستحوذون على ${portfolioMetrics.top3VendorSpendConcentrationPct}% من الصرف`
              : `Top 3 vendors hold ${portfolioMetrics.top3VendorSpendConcentrationPct}% of spend`}
          </div>
        </div>

        {/* KPI 3: Cross-Branch Price Arbitrage Leakage */}
        <div style={{ background: '#0F172A', padding: '18px 22px' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, marginBottom: '6px' }}>
            {isAr ? 'الهدر المالي من تباين أسعار الفروع' : 'PRICE ARBITRAGE LEAKAGE'}
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#EF4444', fontFamily: 'var(--font-mono, monospace)' }}>
            {(portfolioMetrics.aggregatePriceLeakageSAR / 1_000_000).toFixed(2)}M
            <span style={{ fontSize: '12px', color: '#64748B', marginInlineStart: '6px' }}>SAR</span>
          </div>
          <div style={{ fontSize: '11px', color: '#10B981', marginTop: '4px' }}>
            {isAr
              ? `يمكن استرداده بالكامل فور توحيد التعاقد`
              : `100% recoverable via unified master pricing`}
          </div>
        </div>

        {/* KPI 4: Lead-Time SLA & Critical Vendors */}
        <div style={{ background: '#0F172A', padding: '18px 22px' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, marginBottom: '6px' }}>
            {isAr ? 'معدل الالتزام بالمواعيد (SLA Delivery)' : 'AVG ON-TIME DELIVERY RATE'}
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#67E8F9', fontFamily: 'var(--font-mono, monospace)' }}>
            {portfolioMetrics.avgOnTimeDeliveryRatePct}%
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: 700 }}>
              {portfolioMetrics.criticalVendorCount} {isAr ? 'مورد حرج' : 'Critical'}
            </span>
            <span style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 700 }}>
              {portfolioMetrics.highRiskVendorCount} {isAr ? 'مرتفع الخطورة' : 'High Risk'}
            </span>
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
          onClick={() => setActiveTab('scorecard')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'scorecard' ? '2px solid #06B6D4' : '2px solid transparent',
            color: activeTab === 'scorecard' ? '#06B6D4' : '#94A3B8',
            padding: '16px 18px',
            fontSize: '13px',
            fontWeight: activeTab === 'scorecard' ? 800 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <IconTruck size={15} />
          <span>{isAr ? 'بطاقة الأداء 360° ورادار الموردين' : '360° Supplier Scorecard & SLA Radar'}</span>
          <span
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '999px',
              background: 'rgba(6, 182, 212, 0.2)',
              color: '#A5F3FC'
            }}
          >
            {filteredSuppliers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('arbitrage')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'arbitrage' ? '2px solid #06B6D4' : '2px solid transparent',
            color: activeTab === 'arbitrage' ? '#06B6D4' : '#94A3B8',
            padding: '16px 18px',
            fontSize: '13px',
            fontWeight: activeTab === 'arbitrage' ? 800 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <IconTrendingUp size={15} />
          <span>{isAr ? 'مصفوفة تباين أسعار الفروع (Price Arbitrage)' : 'Cross-Branch Price Arbitrage'}</span>
          <span
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '999px',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#FCA5A5'
            }}
          >
            -{(portfolioMetrics.aggregatePriceLeakageSAR / 1_000_000).toFixed(1)}M SAR
          </span>
        </button>

        <button
          onClick={() => setActiveTab('concentration')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'concentration' ? '2px solid #06B6D4' : '2px solid transparent',
            color: activeTab === 'concentration' ? '#06B6D4' : '#94A3B8',
            padding: '16px 18px',
            fontSize: '13px',
            fontWeight: activeTab === 'concentration' ? 800 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <IconAlertTriangle size={15} />
          <span>{isAr ? 'مصفوفة التركز والتأهيل البديل (HHI Matrix)' : 'HHI Monopoly & Dual-Sourcing Plan'}</span>
        </button>

        <button
          onClick={() => setActiveTab('decree')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'decree' ? '2px solid #06B6D4' : '2px solid transparent',
            color: activeTab === 'decree' ? '#06B6D4' : '#94A3B8',
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
          <span>{isAr ? 'محضر حوكمة المشتريات لمجلس الإدارة (Procurement Decree)' : 'Executive Procurement Governance Decree'}</span>
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

        {/* ── TAB 1: 360° SCORECARD & SLA RADAR ─────────────────────────────── */}
        {activeTab === 'scorecard' && (
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
                  { key: 'all', labelAr: 'كافة الموردين', labelEn: 'All Suppliers' },
                  { key: 'CRITICAL', labelAr: 'موردين حرجين (احتكار وتأخر)', labelEn: 'Critical Risk' },
                  { key: 'HIGH', labelAr: 'مرتفع الخطورة', labelEn: 'High Risk' },
                  { key: 'MEDIUM', labelAr: 'مخاطر تشغيلية متوسطة', labelEn: 'Medium Risk' },
                  { key: 'LOW', labelAr: 'موردين معتمدين ومستقرين', labelEn: 'Certified & Low Risk' }
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setRiskFilter(f.key)}
                    style={{
                      background: riskFilter === f.key ? '#06B6D4' : 'rgba(255, 255, 255, 0.05)',
                      border: riskFilter === f.key ? '1px solid #06B6D4' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: riskFilter === f.key ? '#082F49' : '#94A3B8',
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
                  placeholder={isAr ? 'بحث بالكود، اسم المورد، الصنف...' : 'Search vendor, code, category...'}
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
                    background: 'rgba(6, 182, 212, 0.15)',
                    border: '1px solid rgba(6, 182, 212, 0.4)',
                    color: '#67E8F9',
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

            {/* Supplier Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                gap: '16px'
              }}
            >
              {filteredSuppliers.map((s) => {
                const potentialSavings = (s.annualSpendSAR * discountRate) / 100;
                return (
                  <div
                    key={s.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: s.riskLevel === 'CRITICAL'
                        ? '1px solid rgba(239, 68, 68, 0.5)'
                        : s.riskLevel === 'HIGH'
                        ? '1px solid rgba(245, 158, 11, 0.4)'
                        : '1px solid rgba(6, 182, 212, 0.25)',
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
                        background: s.riskLevel === 'CRITICAL'
                          ? '#EF4444'
                          : s.riskLevel === 'HIGH'
                          ? '#F59E0B'
                          : s.riskLevel === 'MEDIUM'
                          ? '#38BDF8'
                          : '#10B981'
                      }}
                    />

                    <div>
                      {/* Code, Category & Risk Level */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono, monospace)',
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#06B6D4',
                              background: 'rgba(6, 182, 212, 0.15)',
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}
                          >
                            {s.code}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748B' }}>
                            {s.tier.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: '999px',
                            background: s.riskLevel === 'CRITICAL'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : s.riskLevel === 'HIGH'
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(16, 185, 129, 0.15)',
                            color: s.riskLevel === 'CRITICAL'
                              ? '#EF4444'
                              : s.riskLevel === 'HIGH'
                              ? '#F59E0B'
                              : '#10B981',
                            border: `1px solid ${
                              s.riskLevel === 'CRITICAL'
                                ? 'rgba(239, 68, 68, 0.3)'
                                : s.riskLevel === 'HIGH'
                                ? 'rgba(245, 158, 11, 0.3)'
                                : 'rgba(16, 185, 129, 0.3)'
                            }`
                          }}
                        >
                          {s.riskLevel === 'CRITICAL'
                            ? (isAr ? 'حرج // احتكار وتأخير' : 'CRITICAL MONOPOLY')
                            : s.riskLevel === 'HIGH'
                            ? (isAr ? 'مرتفع الخطورة' : 'HIGH RISK')
                            : (isAr ? 'مورد معتمد مستقر' : 'STABLE VENDOR')}
                        </span>
                      </div>

                      {/* Supplier Name & Category */}
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#F8FAFC', margin: '0 0 6px 0', lineHeight: 1.35 }}>
                        {isAr ? s.nameAr : s.nameEn}
                      </h3>
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '14px' }}>
                        📦 {isAr ? s.categoryAr : s.categoryEn} (سجل تجاري: {s.commercialRegistrationCR})
                      </div>

                      {/* Key Operational Grid */}
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
                          <div style={{ fontSize: '10px', color: '#94A3B8' }}>{isAr ? 'الإنفاق السنوي وحصته' : 'Annual Spend (Share)'}</div>
                          <div style={{ fontSize: '14px', fontWeight: 900, fontFamily: 'var(--font-mono, monospace)', color: '#F8FAFC' }}>
                            {(s.annualSpendSAR / 1_000_000).toFixed(1)}M SAR
                            <span style={{ fontSize: '10px', color: '#06B6D4', marginInlineStart: '4px' }}>({s.spendSharePct}%)</span>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', color: '#94A3B8' }}>{isAr ? 'تباين السعر بين الفروع' : 'Branch Price Gap'}</div>
                          <div
                            style={{
                              fontSize: '14px',
                              fontWeight: 900,
                              fontFamily: 'var(--font-mono, monospace)',
                              color: s.priceVariancePct > 15 ? '#EF4444' : s.priceVariancePct > 8 ? '#F59E0B' : '#10B981'
                            }}
                          >
                            +{s.priceVariancePct}%
                            <span style={{ fontSize: '10px', marginInlineStart: '4px', color: '#94A3B8' }}>({s.branchCount} فروع)</span>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', color: '#94A3B8' }}>{isAr ? 'انحراف زمن التوريد (Drift)' : 'Lead-Time Drift'}</div>
                          <div
                            style={{
                              fontSize: '14px',
                              fontWeight: 900,
                              fontFamily: 'var(--font-mono, monospace)',
                              color: s.leadTimeDriftDays > 5 ? '#EF4444' : s.leadTimeDriftDays > 0 ? '#F59E0B' : '#10B981'
                            }}
                          >
                            +{s.leadTimeDriftDays} {isAr ? 'أيام تأخر' : 'Days Lag'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', color: '#94A3B8' }}>{isAr ? 'الالتزام بمواعيد SLA' : 'SLA On-Time'}</div>
                          <div
                            style={{
                              fontSize: '14px',
                              fontWeight: 900,
                              fontFamily: 'var(--font-mono, monospace)',
                              color: s.onTimeDeliveryPct >= 90 ? '#10B981' : s.onTimeDeliveryPct >= 80 ? '#F59E0B' : '#EF4444'
                            }}
                          >
                            {s.onTimeDeliveryPct}%
                          </div>
                        </div>
                      </div>

                      {/* Primary Risk & Recommendation Box */}
                      <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '14px' }}>
                        <div style={{ color: '#FCD34D', fontWeight: 700, marginBottom: '4px' }}>
                          ⚠️ {isAr ? s.primaryRiskFactorAr : s.primaryRiskFactorEn}
                        </div>
                        <div style={{ color: '#67E8F9', fontSize: '11px' }}>
                          💡 <strong>{isAr ? 'التوجيه:' : 'Action:'}</strong> {isAr ? s.recommendedActionAr : s.recommendedActionEn}
                        </div>
                      </div>

                      {/* Potential Consolidation Gain */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '14px' }}>
                        <span style={{ color: '#94A3B8' }}>{isAr ? 'الوفر المحقق عند توحيد العقد:' : 'Consolidated Volume Saving:'}</span>
                        <span style={{ color: '#10B981', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)' }}>
                          +{(potentialSavings / 1_000).toFixed(0)}K SAR
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
                      <button
                        onClick={() => setSelectedSupplier(s)}
                        style={{
                          width: '100%',
                          background: 'rgba(6, 182, 212, 0.15)',
                          border: '1px solid rgba(6, 182, 212, 0.4)',
                          color: '#67E8F9',
                          borderRadius: '8px',
                          padding: '9px 0',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.18s ease'
                        }}
                      >
                        {isAr ? 'فحص ملف المورد وأدلة الأسعار' : 'Inspect Vendor Audit Dossier'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 2: CROSS-BRANCH PRICE ARBITRAGE MATRIX ────────────────────── */}
        {activeTab === 'arbitrage' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC', margin: '0 0 6px 0' }}>
                {isAr ? 'مصفوفة رصد تباين أسعار الفروع لنفس البنود والمواد' : 'Cross-Branch Pricing Arbitrage & Spend Leakage Matrix'}
              </h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                {isAr
                  ? 'رصد الفروقات السعرية التي تدفعها الفروع المستقلة لنفس الموردين دون الاستفادة من الخصم المجمع للشركة الأم.'
                  : 'Empirical cross-branch price divergences highlighting immediate consolidation arbitrage opportunities.'}
              </p>
            </div>

            <div style={{ overflowX: 'auto', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#082F49', borderBottom: '1px solid rgba(6, 182, 212, 0.3)', color: '#67E8F9' }}>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'الكود' : 'Code'}</th>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'المورد' : 'Supplier'}</th>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'الصنف / المادة' : 'Category'}</th>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'الإنفاق السنوي' : 'Annual Spend'}</th>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'عدد الفروع' : 'Branches'}</th>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'أعلى تباين سعر' : 'Price Divergence'}</th>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'الهدر المالي المقدر' : 'Leakage Amount'}</th>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'التصحيح المالي' : 'Corrective Action'}</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => {
                    const branchSpend = s.annualSpendSAR * (Math.max(1, s.branchCount - 1) / Math.max(1, s.branchCount));
                    const estLeakage = branchSpend * (s.priceVariancePct / 100) * 0.45;
                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono, monospace)', color: '#06B6D4', fontWeight: 700 }}>
                          {s.code}
                        </td>
                        <td style={{ padding: '12px 14px', color: '#F8FAFC', fontWeight: 600 }}>
                          {isAr ? s.nameAr : s.nameEn}
                        </td>
                        <td style={{ padding: '12px 14px', color: '#94A3B8' }}>
                          {isAr ? s.categoryAr : s.categoryEn}
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono, monospace)', color: '#F8FAFC' }}>
                          {(s.annualSpendSAR / 1_000_000).toFixed(1)}M SAR
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono, monospace)', color: '#67E8F9', fontWeight: 700 }}>
                          {s.branchCount}
                        </td>
                        <td
                          style={{
                            padding: '12px 14px',
                            fontFamily: 'var(--font-mono, monospace)',
                            fontWeight: 800,
                            color: s.priceVariancePct > 15 ? '#EF4444' : s.priceVariancePct > 8 ? '#F59E0B' : '#10B981'
                          }}
                        >
                          +{s.priceVariancePct}%
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono, monospace)', color: '#EF4444', fontWeight: 800 }}>
                          {(estLeakage / 1_000).toFixed(0)}K SAR
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <button
                            onClick={() => {
                              setActionFeedbackMsg(
                                isAr
                                  ? `تم إصدار أمر توحيد التسعيرة المركزية للمورد [${s.code}] وتعميمه على كافة مدراء فروع المجموعة.`
                                  : `Master price ceiling directive dispatched for [${s.code}] across all branch managers.`
                              );
                            }}
                            style={{
                              background: 'rgba(6, 182, 212, 0.15)',
                              border: '1px solid rgba(6, 182, 212, 0.4)',
                              color: '#67E8F9',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {isAr ? 'توحيد التسعيرة' : 'Standardize Price'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: HHI MONOPOLY MATRIX & DUAL-SOURCING ────────────────────── */}
        {activeTab === 'concentration' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC', margin: '0 0 6px 0' }}>
                {isAr ? 'مصفوفة تركز الموردين وخطط التأهيل البديل (HHI & Dual Sourcing)' : 'Supplier Concentration & Secondary Qualification Matrix'}
              </h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                {isAr
                  ? 'قياس مؤشر هيرفندال-هيرشمان لمنع التبعية المفرطة وتأمين بدائل معتمدة للمواد الحرجة لمنع توقف العمليات.'
                  : 'Herfindahl-Hirschman Index telemetry identifying single-source dependency risks and auto-generating secondary sourcing routes.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {suppliers.map((s) => (
                <div
                  key={s.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: s.dependencyCategory === 'MONOPOLY_SINGLE_SOURCE'
                      ? '1px solid rgba(239, 68, 68, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '18px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#06B6D4', fontWeight: 800 }}>
                      {s.code}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: s.dependencyCategory === 'MONOPOLY_SINGLE_SOURCE' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: s.dependencyCategory === 'MONOPOLY_SINGLE_SOURCE' ? '#EF4444' : '#10B981'
                      }}
                    >
                      {s.dependencyCategory.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#F8FAFC', margin: '0 0 6px 0' }}>
                    {isAr ? s.nameAr : s.nameEn}
                  </h4>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '12px' }}>
                    {isAr ? s.categoryAr : s.categoryEn} — {isAr ? 'حصة الإنفاق:' : 'Spend Share:'} <strong>{s.spendSharePct}%</strong>
                  </div>

                  {/* Share Progress */}
                  <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden', marginBottom: '14px' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${s.spendSharePct}%`,
                        background: s.spendSharePct > 25 ? '#EF4444' : s.spendSharePct > 15 ? '#F59E0B' : '#06B6D4',
                        borderRadius: '999px'
                      }}
                    />
                  </div>

                  <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '8px', marginBottom: '14px', fontSize: '12px' }}>
                    <div style={{ color: '#FCD34D', fontWeight: 700, marginBottom: '4px' }}>
                      {isAr ? 'خطة التأهيل البديل المقترحة:' : 'Recommended Dual-Sourcing Mandate:'}
                    </div>
                    <div style={{ color: '#CBD5E1', lineHeight: 1.5 }}>
                      {isAr ? s.recommendedActionAr : s.recommendedActionEn}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActionFeedbackMsg(
                        isAr
                          ? `تم فتح طلب تأهيل مورد بديل للصنف [${s.categoryAr}] وإرساله للجنة المشتريات الاستراتيجية.`
                          : `Secondary qualification tender launched for category [${s.categoryEn}].`
                      );
                    }}
                    style={{
                      width: '100%',
                      background: 'rgba(6, 182, 212, 0.15)',
                      border: '1px solid rgba(6, 182, 212, 0.35)',
                      color: '#67E8F9',
                      borderRadius: '6px',
                      padding: '8px 0',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {isAr ? 'إطلاق منافسة تأهيل مورد بديل' : 'Launch Secondary Vendor Tender'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 4: PROCUREMENT DECREE DOSSIER ────────────────────────────── */}
        {activeTab === 'decree' && (
          <div
            style={{
              background: '#0F172A',
              border: '1px solid rgba(6, 182, 212, 0.3)',
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
                borderBottom: '2px solid rgba(6, 182, 212, 0.4)',
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
                <div style={{ fontSize: '11px', color: '#06B6D4', fontFamily: 'var(--font-mono, monospace)', fontWeight: 800 }}>
                  KINGDOM OF SAUDI ARABIA // STRATEGIC PROCUREMENT COUNCIL
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#F8FAFC', margin: '4px 0' }}>
                  {isAr ? 'محضر وقرار حوكمة المشتريات وسلاسل الإمداد لمجلس الإدارة' : 'Executive Board Master Procurement Governance Decree'}
                </h2>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  {isAr ? `تاريخ الاعتماد: ${new Date().toLocaleDateString('ar-SA')} | المرجع: PROC-GOV-2026-KSA` : `Issued: ${new Date().toLocaleDateString('en-US')} | Ref: PROC-GOV-2026-KSA`}
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
                    background: '#06B6D4',
                    border: 'none',
                    color: '#082F49',
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
                  ? `بناءً على فحص سجلات أوامر الشراء والتعاقدات عبر كافة فروع المجموعة بإجمالي إنفاق سنوي بلغ ${(portfolioMetrics.totalAnnualSpendSAR / 1_000_000).toFixed(1)} مليون ريال سعودي، ورصد تشتت تعاقدي وهدر تسعيري بقيمة ${(portfolioMetrics.aggregatePriceLeakageSAR / 1_000_000).toFixed(2)} مليون ر.س، يُقرر مجلس الإدارة القرارات التنفيذية الإلزامية التالية:`
                  : `Pursuant to strategic procurement audit covering ${(portfolioMetrics.totalAnnualSpendSAR / 1_000_000).toFixed(1)}M SAR annual group spend, the executive committee enacts the following binding directives:`}
              </p>
            </div>

            {/* Directive Clauses */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
              <div style={{ background: 'rgba(6, 182, 212, 0.1)', borderLeft: isAr ? 'none' : '4px solid #06B6D4', borderRight: isAr ? '4px solid #06B6D4' : 'none', padding: '14px 18px', borderRadius: '4px' }}>
                <div style={{ fontWeight: 800, color: '#67E8F9', marginBottom: '4px' }}>
                  {isAr ? '1. حظر إصدار أوامر شراء منفصلة خارج الاتفاقية الإطارية الموحدة' : '1. Mandatory Prohibition of Decentralized Branch Purchasing'}
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  {isAr
                    ? `إلزام كافة الفروع باعتماد السعر المرجعي الأقل الموحد وتفعيل نسبة الخصم المستهدفة بنسبة ${discountRate}% لتحقيق وفر مباشر بقيمة +${(portfolioMetrics.projectedVolumeConsolidationSavingsSAR / 1_000_000).toFixed(2)} مليون ر.س سنوياً.`
                    : `All subsidiaries must route POs through master group catalog, locking in ${discountRate}% volume discount saving ${(portfolioMetrics.projectedVolumeConsolidationSavingsSAR / 1_000_000).toFixed(2)}M SAR annually.`}
                </div>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: isAr ? 'none' : '4px solid #EF4444', borderRight: isAr ? '4px solid #EF4444' : 'none', padding: '14px 18px', borderRadius: '4px' }}>
                <div style={{ fontWeight: 800, color: '#FCA5A5', marginBottom: '4px' }}>
                  {isAr ? '2. كسر احتكار الموردين الأحاديين وفرض كوتة التأهيل المزدوج (Dual Sourcing)' : '2. Enforce Mandatory Dual-Sourcing Sourcing Quotas'}
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  {isAr
                    ? `حظر تجاوز حصة أي مورد نسبة 45% من مشتريات أي صنف استراتيجي، وإلزام إدارة سلاسل الإمداد بتأهيل موردين محليين معتمدين بدلاء خلال 30 يوماً.`
                    : `No vendor may exceed 45% category allocation; secondary approved supplier onboarding mandated within 30 days.`}
                </div>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: isAr ? 'none' : '4px solid #10B981', borderRight: isAr ? '4px solid #10B981' : 'none', padding: '14px 18px', borderRadius: '4px' }}>
                <div style={{ fontWeight: 800, color: '#6EE7B7', marginBottom: '4px' }}>
                  {isAr ? '3. ربط سداد الفواتير باشتراطات SLA وخفض فترات الائتمان' : '3. SLA-Gated Payment Settlement & Performance Rebates'}
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  {isAr
                    ? `تطبيق خصم تلقائي بنسبة 1.5% عن كل يوم تأخير في مواعيد التوريد المعتمدة، وتحسين فترات السداد لموردي الفئة الثانية والثالثة.`
                    : `Automated debit penalty of 1.5% per delivery lag day on vendor invoices with optimized 60-day DPO.`}
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
                <div style={{ color: '#64748B' }}>{isAr ? 'رئيس قطاع المشتريات وسلاسل الإمداد:' : 'VP of Strategic Sourcing:'}</div>
                <div style={{ fontWeight: 800, color: '#F8FAFC', marginTop: '4px' }}>م. خالد بن منصور التميمي</div>
                <div style={{ color: '#06B6D4', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>SIG-PROC-7712-VERIFIED</div>
              </div>
              <div>
                <div style={{ color: '#64748B' }}>{isAr ? 'المدير المالي التنفيذي (CFO):' : 'Chief Financial Officer:'}</div>
                <div style={{ fontWeight: 800, color: '#F8FAFC', marginTop: '4px' }}>أ. فيصل بن عبدالله الراجحي</div>
                <div style={{ color: '#06B6D4', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>SIG-CFO-9041-VERIFIED</div>
              </div>
              <div>
                <div style={{ color: '#64748B' }}>{isAr ? 'البصمة المشفرة للاعتماد:' : 'Cryptographic Hash:'}</div>
                <div style={{ color: '#10B981', fontFamily: 'var(--font-mono, monospace)', marginTop: '4px', wordBreak: 'break-all' }}>
                  SHA256: 4a9e102f...c890184b
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── DEEP INSPECTION MODAL ─────────────────────────────────────────── */}
      {selectedSupplier && (
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
              border: '1px solid rgba(6, 182, 212, 0.4)',
              borderRadius: '16px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(6, 182, 212, 0.25)',
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
                    color: '#06B6D4',
                    background: 'rgba(6, 182, 212, 0.15)',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}
                >
                  {selectedSupplier.code}
                </span>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>{selectedSupplier.tier}</span>
              </div>
              <button
                onClick={() => setSelectedSupplier(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <IconX size={20} />
              </button>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F8FAFC', margin: '0 0 8px 0' }}>
              {isAr ? selectedSupplier.nameAr : selectedSupplier.nameEn}
            </h3>
            <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '20px' }}>
              📦 {isAr ? selectedSupplier.categoryAr : selectedSupplier.categoryEn} | CR: {selectedSupplier.commercialRegistrationCR} | VAT: {selectedSupplier.vatTaxNumber}
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
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>{isAr ? 'الإنفاق السنوي الإجمالي' : 'Annual Spend'}</div>
                <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)' }}>
                  {(selectedSupplier.annualSpendSAR / 1_000_000).toFixed(2)}M SAR
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>{isAr ? 'فارق سعر الفروع' : 'Branch Price Gap'}</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#EF4444', fontFamily: 'var(--font-mono, monospace)' }}>
                  +{selectedSupplier.priceVariancePct}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>{isAr ? 'دقة مواعيد التوريد' : 'On-Time SLA'}</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#67E8F9', fontFamily: 'var(--font-mono, monospace)' }}>
                  {selectedSupplier.onTimeDeliveryPct}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>{isAr ? 'انحراف زمن الوصول' : 'Lead-Time Drift'}</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#F59E0B', fontFamily: 'var(--font-mono, monospace)' }}>
                  +{selectedSupplier.leadTimeDriftDays} {isAr ? 'أيام' : 'Days'}
                </div>
              </div>
            </div>

            {/* Operational Directive Details */}
            <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontWeight: 800, color: '#67E8F9', fontSize: '13px', marginBottom: '8px' }}>
                💡 {isAr ? 'التحليل الاستراتيجي والتوصية الإلزامية' : 'Procurement Strategic Recommendation'}
              </div>
              <div style={{ fontSize: '12px', color: '#CBD5E1', lineHeight: 1.6 }}>
                <strong>{isAr ? 'عامل الخطورة:' : 'Risk Factor:'}</strong> {isAr ? selectedSupplier.primaryRiskFactorAr : selectedSupplier.primaryRiskFactorEn}<br />
                <strong>{isAr ? 'الإجراء المعتمد:' : 'Action:'}</strong> {isAr ? selectedSupplier.recommendedActionAr : selectedSupplier.recommendedActionEn}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedSupplier(null)}
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
                  const details = `Supplier ${selectedSupplier.code} - ${selectedSupplier.nameEn} (Spend: ${(selectedSupplier.annualSpendSAR / 1_000_000).toFixed(1)}M SAR, Price Gap: +${selectedSupplier.priceVariancePct}%)`;
                  if (onRequestAssistance) {
                    onRequestAssistance(details);
                  } else {
                    setActionFeedbackMsg(
                      isAr
                        ? `تم تسجيل طلب المراجعة التعاقدية للمورد [${selectedSupplier.code}] وسيتواصل معك كبير خبراء المشتريات.`
                        : `Contractual review logged for [${selectedSupplier.code}]. Procurement advisory team alerted.`
                    );
                  }
                  setSelectedSupplier(null);
                }}
                style={{
                  background: '#06B6D4',
                  border: 'none',
                  color: '#082F49',
                  padding: '10px 22px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {isAr ? 'طلب إعادة تفاوض وتوحيد السعر' : 'Initiate Master Price Renegotiation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
