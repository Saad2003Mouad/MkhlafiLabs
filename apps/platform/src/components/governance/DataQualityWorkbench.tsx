// MIKHLAFI LABS — Enterprise Data Quality & Multi-System Governance Workbench (Service 08)
// High-Impact Visual Cockpit: Multi-Vector Ledger Integrity Index, Sub-Ledger Imbalance Quarantine,
// ZATCA Phase 2 Pre-Flight Schema Validator, Automated Remediation Slider, and Board Governance Attestations.

import React, { useState, useMemo } from 'react';
import { LocaleMode } from '../../types';
import { SandboxNotice } from '../common/SandboxNotice';
import {
  PRESET_DATA_QUALITY_SCENARIOS,
  DataQualityAnomaly,
  calculatePortfolioDataQualityMetrics,
  calculateDomainScores,
  generateDataQualityAttestation,
  exportDataQualityCsv,
  parseDataQualityCsv
} from '../../services/governance/dataQualityEngine';
import {
  IconDataQuality,
  IconCheckCircle,
  IconRisk,
  IconDownload,
  IconRefreshCw,
  IconArrowRight,
  IconShield,
  IconLayers,
  IconCheck
} from '../Icons';

interface DataQualityWorkbenchProps {
  locale: LocaleMode;
  initialScenario?: 'retail_distribution' | 'healthcare_network' | 'industrial_petrochem';
  isEmbeddedInPublicPage?: boolean;
  onRequestAssistance?: (details: string) => void;
}

export const DataQualityWorkbench: React.FC<DataQualityWorkbenchProps> = ({
  locale,
  initialScenario = 'retail_distribution',
  isEmbeddedInPublicPage = false,
  onRequestAssistance
}) => {
  const isAr = locale === 'ar';

  // ── State ───────────────────────────────────────────────────────────────────
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<string>(initialScenario);
  const [remediationTargetPct, setRemediationTargetPct] = useState<number>(85);
  const [activeTab, setActiveTab] = useState<'anomalies' | 'domains' | 'dedup' | 'attestation'>('anomalies');
  const [selectedAnomaly, setSelectedAnomaly] = useState<DataQualityAnomaly | null>(null);
  const [remediatedIds, setRemediatedIds] = useState<{ [id: string]: boolean }>({});
  const [attestationCopied, setAttestationCopied] = useState<boolean>(false);
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL');

  const currentScenario =
    PRESET_DATA_QUALITY_SCENARIOS[selectedScenarioKey] || PRESET_DATA_QUALITY_SCENARIOS.retail_distribution;

  const [activeAnomaliesList, setActiveAnomaliesList] = useState<DataQualityAnomaly[]>(
    currentScenario.anomalies
  );

  // Sync when scenario changes
  const handleScenarioChange = (key: string) => {
    setSelectedScenarioKey(key);
    const scen = PRESET_DATA_QUALITY_SCENARIOS[key] || PRESET_DATA_QUALITY_SCENARIOS.retail_distribution;
    setActiveAnomaliesList(scen.anomalies);
    setSelectedAnomaly(null);
    setRemediatedIds({});
  };

  // Metrics
  const portfolioMetrics = useMemo(() => {
    return calculatePortfolioDataQualityMetrics(
      activeAnomaliesList,
      currentScenario.totalMonthlyTransactions,
      currentScenario.baselineIntegrityScore,
      remediationTargetPct
    );
  }, [activeAnomaliesList, currentScenario.totalMonthlyTransactions, currentScenario.baselineIntegrityScore, remediationTargetPct]);

  // Domain Scores
  const domainScores = useMemo(() => {
    return calculateDomainScores(activeAnomaliesList, remediationTargetPct);
  }, [activeAnomaliesList, remediationTargetPct]);

  // One-click remediation trigger
  const handleResolveAnomaly = (id: string) => {
    setRemediatedIds((prev) => ({ ...prev, [id]: true }));
    setActiveAnomaliesList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, autoRemediated: true, severity: 'RESOLVED' } : a))
    );
  };

  // Filtered Anomalies
  const displayedAnomalies = useMemo(() => {
    if (severityFilter === 'ALL') return activeAnomaliesList;
    return activeAnomaliesList.filter((a) => a.severity === severityFilter);
  }, [activeAnomaliesList, severityFilter]);

  // Attestation text
  const currentAttestation = useMemo(() => {
    return generateDataQualityAttestation(selectedScenarioKey, portfolioMetrics, locale);
  }, [selectedScenarioKey, portfolioMetrics, locale]);

  const handleCopyAttestation = () => {
    navigator.clipboard.writeText(currentAttestation);
    setAttestationCopied(true);
    setTimeout(() => setAttestationCopied(false), 2500);
  };

  const handleExportCsv = () => {
    const csv = exportDataQualityCsv(activeAnomaliesList);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Mikhlafi_Data_Quality_Ledger_${selectedScenarioKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const parsed = parseDataQualityCsv(content);
        if (parsed.length > 0) {
          const filled: DataQualityAnomaly[] = parsed.map((p, idx) => ({
            id: p.id || `IMPORT-${idx + 1}`,
            voucherNumber: p.voucherNumber || `JV-IMP-${idx + 1}`,
            sourceSystem: p.sourceSystem || 'SAP_S4HANA',
            category: p.category || 'UNBALANCED_JOURNAL',
            severity: p.severity || 'WARNING',
            titleAr: p.titleAr || 'سجل محاسبي تم استيراده',
            titleEn: p.titleEn || 'Imported Ledger Record',
            descriptionAr: 'تم استيراد هذا القيد للتدقيق عبر ملف CSV.',
            descriptionEn: 'Imported for continuous data quality inspection.',
            impactAmountSAR: p.impactAmountSAR || 0,
            detectedField: p.detectedField || 'CUSTOM_FIELD',
            entityNameAr: p.entityNameAr || 'سجل مالي',
            entityNameEn: p.entityNameEn || 'Financial Record',
            timestamp: 'الآن',
            remediationActionAr: 'تدقيق ومطابقة السجل مع الأستاذ العام.',
            remediationActionEn: 'Reconcile imported voucher with general ledger.',
            autoRemediated: p.autoRemediated || false,
            cryptographicProofHash: p.cryptographicProofHash || 'DQ-HASH-IMPORT'
          }));
          setActiveAnomaliesList(filled);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      style={{
        maxWidth: '1160px',
        margin: '0 auto',
        background: '#0B0F19',
        border: '1px solid rgba(20, 184, 166, 0.35)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 35px rgba(20, 184, 166, 0.2)',
        color: '#F8FAFC',
        fontFamily: 'inherit'
      }}
    >
      <SandboxNotice locale={locale} variant={isEmbeddedInPublicPage ? 'public' : 'app'} />

      {/* ── Top Bar: Header & Actions ─────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(90deg, #111827 0%, #134E4A 100%)',
          padding: '16px 24px',
          borderBottom: '1px solid rgba(20, 184, 166, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(20, 184, 166, 0.18)',
              border: '1px solid #14B8A6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2DD4BF'
            }}
          >
            <IconDataQuality size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  background: '#14B8A6',
                  color: '#042F2E',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontFamily: 'monospace'
                }}
              >
                ENGINE 08 // DATA GOVERNANCE
              </span>
              <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'monospace' }}>
                ZATCA PHASE 2 & SOCPA AUDIT READY
              </span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: '2px 0 0 0' }}>
              {isAr ? 'منظومة حوكمة وجودة البيانات المحاسبية المتعددة' : 'Data Quality & Multi-System Governance Workbench'}
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label
            style={{
              cursor: 'pointer',
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '12px',
              color: '#CBD5E1',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <IconDownload size={14} />
            <span>{isAr ? 'استيراد قيود CSV' : 'Import CSV'}</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          <button
            onClick={handleExportCsv}
            style={{
              cursor: 'pointer',
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'rgba(20, 184, 166, 0.15)',
              border: '1px solid rgba(20, 184, 166, 0.4)',
              fontSize: '12px',
              color: '#5EEAD4',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <IconDownload size={14} />
            <span>{isAr ? 'تصدير تقرير الجودة' : 'Export Audit'}</span>
          </button>
        </div>
      </div>

      {/* ── Operational Control Strip: Scenario & Remediation Slider ──────────── */}
      <div
        style={{
          background: '#0F172A',
          padding: '16px 24px',
          borderBottom: '1px solid #1E293B',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          alignItems: 'center'
        }}
      >
        {/* Scenario Selector */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              color: '#94A3B8',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '6px'
            }}
          >
            {isAr ? 'قطاع الأعمال ومنظومة الدفاتر المستهدفة' : 'Target Enterprise Ecosystem'}
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.entries(PRESET_DATA_QUALITY_SCENARIOS).map(([key, item]) => {
              const isSelected = key === selectedScenarioKey;
              return (
                <button
                  key={key}
                  onClick={() => handleScenarioChange(key)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid #14B8A6' : '1px solid #334155',
                    background: isSelected ? 'rgba(20, 184, 166, 0.2)' : '#1E293B',
                    color: isSelected ? '#FFFFFF' : '#94A3B8',
                    fontSize: '12px',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isAr ? item.nameAr.split('(')[0] : item.nameEn.split('&')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Automated Remediation Target Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#94A3B8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              {isAr ? 'نسبة المعالجة والتصحيح الآلي للبيانات' : 'Automated Data Remediation Target'}
            </label>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '13px',
                fontWeight: 800,
                color: '#2DD4BF',
                background: 'rgba(20, 184, 166, 0.15)',
                padding: '2px 8px',
                borderRadius: '4px'
              }}
            >
              {remediationTargetPct}% {isAr ? 'تصحيح معتمد' : 'Auto-Remediated'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={remediationTargetPct}
            onChange={(e) => setRemediationTargetPct(parseInt(e.target.value, 10))}
            style={{
              width: '100%',
              accentColor: '#14B8A6',
              cursor: 'pointer'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748B', marginTop: '4px' }}>
            <span>0% {isAr ? 'عزل فقط' : 'Quarantine Only'}</span>
            <span>50% {isAr ? 'معالجة جزئية' : 'Partial Healing'}</span>
            <span style={{ color: '#2DD4BF', fontWeight: 700 }}>100% {isAr ? 'دفاتر نظيفة تماماً' : '100% Golden Ledgers'}</span>
          </div>
        </div>
      </div>

      {/* ── Executive KPI Telemetry Bar ───────────────────────────────────────── */}
      <div
        style={{
          background: '#0B0F19',
          padding: '18px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          borderBottom: '1px solid #1E293B'
        }}
      >
        <div style={{ background: '#111827', padding: '14px 18px', borderRadius: '12px', border: '1px solid #1F2937' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
            {isAr ? 'مؤشر سلامة ونزاهة الدفاتر (DQI)' : 'Multi-Vector Integrity Index'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#2DD4BF', fontFamily: 'monospace', marginTop: '4px' }}>
            {portfolioMetrics.overallIntegrityScore}%
          </div>
          <div style={{ fontSize: '10px', color: '#10B981', marginTop: '4px', fontWeight: 700 }}>
            +{(portfolioMetrics.overallIntegrityScore - currentScenario.baselineIntegrityScore).toFixed(1)}% {isAr ? 'تحسن بالمعالجة الآلية' : 'via auto-remediation'}
          </div>
        </div>

        <div style={{ background: '#111827', padding: '14px 18px', borderRadius: '12px', border: '1px solid #1F2937' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
            {isAr ? 'حجم الدفاتر المعالجة والمحمية' : 'Remediated Financial Volume'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#38BDF8', fontFamily: 'monospace', marginTop: '4px' }}>
            {portfolioMetrics.projectedRemediatedVolumeSAR.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 600 }}>{isAr ? 'ر.س' : 'SAR'}</span>
          </div>
          <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>
            {isAr ? `من أصل ${portfolioMetrics.totalAtRiskLedgerVolumeSAR.toLocaleString()} ر.س معرضة للخلل` : `out of ${portfolioMetrics.totalAtRiskLedgerVolumeSAR.toLocaleString()} SAR at risk`}
          </div>
        </div>

        <div style={{ background: '#111827', padding: '14px 18px', borderRadius: '12px', border: '1px solid #1F2937' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
            {isAr ? 'زمن إقفال الحسابات الشهرية' : 'Monthly Close Cycle Speed'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#A855F7', fontFamily: 'monospace', marginTop: '4px' }}>
            {portfolioMetrics.monthEndCloseDaysReduced} <span style={{ fontSize: '12px', fontWeight: 600 }}>{isAr ? 'أيام عمل' : 'Days'}</span>
          </div>
          <div style={{ fontSize: '10px', color: '#A855F7', marginTop: '4px', fontWeight: 700 }}>
            {isAr ? 'تقليص بنسبة 85% (كان 14 يوماً)' : '85% faster close (was 14 days)'}
          </div>
        </div>

        <div style={{ background: '#111827', padding: '14px 18px', borderRadius: '12px', border: '1px solid #1F2937' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
            {isAr ? 'امتثال الفوترة الإلكترونية ZATCA' : 'ZATCA Phase 2 E-Invoice Compliance'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#10B981', fontFamily: 'monospace', marginTop: '4px' }}>
            {portfolioMetrics.zatcaCompliancePct}%
          </div>
          <div style={{ fontSize: '10px', color: '#10B981', marginTop: '4px', fontWeight: 700 }}>
            {isAr ? 'صفر مخالفات ضريبية على الفواتير' : 'Zero tax schema rejections'}
          </div>
        </div>
      </div>

      {/* ── Tabs Navigation ───────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #1E293B',
          background: '#0B0F19',
          padding: '0 24px',
          overflowX: 'auto',
          gap: '8px'
        }}
      >
        <button
          onClick={() => setActiveTab('anomalies')}
          style={{
            padding: '14px 18px',
            borderBottom: activeTab === 'anomalies' ? '2px solid #14B8A6' : '2px solid transparent',
            color: activeTab === 'anomalies' ? '#FFFFFF' : '#94A3B8',
            fontWeight: activeTab === 'anomalies' ? 700 : 500,
            fontSize: '13px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <IconRisk size={16} />
          <span>{isAr ? 'سجل الانحرافات والقيود المعزولة' : 'Quarantined Ledger Anomalies'}</span>
          <span
            style={{
              fontSize: '10px',
              background: '#0F766E',
              color: '#FFFFFF',
              padding: '1px 6px',
              borderRadius: '10px'
            }}
          >
            {activeAnomaliesList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('domains')}
          style={{
            padding: '14px 18px',
            borderBottom: activeTab === 'domains' ? '2px solid #14B8A6' : '2px solid transparent',
            color: activeTab === 'domains' ? '#FFFFFF' : '#94A3B8',
            fontWeight: activeTab === 'domains' ? 700 : 500,
            fontSize: '13px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <IconLayers size={16} />
          <span>{isAr ? 'مصفوفة فحص المحاور الخمسة' : '5-Domain Schema Health Matrix'}</span>
        </button>

        <button
          onClick={() => setActiveTab('dedup')}
          style={{
            padding: '14px 18px',
            borderBottom: activeTab === 'dedup' ? '2px solid #14B8A6' : '2px solid transparent',
            color: activeTab === 'dedup' ? '#FFFFFF' : '#94A3B8',
            fontWeight: activeTab === 'dedup' ? 700 : 500,
            fontSize: '13px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <IconRefreshCw size={16} />
          <span>{isAr ? 'توحيد السجلات المكررة (Golden Record)' : 'Entity Deduplication & Golden Record'}</span>
        </button>

        <button
          onClick={() => setActiveTab('attestation')}
          style={{
            padding: '14px 18px',
            borderBottom: activeTab === 'attestation' ? '2px solid #14B8A6' : '2px solid transparent',
            color: activeTab === 'attestation' ? '#FFFFFF' : '#94A3B8',
            fontWeight: activeTab === 'attestation' ? 700 : 500,
            fontSize: '13px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <IconShield size={16} />
          <span>{isAr ? 'شهادة الحوكمة والرقابة النظامية' : 'Statutory Board Attestation'}</span>
        </button>
      </div>

      {/* ── Tab Content ──────────────────────────────────────────────────────── */}
      <div style={{ padding: '24px' }}>
        {/* ── TAB 1: QUARANTINED ANOMALIES ───────────────────────────────────── */}
        {activeTab === 'anomalies' && (
          <div>
            {/* Filters */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setSeverityFilter('ALL')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: severityFilter === 'ALL' ? '1px solid #14B8A6' : '1px solid #334155',
                    background: severityFilter === 'ALL' ? 'rgba(20, 184, 166, 0.2)' : '#1E293B',
                    color: severityFilter === 'ALL' ? '#FFFFFF' : '#94A3B8',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {isAr ? 'كافة الانحرافات' : 'All Anomalies'} ({activeAnomaliesList.length})
                </button>
                <button
                  onClick={() => setSeverityFilter('CRITICAL')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: severityFilter === 'CRITICAL' ? '1px solid #EF4444' : '1px solid #334155',
                    background: severityFilter === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : '#1E293B',
                    color: severityFilter === 'CRITICAL' ? '#EF4444' : '#94A3B8',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {isAr ? 'حرجة (قيود غير متوازنة)' : 'Critical (Imbalanced)'}
                </button>
                <button
                  onClick={() => setSeverityFilter('WARNING')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: severityFilter === 'WARNING' ? '1px solid #F59E0B' : '1px solid #334155',
                    background: severityFilter === 'WARNING' ? 'rgba(245, 158, 11, 0.2)' : '#1E293B',
                    color: severityFilter === 'WARNING' ? '#F59E0B' : '#94A3B8',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {isAr ? 'تحذيرات امتثال' : 'Compliance Warnings'}
                </button>
              </div>

              <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                {isAr
                  ? 'تم عزل هذه القيود برمجياً قبل التأثير على ميزان المراجعة أو إرسالها لـ ZATCA'
                  : 'Vouchers quarantined pre-posting to protect trial balance integrity'}
              </div>
            </div>

            {/* Anomalies Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {displayedAnomalies.map((a) => {
                const isRemediated = a.autoRemediated || !!remediatedIds[a.id];
                return (
                  <div
                    key={a.id}
                    onClick={() => setSelectedAnomaly(a)}
                    style={{
                      background: '#111827',
                      border: isRemediated
                        ? '1px solid rgba(16, 185, 129, 0.4)'
                        : a.severity === 'CRITICAL'
                          ? '1px solid rgba(239, 68, 68, 0.5)'
                          : '1px solid #1E293B',
                      borderRadius: '10px',
                      padding: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '280px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: isRemediated
                              ? 'rgba(16, 185, 129, 0.15)'
                              : a.severity === 'CRITICAL'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(245, 158, 11, 0.15)',
                            color: isRemediated ? '#10B981' : a.severity === 'CRITICAL' ? '#EF4444' : '#F59E0B'
                          }}
                        >
                          {isRemediated ? (isAr ? 'تمت المعالجة ✓' : 'RESOLVED ✓') : a.severity}
                        </span>

                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#14B8A6', fontWeight: 700 }}>
                          {a.voucherNumber}
                        </span>

                        <span style={{ fontSize: '10px', background: '#1E293B', color: '#94A3B8', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                          {a.sourceSystem}
                        </span>

                        <span style={{ fontSize: '10px', color: '#64748B' }}>{a.timestamp}</span>
                      </div>

                      <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px 0' }}>
                        {isAr ? a.titleAr : a.titleEn}
                      </h4>

                      <p style={{ fontSize: '12px', color: '#CBD5E1', margin: '0 0 8px 0', lineHeight: 1.6 }}>
                        {isAr ? a.descriptionAr : a.descriptionEn}
                      </p>

                      <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                        FIELD // {a.detectedField}
                      </div>
                    </div>

                    <div style={{ textAlign: isAr ? 'left' : 'right', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {a.impactAmountSAR > 0 && (
                        <div>
                          <div style={{ fontSize: '10px', color: '#94A3B8' }}>{isAr ? 'الأثر المالي' : 'Impact'}</div>
                          <div style={{ fontSize: '16px', fontWeight: 900, color: '#38BDF8', fontFamily: 'monospace' }}>
                            {a.impactAmountSAR.toLocaleString()} {isAr ? 'ر.س' : 'SAR'}
                          </div>
                        </div>
                      )}

                      {!isRemediated && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolveAnomaly(a.id);
                          }}
                          style={{
                            background: '#0F766E',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <IconCheck size={12} />
                          <span>{isAr ? 'معالجة وتصحيح آلي' : 'Auto-Remediate'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Anomaly Remediation Drawer */}
            {selectedAnomaly && (
              <div
                style={{
                  marginTop: '20px',
                  background: '#07181F',
                  border: '1px solid #14B8A6',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#2DD4BF', fontFamily: 'monospace' }}>
                    DETAILED FORENSIC REMEDIATION PROTOCOL // {selectedAnomaly.voucherNumber}
                  </span>
                  <button
                    onClick={() => setSelectedAnomaly(null)}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '14px' }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ fontSize: '13px', color: '#E2E8F0', lineHeight: 1.6 }}>
                  <strong>{isAr ? 'الإجراء التصحيحي المنفذ:' : 'Prescribed Remediation Step:'}</strong>{' '}
                  {isAr ? selectedAnomaly.remediationActionAr : selectedAnomaly.remediationActionEn}
                </div>

                <div style={{ fontSize: '11px', color: '#14B8A6', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  PROOF HASH: {selectedAnomaly.cryptographicProofHash}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: 5-DOMAIN SCHEMA HEALTH MATRIX ──────────────────────────── */}
        {activeTab === 'domains' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                {isAr ? 'مصفوفة فحص المحاور الخمسة لسلامة ونزاهة الدفاتر' : '5-Domain Ledger Governance Health Matrix'}
              </h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0 0' }}>
                {isAr
                  ? 'فحص شامل ومستمر للقيود المحاسبية، الفوترة الإلكترونية، الدفاتر الفرعية، وأسعار الصرف الرسمية.'
                  : 'Continuous multi-system schema validation across general ledger, tax compliance, and entity registers.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {domainScores.map((d) => (
                <div
                  key={d.domain}
                  style={{
                    background: '#111827',
                    border: '1px solid #1E293B',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF' }}>
                      {isAr ? d.labelAr : d.labelEn}
                    </span>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 900,
                        color: d.score >= 95 ? '#10B981' : d.score >= 90 ? '#2DD4BF' : '#F59E0B',
                        fontFamily: 'monospace'
                      }}
                    >
                      {d.score}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '6px', background: '#1E293B', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${d.score}%`,
                        height: '100%',
                        background: d.score >= 95 ? '#10B981' : '#14B8A6',
                        borderRadius: '3px',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8' }}>
                    <span>{isAr ? `إجمالي الفحوصات: ${d.totalChecks.toLocaleString()}` : `Checks: ${d.totalChecks.toLocaleString()}`}</span>
                    <span>{isAr ? `الانحرافات: ${d.anomaliesDetected}` : `Anomalies: ${d.anomaliesDetected}`}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: GOLDEN RECORD ENTITY DEDUPLICATION ─────────────────────── */}
        {activeTab === 'dedup' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                {isAr ? 'محرك توحيد الكيانات والسجلات الذهبية (Golden Record Resolver)' : 'Master Data Entity Resolution & Golden Record Resolver'}
              </h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0 0' }}>
                {isAr
                  ? 'دمج آلي لسجلات الموردين والعملاء المكررة استناداً إلى السجل التجاري والآيبان البنكي لمنع تشتت الفواتير وحساب الخصومات بدقة.'
                  : 'Automated entity reconciliation matching fragmented vendor & customer records via unique Commercial Registration and IBAN keys.'}
              </p>
            </div>

            <div style={{ background: '#111827', border: '1px solid #1E293B', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#2DD4BF', fontFamily: 'monospace' }}>
                  RESOLVED MASTER ENTITY // مؤسسة البناء الحديث للمقاولات
                </span>
                <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  GOLDEN RECORD CERTIFIED
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div style={{ background: '#0F172A', padding: '14px', borderRadius: '8px', border: '1px solid #1E293B' }}>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>{isAr ? 'السجل الأصلي 1 (فرع الرياض)' : 'Branch 1 Record (Riyadh)'}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>كود الحساب: VEND-104</div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace', marginTop: '2px' }}>CR: 1010884920 // IBAN: SA4480000...</div>
                </div>

                <div style={{ background: '#0F172A', padding: '14px', borderRadius: '8px', border: '1px solid #1E293B' }}>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>{isAr ? 'السجل الأصلي 2 (فرع جدة)' : 'Branch 2 Record (Jeddah)'}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>كود الحساب: VEND-890</div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace', marginTop: '2px' }}>CR: 1010884920 // IBAN: SA4480000...</div>
                </div>
              </div>

              <div style={{ background: 'rgba(20, 184, 166, 0.1)', border: '1px solid rgba(20, 184, 166, 0.3)', borderRadius: '8px', padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#2DD4BF', fontSize: '16px' }}>✓</span>
                <span style={{ fontSize: '12px', color: '#CCFBF1' }}>
                  {isAr
                    ? 'تم توحيد الحساب في السجل الذهبي (VEND-GOLD-1010884920) وإعادة ربط 42 فاتورة سابقة بإجمالي 4,120,000 ريال، وتفعيل خصم الحجم السنوي بنسبة 4.5%.'
                    : 'Consolidated into Golden Master (VEND-GOLD-1010884920), preserving 42 historical vouchers totaling 4.12M SAR and unlocking 4.5% volume rebate.'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: STATUTORY ATTESTATION ──────────────────────────────────── */}
        {activeTab === 'attestation' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  {isAr ? 'وثيقة شهادة الحوكمة والرقابة النظامية (SOCPA / IFRS)' : 'Official Statutory Data Governance Certificate'}
                </h3>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0 0' }}>
                  {isAr
                    ? 'شهادة رسمية صادرة للمراجعين الخارجيين والجهات الرقابية تؤكد سلامة ميزان المراجعة وخلوه من الفوارق المعلقة.'
                    : 'Formal certification issued for external auditors (Big 4) and board audit committees attesting to zero unposted imbalances.'}
                </p>
              </div>

              <button
                onClick={handleCopyAttestation}
                style={{
                  background: attestationCopied ? '#10B981' : '#1E293B',
                  border: '1px solid #334155',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <IconCheckCircle size={14} />
                <span>{attestationCopied ? (isAr ? 'تم النسخ بنجاح!' : 'Copied!') : isAr ? 'نسخ الشهادة' : 'Copy Attestation'}</span>
              </button>
            </div>

            <div
              style={{
                background: '#070A12',
                border: '1px solid #1E293B',
                borderRadius: '12px',
                padding: '24px',
                fontFamily: 'monospace',
                fontSize: '13px',
                color: '#CBD5E1',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
              }}
            >
              {currentAttestation}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer Public Trigger ─────────────────────────────────────────────── */}
      {isEmbeddedInPublicPage && onRequestAssistance && (
        <div
          style={{
            background: '#0F172A',
            padding: '16px 24px',
            borderTop: '1px solid #1E293B',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ fontSize: '12px', color: '#94A3B8' }}>
            {isAr
              ? 'هل ترغب في فحص قيود وسجلات مؤسستك المحاسبية وضمان امتثال ZATCA الفوري؟'
              : 'Deploy continuous multi-system data governance on your enterprise ledgers?'}
          </div>

          <button
            onClick={() =>
              onRequestAssistance(
                `${isAr ? 'فحص جودة وحوكمة البيانات' : 'Data Quality Governance Scan'} [DQI: ${portfolioMetrics.overallIntegrityScore}%]`
              )
            }
            style={{
              background: '#14B8A6',
              color: '#042F2E',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{isAr ? 'بدء فحص بيانات مؤسستنا' : 'Initiate Enterprise Ledger Scan'}</span>
            <IconArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
