// MIKHLAFI LABS — Enterprise Project Margin & Contract Assurance Workbench (Service 04)
// Deterministic EVM Telemetry (CPI, SPI, EAC, VAC), Variation Order (VO) Settlement Slider,
// Subcontractor Claims Audit, and FIDIC-Compliant Executive Board Governance Dossiers.

import React, { useState, useMemo } from 'react';
import { LocaleMode } from '../../types';
import {
  ProjectContractRecord,
  PRESET_PROJECT_SCENARIOS,
  calculatePortfolioEVM,
  parseProjectPortfolioCsv
} from '../../services/projects/projectMarginEngine';
import {
  IconCheckCircle,
  IconDownload,
  IconX,
  IconProjects,
  IconAlertTriangle,
  IconFileText
} from '../Icons';
import { SandboxNotice } from '../common/SandboxNotice';

interface ProjectMarginWorkbenchProps {
  locale: LocaleMode;
  initialScenario?: string;
  isEmbeddedInPublicPage?: boolean;
  onRequestAssistance?: (projectDetails: string) => void;
}

export const ProjectMarginWorkbench: React.FC<ProjectMarginWorkbenchProps> = ({
  locale,
  initialScenario = 'infrastructure',
  isEmbeddedInPublicPage = false,
  onRequestAssistance
}) => {
  const isAr = locale === 'ar';

  // Scenario State
  const [activeScenarioKey, setActiveScenarioKey] = useState<string>(initialScenario);
  const [projects, setProjects] = useState<ProjectContractRecord[]>(() => {
    return PRESET_PROJECT_SCENARIOS[initialScenario]?.projects || PRESET_PROJECT_SCENARIOS.infrastructure.projects;
  });

  const scenarioMeta = PRESET_PROJECT_SCENARIOS[activeScenarioKey] || PRESET_PROJECT_SCENARIOS.infrastructure;

  // Variation Order Recovery Rate Slider (0% to 100%)
  const [voRecoveryRate, setVoRecoveryRate] = useState<number>(75);

  // Tabs
  const [activeTab, setActiveTab] = useState<'radar' | 'evm' | 'claims' | 'dossier'>('radar');
  const [healthFilter, setHealthFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State for Deep Inspection
  const [selectedProject, setSelectedProject] = useState<ProjectContractRecord | null>(null);
  const [actionFeedbackMsg, setActionFeedbackMsg] = useState<string | null>(null);

  // Custom File Name
  const [customFileName, setCustomFileName] = useState<string | null>(null);

  // Switch Scenario
  const handleSelectScenario = (key: string) => {
    setActiveScenarioKey(key);
    setCustomFileName(null);
    if (PRESET_PROJECT_SCENARIOS[key]) {
      setProjects(PRESET_PROJECT_SCENARIOS[key].projects);
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
        const parsed = parseProjectPortfolioCsv(content);
        if (parsed.length > 0) {
          setProjects(parsed);
          setActiveScenarioKey('custom');
        }
      }
    };
    reader.readAsText(file);
  };

  // Recompute portfolio metrics with the current VO Recovery Rate
  const portfolioMetrics = useMemo(() => {
    return calculatePortfolioEVM(projects, voRecoveryRate);
  }, [projects, voRecoveryRate]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (healthFilter !== 'all' && p.healthStatus !== healthFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = p.code.toLowerCase().includes(q);
        const matchName = p.nameAr.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q);
        const matchClient = p.clientNameAr.toLowerCase().includes(q) || p.clientNameEn.toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchClient) return false;
      }
      return true;
    });
  }, [projects, healthFilter, searchQuery]);

  // Download Sample CSV
  const handleDownloadSampleCsv = () => {
    const headers = 'code,name,client,contract_value,budget_cost,actual_cost,billed_amount,progress_pct,variation_orders_sar\n';
    const rows = [
      'PRJ-901,مشروع مجمع مستودعات لوجستية بالرياض,شركة سلاسل الإمداد العالمية,45000000,36900000,24500000,26000000,68,3200000',
      'PRJ-902,عقد توريد وتركيب خطوط نقل المياه,شركة المياه الوطنية,62000000,52080000,41000000,38000000,62,4800000',
      'PRJ-903,إنشاء مبنى مكتبي ذكي بحي الصحافة,صندوق الاستثمار العقاري,38000000,30780000,18900000,22500000,74,1500000'
    ].join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mikhlafi_project_margin_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Audit CSV
  const handleExportAuditCsv = () => {
    const headers = 'Code,Project Name,Client,Contract Value (SAR),Budget (SAR),Actual Cost (SAR),EV (SAR),PV (SAR),CPI,SPI,EAC (SAR),Baseline Margin %,Forecasted Margin %,Unbilled VOs (SAR),Claims (SAR),Health\n';
    const rows = projects.map((p) => {
      return `"${p.code}","${isAr ? p.nameAr : p.nameEn}","${isAr ? p.clientNameAr : p.clientNameEn}",${p.contractValueSAR},${p.budgetCostSAR},${p.actualCostSAR},${p.earnedValueSAR},${p.plannedValueSAR},${p.costPerformanceIndex},${p.schedulePerformanceIndex},${p.estimateAtCompletionSAR},${p.baselineMarginPct}%,${p.forecastedFinalMarginPct}%,${p.unbilledVariationOrdersSAR},${p.disputedClaimsSAR},"${p.healthStatus}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pmo_margin_audit_${activeScenarioKey}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        maxWidth: isEmbeddedInPublicPage ? '1140px' : '100%',
        margin: '0 auto',
        background: '#0B0F19',
        border: '1px solid rgba(139, 92, 246, 0.35)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: isEmbeddedInPublicPage ? '0 25px 65px rgba(0,0,0,0.7), 0 0 35px rgba(139, 92, 246, 0.18)' : 'none',
        fontFamily: 'inherit'
      }}
    >
      <SandboxNotice locale={locale} variant={isEmbeddedInPublicPage ? 'public' : 'app'} />
      <div
        style={{
          background: 'linear-gradient(90deg, #131728 0%, #171c33 100%)',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(139, 92, 246, 0.25)',
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
              color: '#8B5CF6',
              letterSpacing: '0.08em'
            }}
          >
            MIKHLAFI_LABS // ENGINE_04 // PROJECT_MARGIN_EVM_TELEMETRY_V2.1
          </span>
          <span
            style={{
              fontSize: '11px',
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              color: '#C4B5FD',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 700
            }}
          >
            FIDIC & EVM ASSURANCE
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
            <span>{isAr ? 'نموذج المحفظة CSV' : 'Sample CSV'}</span>
          </button>
          <label
            style={{
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              color: '#DDD6FE',
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
              <span>{isAr ? 'رفع ملف مشاريع خارجي' : 'Upload PMO CSV'}</span>
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
            <div style={{ fontSize: '11px', color: '#8B5CF6', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              {isAr ? 'سيناريوهات المحافظ الإنشائية والهندسية' : 'PORTFOLIO EVM SCENARIOS'}
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#F8FAFC', margin: 0 }}>
              {customFileName
                ? (isAr ? `المحفظة المرفوعة: ${customFileName}` : `Custom Portfolio: ${customFileName}`)
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
            {Object.keys(PRESET_PROJECT_SCENARIOS).map((key) => {
              const sc = PRESET_PROJECT_SCENARIOS[key];
              const isSelected = activeScenarioKey === key && !customFileName;
              return (
                <button
                  key={key}
                  onClick={() => handleSelectScenario(key)}
                  style={{
                    background: isSelected ? '#8B5CF6' : 'transparent',
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

        {/* ── Interactive Variation Order (VO) Settlement Slider ──────────── */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(15, 23, 42, 0.7) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
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
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#DDD6FE', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6' }} />
                {isAr ? 'مُحاكي تسوية أوامر التغيير والمطالبات العالقة (VO Settlement & Claim Recovery Rate)' : 'Variation Order (VO) & Claim Settlement Recovery Simulator'}
              </span>
              <span style={{ fontSize: '11px', color: '#94A3B8', marginInlineStart: '16px' }}>
                {isAr
                  ? 'يحدد نسبة استرداد السيولة المفوترة من أوامر التغيير غير المعتمدة ومطالبات المقاولين لتقييم هامش الربح النهائي'
                  : 'Adjusts cash realization rate for unapproved variation orders and contractor claims to forecast true bottom-line margin'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>{isAr ? 'معدل التسوية المعتمد' : 'Recovery Rate'}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#C4B5FD', fontFamily: 'var(--font-mono, monospace)' }}>
                  {voRecoveryRate}%
                </div>
              </div>
              <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>{isAr ? 'السيولة المستردة المتوقعة' : 'Recovered Cash'}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-mono, monospace)' }}>
                  +{((portfolioMetrics.totalUnbilledVariationOrdersSAR * voRecoveryRate) / 100 / 1_000_000).toFixed(2)}M SAR
                </div>
              </div>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={voRecoveryRate}
            onChange={(e) => setVoRecoveryRate(parseInt(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#8B5CF6',
              cursor: 'pointer',
              height: '6px'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748B', marginTop: '6px', fontFamily: 'var(--font-mono, monospace)' }}>
            <span>0% ({isAr ? 'شطب كامل للمطالبات / نزاع صفري' : 'Zero Recovery / Total Write-off'})</span>
            <span>50% ({isAr ? 'تسوية ودية / مفاوضات هندسية' : 'Amicable 50/50 Settlement'})</span>
            <span>75% ({isAr ? 'المعيار المالي المرجحي' : 'Prudent Baseline Standard'})</span>
            <span>100% ({isAr ? 'تحصيل تعاقدي كامل / فيديك' : 'Full Contractual Claim Settlement'})</span>
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
        {/* KPI 1: Total Portfolio Contract Value */}
        <div style={{ background: '#0F172A', padding: '18px 22px' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, marginBottom: '6px' }}>
            {isAr ? 'إجمالي قيمة عقود المحفظة' : 'PORTFOLIO CONTRACT VALUE'}
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#F8FAFC', fontFamily: 'var(--font-mono, monospace)' }}>
            {(portfolioMetrics.totalContractValueSAR / 1_000_000).toFixed(1)}M
            <span style={{ fontSize: '12px', color: '#64748B', marginInlineStart: '6px' }}>SAR</span>
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
            {isAr
              ? `المصروف الفعلي: ${(portfolioMetrics.totalActualCostSAR / 1_000_000).toFixed(1)}M SAR`
              : `Actual Incurred: ${(portfolioMetrics.totalActualCostSAR / 1_000_000).toFixed(1)}M SAR`}
          </div>
        </div>

        {/* KPI 2: Portfolio CPI & SPI (EVM Efficiency) */}
        <div style={{ background: '#0F172A', padding: '18px 22px' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, marginBottom: '6px' }}>
            {isAr ? 'مؤشر كفاءة التكلفة والجدول (CPI / SPI)' : 'EVM EFFICIENCY INDICES'}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span
              style={{
                fontSize: '1.65rem',
                fontWeight: 900,
                fontFamily: 'var(--font-mono, monospace)',
                color: portfolioMetrics.portfolioCpi >= 1.0 ? '#10B981' : portfolioMetrics.portfolioCpi >= 0.9 ? '#F59E0B' : '#EF4444'
              }}
            >
              CPI {portfolioMetrics.portfolioCpi.toFixed(2)}
            </span>
            <span
              style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono, monospace)',
                color: portfolioMetrics.portfolioSpi >= 1.0 ? '#10B981' : '#F59E0B'
              }}
            >
              SPI {portfolioMetrics.portfolioSpi.toFixed(2)}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: portfolioMetrics.portfolioCpi >= 1.0 ? '#10B981' : '#EF4444', marginTop: '4px' }}>
            {portfolioMetrics.portfolioCpi >= 1.0
              ? (isAr ? '✓ وفر في التكاليف التشغيلية' : 'Cost Under Budget')
              : (isAr ? '⚠ تجاوز مالي وتآكل في الهوامش' : 'Cost Overrun Detected')}
          </div>
        </div>

        {/* KPI 3: Blended Final Margin % & Net Margin Variance */}
        <div style={{ background: '#0F172A', padding: '18px 22px' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, marginBottom: '6px' }}>
            {isAr ? 'هامش الربح المتوقع بعد التسوية' : 'ADJUSTED BLENDED MARGIN'}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.65rem', fontWeight: 900, color: '#C4B5FD', fontFamily: 'var(--font-mono, monospace)' }}>
              {portfolioMetrics.portfolioBlendedMarginPct.toFixed(1)}%
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: portfolioMetrics.netMarginVarianceSAR >= 0 ? '#10B981' : '#EF4444'
              }}
            >
              {portfolioMetrics.netMarginVarianceSAR >= 0 ? '+' : ''}
              {(portfolioMetrics.netMarginVarianceSAR / 1_000_000).toFixed(1)}M SAR
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
            {isAr
              ? `الربح الإجمالي المتوقع: ${(portfolioMetrics.totalForecastedMarginSAR / 1_000_000).toFixed(1)}M SAR`
              : `Forecast Margin: ${(portfolioMetrics.totalForecastedMarginSAR / 1_000_000).toFixed(1)}M SAR`}
          </div>
        </div>

        {/* KPI 4: Unbilled VOs & Critical Projects */}
        <div style={{ background: '#0F172A', padding: '18px 22px' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, marginBottom: '6px' }}>
            {isAr ? 'مخاطر أوامر التغيير والمشاريع الحرجة' : 'UNBILLED VO & RISK STATUS'}
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#F59E0B', fontFamily: 'var(--font-mono, monospace)' }}>
            {(portfolioMetrics.totalUnbilledVariationOrdersSAR / 1_000_000).toFixed(1)}M
            <span style={{ fontSize: '12px', color: '#64748B', marginInlineStart: '6px' }}>SAR</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: 700 }}>
              {portfolioMetrics.criticalProjectCount} {isAr ? 'حرج' : 'Critical'}
            </span>
            <span style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 700 }}>
              {portfolioMetrics.atRiskProjectCount} {isAr ? 'قيد المراقبة' : 'At Risk'}
            </span>
            <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>
              {portfolioMetrics.healthyProjectCount} {isAr ? 'سليم' : 'Healthy'}
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
          onClick={() => setActiveTab('radar')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'radar' ? '2px solid #8B5CF6' : '2px solid transparent',
            color: activeTab === 'radar' ? '#8B5CF6' : '#94A3B8',
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
          <IconProjects size={15} />
          <span>{isAr ? 'رادار صحة العقود وهوامش المشاريع' : 'Project Margin Health Radar'}</span>
          <span
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '999px',
              background: 'rgba(139, 92, 246, 0.2)',
              color: '#DDD6FE'
            }}
          >
            {filteredProjects.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('evm')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'evm' ? '2px solid #8B5CF6' : '2px solid transparent',
            color: activeTab === 'evm' ? '#8B5CF6' : '#94A3B8',
            padding: '16px 18px',
            fontSize: '13px',
            fontWeight: activeTab === 'evm' ? 800 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <IconCheckCircle size={15} />
          <span>{isAr ? 'مصفوفة القيمة المكتسبة (EVM Telemetry Matrix)' : 'EVM Telemetry Matrix (PV/EV/AC/EAC)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'claims' ? '2px solid #8B5CF6' : '2px solid transparent',
            color: activeTab === 'claims' ? '#8B5CF6' : '#94A3B8',
            padding: '16px 18px',
            fontSize: '13px',
            fontWeight: activeTab === 'claims' ? 800 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <IconAlertTriangle size={15} />
          <span>{isAr ? 'تدقيق أوامر التغيير والمطالبات (VO & Claims)' : 'Variation Orders & Claims Audit'}</span>
          <span
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '999px',
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#FCD34D'
            }}
          >
            {(portfolioMetrics.totalUnbilledVariationOrdersSAR / 1_000_000).toFixed(1)}M SAR
          </span>
        </button>

        <button
          onClick={() => setActiveTab('dossier')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'dossier' ? '2px solid #8B5CF6' : '2px solid transparent',
            color: activeTab === 'dossier' ? '#8B5CF6' : '#94A3B8',
            padding: '16px 18px',
            fontSize: '13px',
            fontWeight: activeTab === 'dossier' ? 800 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <IconFileText size={15} />
          <span>{isAr ? 'تقرير حوكمة المشاريع لمجلس الإدارة (FIDIC PMO Decree)' : 'Executive FIDIC Governance Memo'}</span>
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

        {/* ── TAB 1: RADAR & PROJECT CARDS ─────────────────────────────────── */}
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
                  { key: 'all', labelAr: 'كافة المشاريع', labelEn: 'All Projects' },
                  { key: 'CRITICAL', labelAr: 'مشاريع حرجة (تآكل هامش)', labelEn: 'Critical Overrun' },
                  { key: 'AT_RISK', labelAr: 'مشاريع قيد المراقبة', labelEn: 'At Risk' },
                  { key: 'HEALTHY', labelAr: 'مشاريع منضبطة ومربحة', labelEn: 'Healthy' }
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setHealthFilter(f.key)}
                    style={{
                      background: healthFilter === f.key ? '#8B5CF6' : 'rgba(255, 255, 255, 0.05)',
                      border: healthFilter === f.key ? '1px solid #8B5CF6' : '1px solid rgba(255, 255, 255, 0.1)',
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
                  placeholder={isAr ? 'بحث بالكود، اسم المشروع، العميل...' : 'Search by code, project, client...'}
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
                    background: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    color: '#DDD6FE',
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

            {/* Project Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                gap: '16px'
              }}
            >
              {filteredProjects.map((p) => {
                const settledVoGain = (p.unbilledVariationOrdersSAR * voRecoveryRate) / 100;
                const dynamicForecastedMargin = p.forecastedFinalMarginSAR + settledVoGain;
                const dynamicForecastedPct = p.contractValueSAR > 0 ? (dynamicForecastedMargin / p.contractValueSAR) * 100 : 0;
                const isUnderbudget = p.costPerformanceIndex >= 1.0;

                return (
                  <div
                    key={p.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: p.healthStatus === 'CRITICAL'
                        ? '1px solid rgba(239, 68, 68, 0.5)'
                        : p.healthStatus === 'AT_RISK'
                        ? '1px solid rgba(245, 158, 11, 0.4)'
                        : '1px solid rgba(139, 92, 246, 0.25)',
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
                        background: p.healthStatus === 'CRITICAL'
                          ? '#EF4444'
                          : p.healthStatus === 'AT_RISK'
                          ? '#F59E0B'
                          : '#10B981'
                      }}
                    />

                    <div>
                      {/* Code, Status & Contract Type */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono, monospace)',
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#8B5CF6',
                              background: 'rgba(139, 92, 246, 0.15)',
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}
                          >
                            {p.code}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748B' }}>
                            {p.contractType.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: '999px',
                            background: p.healthStatus === 'CRITICAL'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : p.healthStatus === 'AT_RISK'
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(16, 185, 129, 0.15)',
                            color: p.healthStatus === 'CRITICAL'
                              ? '#EF4444'
                              : p.healthStatus === 'AT_RISK'
                              ? '#F59E0B'
                              : '#10B981',
                            border: `1px solid ${
                              p.healthStatus === 'CRITICAL'
                                ? 'rgba(239, 68, 68, 0.3)'
                                : p.healthStatus === 'AT_RISK'
                                ? 'rgba(245, 158, 11, 0.3)'
                                : 'rgba(16, 185, 129, 0.3)'
                            }`
                          }}
                        >
                          {p.healthStatus === 'CRITICAL'
                            ? (isAr ? 'حرج // تآكل في الأرباح' : 'CRITICAL OVERRUN')
                            : p.healthStatus === 'AT_RISK'
                            ? (isAr ? 'مخاطر تأخير ومطالبات' : 'AT RISK')
                            : (isAr ? 'منضبط تعاقدياً' : 'ON TRACK')}
                        </span>
                      </div>

                      {/* Project Title */}
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#F8FAFC', margin: '0 0 6px 0', lineHeight: 1.35 }}>
                        {isAr ? p.nameAr : p.nameEn}
                      </h3>
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '14px' }}>
                        🏢 {isAr ? p.clientNameAr : p.clientNameEn}
                      </div>

                      {/* Completion Progress Bar */}
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>
                          <span>{isAr ? 'نسبة الإنجاز الفعلي' : 'Progress'}</span>
                          <span style={{ fontWeight: 800, color: '#F8FAFC', fontFamily: 'var(--font-mono, monospace)' }}>
                            {p.completionPercentage}%
                          </span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${p.completionPercentage}%`,
                              background: p.healthStatus === 'CRITICAL'
                                ? '#EF4444'
                                : p.healthStatus === 'AT_RISK'
                                ? '#F59E0B'
                                : 'linear-gradient(90deg, #8B5CF6, #10B981)',
                              borderRadius: '999px'
                            }}
                          />
                        </div>
                      </div>

                      {/* EVM Indicators (CPI & SPI) */}
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
                          <div style={{ fontSize: '10px', color: '#94A3B8' }}>{isAr ? 'مؤشر أداء التكلفة' : 'Cost Index (CPI)'}</div>
                          <div
                            style={{
                              fontSize: '15px',
                              fontWeight: 900,
                              fontFamily: 'var(--font-mono, monospace)',
                              color: isUnderbudget ? '#10B981' : p.costPerformanceIndex >= 0.9 ? '#F59E0B' : '#EF4444'
                            }}
                          >
                            {p.costPerformanceIndex.toFixed(2)}
                            <span style={{ fontSize: '10px', marginInlineStart: '4px', fontWeight: 600 }}>
                              {isUnderbudget ? '(وفر)' : '(تجاوز)'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', color: '#94A3B8' }}>{isAr ? 'مؤشر أداء الجدول' : 'Schedule (SPI)'}</div>
                          <div
                            style={{
                              fontSize: '15px',
                              fontWeight: 900,
                              fontFamily: 'var(--font-mono, monospace)',
                              color: p.schedulePerformanceIndex >= 1.0 ? '#10B981' : '#F59E0B'
                            }}
                          >
                            {p.schedulePerformanceIndex.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Financial Metrics Summary */}
                      <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#94A3B8' }}>{isAr ? 'قيمة العقد المعتمد:' : 'Contract Value:'}</span>
                          <span style={{ color: '#F8FAFC', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)' }}>
                            {(p.contractValueSAR / 1_000_000).toFixed(2)}M SAR
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#94A3B8' }}>{isAr ? 'التكلفة التقديرية النهائية (EAC):' : 'Estimate At Completion:'}</span>
                          <span style={{ color: '#DDD6FE', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)' }}>
                            {(p.estimateAtCompletionSAR / 1_000_000).toFixed(2)}M SAR
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#94A3B8' }}>{isAr ? 'هامش الربح بعد التسوية:' : 'Adjusted Margin %:'}</span>
                          <span
                            style={{
                              fontWeight: 800,
                              fontFamily: 'var(--font-mono, monospace)',
                              color: dynamicForecastedPct >= 15 ? '#10B981' : dynamicForecastedPct >= 5 ? '#F59E0B' : '#EF4444'
                            }}
                          >
                            {dynamicForecastedPct.toFixed(1)}% ({(dynamicForecastedMargin / 1_000_000).toFixed(2)}M SAR)
                          </span>
                        </div>
                        {p.unbilledVariationOrdersSAR > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#F59E0B' }}>{isAr ? 'أوامر تغيير قيد التفاوض:' : 'Unbilled VOs:'}</span>
                            <span style={{ color: '#F59E0B', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)' }}>
                              {(p.unbilledVariationOrdersSAR / 1_000_000).toFixed(2)}M SAR
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action & Director */}
                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px', marginTop: '6px' }}>
                      <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '10px' }}>
                        👤 {p.assignedDirector}
                      </div>
                      <button
                        onClick={() => setSelectedProject(p)}
                        style={{
                          width: '100%',
                          background: 'rgba(139, 92, 246, 0.15)',
                          border: '1px solid rgba(139, 92, 246, 0.4)',
                          color: '#C4B5FD',
                          borderRadius: '8px',
                          padding: '9px 0',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.18s ease'
                        }}
                      >
                        {isAr ? 'فحص أدلة العقد والمطالبات (Audit EVM)' : 'Inspect EVM & Claims Dossier'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 2: EVM TELEMETRY MATRIX ──────────────────────────────────── */}
        {activeTab === 'evm' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC', margin: '0 0 6px 0' }}>
                {isAr ? 'مصفوفة حسابات القيمة المكتسبة للمحفظة بالكامل (EVM Breakdown)' : 'Portfolio Earned Value Management Matrix'}
              </h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                {isAr
                  ? 'تطبيق القوانين المعيارية لإدارة المشاريع: PV (القيمة المخططة)، EV (القيمة المكتسبة)، AC (التكلفة الفعلية)، CV (تباين التكلفة)، SV (تباين الجدول)، EAC (التقدير عند الاكتمال)، و VAC (التباين عند الاكتمال).'
                  : 'Rigorous EVM telemetry: Planned Value, Earned Value, Actual Cost, Cost & Schedule Variances, Estimate at Completion (EAC) & Variance at Completion (VAC).'}
              </p>
            </div>

            <div style={{ overflowX: 'auto', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#131728', borderBottom: '1px solid rgba(139, 92, 246, 0.3)', color: '#C4B5FD' }}>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'الكود' : 'Code'}</th>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'اسم المشروع' : 'Project'}</th>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'قيمة العقد (BAC)' : 'BAC (Value)'}</th>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'المخطط (PV)' : 'PV'}</th>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'المكتسب (EV)' : 'EV'}</th>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'الفعلي (AC)' : 'AC'}</th>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'CPI' : 'CPI'}</th>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'SPI' : 'SPI'}</th>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'التقدير النهائي (EAC)' : 'EAC'}</th>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'تباين التكلفة (VAC)' : 'VAC'}</th>
                    <th style={{ padding: '12px 14px' }}>{isAr ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => {
                    const vac = p.budgetCostSAR - p.estimateAtCompletionSAR;
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono, monospace)', color: '#8B5CF6', fontWeight: 700 }}>
                          {p.code}
                        </td>
                        <td style={{ padding: '12px 14px', color: '#F8FAFC', fontWeight: 600 }}>
                          {isAr ? p.nameAr : p.nameEn}
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono, monospace)', color: '#94A3B8' }}>
                          {(p.contractValueSAR / 1_000_000).toFixed(1)}M
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono, monospace)', color: '#94A3B8' }}>
                          {(p.plannedValueSAR / 1_000_000).toFixed(1)}M
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono, monospace)', color: '#10B981', fontWeight: 700 }}>
                          {(p.earnedValueSAR / 1_000_000).toFixed(1)}M
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono, monospace)', color: '#F8FAFC' }}>
                          {(p.actualCostSAR / 1_000_000).toFixed(1)}M
                        </td>
                        <td
                          style={{
                            padding: '12px 14px',
                            fontFamily: 'var(--font-mono, monospace)',
                            fontWeight: 800,
                            color: p.costPerformanceIndex >= 1.0 ? '#10B981' : p.costPerformanceIndex >= 0.9 ? '#F59E0B' : '#EF4444'
                          }}
                        >
                          {p.costPerformanceIndex.toFixed(2)}
                        </td>
                        <td
                          style={{
                            padding: '12px 14px',
                            fontFamily: 'var(--font-mono, monospace)',
                            fontWeight: 800,
                            color: p.schedulePerformanceIndex >= 1.0 ? '#10B981' : '#F59E0B'
                          }}
                        >
                          {p.schedulePerformanceIndex.toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono, monospace)', color: '#DDD6FE', fontWeight: 700 }}>
                          {(p.estimateAtCompletionSAR / 1_000_000).toFixed(1)}M
                        </td>
                        <td
                          style={{
                            padding: '12px 14px',
                            fontFamily: 'var(--font-mono, monospace)',
                            fontWeight: 800,
                            color: vac >= 0 ? '#10B981' : '#EF4444'
                          }}
                        >
                          {vac >= 0 ? '+' : ''}{(vac / 1_000_000).toFixed(1)}M
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: p.healthStatus === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : p.healthStatus === 'AT_RISK' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                              color: p.healthStatus === 'CRITICAL' ? '#EF4444' : p.healthStatus === 'AT_RISK' ? '#F59E0B' : '#10B981'
                            }}
                          >
                            {p.healthStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* EVM Explanation Box */}
            <div
              style={{
                marginTop: '20px',
                background: 'rgba(139, 92, 246, 0.08)',
                border: '1px solid rgba(139, 92, 246, 0.25)',
                borderRadius: '10px',
                padding: '16px 20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
                fontSize: '12px'
              }}
            >
              <div>
                <div style={{ fontWeight: 800, color: '#C4B5FD', marginBottom: '4px' }}>
                  {isAr ? '📐 معادلات إدارة القيمة المكتسبة (EVM Standard)' : 'EVM Mathematical Formulations'}
                </div>
                <div style={{ color: '#94A3B8', lineHeight: 1.5 }}>
                  <code>CPI = EV / AC</code> ({isAr ? 'مؤشر أداء التكلفة، أعلى من 1.0 يعني وفراً مالياً' : 'Cost index; > 1.0 means under budget'})<br />
                  <code>SPI = EV / PV</code> ({isAr ? 'مؤشر أداء الجدول الزمني، أعلى من 1.0 يعني تقدماً' : 'Schedule index; > 1.0 means ahead'})<br />
                  <code>EAC = BAC / CPI</code> ({isAr ? 'التقدير المالي المتوقع للمشروع عند الاكتمال' : 'Forecast cost at completion'})
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#C4B5FD', marginBottom: '4px' }}>
                  {isAr ? '⚖ الامتثال لعقود فيديك ونظام المنافسات' : 'FIDIC & Saudi Procurement Compliance'}
                </div>
                <div style={{ color: '#94A3B8', lineHeight: 1.5 }}>
                  {isAr
                    ? 'يتم ربط نسب الإنجاز بشهادات الدفع المرحلية (IPC) المعتمدة من الاستشاري المشرف، وحساب التباين المالي وفق المادة 52 من شروط عقود فيديك الإنشائية.'
                    : 'Milestones mapped to Interim Payment Certificates (IPCs) approved by supervising engineers under FIDIC Red Book Clause 52.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: VARIATION ORDERS & CLAIMS ─────────────────────────────── */}
        {activeTab === 'claims' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC', margin: '0 0 6px 0' }}>
                {isAr ? 'تدقيق أوامر التغيير والمطالبات ومطالبات مقاولي الباطن' : 'Variation Orders & Contractor Claims Ledger'}
              </h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                {isAr
                  ? 'رصد التسرب المالي الناتج عن تنفيذ أعمال إضافية دون اعتمادات مالية مسبقة، ونزاعات مطالبات مقاولي الباطن.'
                  : 'Forensic tracking of unapproved variation orders, client scope creep, and subcontractor dispute exposure.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
              {projects.map((p) => {
                const totalExposure = p.unbilledVariationOrdersSAR + p.disputedClaimsSAR;
                return (
                  <div
                    key={p.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: totalExposure > 3_000_000 ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '18px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#8B5CF6', fontWeight: 800 }}>
                        {p.code}
                      </span>
                      <span style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 700 }}>
                        {isAr ? 'إجمالي التعرض:' : 'Total Exposure:'} {(totalExposure / 1_000_000).toFixed(2)}M SAR
                      </span>
                    </div>

                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#F8FAFC', margin: '0 0 6px 0' }}>
                      {isAr ? p.nameAr : p.nameEn}
                    </h4>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '14px' }}>
                      {isAr ? p.clientNameAr : p.clientNameEn}
                    </div>

                    <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '8px', marginBottom: '14px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: '#94A3B8' }}>{isAr ? 'أوامر تغيير منفذة غير معتمدة:' : 'Unbilled VOs:'}</span>
                        <span style={{ color: '#F59E0B', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)' }}>
                          {(p.unbilledVariationOrdersSAR / 1_000_000).toFixed(2)}M SAR
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94A3B8' }}>{isAr ? 'مطالبات مقاولي الباطن المتنازع عليها:' : 'Disputed Subcontractor Claims:'}</span>
                        <span style={{ color: '#EF4444', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)' }}>
                          {(p.disputedClaimsSAR / 1_000_000).toFixed(2)}M SAR
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '12px' }}>
                      📜 {p.statutoryRegulation}
                    </div>

                    <button
                      onClick={() => {
                        setActionFeedbackMsg(
                          isAr
                            ? `تم تصدير مذكرة المطالبة التعاقدية للمشروع [${p.code}] إلى الإدارة القانونية والاستشاري المشرف بنجاح.`
                            : `Contractual claim memo for [${p.code}] dispatched to Legal & Supervising Consultant.`
                        );
                      }}
                      style={{
                        width: '100%',
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        color: '#FCD34D',
                        borderRadius: '6px',
                        padding: '8px 0',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {isAr ? 'إصدار مذكرة تسوية مطالبات FIDIC' : 'Generate FIDIC Claim Letter'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 4: PMO GOVERNANCE DOSSIER ────────────────────────────────── */}
        {activeTab === 'dossier' && (
          <div
            style={{
              background: '#0F172A',
              border: '1px solid rgba(139, 92, 246, 0.3)',
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
                borderBottom: '2px solid rgba(139, 92, 246, 0.4)',
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
                <div style={{ fontSize: '11px', color: '#8B5CF6', fontFamily: 'var(--font-mono, monospace)', fontWeight: 800 }}>
                  KINGDOM OF SAUDI ARABIA // PMO GOVERNANCE COUNCIL
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#F8FAFC', margin: '4px 0' }}>
                  {isAr ? 'محضر حوكمة هوامش المشاريع والتدقيق التعاقدي لمجلس الإدارة' : 'Executive Board Project Margin & Contract Assurance Decree'}
                </h2>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  {isAr ? `تاريخ الإصدار: ${new Date().toLocaleDateString('ar-SA')} | المرجع: PMO-FIDIC-2026-SA` : `Issued: ${new Date().toLocaleDateString('en-US')} | Ref: PMO-FIDIC-2026-SA`}
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
                  🖨 {isAr ? 'طباعة المحضر' : 'Print Memo'}
                </button>
                <button
                  onClick={handleExportAuditCsv}
                  style={{
                    background: '#8B5CF6',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <IconDownload size={14} />
                  <span>{isAr ? 'تصدير البيانات كاملة' : 'Export Full Audit'}</span>
                </button>
              </div>
            </div>

            {/* Statutory Overview */}
            <div style={{ fontSize: '13px', lineHeight: 1.7, color: '#CBD5E1', marginBottom: '22px' }}>
              <p>
                {isAr
                  ? `بناءً على الصلاحيات الممنوحة للجنة المراجعة والتدقيق، ومراجعة سجلات إدارة القيمة المكتسبة (EVM) لمحفظة المشاريع بقيمة إجمالية بلغت ${(portfolioMetrics.totalContractValueSAR / 1_000_000).toFixed(1)} مليون ريال سعودي، تم رصد الانحرافات المالية والتشغيلية والتوصية بالقرارات التنفيذية الإلزامية التالية:`
                  : `Pursuant to Audit Committee mandate and EVM audit across total portfolio value of ${(portfolioMetrics.totalContractValueSAR / 1_000_000).toFixed(1)}M SAR, the following statutory directives are enacted:`}
              </p>
            </div>

            {/* Decree Directives */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', borderLeft: isAr ? 'none' : '4px solid #8B5CF6', borderRight: isAr ? '4px solid #8B5CF6' : 'none', padding: '14px 18px', borderRadius: '4px' }}>
                <div style={{ fontWeight: 800, color: '#C4B5FD', marginBottom: '4px' }}>
                  {isAr ? '1. حظر تنفيذ أوامر التغيير غير المعتمدة مالياً (Variation Freeze)' : '1. Mandatory Freeze on Unapproved Variation Orders'}
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  {isAr
                    ? `إلزام مدراء المشاريع بوقف تنفيذ أي أعمال إضافية تتجاوز 100,000 ر.س دون الحصول على ملحق مالي معتمد من العميل، لحماية السيولة المفوترة البالغة ${(portfolioMetrics.totalUnbilledVariationOrdersSAR / 1_000_000).toFixed(1)} مليون ر.س.`
                    : `Immediate freeze on all site instruction variations exceeding 100K SAR without signed employer addendum.`}
                </div>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: isAr ? 'none' : '4px solid #EF4444', borderRight: isAr ? '4px solid #EF4444' : 'none', padding: '14px 18px', borderRadius: '4px' }}>
                <div style={{ fontWeight: 800, color: '#FCA5A5', marginBottom: '4px' }}>
                  {isAr ? '2. إعادة هيكلة المشاريع المتدهورة تحت مؤشر CPI < 0.90' : '2. Mandatory Remediation for Projects with CPI < 0.90'}
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  {isAr
                    ? `إلزام إدارة المشاريع بتقديم خطة تصحيحية هندسية خلال 14 يوماً لعدد ${portfolioMetrics.criticalProjectCount} مشاريع حرجة لتفادي تآكل إضافي بقيمة ${(Math.abs(portfolioMetrics.netMarginVarianceSAR) / 1_000_000).toFixed(1)} مليون ر.س.`
                    : `PMO must submit 14-day value engineering recovery plans for ${portfolioMetrics.criticalProjectCount} critical projects.`}
                </div>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: isAr ? 'none' : '4px solid #10B981', borderRight: isAr ? '4px solid #10B981' : 'none', padding: '14px 18px', borderRadius: '4px' }}>
                <div style={{ fontWeight: 800, color: '#6EE7B7', marginBottom: '4px' }}>
                  {isAr ? '3. التسوية التفاوضية مع مقاولي الباطن واسترداد الضمانات' : '3. Subcontractor Amicable Claims Settlement Protocol'}
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  {isAr
                    ? `تفعيل معدل التسوية المستهدف بنسبة ${voRecoveryRate}% عبر اللجان المشتركة، لاسترداد سيولة نقدية فورية بقيمة +${((portfolioMetrics.totalUnbilledVariationOrdersSAR * voRecoveryRate) / 100 / 1_000_000).toFixed(2)} مليون ر.س.`
                    : `Execute targeted ${voRecoveryRate}% recovery protocol generating +${((portfolioMetrics.totalUnbilledVariationOrdersSAR * voRecoveryRate) / 100 / 1_000_000).toFixed(2)}M SAR in recovered margin cash.`}
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
                <div style={{ color: '#64748B' }}>{isAr ? 'مدير مكتب إدارة المشاريع (PMO):' : 'PMO Director:'}</div>
                <div style={{ fontWeight: 800, color: '#F8FAFC', marginTop: '4px' }}>م. سلطان الشمري</div>
                <div style={{ color: '#8B5CF6', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>SIG-PMO-8841-VERIFIED</div>
              </div>
              <div>
                <div style={{ color: '#64748B' }}>{isAr ? 'رئيس الإدارة المالية والتدقيق:' : 'Chief Financial Officer:'}</div>
                <div style={{ fontWeight: 800, color: '#F8FAFC', marginTop: '4px' }}>أ. ريان القحطاني</div>
                <div style={{ color: '#8B5CF6', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>SIG-CFO-9032-VERIFIED</div>
              </div>
              <div>
                <div style={{ color: '#64748B' }}>{isAr ? 'الختم التشفيري للبصمة:' : 'Audit Proof Hash:'}</div>
                <div style={{ color: '#10B981', fontFamily: 'var(--font-mono, monospace)', marginTop: '4px', wordBreak: 'break-all' }}>
                  SHA256: 7f8a91c2...e810a9c4
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── DEEP INSPECTION MODAL ─────────────────────────────────────────── */}
      {selectedProject && (
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
              border: '1px solid rgba(139, 92, 246, 0.4)',
              borderRadius: '16px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(139, 92, 246, 0.25)',
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
                    color: '#8B5CF6',
                    background: 'rgba(139, 92, 246, 0.15)',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}
                >
                  {selectedProject.code}
                </span>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>{selectedProject.contractType}</span>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <IconX size={20} />
              </button>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F8FAFC', margin: '0 0 8px 0' }}>
              {isAr ? selectedProject.nameAr : selectedProject.nameEn}
            </h3>
            <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '20px' }}>
              🏢 {isAr ? selectedProject.clientNameAr : selectedProject.clientNameEn}
            </div>

            {/* EVM Breakdown Grid */}
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
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>{isAr ? 'قيمة العقد المعتمد' : 'Contract Value'}</div>
                <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)' }}>
                  {(selectedProject.contractValueSAR / 1_000_000).toFixed(2)}M SAR
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>{isAr ? 'التكلفة الفعلية المنصرفة' : 'Actual Cost (AC)'}</div>
                <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)' }}>
                  {(selectedProject.actualCostSAR / 1_000_000).toFixed(2)}M SAR
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>{isAr ? 'القيمة المكتسبة (EV)' : 'Earned Value (EV)'}</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono, monospace)' }}>
                  {(selectedProject.earnedValueSAR / 1_000_000).toFixed(2)}M SAR
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>{isAr ? 'التقدير عند الاكتمال (EAC)' : 'Forecast EAC'}</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#DDD6FE', fontFamily: 'var(--font-mono, monospace)' }}>
                  {(selectedProject.estimateAtCompletionSAR / 1_000_000).toFixed(2)}M SAR
                </div>
              </div>
            </div>

            {/* Variation Orders & Disputed Claims Section */}
            <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontWeight: 800, color: '#FCD34D', fontSize: '13px', marginBottom: '8px' }}>
                {isAr ? '⚠️ أوامر التغيير والمطالبات الهندسية العالقة' : '⚠️ Outstanding Variation Orders & Claims'}
              </div>
              <div style={{ fontSize: '12px', color: '#CBD5E1', lineHeight: 1.6 }}>
                {isAr ? 'أوامر التغيير غير المعتمدة مالياً:' : 'Unbilled VOs:'} <strong>{(selectedProject.unbilledVariationOrdersSAR / 1_000_000).toFixed(2)}M SAR</strong><br />
                {isAr ? 'مطالبات مقاولي الباطن العالقة:' : 'Disputed Claims:'} <strong>{(selectedProject.disputedClaimsSAR / 1_000_000).toFixed(2)}M SAR</strong>
              </div>
            </div>

            {/* Directive Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedProject(null)}
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
                {isAr ? 'إغلاق النافذة' : 'Close'}
              </button>
              <button
                onClick={() => {
                  const details = `Project ${selectedProject.code} - ${selectedProject.nameEn} (Contract: ${(selectedProject.contractValueSAR / 1_000_000).toFixed(1)}M SAR, EAC: ${(selectedProject.estimateAtCompletionSAR / 1_000_000).toFixed(1)}M SAR)`;
                  if (onRequestAssistance) {
                    onRequestAssistance(details);
                  } else {
                    setActionFeedbackMsg(
                      isAr
                        ? `تم تسجيل طلب الدعم الهندسي للمشروع [${selectedProject.code}] وسيتم التواصل من كبير مهندسي العقود.`
                        : `Assistance request logged for project [${selectedProject.code}]. PMO team alerted.`
                    );
                  }
                  setSelectedProject(null);
                }}
                style={{
                  background: '#8B5CF6',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '10px 22px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isAr ? 'طلب تدخل هندسي تعاقدي فوري' : 'Request FIDIC Contract Intervention'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
