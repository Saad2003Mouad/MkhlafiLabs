// MIKHLAFI LABS — Executive Sovereign AI Assistant Workbench (Service 07)
// High-Impact Visual Cockpit: Deterministic Ledger Interrogation, Clickable ERP Citations,
// Zero-Hallucination Confidence Threshold Slider, Sovereign Security Policy, and Board Briefing Dossiers.

import React, { useState, useMemo } from 'react';
import { LocaleMode } from '../../types';
import {
  PRESET_ASSISTANT_SCENARIOS,
  AssistantQueryRecord,
  EvidenceCitation,
  calculatePortfolioAssistantMetrics,
  executeSemanticAssistantQuery,
  generateBoardAssistantBriefing,
  exportAssistantLedgerCsv,
  parseAssistantLedgerCsv
} from '../../services/assistant/executiveAssistantEngine';
import {
  IconBot,
  IconSearch,
  IconCheckCircle,
  IconClock,
  IconShield,
  IconDownload,
  IconRefreshCw,
  IconArrowRight,
  IconFileText
} from '../Icons';

interface ExecutiveAssistantWorkbenchProps {
  locale: LocaleMode;
  initialScenario?: 'conglomerate_holding' | 'giga_construction' | 'pharma_healthcare';
  isEmbeddedInPublicPage?: boolean;
  onRequestAssistance?: (queryDetails: string) => void;
}

export const ExecutiveAssistantWorkbench: React.FC<ExecutiveAssistantWorkbenchProps> = ({
  locale,
  initialScenario = 'conglomerate_holding',
  isEmbeddedInPublicPage = false,
  onRequestAssistance
}) => {
  const isAr = locale === 'ar';

  // ── State Management ────────────────────────────────────────────────────────
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<string>(initialScenario);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(95);
  const [activeTab, setActiveTab] = useState<'console' | 'citations' | 'governance' | 'decree'>('console');
  const [activeQueryIndex, setActiveQueryIndex] = useState<number>(0);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isProcessingQuery, setIsProcessingQuery] = useState<boolean>(false);
  const [selectedCitation, setSelectedCitation] = useState<EvidenceCitation | null>(null);
  const [decreeCopied, setDecreeCopied] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const currentScenario =
    PRESET_ASSISTANT_SCENARIOS[selectedScenarioKey] || PRESET_ASSISTANT_SCENARIOS.conglomerate_holding;

  const [activeQueriesList, setActiveQueriesList] = useState<AssistantQueryRecord[]>(
    currentScenario.queries
  );

  // Sync queries when scenario changes
  const handleScenarioChange = (key: string) => {
    setSelectedScenarioKey(key);
    const scen = PRESET_ASSISTANT_SCENARIOS[key] || PRESET_ASSISTANT_SCENARIOS.conglomerate_holding;
    setActiveQueriesList(scen.queries);
    setActiveQueryIndex(0);
    setSelectedCitation(null);
  };

  // Filtered queries based on confidence slider
  const displayedQueries = useMemo(() => {
    return activeQueriesList.filter((q) => q.confidenceScore >= confidenceThreshold);
  }, [activeQueriesList, confidenceThreshold]);

  const activeQuery = displayedQueries[activeQueryIndex] || activeQueriesList[0];

  const portfolioMetrics = useMemo(() => {
    return calculatePortfolioAssistantMetrics(
      activeQueriesList,
      currentScenario.totalLedgerVolumeSAR,
      confidenceThreshold
    );
  }, [activeQueriesList, currentScenario.totalLedgerVolumeSAR, confidenceThreshold]);

  // Execute interactive natural language query
  const handleExecuteQuery = (textToRun?: string) => {
    const qText = textToRun || customPrompt;
    if (!qText.trim()) return;

    setIsProcessingQuery(true);
    setTimeout(() => {
      const result = executeSemanticAssistantQuery(qText, selectedScenarioKey);
      setActiveQueriesList((prev) => {
        const exists = prev.some((item) => item.id === result.id);
        if (exists) return prev;
        return [result, ...prev];
      });
      setActiveQueryIndex(0);
      setIsProcessingQuery(false);
      if (!textToRun) setCustomPrompt('');
    }, 650);
  };

  // Generate briefing text
  const currentBriefing = useMemo(() => {
    if (!activeQuery) return '';
    return generateBoardAssistantBriefing(selectedScenarioKey, activeQuery, locale);
  }, [selectedScenarioKey, activeQuery, locale]);

  // Copy briefing text
  const handleCopyDecree = () => {
    navigator.clipboard.writeText(currentBriefing);
    setDecreeCopied(true);
    setTimeout(() => setDecreeCopied(false), 2500);
  };

  // Download CSV
  const handleExportCsv = () => {
    const csv = exportAssistantLedgerCsv(activeQueriesList);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Mikhlafi_AI_Ledger_Evidence_${selectedScenarioKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const parsed = parseAssistantLedgerCsv(content);
        if (parsed.length > 0) {
          const filled = parsed.map((p, idx) => ({
            id: p.id || `UPLOAD-${idx + 1}`,
            category: p.category || 'EXPENSE_VARIANCE',
            queryAr: p.queryAr || 'استفسار محاسبي مخصص',
            queryEn: p.queryEn || 'Custom accounting query',
            executiveSummaryAr: 'تم استيراد هذا الاستفسار بنجاح من ملف التدقيق المرفوع.',
            executiveSummaryEn: 'Imported successfully from external ledger audit file.',
            primaryImpactSAR: p.primaryImpactSAR || 0,
            confidenceScore: p.confidenceScore || 99.0,
            processingLatencySec: p.processingLatencySec || 0.8,
            governanceStatus: 'CERTIFIED_AUDIT_PROOF' as const,
            assignedExecutive: 'مدير التدقيق الداخلي',
            citations: [],
            prescriptiveActionAr: 'تدقيق المستندات الداعمة للسجل المرفوع.',
            prescriptiveActionEn: 'Audit supporting documentation for uploaded record.',
            suggestedFollowUpAr: 'أظهر السجلات المحاسبية المرتبطة بالملف المرفوع',
            suggestedFollowUpEn: 'Show ledger postings linked to uploaded dataset',
            cryptographicHash: p.cryptographicHash || 'EV-PROOF-UPLOADED'
          }));
          setActiveQueriesList(filled);
          setActiveQueryIndex(0);
        }
      }
    };
    reader.readAsText(file);
  };

  // Filter citations for Tab 2
  const allScenarioCitations = useMemo(() => {
    const list: EvidenceCitation[] = [];
    activeQueriesList.forEach((q) => {
      q.citations.forEach((c) => {
        if (!list.some((existing) => existing.id === c.id)) {
          list.push(c);
        }
      });
    });
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(
      (c) =>
        c.voucherNumber.toLowerCase().includes(term) ||
        c.entityOrVendorAr.toLowerCase().includes(term) ||
        c.entityOrVendorEn.toLowerCase().includes(term) ||
        c.glAccountCode.toLowerCase().includes(term) ||
        c.system.toLowerCase().includes(term)
    );
  }, [activeQueriesList, searchTerm]);

  return (
    <div
      style={{
        maxWidth: '1160px',
        margin: '0 auto',
        background: '#0B0F19',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 35px rgba(99, 102, 241, 0.2)',
        color: '#F8FAFC',
        fontFamily: 'inherit'
      }}
    >
      {/* ── Top Bar: Sovereign AI Header & Live Status ────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(90deg, #111827 0%, #1E1B4B 100%)',
          padding: '16px 24px',
          borderBottom: '1px solid rgba(99, 102, 241, 0.25)',
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
              background: 'rgba(99, 102, 241, 0.18)',
              border: '1px solid #6366F1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818CF8'
            }}
          >
            <IconBot size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  background: '#6366F1',
                  color: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontFamily: 'monospace'
                }}
              >
                ENGINE 07 // SOVEREIGN ASSISTANT
              </span>
              <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'monospace' }}>
                ZERO-HALLUCINATION DETERMINISTIC RAG
              </span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: '2px 0 0 0' }}>
              {isAr ? 'منظومة المساعد التنفيذي السيادي المستند للأدلة' : 'Sovereign Evidence-Grounded AI Assistant Workbench'}
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
            <span>{isAr ? 'استيراد CSV' : 'Import CSV'}</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          <button
            onClick={handleExportCsv}
            style={{
              cursor: 'pointer',
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              fontSize: '12px',
              color: '#A5B4FC',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <IconDownload size={14} />
            <span>{isAr ? 'تصدير الأدلة CSV' : 'Export Evidence'}</span>
          </button>
        </div>
      </div>

      {/* ── Operational Control Strip: Scenario & Confidence Slider ───────────── */}
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
            {isAr ? 'المحفظة والدفاتر المؤسسية المفحوصة' : 'Enterprise Ledger & Sector Portfolio'}
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.entries(PRESET_ASSISTANT_SCENARIOS).map(([key, item]) => {
              const isSelected = key === selectedScenarioKey;
              return (
                <button
                  key={key}
                  onClick={() => handleScenarioChange(key)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid #6366F1' : '1px solid #334155',
                    background: isSelected ? 'rgba(99, 102, 241, 0.2)' : '#1E293B',
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

        {/* Verification Strictness Slider (85% to 100%) */}
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
              {isAr ? 'عتبة التدقيق الحتمي الصارم' : 'Evidence Confidence Threshold'}
            </label>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '13px',
                fontWeight: 800,
                color: '#818CF8',
                background: 'rgba(99, 102, 241, 0.15)',
                padding: '2px 8px',
                borderRadius: '4px'
              }}
            >
              {confidenceThreshold}% {confidenceThreshold >= 98 ? (isAr ? '(إثبات ثلاثي)' : '(Triple-Proof)') : ''}
            </span>
          </div>
          <input
            type="range"
            min="85"
            max="100"
            step="1"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(parseInt(e.target.value, 10))}
            style={{
              width: '100%',
              accentColor: '#6366F1',
              cursor: 'pointer'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748B', marginTop: '4px' }}>
            <span>85% {isAr ? 'فحص ثنائي' : 'Dual-Reconciled'}</span>
            <span>95% {isAr ? 'معتمد تدقيقياً' : 'Audit-Certified'}</span>
            <span style={{ color: '#818CF8', fontWeight: 700 }}>100% {isAr ? 'قاطع 0.00% هلوسة' : 'Zero-Hallucination'}</span>
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
            {isAr ? 'الأثر المالي المفحوص' : 'Audited Financial Impact'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#38BDF8', fontFamily: 'monospace', marginTop: '4px' }}>
            {portfolioMetrics.totalAuditedLedgerValueSAR.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 600 }}>{isAr ? 'ر.س' : 'SAR'}</span>
          </div>
          <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>
            {isAr ? 'مستخرج من ملايين القيود المحاسبية' : 'Synthesized across verified ledgers'}
          </div>
        </div>

        <div style={{ background: '#111827', padding: '14px 18px', borderRadius: '12px', border: '1px solid #1F2937' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
            {isAr ? 'متوسط دقة الإسناد الحسابي' : 'Verification Precision'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#10B981', fontFamily: 'monospace', marginTop: '4px' }}>
            {portfolioMetrics.avgVerificationConfidence}%
          </div>
          <div style={{ fontSize: '10px', color: '#10B981', marginTop: '4px', fontWeight: 700 }}>
            100% {isAr ? 'مدعوم بسندات مصدرية' : 'Source voucher citations'}
          </div>
        </div>

        <div style={{ background: '#111827', padding: '14px 18px', borderRadius: '12px', border: '1px solid #1F2937' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
            {isAr ? 'السندات المصدرية المفهرسة' : 'Active ERP Evidence Vouchers'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#A855F7', fontFamily: 'monospace', marginTop: '4px' }}>
            {portfolioMetrics.totalCitationsIndexed} <span style={{ fontSize: '12px', fontWeight: 600 }}>{isAr ? 'سندات موثقة' : 'Vouchers'}</span>
          </div>
          <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>
            SAP S/4HANA // Oracle // ZATCA
          </div>
        </div>

        <div style={{ background: '#111827', padding: '14px 18px', borderRadius: '12px', border: '1px solid #1F2937' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
            {isAr ? 'سرعة الاستجابة التنفيذية' : 'Executive Query Latency'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#F59E0B', fontFamily: 'monospace', marginTop: '4px' }}>
            {portfolioMetrics.avgResponseLatencyMs} <span style={{ fontSize: '12px', fontWeight: 600 }}>ms</span>
          </div>
          <div style={{ fontSize: '10px', color: '#F59E0B', marginTop: '4px' }}>
            {isAr ? 'استعلام سيادي فوري بلا انتظار' : 'Sovereign instant query pipeline'}
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ───────────────────────────────────────────────────── */}
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
          onClick={() => setActiveTab('console')}
          style={{
            padding: '14px 18px',
            borderBottom: activeTab === 'console' ? '2px solid #6366F1' : '2px solid transparent',
            color: activeTab === 'console' ? '#FFFFFF' : '#94A3B8',
            fontWeight: activeTab === 'console' ? 700 : 500,
            fontSize: '13px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <IconBot size={16} />
          <span>{isAr ? 'منصة الاستجواب الفوري والتحليل' : 'Executive Query Console'}</span>
        </button>

        <button
          onClick={() => setActiveTab('citations')}
          style={{
            padding: '14px 18px',
            borderBottom: activeTab === 'citations' ? '2px solid #6366F1' : '2px solid transparent',
            color: activeTab === 'citations' ? '#FFFFFF' : '#94A3B8',
            fontWeight: activeTab === 'citations' ? 700 : 500,
            fontSize: '13px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <IconFileText size={16} />
          <span>{isAr ? 'فهرس الأدلة والسندات المحاسبية' : 'Cryptographic Citations Index'}</span>
          <span
            style={{
              fontSize: '10px',
              background: '#334155',
              color: '#CBD5E1',
              padding: '1px 6px',
              borderRadius: '10px'
            }}
          >
            {allScenarioCitations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('governance')}
          style={{
            padding: '14px 18px',
            borderBottom: activeTab === 'governance' ? '2px solid #6366F1' : '2px solid transparent',
            color: activeTab === 'governance' ? '#FFFFFF' : '#94A3B8',
            fontWeight: activeTab === 'governance' ? 700 : 500,
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
          <span>{isAr ? 'معايير السيادة والحماية من الهلوسة' : 'Sovereignty & Anti-Hallucination'}</span>
        </button>

        <button
          onClick={() => setActiveTab('decree')}
          style={{
            padding: '14px 18px',
            borderBottom: activeTab === 'decree' ? '2px solid #6366F1' : '2px solid transparent',
            color: activeTab === 'decree' ? '#FFFFFF' : '#94A3B8',
            fontWeight: activeTab === 'decree' ? 700 : 500,
            fontSize: '13px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <IconCheckCircle size={16} />
          <span>{isAr ? 'وثيقة الإحاطة وقرار مجلس الإدارة' : 'Board Briefing Dossier'}</span>
        </button>
      </div>

      {/* ── Tab Content ──────────────────────────────────────────────────────── */}
      <div style={{ padding: '24px' }}>
        {/* ── TAB 1: EXECUTIVE QUERY CONSOLE ─────────────────────────────────── */}
        {activeTab === 'console' && (
          <div>
            {/* Interactive Query Input Bar */}
            <div
              style={{
                background: '#111827',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ color: '#818CF8' }}>
                  <IconSearch size={20} />
                </div>
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExecuteQuery()}
                  placeholder={
                    isAr
                      ? 'اسأل المساعد باللغة العربية: مثلاً "ما هي أعلى مصاريف هذا الربع؟" أو "كم يتبقى من ميزانية المشروع؟"...'
                      : 'Ask in plain English or Arabic: e.g. "What are top expense variances?" or "Remaining project budget?"...'
                  }
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
                <button
                  onClick={() => handleExecuteQuery()}
                  disabled={isProcessingQuery}
                  style={{
                    background: '#6366F1',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: isProcessingQuery ? 0.7 : 1
                  }}
                >
                  {isProcessingQuery ? (
                    <>
                      <IconRefreshCw size={14} className="spin" />
                      <span>{isAr ? 'جارِ التدقيق...' : 'Auditing...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isAr ? 'استجواب الدفاتر' : 'Interrogate Ledgers'}</span>
                      <IconArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>

              {/* Pre-Seeded Suggested Questions */}
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                  {isAr ? 'أسئلة قيادية سريعة:' : 'Executive Prompt Presets:'}
                </span>
                {currentScenario.queries.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setActiveQueryIndex(idx);
                    }}
                    style={{
                      background: activeQuery?.id === q.id ? 'rgba(99, 102, 241, 0.25)' : '#1E293B',
                      border: activeQuery?.id === q.id ? '1px solid #6366F1' : '1px solid #334155',
                      color: activeQuery?.id === q.id ? '#A5B4FC' : '#CBD5E1',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isAr ? q.queryAr.slice(0, 48) + '...' : q.queryEn.slice(0, 48) + '...'}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Query Grounded Intelligence Card */}
            {activeQuery && (
              <div
                style={{
                  background: '#0F172A',
                  border: '1px solid #1E293B',
                  borderRadius: '14px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}
              >
                {/* Header: Query Title & Verification Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontFamily: 'monospace',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10B981',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 700
                        }}
                      >
                        {activeQuery.governanceStatus}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace' }}>
                        REF: {activeQuery.id} // LATENCY: {activeQuery.processingLatencySec}s
                      </span>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                      {isAr ? activeQuery.queryAr : activeQuery.queryEn}
                    </h3>
                  </div>

                  <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>{isAr ? 'الأثر المالي الموثق' : 'Verified Financial Impact'}</div>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: '#38BDF8', fontFamily: 'monospace' }}>
                      {activeQuery.primaryImpactSAR.toLocaleString()} <span style={{ fontSize: '13px' }}>{isAr ? 'ر.س' : 'SAR'}</span>
                    </div>
                  </div>
                </div>

                {/* Grounded Executive Synthesis Box */}
                <div
                  style={{
                    background: '#111827',
                    border: '1px solid #1F2937',
                    borderRadius: '10px',
                    padding: '18px',
                    borderInlineStart: '4px solid #6366F1'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#818CF8', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>
                    {isAr ? 'الملخص التنفيذي الحتمي (مستخرج مباشرة من القيود)' : 'Deterministic Executive Synthesis (Zero Generative Hallucination)'}
                  </div>
                  <div style={{ fontSize: '14px', lineHeight: 1.7, color: '#E2E8F0' }}>
                    {isAr ? activeQuery.executiveSummaryAr : activeQuery.executiveSummaryEn}
                  </div>
                </div>

                {/* Prescriptive Operational Action */}
                <div
                  style={{
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  <div style={{ color: '#F59E0B', marginTop: '2px' }}>
                    <IconShield size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {isAr ? 'الإجراء التنفيذي الموصى به فوراً' : 'Recommended Prescriptive Executive Action'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#FDE68A', marginTop: '4px', lineHeight: 1.6 }}>
                      {isAr ? activeQuery.prescriptiveActionAr : activeQuery.prescriptiveActionEn}
                    </div>
                  </div>
                </div>

                {/* Clickable Ledger Citations Grid */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                    {isAr ? 'السندات المصدرية والأدلة المحاسبية المستشهد بها (Citations):' : 'Clickable Ledger Citations & Evidence Vouchers:'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    {activeQuery.citations.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCitation(c)}
                        style={{
                          background: selectedCitation?.id === c.id ? '#1E1B4B' : '#111827',
                          border: selectedCitation?.id === c.id ? '1px solid #818CF8' : '1px solid #1F2937',
                          borderRadius: '8px',
                          padding: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#818CF8', fontFamily: 'monospace' }}>
                            {c.voucherNumber}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              background: '#1E293B',
                              color: '#94A3B8',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontFamily: 'monospace'
                            }}
                          >
                            {c.system}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#F8FAFC', marginBottom: '4px' }}>
                          {isAr ? c.entityOrVendorAr : c.entityOrVendorEn}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace', marginBottom: '6px' }}>
                          {c.glAccountCode} // {isAr ? c.glAccountNameAr : c.glAccountNameEn}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#38BDF8', fontFamily: 'monospace' }}>
                            {c.amountSAR.toLocaleString()} {isAr ? 'ر.س' : 'SAR'}
                          </span>
                          <span style={{ fontSize: '10px', color: '#10B981', fontWeight: 700 }}>
                            {c.verificationConfidence}% {isAr ? 'دقة' : 'Conf'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Citation Inspection Drawer */}
                {selectedCitation && (
                  <div
                    style={{
                      background: '#1E1B4B',
                      border: '1px solid #6366F1',
                      borderRadius: '10px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#A5B4FC', fontFamily: 'monospace' }}>
                        CRYPTOGRAPHIC PROOF INSPECTOR // {selectedCitation.voucherNumber}
                      </span>
                      <button
                        onClick={() => setSelectedCitation(null)}
                        style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '14px' }}
                      >
                        ✕
                      </button>
                    </div>
                    <div style={{ fontSize: '12px', color: '#E2E8F0', lineHeight: 1.6 }}>
                      {isAr ? selectedCitation.auditSnippetAr : selectedCitation.auditSnippetEn}
                    </div>
                    <div style={{ fontSize: '10px', color: '#818CF8', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      PROOF HASH: {selectedCitation.cryptographicProofHash}
                    </div>
                  </div>
                )}

                {/* Footer: Follow-up Prompt & Assistance Trigger */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    paddingTop: '16px',
                    borderTop: '1px solid #1E293B'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>{isAr ? 'السؤال المقترح التالي:' : 'Follow-up Prompt:'}</span>
                    <button
                      onClick={() => handleExecuteQuery(isAr ? activeQuery.suggestedFollowUpAr : activeQuery.suggestedFollowUpEn)}
                      style={{
                        background: '#1E293B',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        color: '#A5B4FC',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      {isAr ? activeQuery.suggestedFollowUpAr : activeQuery.suggestedFollowUpEn}
                    </button>
                  </div>

                  {isEmbeddedInPublicPage && onRequestAssistance && (
                    <button
                      onClick={() =>
                        onRequestAssistance(
                          `${isAr ? activeQuery.queryAr : activeQuery.queryEn} [SAR ${activeQuery.primaryImpactSAR.toLocaleString()}]`
                        )
                      }
                      style={{
                        background: '#6366F1',
                        color: '#FFFFFF',
                        border: 'none',
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
                      <span>{isAr ? 'طلب ربط المساعد بدفاتر مؤسستنا' : 'Deploy Sovereign Assistant on Our ERP'}</span>
                      <IconArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: CITATIONS INDEX ────────────────────────────────────────── */}
        {activeTab === 'citations' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  {isAr ? 'فهرس الأدلة والسندات المحاسبية المصدرية' : 'Cryptographic ERP Voucher Index'}
                </h3>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0 0' }}>
                  {isAr
                    ? 'كافة السجلات المستند إليها مستخرجة من أنظمة المؤسسة المعتمدة وموثقة ببصمات تشفير حتمية.'
                    : 'Authoritative transaction vouchers retrieved from integrated enterprise backends with deterministic hash seals.'}
                </p>
              </div>

              <div style={{ position: 'relative', width: '260px' }}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={isAr ? 'بحث برقم السند، المورد، أو الحساب...' : 'Search voucher, vendor, or account...'}
                  style={{
                    width: '100%',
                    background: '#111827',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto', background: '#0F172A', borderRadius: '12px', border: '1px solid #1E293B' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: isAr ? 'right' : 'left' }}>
                <thead>
                  <tr style={{ background: '#111827', borderBottom: '1px solid #1E293B', color: '#94A3B8' }}>
                    <th style={{ padding: '12px 16px' }}>{isAr ? 'رقم السند / القيد' : 'Voucher ID'}</th>
                    <th style={{ padding: '12px 16px' }}>{isAr ? 'النظام المصدر' : 'System'}</th>
                    <th style={{ padding: '12px 16px' }}>{isAr ? 'الجهة / المورد' : 'Entity / Vendor'}</th>
                    <th style={{ padding: '12px 16px' }}>{isAr ? 'رمز الحساب' : 'GL Account'}</th>
                    <th style={{ padding: '12px 16px' }}>{isAr ? 'المبلغ' : 'Amount'}</th>
                    <th style={{ padding: '12px 16px' }}>{isAr ? 'تاريخ القيد' : 'Posting Date'}</th>
                    <th style={{ padding: '12px 16px' }}>{isAr ? 'مستوى الثقة' : 'Confidence'}</th>
                    <th style={{ padding: '12px 16px' }}>{isAr ? 'بصمة الإثبات' : 'Proof Hash'}</th>
                  </tr>
                </thead>
                <tbody>
                  {allScenarioCitations.map((c) => (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: '1px solid #1E293B',
                        color: '#E2E8F0',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#818CF8', fontFamily: 'monospace' }}>
                        {c.voucherNumber}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: '#1E293B', color: '#94A3B8', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}>
                          {c.system}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                        {isAr ? c.entityOrVendorAr : c.entityOrVendorEn}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#94A3B8' }}>
                        {c.glAccountCode}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: '#38BDF8', fontFamily: 'monospace' }}>
                        {c.amountSAR.toLocaleString()} {isAr ? 'ر.س' : 'SAR'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#94A3B8' }}>{c.postingDate}</td>
                      <td style={{ padding: '12px 16px', color: '#10B981', fontWeight: 700 }}>{c.verificationConfidence}%</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '10px', color: '#64748B' }}>
                        {c.cryptographicProofHash}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: SOVEREIGNTY & ANTI-HALLUCINATION ──────────────────────── */}
        {activeTab === 'governance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                {isAr ? 'معايير السيادة الرقمية والحماية الحتمية من الهلوسة' : 'Sovereign Architecture & Anti-Hallucination Policy'}
              </h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0 0' }}>
                {isAr
                  ? 'مقارنة هندسية بين معمارية مخلافي لابس المعتمدة ونماذج الذكاء الاصطناعي العامة غير الخاضعة للسيادة.'
                  : 'Architectural comparison between Mikhlafi Labs sovereign deterministic grounding and ungrounded public LLMs.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* Card 1: Mikhlafi Labs Sovereign Engine */}
              <div
                style={{
                  background: 'linear-gradient(180deg, #1E1B4B 0%, #0F172A 100%)',
                  border: '1px solid #6366F1',
                  borderRadius: '12px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ color: '#818CF8' }}>
                    <IconCheckCircle size={22} />
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                    {isAr ? 'منظومة مخلافي لابس (الذكاء السيادي)' : 'Mikhlafi Labs (Sovereign Intelligence)'}
                  </h4>
                </div>

                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#E2E8F0' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#10B981', fontWeight: 900 }}>✓</span>
                    <span><strong>{isAr ? 'حتمية الإسناد (0.00% هلوسة):' : 'Zero Hallucination:'}</strong> {isAr ? 'النموذج مقيد حتمياً بسجلات الدفاتر. في حال غياب الدليل يمتنع عن التخمين.' : 'Strictly bounded to audited ledger records; refusal fallback if evidence is absent.'}</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#10B981', fontWeight: 900 }}>✓</span>
                    <span><strong>{isAr ? 'استضافة سيادية 100% داخل المملكة:' : '100% In-Kingdom Sovereign Hosting:'}</strong> {isAr ? 'معالجة محلية متوافقة مع لوائح هيئة البيانات والذكاء الاصطناعي (SDAIA) والأمن السيبراني (NCA).' : 'Certified Saudi sovereign infrastructure adhering to PDPL and national cybersecurity mandates.'}</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#10B981', fontWeight: 900 }}>✓</span>
                    <span><strong>{isAr ? 'روابط استشهاد مشفرة (Citations):' : 'Verifiable Citations:'}</strong> {isAr ? 'كل رقم معروض يرتبط مباشرة بقيد محاسبي، رقم فاتورة، أو اعتماد بنكي قابل للتحقق.' : 'Every figure links directly to a verifiable ledger voucher, tax UUID, or bank hash.'}</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#10B981', fontWeight: 900 }}>✓</span>
                    <span><strong>{isAr ? 'عزل كامل للمستأجر (Tenant Isolation):' : 'Air-Gapped Tenant Isolation:'}</strong> {isAr ? 'بيانات كل مؤسسة مشفرة بمفاتيح خاصة ولا تُستخدم إطلاقاً في تدريب نماذج أخرى.' : 'Customer datasets are cryptographically isolated and never recycled for model retraining.'}</span>
                  </li>
                </ul>
              </div>

              {/* Card 2: Generic Public LLMs */}
              <div
                style={{
                  background: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  opacity: 0.85
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ color: '#EF4444' }}>
                    <IconClock size={22} />
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#F87171', margin: 0 }}>
                    {isAr ? 'النماذج التجارية العامة (Public LLMs)' : 'Generic Public Commercial LLMs'}
                  </h4>
                </div>

                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#94A3B8' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#EF4444', fontWeight: 900 }}>✗</span>
                    <span><strong>{isAr ? 'مخاطر الهلوسة العالية:' : 'High Hallucination Risk:'}</strong> {isAr ? 'توليد أرقام وتواريخ وهمية تبدو صحيحة دون أي أساس محاسبي حقيقي.' : 'Generates plausible-sounding but fictitious figures, balances, and ledger dates.'}</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#EF4444', fontWeight: 900 }}>✗</span>
                    <span><strong>{isAr ? 'تسريب البيانات خارج المملكة:' : 'Data Sovereignty Breach:'}</strong> {isAr ? 'إرسال المعلومات المالية الحساسة إلى خوادم خارجية في أمريكا وأوروبا يخرق نظام حماية البيانات.' : 'Customer financial records routed to foreign third-party clouds, violating PDPL laws.'}</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#EF4444', fontWeight: 900 }}>✗</span>
                    <span><strong>{isAr ? 'انعدام الإسناد التوثيقي:' : 'Zero Voucher Attribution:'}</strong> {isAr ? 'إجابات نصية عامة غير قابلة للتدقيق أو التقديم للجهات الرقابية والمراجع القانوني.' : 'Unattributed text outputs completely unusable for legal audits or board review.'}</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#EF4444', fontWeight: 900 }}>✗</span>
                    <span><strong>{isAr ? 'مخاطر استخدام البيانات في التدريب:' : 'Model Retraining Leakage:'}</strong> {isAr ? 'قد يتم تسريب أرقام الشركة وهوامش أرباحها في مخرجات مستخدمين آخرين.' : 'Proprietary enterprise data may leak into global model weights and competitor prompts.'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: BOARD BRIEFING DOSSIER ─────────────────────────────────── */}
        {activeTab === 'decree' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  {isAr ? 'وثيقة الإحاطة التنفيذية المعتمدة المستندة للأدلة' : 'Official Evidence-Grounded Executive Briefing Dossier'}
                </h3>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0 0' }}>
                  {isAr
                    ? 'تقرير رسمي معتمد يتضمن بصمة التشفير وأرقام السجلات المحاسبية جاهز للعرض على مجلس الإدارة والمراجع القانوني.'
                    : 'Formal executive dossier with cryptographic verification hashes ready for board presentation and external audit.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleCopyDecree}
                  style={{
                    background: decreeCopied ? '#10B981' : '#1E293B',
                    border: '1px solid #334155',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <IconCheckCircle size={14} />
                  <span>{decreeCopied ? (isAr ? 'تم النسخ بنجاح!' : 'Copied!') : isAr ? 'نسخ الوثيقة' : 'Copy Briefing'}</span>
                </button>
              </div>
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
              {currentBriefing}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
