// MIKHLAFI LABS — Enterprise Executive Decision Mesh & Capital Allocation Workbench (Service 02)
// Interactive decision ranking, real-time knapsack capital budget allocation slider,
// 2x2 strategic efficiency matrix, comparative trade-off simulator, and board resolution memo.

import React, { useState, useMemo } from 'react';
import { LocaleMode } from '../../types';
import {
  ExecutiveDecision,
  CapitalAllocationResult,
  PRESET_DECISION_SCENARIOS,
  optimizeCapitalAllocation,
  compareDecisionTradeoffs,
  parseDecisionsCsv
} from '../../services/decisions/executiveDecisionEngine';
import {
  IconCheckCircle,
  IconDownload,
  IconX
} from '../Icons';
import { SandboxNotice } from '../common/SandboxNotice';

interface ExecutiveDecisionWorkbenchProps {
  locale: LocaleMode;
  initialScenario?: string;
  isEmbeddedInPublicPage?: boolean;
  onRequestAssistance?: (decisionDetails: string) => void;
}

export const ExecutiveDecisionWorkbench: React.FC<ExecutiveDecisionWorkbenchProps> = ({
  locale,
  initialScenario = 'retail',
  isEmbeddedInPublicPage = false,
  onRequestAssistance
}) => {
  const isAr = locale === 'ar';

  // Scenario & Decisions State
  const [activeScenarioKey, setActiveScenarioKey] = useState<string>(initialScenario);
  const [scenarioDecisions, setScenarioDecisions] = useState<ExecutiveDecision[]>(() => {
    return PRESET_DECISION_SCENARIOS[initialScenario]?.decisions || PRESET_DECISION_SCENARIOS.retail.decisions;
  });

  // Capital Budget Slider State
  const defaultBudget = PRESET_DECISION_SCENARIOS[initialScenario]?.suggestedBudgetSAR || 6000000;
  const [budgetPoolSAR, setBudgetPoolSAR] = useState<number>(defaultBudget);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'queue' | 'matrix' | 'tradeoff' | 'memo'>('queue');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Trade-off Simulator State
  const [tradeoffIdA, setTradeoffIdA] = useState<string>('');
  const [tradeoffIdB, setTradeoffIdB] = useState<string>('');

  // Modal State
  const [activeModalDecision, setActiveModalDecision] = useState<ExecutiveDecision | null>(null);
  const [actionFeedbackMsg, setActionFeedbackMsg] = useState<string | null>(null);

  // Custom File Name
  const [customFileName, setCustomFileName] = useState<string | null>(null);

  // Switch Preset Scenario
  const handleSelectScenario = (key: string) => {
    setActiveScenarioKey(key);
    const scenario = PRESET_DECISION_SCENARIOS[key];
    if (scenario) {
      setScenarioDecisions(scenario.decisions);
      setBudgetPoolSAR(scenario.suggestedBudgetSAR);
      setTradeoffIdA(scenario.decisions[0]?.id || '');
      setTradeoffIdB(scenario.decisions[1]?.id || '');
    }
  };

  // Run dynamic knapsack optimizer on current decisions and budget
  const allocationResult: CapitalAllocationResult = useMemo(() => {
    return optimizeCapitalAllocation(scenarioDecisions, budgetPoolSAR);
  }, [scenarioDecisions, budgetPoolSAR]);

  // Handle Trade-off initial selection
  useMemo(() => {
    if (!tradeoffIdA && scenarioDecisions[0]) setTradeoffIdA(scenarioDecisions[0].id);
    if (!tradeoffIdB && scenarioDecisions[1]) setTradeoffIdB(scenarioDecisions[1].id);
  }, [scenarioDecisions, tradeoffIdA, tradeoffIdB]);

  // Compute Trade-off Comparison
  const tradeoffResult = useMemo(() => {
    const decA = scenarioDecisions.find((d) => d.id === tradeoffIdA) || scenarioDecisions[0];
    const decB = scenarioDecisions.find((d) => d.id === tradeoffIdB) || scenarioDecisions[1] || scenarioDecisions[0];
    if (!decA || !decB) return null;
    return compareDecisionTradeoffs(decA, decB);
  }, [scenarioDecisions, tradeoffIdA, tradeoffIdB]);

  // Decision Status Action (Approve / Reject)
  const handleUpdateStatus = (decisionId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setScenarioDecisions((prev) =>
      prev.map((d) => (d.id === decisionId ? { ...d, status: newStatus } : d))
    );

    if (activeModalDecision?.id === decisionId) {
      setActiveModalDecision((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    const msg =
      newStatus === 'APPROVED'
        ? isAr
          ? 'تم اعتماد القرار التنفيذي وتفويض المخصص المالي في محضر الحوكمة.'
          : 'Executive decision approved & capital disbursement delegated in governance log.'
        : isAr
        ? 'تم استبعاد المبادرة وتجميد المخصص المالي لصالح أولويات أعلى.'
        : 'Initiative rejected & capital allocated to higher-priority backlog.';

    setActionFeedbackMsg(msg);
    setTimeout(() => setActionFeedbackMsg(null), 3500);
  };

  // Custom CSV Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseDecisionsCsv(text);
      if (parsed.length > 0) {
        setActiveScenarioKey('custom');
        setScenarioDecisions(parsed);
        const totalCapex = parsed.reduce((sum, d) => sum + d.capexRequiredSAR, 0);
        setBudgetPoolSAR(Math.round(totalCapex * 0.6));
        setTradeoffIdA(parsed[0]?.id || '');
        setTradeoffIdB(parsed[1]?.id || '');
      } else {
        alert(
          isAr
            ? 'لم نتمكن من قراءة أسطر المبادرات. يرجى التأكد من وجود أعمدة (الكود، العنوان، التكلفة، العائد).'
            : 'Could not parse decision initiatives. Ensure CSV contains Code, Title, Capex, Return.'
        );
      }
    };
    reader.readAsText(file);
  };

  // Sample CSV generator for download
  const handleDownloadSampleCsv = () => {
    const csvContent =
      'Code,Title,Capex,Return,Months,Department,Owner,Risk\n' +
      'DEC-901,أتمتة مستودعات الرياض المركزية,2500000,4200000,8,اللوجستيات,م. سعود العتيبي,LOW\n' +
      'DEC-902,تسوية فواتير الموردين المبكرة بخصم 5%,3000000,3450000,2,المالية,أ. نورة القحطاني,LOW\n' +
      'DEC-903,إغلاق منافذ التوزيع ذات العائد السلبي,400000,1600000,4,التطوير,أ. فيصل الدوسري,MEDIUM\n' +
      'DEC-904,تثبيت عقود الطاقة والوقود السنوية,800000,1900000,6,المخاطر,د. خالد الشمري,LOW\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Sample_Executive_Decision_Portfolio.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Board Resolution as CSV
  const handleExportResolutionCsv = () => {
    let csv = 'Code,Title,Category,CapexSAR,ExpectedPaybackSAR,NetGainSAR,ROIPct,EfficiencyScore,DoAAuthority,Status,Owner\n';
    scenarioDecisions.forEach((d) => {
      csv += `"${d.code}","${d.titleAr}","${d.category}",${d.capexRequiredSAR},${d.expectedPaybackSAR},${d.netGainSAR},${d.roiPct},${d.capitalEfficiencyScore},"${d.doaAuthority}","${d.status}","${d.assignedOwner}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Executive_Board_Resolution_Portfolio_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered decisions list
  const filteredDecisions = useMemo(() => {
    return scenarioDecisions.filter((d) => {
      const matchCat = filterCategory === 'all' || d.category === filterCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        d.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.assignedOwner.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [scenarioDecisions, filterCategory, searchQuery]);

  return (
    <div
      className="executive-workbench-card"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-elevated)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0'
      }}
    >
      <SandboxNotice locale={locale} variant={isEmbeddedInPublicPage ? 'public' : 'app'} />

      {/* Workbench Header & Scenario Bar */}
      <div
        style={{
          background: 'var(--bg-surface-elevated)',
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#38BDF8', boxShadow: '0 0 10px #38BDF8' }} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#38BDF8', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
              EXECUTIVE DECISION MESH // CAPITAL_ALLOCATOR_V2.4
            </span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
            {isAr ? 'محطة توجيه رأس المال وصياغة القرارات التنفيذية' : 'Capital Allocation Mesh & Executive Directives'}
          </h2>
        </div>

        {/* Preset Scenarios Selector Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
            {isAr ? 'السيناريو:' : 'Scenario:'}
          </span>

          {Object.entries(PRESET_DECISION_SCENARIOS).map(([key, s]) => {
            const isSelected = activeScenarioKey === key;
            return (
              <button
                key={key}
                onClick={() => handleSelectScenario(key)}
                className={`ctrl-btn ${isSelected ? 'active' : ''}`}
                style={{
                  fontSize: '12px',
                  padding: '6px 14px',
                  borderColor: isSelected ? '#38BDF8' : undefined,
                  background: isSelected ? 'rgba(56, 189, 248, 0.15)' : undefined,
                  color: isSelected ? '#38BDF8' : undefined
                }}
              >
                {isAr ? s.industryAr.split(' ')[0] : s.nameEn.split(' ')[0]}
              </button>
            );
          })}

          {/* Custom File Upload Button */}
          <label
            style={{
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              borderRadius: 'var(--radius-sm)',
              border: activeScenarioKey === 'custom' ? '1px solid #38BDF8' : '1px dashed var(--border-default)',
              background: activeScenarioKey === 'custom' ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-surface)',
              color: activeScenarioKey === 'custom' ? '#38BDF8' : 'var(--text-secondary)'
            }}
          >
            <span>📁 {customFileName ? (isAr ? 'ملف مخصص' : 'Custom') : (isAr ? 'رفع محفظة CSV' : 'Upload CSV')}</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          <button
            onClick={handleDownloadSampleCsv}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              fontSize: '11px',
              textDecoration: 'underline'
            }}
            title={isAr ? 'تحميل ملف CSV تجريبي' : 'Download Sample CSV'}
          >
            {isAr ? 'نموذج' : 'Sample'}
          </button>
        </div>
      </div>

      {/* ── Interactive Capital Budget Slider ─────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {isAr ? 'مخصص السيولة الرأسمالية المتاحة للقرارات (Capital Pool)' : 'AVAILABLE CAPITAL ALLOCATION POOL'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {isAr
                ? 'حرك مؤشر الميزانية لاختبار خوارزمية الحقيبة المثلى (Knapsack Algorithm) في انتقاء المبادرات الأعلى عائداً'
                : 'Adjust slider to trigger dynamic knapsack optimization for maximum risk-weighted capital return'}
            </div>
          </div>

          <div style={{ textAlign: isAr ? 'left' : 'right' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#38BDF8' }}>
              {budgetPoolSAR.toLocaleString(isAr ? 'ar-SA' : 'en-US')}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginInlineStart: '6px' }}>SAR</span>
          </div>
        </div>

        {/* Range Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>1,000,000</span>
          <input
            type="range"
            min="1000000"
            max="25000000"
            step="250000"
            value={budgetPoolSAR}
            onChange={(e) => setBudgetPoolSAR(Number(e.target.value))}
            style={{
              flex: 1,
              accentColor: '#38BDF8',
              height: '6px',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          />
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>25,000,000</span>
        </div>

        {/* Live Mathematical Telemetry Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginTop: '6px'
          }}
        >
          <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
            <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', fontWeight: 700 }}>
              {isAr ? 'السيولة المخصصة المعتمدة' : 'ALLOCATED CAPEX'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '2px' }}>
              {allocationResult.allocatedCapexSAR.toLocaleString(isAr ? 'ar-SA' : 'en-US')} SAR
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
              {allocationResult.allocatedDecisions.length} {isAr ? 'مبادرات ضمن الميزانية' : 'Funded Initiatives'}
            </div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
            <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', fontWeight: 700 }}>
              {isAr ? 'صافي القيمة المضافة المحققة' : 'NET VALUE CREATION'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--status-success)', marginTop: '2px' }}>
              +{allocationResult.netValueCreationSAR.toLocaleString(isAr ? 'ar-SA' : 'en-US')} SAR
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
              {isAr ? 'عائد المحفظة المركب:' : 'Portfolio Blended ROI:'} <strong>{allocationResult.portfolioRoiPct}%</strong>
            </div>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
            <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', fontWeight: 700 }}>
              {isAr ? 'السيولة النقدية المتبقية' : 'UNALLOCATED SURPLUS'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#f59e0b', marginTop: '2px' }}>
              {allocationResult.remainingBudgetSAR.toLocaleString(isAr ? 'ar-SA' : 'en-US')} SAR
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
              {allocationResult.unallocatedDecisions.length} {isAr ? 'مبادرات في قائمة الانتظار' : 'Pending in Backlog'}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
            <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', fontWeight: 700 }}>
              {isAr ? 'مؤشر كفاءة رأس المال' : 'CAPITAL EFFICIENCY INDEX'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#38BDF8', marginTop: '2px' }}>
              {allocationResult.efficiencyIndex} / 100
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
              {isAr ? 'مقياس المفاضلة الاستراتيجية' : 'Weighted Decision Metric'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Operating View Tabs ────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '12px 24px 0 24px',
          background: 'var(--bg-surface-subtle)',
          overflowX: 'auto'
        }}
      >
        <button
          onClick={() => setActiveTab('queue')}
          className={`ctrl-btn ${activeTab === 'queue' ? 'active' : ''}`}
          style={{
            fontWeight: activeTab === 'queue' ? 800 : 500,
            color: activeTab === 'queue' ? '#38BDF8' : undefined,
            borderColor: activeTab === 'queue' ? '#38BDF8' : undefined
          }}
        >
          {isAr ? `⚡ طابور القرارات التنفيذية (${scenarioDecisions.length})` : `⚡ Executive Queue (${scenarioDecisions.length})`}
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`ctrl-btn ${activeTab === 'matrix' ? 'active' : ''}`}
          style={{
            fontWeight: activeTab === 'matrix' ? 800 : 500,
            color: activeTab === 'matrix' ? '#38BDF8' : undefined,
            borderColor: activeTab === 'matrix' ? '#38BDF8' : undefined
          }}
        >
          {isAr ? '🎯 مصفوفة المفاضلة وتصنيف الأثر' : '🎯 Strategic Impact Matrix'}
        </button>

        <button
          onClick={() => setActiveTab('tradeoff')}
          className={`ctrl-btn ${activeTab === 'tradeoff' ? 'active' : ''}`}
          style={{
            fontWeight: activeTab === 'tradeoff' ? 800 : 500,
            color: activeTab === 'tradeoff' ? '#38BDF8' : undefined,
            borderColor: activeTab === 'tradeoff' ? '#38BDF8' : undefined
          }}
        >
          {isAr ? '⚖️ محاكي المفاضلات وتكلفة الفرصة البديلة' : '⚖️ Trade-off & Opportunity Cost Simulator'}
        </button>

        <button
          onClick={() => setActiveTab('memo')}
          className={`ctrl-btn ${activeTab === 'memo' ? 'active' : ''}`}
          style={{
            fontWeight: activeTab === 'memo' ? 800 : 500,
            color: activeTab === 'memo' ? '#38BDF8' : undefined,
            borderColor: activeTab === 'memo' ? '#38BDF8' : undefined
          }}
        >
          {isAr ? '📜 محضر تفويض مجلس الإدارة الرسمي' : '📜 Board Resolution Decree'}
        </button>
      </div>

      {/* Action Notification Banner */}
      {actionFeedbackMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', borderBottom: '1px solid var(--status-success)', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--status-success)', fontWeight: 700 }}>
          <IconCheckCircle size={16} />
          <span>{actionFeedbackMsg}</span>
        </div>
      )}

      {/* ── TAB 1: EXECUTIVE DECISION QUEUE ───────────────────────────────────── */}
      {activeTab === 'queue' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Controls Bar: Search & Category Filter */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{isAr ? 'التصنيف:' : 'Category:'}</span>
              <button
                onClick={() => setFilterCategory('all')}
                className={`ctrl-btn ${filterCategory === 'all' ? 'active' : ''}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {isAr ? 'الكل' : 'All'}
              </button>
              <button
                onClick={() => setFilterCategory('CAPITAL_ALLOCATION')}
                className={`ctrl-btn ${filterCategory === 'CAPITAL_ALLOCATION' ? 'active' : ''}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {isAr ? 'رأس المال' : 'Capex'}
              </button>
              <button
                onClick={() => setFilterCategory('OPEX_OPTIMIZATION')}
                className={`ctrl-btn ${filterCategory === 'OPEX_OPTIMIZATION' ? 'active' : ''}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {isAr ? 'المصاريف التشغيلية' : 'Opex'}
              </button>
              <button
                onClick={() => setFilterCategory('CONTRACT_RENEGOTIATION')}
                className={`ctrl-btn ${filterCategory === 'CONTRACT_RENEGOTIATION' ? 'active' : ''}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {isAr ? 'إعادة التفاوض' : 'Contracts'}
              </button>
              <button
                onClick={() => setFilterCategory('RISK_MITIGATION')}
                className={`ctrl-btn ${filterCategory === 'RISK_MITIGATION' ? 'active' : ''}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {isAr ? 'التحوط والمخاطر' : 'Risk'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="text"
                placeholder={isAr ? 'بحث بالرمز، العنوان، أو المسؤول...' : 'Search code, title, owner...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  width: '240px'
                }}
              />
              <button onClick={handleExportResolutionCsv} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                <IconDownload size={13} />
                <span>{isAr ? 'تصدير CSV' : 'Export'}</span>
              </button>
            </div>
          </div>

          {/* Decision Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {filteredDecisions.map((decision) => {
              const isAllocated = allocationResult.allocatedDecisions.some((d) => d.id === decision.id);
              return (
                <div
                  key={decision.id}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: isAllocated ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: isAllocated ? '0 0 20px rgba(56, 189, 248, 0.1)' : undefined
                  }}
                >
                  {/* Top Badge Strip */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          color: '#38BDF8',
                          background: 'rgba(56, 189, 248, 0.12)',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        {decision.code}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: decision.doaAuthority === 'BOARD' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: decision.doaAuthority === 'BOARD' ? '#ef4444' : 'var(--status-success)'
                        }}
                      >
                        DoA: {decision.doaAuthority}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isAllocated ? (
                        <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--status-success)', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                          ✓ {isAr ? 'ضمن الميزانية' : 'FUNDED'}
                        </span>
                      ) : (
                        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-tertiary)', background: 'var(--bg-surface-subtle)', padding: '2px 8px', borderRadius: '4px' }}>
                          ⏳ {isAr ? 'تنتظر مخصصاً' : 'BACKLOG'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
                    {isAr ? decision.titleAr : decision.titleEn}
                  </h3>

                  {/* Financial Metrics Strip */}
                  <div
                    style={{
                      background: 'var(--bg-surface)',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{isAr ? 'الاستثمار المطلوب' : 'CAPEX REQUIRED'}</div>
                      <div style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                        {decision.capexRequiredSAR.toLocaleString(isAr ? 'ar-SA' : 'en-US')} SAR
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{isAr ? 'صافي القيمة المضافة' : 'NET VALUE ADD'}</div>
                      <div style={{ fontSize: '13px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--status-success)' }}>
                        +{decision.netGainSAR.toLocaleString(isAr ? 'ar-SA' : 'en-US')} SAR
                      </div>
                    </div>
                  </div>

                  {/* ROI & Speed Meta */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    <span>
                      {isAr ? 'العائد:' : 'ROI:'} <strong style={{ color: '#38BDF8' }}>{decision.roiPct}%</strong>
                    </span>
                    <span>
                      {isAr ? 'فترة الاسترداد:' : 'Payback:'} <strong style={{ color: 'var(--text-primary)' }}>{decision.paybackPeriodMonths} {isAr ? 'أشهر' : 'mo'}</strong>
                    </span>
                    <span>
                      {isAr ? 'كفاءة:' : 'Score:'} <strong style={{ color: 'var(--status-success)' }}>{decision.capitalEfficiencyScore}/100</strong>
                    </span>
                  </div>

                  {/* Opportunity Cost Note */}
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', background: 'rgba(239, 68, 68, 0.04)', padding: '6px 10px', borderRadius: '4px', borderLeft: isAr ? undefined : '2px solid #ef4444', borderRight: isAr ? '2px solid #ef4444' : undefined }}>
                    <strong>{isAr ? 'تكلفة التردد:' : 'Inaction Cost:'}</strong> {isAr ? decision.opportunityCostAr : decision.opportunityCostEn}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                    <button
                      onClick={() => setActiveModalDecision(decision)}
                      className="btn-secondary"
                      style={{ flex: 1, padding: '7px 10px', fontSize: '11.5px', justifyContent: 'center' }}
                    >
                      <span>{isAr ? 'فحص الأدلة' : 'Inspect'}</span>
                    </button>

                    {decision.status !== 'APPROVED' ? (
                      <button
                        onClick={() => handleUpdateStatus(decision.id, 'APPROVED')}
                        className="btn-primary"
                        style={{ flex: 1, padding: '7px 10px', fontSize: '11.5px', justifyContent: 'center', background: '#38BDF8', borderColor: '#0284C7', color: '#0F172A' }}
                      >
                        <span>✓ {isAr ? 'اعتماد المبادرة' : 'Approve'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(decision.id, 'REJECTED')}
                        className="btn-secondary"
                        style={{ flex: 1, padding: '7px 10px', fontSize: '11.5px', justifyContent: 'center', color: '#ef4444' }}
                      >
                        <span>{isAr ? 'إلغاء الاعتماد' : 'Revoke'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: STRATEGIC EFFICIENCY MATRIX ─────────────────────────────────── */}
      {activeTab === 'matrix' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {isAr ? 'مصفوفة أولويات توجيه رأس المال (2x2 Strategic Quadrant)' : 'Strategic Capital Efficiency Quadrants'}
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              {isAr
                ? 'تصنيف حتمي لمبادرات القرار بناءً على العائد المالي الصافي ومخاطر التنفيذ لتوجيه الميزانية نحو المكاسب السريعة والرهانات الاستراتيجية.'
                : 'Deterministic classification sorting decisions by net cash generation and risk exposure to direct funding.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Quadrant 1: High ROI / Low Risk -> QUICK WINS */}
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--status-success)', textTransform: 'uppercase' }}>
                  🚀 {isAr ? 'مكاسب سريعة مؤكدة (Quick Wins)' : 'Guaranteed Quick Wins'}
                </span>
                <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--status-success)', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                  HIGH ROI // LOW RISK
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {scenarioDecisions
                  .filter((d) => d.riskLevel === 'LOW' && d.roiPct >= 60)
                  .map((d) => (
                    <div key={d.id} onClick={() => setActiveModalDecision(d)} style={{ background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#38BDF8' }}>{d.code}</span>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--status-success)', fontFamily: 'var(--font-mono)' }}>+{d.netGainSAR.toLocaleString()} SAR</span>
                      </div>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{isAr ? d.titleAr : d.titleEn}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quadrant 2: High ROI / Medium-High Risk -> STRATEGIC BETS */}
            <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase' }}>
                  💎 {isAr ? 'رهانات استراتيجية كبرى (Strategic Bets)' : 'High-Value Strategic Bets'}
                </span>
                <span style={{ fontSize: '10px', background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                  HIGH ROI // ELEVATED RISK
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {scenarioDecisions
                  .filter((d) => d.riskLevel !== 'LOW' && d.roiPct >= 50)
                  .map((d) => (
                    <div key={d.id} onClick={() => setActiveModalDecision(d)} style={{ background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#38BDF8' }}>{d.code}</span>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>+{d.netGainSAR.toLocaleString()} SAR</span>
                      </div>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{isAr ? d.titleAr : d.titleEn}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quadrant 3: Moderate ROI / Low Risk -> CAPITAL PRESERVATION */}
            <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase' }}>
                  🛡️ {isAr ? 'حماية السيولة وتثبيت التكاليف (Preservation)' : 'Capital Preservation'}
                </span>
                <span style={{ fontSize: '10px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                  MODERATE ROI // LOW RISK
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {scenarioDecisions
                  .filter((d) => d.riskLevel === 'LOW' && d.roiPct < 60)
                  .map((d) => (
                    <div key={d.id} onClick={() => setActiveModalDecision(d)} style={{ background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#38BDF8' }}>{d.code}</span>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>+{d.netGainSAR.toLocaleString()} SAR</span>
                      </div>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{isAr ? d.titleAr : d.titleEn}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quadrant 4: De-prioritized Backlog */}
            <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                  ⏸️ {isAr ? 'تأجيل أو إعادة جدولة (De-prioritized)' : 'De-prioritized Queue'}
                </span>
                <span style={{ fontSize: '10px', background: 'var(--bg-surface)', color: 'var(--text-tertiary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                  DEFERRED
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {scenarioDecisions
                  .filter((d) => d.riskLevel === 'HIGH' && d.roiPct < 60)
                  .map((d) => (
                    <div key={d.id} onClick={() => setActiveModalDecision(d)} style={{ background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--text-tertiary)' }}>{d.code}</span>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>+{d.netGainSAR.toLocaleString()} SAR</span>
                      </div>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '2px' }}>{isAr ? d.titleAr : d.titleEn}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: COMPARATIVE TRADE-OFF SIMULATOR ───────────────────────────── */}
      {activeTab === 'tradeoff' && tradeoffResult && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {isAr ? 'محاكي المفاضلة وتكلفة الفرصة البديلة (Trade-off Matrix)' : 'Trade-off & Opportunity Cost Engine'}
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              {isAr
                ? 'قارن بين قرارين تنفيذيين متنافسين على السيولة لفهم الفارق الدقيق في العائد المالي، سرعة استرداد النقد، والمخاطرة التشغيلية.'
                : 'Compare two competing capex moves to isolate differential IRR, payback velocity, and capital opportunity cost.'}
            </p>
          </div>

          {/* Selectors Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#38BDF8', display: 'block', marginBottom: '6px' }}>
                {isAr ? 'الخيار (أ):' : 'OPTION (A):'}
              </label>
              <select
                value={tradeoffIdA}
                onChange={(e) => setTradeoffIdA(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', fontSize: '12.5px' }}
              >
                {scenarioDecisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    [{d.code}] {isAr ? d.titleAr : d.titleEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b', display: 'block', marginBottom: '6px' }}>
                {isAr ? 'الخيار (ب):' : 'OPTION (B):'}
              </label>
              <select
                value={tradeoffIdB}
                onChange={(e) => setTradeoffIdB(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', fontSize: '12.5px' }}
              >
                {scenarioDecisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    [{d.code}] {isAr ? d.titleAr : d.titleEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Side-by-Side Comparative Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Card A */}
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '18px', borderRadius: 'var(--radius-md)', border: tradeoffResult.recommendedChoice === 'A' ? '2px solid #38BDF8' : '1px solid var(--border-subtle)', position: 'relative' }}>
              {tradeoffResult.recommendedChoice === 'A' && (
                <div style={{ position: 'absolute', top: '-10px', right: isAr ? '16px' : undefined, left: isAr ? undefined : '16px', background: '#38BDF8', color: '#0F172A', padding: '2px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 900 }}>
                  ★ {isAr ? 'التوصية الحسابية الأفضل' : 'ALGORITHMIC WINNER'}
                </div>
              )}
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>{tradeoffResult.decisionA.code}</div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 12px 0' }}>{isAr ? tradeoffResult.decisionA.titleAr : tradeoffResult.decisionA.titleEn}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>{isAr ? 'الاستثمار المطلوب:' : 'Capex:'}</span>
                  <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{tradeoffResult.decisionA.capexRequiredSAR.toLocaleString()} SAR</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>{isAr ? 'صافي القيمة المضافة:' : 'Net Value:'}</span>
                  <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--status-success)' }}>+{tradeoffResult.decisionA.netGainSAR.toLocaleString()} SAR</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>{isAr ? 'العائد الاستثماري (ROI):' : 'ROI:'}</span>
                  <span style={{ fontWeight: 800, color: '#38BDF8' }}>{tradeoffResult.decisionA.roiPct}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>{isAr ? 'زمن استرداد رأس المال:' : 'Payback:'}</span>
                  <span style={{ fontWeight: 800 }}>{tradeoffResult.decisionA.paybackPeriodMonths} {isAr ? 'أشهر' : 'months'}</span>
                </div>
              </div>
            </div>

            {/* Card B */}
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '18px', borderRadius: 'var(--radius-md)', border: tradeoffResult.recommendedChoice === 'B' ? '2px solid #f59e0b' : '1px solid var(--border-subtle)', position: 'relative' }}>
              {tradeoffResult.recommendedChoice === 'B' && (
                <div style={{ position: 'absolute', top: '-10px', right: isAr ? '16px' : undefined, left: isAr ? undefined : '16px', background: '#f59e0b', color: '#0F172A', padding: '2px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 900 }}>
                  ★ {isAr ? 'التوصية الحسابية الأفضل' : 'ALGORITHMIC WINNER'}
                </div>
              )}
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>{tradeoffResult.decisionB.code}</div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 12px 0' }}>{isAr ? tradeoffResult.decisionB.titleAr : tradeoffResult.decisionB.titleEn}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>{isAr ? 'الاستثمار المطلوب:' : 'Capex:'}</span>
                  <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{tradeoffResult.decisionB.capexRequiredSAR.toLocaleString()} SAR</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>{isAr ? 'صافي القيمة المضافة:' : 'Net Value:'}</span>
                  <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--status-success)' }}>+{tradeoffResult.decisionB.netGainSAR.toLocaleString()} SAR</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>{isAr ? 'العائد الاستثماري (ROI):' : 'ROI:'}</span>
                  <span style={{ fontWeight: 800, color: '#f59e0b' }}>{tradeoffResult.decisionB.roiPct}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>{isAr ? 'زمن استرداد رأس المال:' : 'Payback:'}</span>
                  <span style={{ fontWeight: 800 }}>{tradeoffResult.decisionB.paybackPeriodMonths} {isAr ? 'أشهر' : 'months'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trade-off Synthesis Banner */}
          <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', marginBottom: '4px' }}>
              {isAr ? 'خلاصة المفاضلة الحتمية وتوصية المحرك' : 'DETERMINISTIC TRADEOFF DIRECTIVE'}
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {isAr ? tradeoffResult.comparativeRationaleAr : tradeoffResult.comparativeRationaleEn}
            </p>
          </div>
        </div>
      )}

      {/* ── TAB 4: BOARD RESOLUTION DECREE ───────────────────────────────────── */}
      {activeTab === 'memo' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Printable Decree Paper Card */}
          <div
            style={{
              background: '#0B1120',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-md)',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
            }}
          >
            {/* Header with Emblems */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#38BDF8', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                  KINGDOM OF SAUDI ARABIA // CORPORATE GOVERNANCE REGISTRY
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', margin: '6px 0 2px 0' }}>
                  {isAr ? 'محضر قرارات مجلس الإدارة التنفيذي لتوجيه رأس المال' : 'Executive Board Resolution: Capital Allocation Directives'}
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  {isAr ? 'رقم القيد المركزي:' : 'Resolution Ref:'} <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>BR-2026-EDM-{Date.now().toString().slice(-6)}</strong>
                </div>
              </div>

              <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                <span style={{ fontSize: '11px', color: 'var(--status-success)', border: '1px solid var(--status-success)', padding: '4px 10px', borderRadius: '4px', fontWeight: 800 }}>
                  {isAr ? 'معتمد رسمياً' : 'CERTIFIED'}
                </span>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                  {new Date().toISOString().split('T')[0]}
                </div>
              </div>
            </div>

            {/* Statutory Introduction */}
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
              {isAr
                ? `استناداً إلى أحكام المادة (76) من نظام الشركات السعودي ولائحة تفويض الصلاحيات المالية (DoA) المعتمدة، وبناءً على مخرجات التحليل الرياضي لشبكة القرارات التنفيذية MIKHLAFI LABS، تقرر تخصيص ميزانية رأسمالية قدرها (${budgetPoolSAR.toLocaleString('ar-SA')} ر.س) لتنفيذ المبادرات ذات الجدوى الاقتصادية المؤكدة على النحو التالي:`
                : `Pursuant to Article (76) of the Saudi Companies Law and approved Delegation of Authority (DoA) matrices, evaluated through the MIKHLAFI LABS Executive Decision Mesh, the Board certifies capital allocation of (${budgetPoolSAR.toLocaleString('en-US')} SAR) as follows:`}
            </p>

            {/* Approved Portfolio Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-default)', textAlign: isAr ? 'right' : 'left' }}>
                    <th style={{ padding: '10px' }}>{isAr ? 'رمز القرار' : 'Code'}</th>
                    <th style={{ padding: '10px' }}>{isAr ? 'المبادرة الاستراتيجية' : 'Initiative Title'}</th>
                    <th style={{ padding: '10px' }}>{isAr ? 'الاستثمار المعتمد' : 'Allocated Capex'}</th>
                    <th style={{ padding: '10px' }}>{isAr ? 'صافي القيمة' : 'Net Value'}</th>
                    <th style={{ padding: '10px' }}>{isAr ? 'المسؤول المكلف' : 'Assigned Executive'}</th>
                    <th style={{ padding: '10px' }}>{isAr ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {allocationResult.allocatedDecisions.map((d) => (
                    <tr key={d.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#38BDF8' }}>{d.code}</td>
                      <td style={{ padding: '10px', fontWeight: 700, color: 'var(--text-primary)' }}>{isAr ? d.titleAr : d.titleEn}</td>
                      <td style={{ padding: '10px', fontFamily: 'var(--font-mono)' }}>{d.capexRequiredSAR.toLocaleString()} SAR</td>
                      <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: 'var(--status-success)', fontWeight: 800 }}>+{d.netGainSAR.toLocaleString()} SAR</td>
                      <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{d.assignedOwner}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--status-success)', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                          ✓ {isAr ? 'معتمد' : 'APPROVED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signature & Cryptographic Seal Footer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '16px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                  {isAr ? 'الختم الرقمي والتوقيع المشفر:' : 'Cryptographic Execution Seal:'}
                </div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#38BDF8', marginTop: '4px' }}>
                  SHA256-{allocationResult.allocatedDecisions.map((d) => d.code).join('-')}-CONFIRMED
                </div>
              </div>

              <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{isAr ? 'رئيس مجلس الإدارة التنفيذي:' : 'Executive Chairman Approval:'}</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {isAr ? 'د. مصلح المخلافي — الشريك المدير' : 'Dr. Mosleh Almikhlafi — Managing Partner'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={() => window.print()} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }}>
              <span>🖨️ {isAr ? 'طباعة المحضر الرسمي' : 'Print Decree'}</span>
            </button>
            <button onClick={handleExportResolutionCsv} className="btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>
              <IconDownload size={14} />
              <span>{isAr ? 'تصدير جدول التخصيص CSV' : 'Export Allocation CSV'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── DETAIL MODAL: DECISION INSPECTION ─────────────────────────────────── */}
      {activeModalDecision && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setActiveModalDecision(null)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(56, 189, 248, 0.2)',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38BDF8'
                  }}
                >
                  {activeModalDecision.code}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)' }}>
                  DoA // {activeModalDecision.doaAuthority}
                </span>
              </div>

              <button
                onClick={() => setActiveModalDecision(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {isAr ? activeModalDecision.titleAr : activeModalDecision.titleEn}
                </h3>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {isAr ? 'المسؤول المكلف:' : 'Assigned Executive:'} <strong style={{ color: 'var(--text-primary)' }}>{activeModalDecision.assignedOwner}</strong> ({isAr ? activeModalDecision.departmentAr : activeModalDecision.departmentEn})
                </div>
              </div>

              {/* Rationale */}
              <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {isAr ? 'المبرر الاقتصادي والتشغيلي:' : 'Executive Economic Rationale:'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {isAr ? activeModalDecision.executiveRationaleAr : activeModalDecision.executiveRationaleEn}
                </div>
              </div>

              {/* Financial Box */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div style={{ background: 'var(--bg-surface-subtle)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 800 }}>CAPEX</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {activeModalDecision.capexRequiredSAR.toLocaleString()} SAR
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-subtle)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 800 }}>NET PAYBACK</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--status-success)', marginTop: '2px' }}>
                    +{activeModalDecision.netGainSAR.toLocaleString()} SAR
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-subtle)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 800 }}>ROI // TIME</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#38BDF8', marginTop: '2px' }}>
                    {activeModalDecision.roiPct}% / {activeModalDecision.paybackPeriodMonths}mo
                  </div>
                </div>
              </div>

              {/* Opportunity Cost */}
              <div style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {isAr ? 'تكلفة التردد وتفويت الفرصة البديلة (Opportunity Cost):' : 'Opportunity Cost of Inaction:'}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {isAr ? activeModalDecision.opportunityCostAr : activeModalDecision.opportunityCostEn}
                </div>
              </div>

              {/* Legal & Governance Framework */}
              <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                GOVERNANCE: {activeModalDecision.statutoryFramework}
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                {activeModalDecision.status !== 'APPROVED' ? (
                  <button
                    onClick={() => handleUpdateStatus(activeModalDecision.id, 'APPROVED')}
                    className="btn-primary"
                    style={{ flex: 1, padding: '10px', fontSize: '13px', background: '#38BDF8', borderColor: '#0284C7', color: '#0F172A', justifyContent: 'center' }}
                  >
                    <span>✓ {isAr ? 'اعتماد المبادرة وتفويض الصرف' : 'Approve & Execute'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(activeModalDecision.id, 'REJECTED')}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '10px', fontSize: '13px', justifyContent: 'center', color: '#ef4444' }}
                  >
                    <span>{isAr ? 'إلغاء الاعتماد' : 'Revoke Approval'}</span>
                  </button>
                )}

                {onRequestAssistance && (
                  <button
                    onClick={() => {
                      onRequestAssistance(`${activeModalDecision.code} - ${activeModalDecision.titleAr}`);
                      setActiveModalDecision(null);
                    }}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '10px', fontSize: '13px', justifyContent: 'center' }}
                  >
                    <span>{isAr ? 'طلب دراسة معمقة' : 'Request Advisory'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
