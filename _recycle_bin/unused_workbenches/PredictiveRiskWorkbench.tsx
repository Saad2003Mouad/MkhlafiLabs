// MIKHLAFI LABS — Enterprise Predictive Risk Intelligence & Early Warning Workbench (Service 03)
// Interactive 13-week rolling cash runway simulator, macroeconomic stress-testing slider,
// 5x5 enterprise likelihood-impact heatmap, and board-ready ISO 31000 risk prevention dossiers.

import React, { useState, useMemo } from 'react';
import { LocaleMode } from '../../types';
import {
  RiskSignal,
  PRESET_RISK_SCENARIOS,
  calculatePortfolioRiskMetrics,
  simulate13WeekCashRunway,
  parseRiskLedgerCsv
} from '../../services/risk/predictiveRiskEngine';
import {
  IconCheckCircle,
  IconDownload,
  IconX
} from '../Icons';
import { SandboxNotice } from '../common/SandboxNotice';

interface PredictiveRiskWorkbenchProps {
  locale: LocaleMode;
  initialScenario?: string;
  isEmbeddedInPublicPage?: boolean;
  onRequestAssistance?: (threatDetails: string) => void;
}

export const PredictiveRiskWorkbench: React.FC<PredictiveRiskWorkbenchProps> = ({
  locale,
  initialScenario = 'contracting',
  isEmbeddedInPublicPage = false,
  onRequestAssistance
}) => {
  const isAr = locale === 'ar';

  // Scenario State
  const [activeScenarioKey, setActiveScenarioKey] = useState<string>(initialScenario);
  const [signals, setSignals] = useState<RiskSignal[]>(() => {
    return PRESET_RISK_SCENARIOS[initialScenario]?.signals || PRESET_RISK_SCENARIOS.contracting.signals;
  });

  const scenarioMeta = PRESET_RISK_SCENARIOS[activeScenarioKey] || PRESET_RISK_SCENARIOS.contracting;

  // Stress-Testing Slider State (0% to 50%)
  const [stressLevelPct, setStressLevelPct] = useState<number>(15);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'radar' | 'runway' | 'heatmap' | 'dossier'>('radar');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [activeModalThreat, setActiveModalThreat] = useState<RiskSignal | null>(null);
  const [actionFeedbackMsg, setActionFeedbackMsg] = useState<string | null>(null);

  // Custom File Name
  const [customFileName, setCustomFileName] = useState<string | null>(null);

  // Switch Scenario
  const handleSelectScenario = (key: string) => {
    setActiveScenarioKey(key);
    const s = PRESET_RISK_SCENARIOS[key];
    if (s) {
      setSignals(s.signals);
    }
  };

  // Stress-testing multiplier
  const stressMultiplier = 1.0 + stressLevelPct / 100;

  // Portfolio Risk Metrics (Dynamically updated with stress level)
  const portfolioMetrics = useMemo(() => {
    return calculatePortfolioRiskMetrics(signals, stressMultiplier);
  }, [signals, stressMultiplier]);

  // 13-Week Cash Runway Simulation Data
  const runwayPoints = useMemo(() => {
    return simulate13WeekCashRunway(
      scenarioMeta.initialCashReserveSAR,
      scenarioMeta.minimumSafetyBufferSAR,
      signals,
      stressLevelPct
    );
  }, [scenarioMeta, signals, stressLevelPct]);

  // Toggle Mitigation for a Risk Signal
  const handleToggleMitigation = (riskId: string) => {
    setSignals((prev) =>
      prev.map((s) => {
        if (s.id === riskId) {
          const nextMitigated = !s.isMitigated;
          const msg = nextMitigated
            ? isAr
              ? `تم تفعيل خطة التحوط للمخاطر (${s.code}) وحماية ${s.potentialLossSAR.toLocaleString('ar-SA')} ر.س.`
              : `Mitigation activated for ${s.code}, shielding ${s.potentialLossSAR.toLocaleString('en-US')} SAR.`
            : isAr
            ? `تمت إعادة مؤشر المخاطر (${s.code}) لحالة الإنذار النشطة.`
            : `Risk signal ${s.code} reset to active threat monitoring.`;

          setActionFeedbackMsg(msg);
          setTimeout(() => setActionFeedbackMsg(null), 3500);

          return { ...s, isMitigated: nextMitigated };
        }
        return s;
      })
    );

    if (activeModalThreat?.id === riskId) {
      setActiveModalThreat((prev) => (prev ? { ...prev, isMitigated: !prev.isMitigated } : null));
    }
  };

  // Custom Risk Register CSV Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseRiskLedgerCsv(text);
      if (parsed.length > 0) {
        setActiveScenarioKey('custom');
        setSignals(parsed);
      } else {
        alert(
          isAr
            ? 'لم نتمكن من قراءة أسطر سجل المخاطر. يرجى التأكد من وجود أعمدة (الكود، الخطر، الخسارة، الاحتمالية).'
            : 'Could not parse risk register rows. Ensure CSV contains Code, Title, Loss, Probability.'
        );
      }
    };
    reader.readAsText(file);
  };

  // Sample CSV generator for download
  const handleDownloadSampleCsv = () => {
    const csvContent =
      'Code,Title,Loss,Probability,Days,Category,Owner,MitigationCost\n' +
      'RSK-901,اختناق سيولة في الأسبوع السابع لتأخر اعتماد المستخلص,12500000,80,28,LIQUIDITY_RUNWAY,أ. حسام الغامدي,200000\n' +
      'RSK-902,احتكار توريد قطع الغيار الميكانيكية عبر مورد وحيد,6500000,65,40,SUPPLY_CHAIN_SINGLE_SOURCE,م. راشد القحطاني,150000\n' +
      'RSK-903,غرامات تأخير في تسليم المحطة الكهروميكانيكية,4200000,70,22,CONTRACTUAL_PENALTY,م. فهد التميمي,90000\n' +
      'RSK-904,اهتراء فلاتر التوربينة وتجاوز معايير الانبعاثات,5100000,55,18,REGULATORY_COMPLIANCE,د. مروان بكر,180000\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Sample_Risk_Register.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Risk Dossier as CSV
  const handleExportRiskCsv = () => {
    let csv = 'Code,Title,Category,Severity,ProbabilityPct,PotentialLossSAR,RiskExposureSAR,EarlyWarningHorizonDays,IsMitigated,Owner\n';
    signals.forEach((s) => {
      csv += `"${s.code}","${s.titleAr}","${s.category}","${s.severity}",${s.probabilityPct},${s.potentialLossSAR},${s.riskExposureSAR},${s.earlyWarningHorizonDays},${s.isMitigated},"${s.mitigationOwner}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Risk_Intelligence_Dossier_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered signals list
  const filteredSignals = useMemo(() => {
    return signals.filter((s) => {
      const matchSeverity = filterSeverity === 'all' || s.severity.toLowerCase() === filterSeverity.toLowerCase();
      const matchSearch =
        searchQuery.trim() === '' ||
        s.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.mitigationOwner.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSeverity && matchSearch;
    });
  }, [signals, filterSeverity, searchQuery]);

  return (
    <div
      className="predictive-risk-workbench-card"
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
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#F59E0B', boxShadow: '0 0 10px #F59E0B' }} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#F59E0B', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
              PREDICTIVE RISK RADAR // TELEMETRY_ONLINE
            </span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
            {isAr ? 'رادار التنبؤ بالمخاطر ومحاكي اختناقات السيولة' : 'Predictive Risk Intelligence & Early Warning Radar'}
          </h2>
        </div>

        {/* Preset Scenarios Selector Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
            {isAr ? 'القطاع:' : 'Industry:'}
          </span>

          {Object.entries(PRESET_RISK_SCENARIOS).map(([key, s]) => {
            const isSelected = activeScenarioKey === key;
            return (
              <button
                key={key}
                onClick={() => handleSelectScenario(key)}
                className={`ctrl-btn ${isSelected ? 'active' : ''}`}
                style={{
                  fontSize: '12px',
                  padding: '6px 14px',
                  borderColor: isSelected ? '#F59E0B' : undefined,
                  background: isSelected ? 'rgba(245, 158, 11, 0.15)' : undefined,
                  color: isSelected ? '#F59E0B' : undefined
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
              border: activeScenarioKey === 'custom' ? '1px solid #F59E0B' : '1px dashed var(--border-default)',
              background: activeScenarioKey === 'custom' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-surface)',
              color: activeScenarioKey === 'custom' ? '#F59E0B' : 'var(--text-secondary)'
            }}
          >
            <span>📁 {customFileName ? (isAr ? 'ملف مخصص' : 'Custom') : (isAr ? 'رفع سجل مخاطر CSV' : 'Upload CSV')}</span>
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
            title={isAr ? 'تحميل سجل مخاطر تجريبي' : 'Download Sample CSV'}
          >
            {isAr ? 'نموذج' : 'Sample'}
          </button>
        </div>
      </div>

      {/* ── Interactive Stress-Testing Slider ─────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(20, 15, 10, 0.95) 0%, rgba(30, 25, 15, 0.85) 100%)',
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
              {isAr ? 'محاكي الإجهاد التشغيلي وسيناريوهات الصدمات (Stress Test Level)' : 'OPERATIONAL STRESS-TESTING SCENARIO'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {isAr
                ? 'حرك مؤشر الإجهاد لاختبار صمود السيولة وسلاسل الإمداد عند حدوث صدمات في سلاسل التوريد أو تأخر التحصيل بنسبة تصل لـ 50%'
                : 'Adjust shock severity slider to stress-test cash buffers against delayed collections and supply shocks'}
            </div>
          </div>

          <div style={{ textAlign: isAr ? 'left' : 'right' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: stressLevelPct > 30 ? '#ef4444' : '#F59E0B' }}>
              +{stressLevelPct}%
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginInlineStart: '6px' }}>
              {isAr ? 'مستوى الإجهاد الإضافي' : 'Macroeconomic Drag'}
            </span>
          </div>
        </div>

        {/* Range Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>0% (عادي)</span>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={stressLevelPct}
            onChange={(e) => setStressLevelPct(Number(e.target.value))}
            style={{
              flex: 1,
              accentColor: stressLevelPct > 30 ? '#ef4444' : '#F59E0B',
              height: '6px',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          />
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>+50% (صدمة كبرى)</span>
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
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
            <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', fontWeight: 700 }}>
              {isAr ? 'صافي التعرض للمخاطر غير المعالجة' : 'UNMITIGATED EXPOSURE'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#ef4444', marginTop: '2px' }}>
              {portfolioMetrics.netUnmitigatedExposureSAR.toLocaleString(isAr ? 'ar-SA' : 'en-US')} SAR
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
              {portfolioMetrics.activeCriticalCount} {isAr ? 'تهديدات حرجة نشطة' : 'Active Critical Threats'}
            </div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
            <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', fontWeight: 700 }}>
              {isAr ? 'السيولة المحمية بخطط التحوط' : 'PROTECTED BY MITIGATION'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--status-success)', marginTop: '2px' }}>
              {portfolioMetrics.protectedExposureSAR.toLocaleString(isAr ? 'ar-SA' : 'en-US')} SAR
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
              {signals.filter((s) => s.isMitigated).length} {isAr ? 'تهديدات تم درؤها' : 'Threats Neutralized'}
            </div>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
            <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', fontWeight: 700 }}>
              {isAr ? 'متوسط مهلة الإنذار المبكر' : 'AVG EARLY WARNING HORIZON'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#F59E0B', marginTop: '2px' }}>
              {portfolioMetrics.averageWarningHorizonDays} {isAr ? 'يوماً' : 'Days'}
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
              {isAr ? 'مهلة كافية لتصحيح المسار' : 'Proactive Action Window'}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
            <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', fontWeight: 700 }}>
              {isAr ? 'مؤشر التهديد المركب' : 'COMPOSITE THREAT SCORE'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: portfolioMetrics.compositeThreatScore > 65 ? '#ef4444' : '#F59E0B', marginTop: '2px' }}>
              {portfolioMetrics.compositeThreatScore} / 100
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
              {isAr ? 'معدل الحرق اليومي:' : 'Daily Burn Rate:'} {portfolioMetrics.dailyRiskBurnRateSAR.toLocaleString()} SAR/d
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
          onClick={() => setActiveTab('radar')}
          className={`ctrl-btn ${activeTab === 'radar' ? 'active' : ''}`}
          style={{
            fontWeight: activeTab === 'radar' ? 800 : 500,
            color: activeTab === 'radar' ? '#F59E0B' : undefined,
            borderColor: activeTab === 'radar' ? '#F59E0B' : undefined
          }}
        >
          {isAr ? `📡 رادار التهديدات الحية (${signals.length})` : `📡 Active Threats (${signals.length})`}
        </button>

        <button
          onClick={() => setActiveTab('runway')}
          className={`ctrl-btn ${activeTab === 'runway' ? 'active' : ''}`}
          style={{
            fontWeight: activeTab === 'runway' ? 800 : 500,
            color: activeTab === 'runway' ? '#F59E0B' : undefined,
            borderColor: activeTab === 'runway' ? '#F59E0B' : undefined
          }}
        >
          {isAr ? '📉 محاكي السيولة لـ 13 أسبوعاً (Cash Runway)' : '📉 13-Week Cash Runway Simulation'}
        </button>

        <button
          onClick={() => setActiveTab('heatmap')}
          className={`ctrl-btn ${activeTab === 'heatmap' ? 'active' : ''}`}
          style={{
            fontWeight: activeTab === 'heatmap' ? 800 : 500,
            color: activeTab === 'heatmap' ? '#F59E0B' : undefined,
            borderColor: activeTab === 'heatmap' ? '#F59E0B' : undefined
          }}
        >
          {isAr ? '🎯 مصفوفة الاحتمالية والأثر (5x5 Heatmap)' : '🎯 5x5 Likelihood Heatmap'}
        </button>

        <button
          onClick={() => setActiveTab('dossier')}
          className={`ctrl-btn ${activeTab === 'dossier' ? 'active' : ''}`}
          style={{
            fontWeight: activeTab === 'dossier' ? 800 : 500,
            color: activeTab === 'dossier' ? '#F59E0B' : undefined,
            borderColor: activeTab === 'dossier' ? '#F59E0B' : undefined
          }}
        >
          {isAr ? '📜 مذكرة إدارة الأزمات والتحوط (ISO 31000)' : '📜 Crisis Prevention Dossier'}
        </button>
      </div>

      {/* Action Notification Banner */}
      {actionFeedbackMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', borderBottom: '1px solid var(--status-success)', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--status-success)', fontWeight: 700 }}>
          <IconCheckCircle size={16} />
          <span>{actionFeedbackMsg}</span>
        </div>
      )}

      {/* ── TAB 1: THREAT RADAR QUEUE ────────────────────────────────────────── */}
      {activeTab === 'radar' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Controls Bar: Search & Severity Filter */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{isAr ? 'مستوى الخطورة:' : 'Severity:'}</span>
              <button
                onClick={() => setFilterSeverity('all')}
                className={`ctrl-btn ${filterSeverity === 'all' ? 'active' : ''}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {isAr ? 'الكل' : 'All'}
              </button>
              <button
                onClick={() => setFilterSeverity('critical')}
                className={`ctrl-btn ${filterSeverity === 'critical' ? 'active' : ''}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {isAr ? 'حرجة للغاية' : 'Critical'}
              </button>
              <button
                onClick={() => setFilterSeverity('high')}
                className={`ctrl-btn ${filterSeverity === 'high' ? 'active' : ''}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {isAr ? 'عالية' : 'High'}
              </button>
              <button
                onClick={() => setFilterSeverity('medium')}
                className={`ctrl-btn ${filterSeverity === 'medium' ? 'active' : ''}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {isAr ? 'متوسطة' : 'Medium'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="text"
                placeholder={isAr ? 'بحث بالرمز، الخطر، أو المسؤول...' : 'Search code, threat, owner...'}
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
              <button onClick={handleExportRiskCsv} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                <IconDownload size={13} />
                <span>{isAr ? 'تصدير CSV' : 'Export'}</span>
              </button>
            </div>
          </div>

          {/* Threats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {filteredSignals.map((threat) => {
              const effectiveExposure = threat.potentialLossSAR * (Math.min(100, threat.probabilityPct * stressMultiplier) / 100);
              return (
                <div
                  key={threat.id}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: threat.isMitigated
                      ? '1px solid rgba(16, 185, 129, 0.4)'
                      : threat.severity === 'CRITICAL'
                      ? '1px solid rgba(239, 68, 68, 0.5)'
                      : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: !threat.isMitigated && threat.severity === 'CRITICAL' ? '0 0 25px rgba(239, 68, 68, 0.15)' : undefined
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
                          color: '#F59E0B',
                          background: 'rgba(245, 158, 11, 0.12)',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        {threat.code}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: threat.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: threat.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'
                        }}
                      >
                        {threat.severity}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                        ⏳ {threat.earlyWarningHorizonDays} {isAr ? 'يوماً' : 'd horizon'}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
                    {isAr ? threat.titleAr : threat.titleEn}
                  </h3>

                  {/* Exposure Strip */}
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
                      <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{isAr ? 'الخسارة المحتملة' : 'POTENTIAL LOSS'}</div>
                      <div style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                        {threat.potentialLossSAR.toLocaleString(isAr ? 'ar-SA' : 'en-US')} SAR
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{isAr ? 'التعرض الموزون (مجهد)' : 'STRESSED EXPOSURE'}</div>
                      <div style={{ fontSize: '13px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: threat.isMitigated ? 'var(--status-success)' : '#ef4444' }}>
                        {threat.isMitigated ? (isAr ? '✓ محمي بالكامل' : 'PROTECTED') : `${Math.round(effectiveExposure).toLocaleString(isAr ? 'ar-SA' : 'en-US')} SAR`}
                      </div>
                    </div>
                  </div>

                  {/* Leading Indicator Metric */}
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', background: 'rgba(245, 158, 11, 0.05)', padding: '8px 10px', borderRadius: '4px', borderLeft: isAr ? undefined : '2px solid #F59E0B', borderRight: isAr ? '2px solid #F59E0B' : undefined }}>
                    <strong>{isAr ? 'المؤشر القائد:' : 'Trigger Metric:'}</strong> {threat.leadingIndicatorMetric}
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                    <button
                      onClick={() => setActiveModalThreat(threat)}
                      className="btn-secondary"
                      style={{ flex: 1, padding: '7px 10px', fontSize: '11.5px', justifyContent: 'center' }}
                    >
                      <span>{isAr ? 'فحص الأدلة' : 'Inspect'}</span>
                    </button>

                    <button
                      onClick={() => handleToggleMitigation(threat.id)}
                      className="btn-primary"
                      style={{
                        flex: 1.2,
                        padding: '7px 10px',
                        fontSize: '11.5px',
                        justifyContent: 'center',
                        background: threat.isMitigated ? 'var(--bg-surface-subtle)' : '#F59E0B',
                        borderColor: threat.isMitigated ? 'var(--status-success)' : '#D97706',
                        color: threat.isMitigated ? 'var(--status-success)' : '#0F172A'
                      }}
                    >
                      <span>{threat.isMitigated ? (isAr ? '✓ التحوط مفعل' : 'Mitigated') : (isAr ? '🛡️ تفعيل خطة التحوط' : 'Deploy Defense')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: ROLLING 13-WEEK CASH RUNWAY SIMULATOR ───────────────────────── */}
      {activeTab === 'runway' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {isAr ? 'مدرج السيولة النقدية المتوقعة لـ 13 أسبوعاً (Rolling Cash Runway Telemetry)' : 'Rolling 13-Week Cash Flow & Runway Trajectory'}
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              {isAr
                ? 'نمذجة ديناميكية للسيولة تقيس استحقاقات الصرف التشغيلية والرواتب مقابل سرعة التحصيل المتوقعة تحت ضغط الصدمات المحددة.'
                : 'Dynamic modeling comparing weekly committed disbursements against realistic customer cash collection.'}
            </p>
          </div>

          {/* Runway Visual Table / Timeline */}
          <div style={{ overflowX: 'auto', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', padding: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)', textAlign: isAr ? 'right' : 'left' }}>
                  <th style={{ padding: '10px' }}>{isAr ? 'الأسبوع' : 'Week'}</th>
                  <th style={{ padding: '10px' }}>{isAr ? 'التدفقات الداخلة' : 'Inflows'}</th>
                  <th style={{ padding: '10px' }}>{isAr ? 'الالتزامات الخارجة' : 'Outflows'}</th>
                  <th style={{ padding: '10px' }}>{isAr ? 'رصيد الأساس' : 'Baseline Cash'}</th>
                  <th style={{ padding: '10px' }}>{isAr ? 'الرصيد تحت الصدمة' : 'Stressed Cash'}</th>
                  <th style={{ padding: '10px' }}>{isAr ? 'حالة الأمان' : 'Safety Status'}</th>
                </tr>
              </thead>
              <tbody>
                {runwayPoints.map((pt) => (
                  <tr
                    key={pt.weekNumber}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: pt.isDeficit ? 'rgba(239, 68, 68, 0.08)' : undefined
                    }}
                  >
                    <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: pt.isDeficit ? '#ef4444' : 'var(--text-primary)' }}>
                      {isAr ? pt.weekLabelAr : pt.weekLabelEn}
                    </td>
                    <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: 'var(--status-success)' }}>
                      +{pt.projectedInflowsSAR.toLocaleString()} SAR
                    </td>
                    <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: '#ef4444' }}>
                      -{pt.committedOutflowsSAR.toLocaleString()} SAR
                    </td>
                    <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {pt.baselineCashBalanceSAR.toLocaleString()} SAR
                    </td>
                    <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', fontWeight: 900, color: pt.isDeficit ? '#ef4444' : 'var(--text-primary)' }}>
                      {pt.stressedCashBalanceSAR.toLocaleString()} SAR
                    </td>
                    <td style={{ padding: '10px' }}>
                      {pt.isDeficit ? (
                        <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#ef4444', background: 'rgba(239, 68, 68, 0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                          ⚠️ {isAr ? `عجز ${pt.deficitAmountSAR.toLocaleString()} ر.س` : `Deficit: ${pt.deficitAmountSAR.toLocaleString()} SAR`}
                        </span>
                      ) : (
                        <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--status-success)', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                          ✓ {isAr ? 'آمن فوق سقف الحماية' : 'Secure Buffer'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: 5x5 ENTERPRISE HEATMAP MATRIX ─────────────────────────────── */}
      {activeTab === 'heatmap' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {isAr ? 'مصفوفة التهديدات المؤسسية 5x5 (Enterprise Risk Heatmap)' : 'Enterprise 5x5 Likelihood vs Impact Heatmap'}
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              {isAr
                ? 'توزيع الإشارات المرصودة تلقائياً عبر نطاقات الاحتمالية والأثر المالي لتحديد التهديدات الوشيكة التي تتطلب تدخلاً فورياً.'
                : 'Automated positioning of detected vulnerabilities based on probabilistic impact to prioritize executive focus.'}
            </p>
          </div>

          {/* 5x5 Grid Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', background: 'var(--bg-surface-elevated)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            {[
              { label: '5. كارثي (Catastrophic)', color: '#ef4444', minP: 80 },
              { label: '4. حرج (Major)', color: '#f97316', minP: 65 },
              { label: '3. متوسط (Moderate)', color: '#f59e0b', minP: 50 },
              { label: '2. طفيف (Minor)', color: '#38bdf8', minP: 30 },
              { label: '1. مهمل (Insignificant)', color: '#10b981', minP: 0 }
            ].map((col, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: col.color, borderBottom: `2px solid ${col.color}`, paddingBottom: '6px' }}>
                  {col.label}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '180px' }}>
                  {signals
                    .filter((s) => s.probabilityPct >= col.minP && (idx === 0 || s.probabilityPct < [80, 65, 50, 30][idx - 1]))
                    .map((s) => (
                      <div
                        key={s.id}
                        onClick={() => setActiveModalThreat(s)}
                        style={{
                          background: s.isMitigated ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-surface)',
                          border: s.isMitigated ? '1px solid var(--status-success)' : `1px solid ${col.color}`,
                          padding: '10px',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: col.color }}>{s.code}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{s.probabilityPct}%</span>
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                          {isAr ? s.titleAr : s.titleEn}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                          {s.potentialLossSAR.toLocaleString()} SAR
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: CRISIS PREVENTION DOSSIER ─────────────────────────────────── */}
      {activeTab === 'dossier' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              background: '#0F1420',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-md)',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
            }}
          >
            {/* Header with Badges */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                  ISO 31000 RISK MANAGEMENT FRAMEWORK // SOVEREIGN ASSURANCE
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', margin: '6px 0 2px 0' }}>
                  {isAr ? 'مذكرة الإنذار المبكر ودرء الأزمات التشغيلية والمالية' : 'Executive Crisis Prevention & Early Warning Memorandum'}
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  {isAr ? 'الرقم المرجعي:' : 'Dossier Ref:'} <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>RADAR-ISO31K-{Date.now().toString().slice(-6)}</strong>
                </div>
              </div>

              <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                <span style={{ fontSize: '11px', color: '#F59E0B', border: '1px solid #F59E0B', padding: '4px 10px', borderRadius: '4px', fontWeight: 800 }}>
                  {isAr ? 'سري وتنبيه تنفيذي' : 'EXECUTIVE STRICT'}
                </span>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                  {new Date().toISOString().split('T')[0]}
                </div>
              </div>
            </div>

            {/* Narrative Summary */}
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
              {isAr
                ? `استناداً إلى معايير إدارة المخاطر المؤسسية ISO 31000 واشتراطات حوكمة الشركات في المملكة، يوثق هذا التقرير نتائج الرصد الاستباقي لشبكة الإنذار المبكر MIKHLAFI LABS. تم رصد إجمالي مخاطر نشطة محتملة بقيمة (${portfolioMetrics.totalMonitoredExposureSAR.toLocaleString('ar-SA')} ر.س) بمتوسط مهلة إنذار (${portfolioMetrics.averageWarningHorizonDays} يوماً). تم تفعيل خطط التحوط المعتمدة أدناه لحماية استمرارية الأعمال ومنع تعثر السيولة.`
                : `In accordance with ISO 31000 enterprise risk standards and Saudi corporate governance rules, this memorandum certifies findings from the MIKHLAFI LABS predictive radar. Active exposure of (${portfolioMetrics.totalMonitoredExposureSAR.toLocaleString('en-US')} SAR) detected with an average lead-time runway of (${portfolioMetrics.averageWarningHorizonDays} days).`}
            </p>

            {/* Signals Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-default)', textAlign: isAr ? 'right' : 'left' }}>
                    <th style={{ padding: '10px' }}>{isAr ? 'الرمز' : 'Code'}</th>
                    <th style={{ padding: '10px' }}>{isAr ? 'التهديد المرصود' : 'Vulnerability'}</th>
                    <th style={{ padding: '10px' }}>{isAr ? 'الخسارة المحتملة' : 'Potential Loss'}</th>
                    <th style={{ padding: '10px' }}>{isAr ? 'مهلة الإنذار' : 'Lead Time'}</th>
                    <th style={{ padding: '10px' }}>{isAr ? 'المسؤول' : 'Owner'}</th>
                    <th style={{ padding: '10px' }}>{isAr ? 'حالة التحوط' : 'Mitigation'}</th>
                  </tr>
                </thead>
                <tbody>
                  {signals.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#F59E0B' }}>{s.code}</td>
                      <td style={{ padding: '10px', fontWeight: 700, color: 'var(--text-primary)' }}>{isAr ? s.titleAr : s.titleEn}</td>
                      <td style={{ padding: '10px', fontFamily: 'var(--font-mono)' }}>{s.potentialLossSAR.toLocaleString()} SAR</td>
                      <td style={{ padding: '10px', fontFamily: 'var(--font-mono)' }}>{s.earlyWarningHorizonDays} {isAr ? 'يوماً' : 'days'}</td>
                      <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{s.mitigationOwner}</td>
                      <td style={{ padding: '10px' }}>
                        {s.isMitigated ? (
                          <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--status-success)', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                            ✓ {isAr ? 'تم الدرء والتحوط' : 'MITIGATED'}
                          </span>
                        ) : (
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                            ⚠️ {isAr ? 'إنذار نشط' : 'ACTIVE THREAT'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer with Seal */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '16px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                  {isAr ? 'التوقيع المشفر وختم الحوكمة:' : 'Cryptographic Security Proof:'}
                </div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#F59E0B', marginTop: '4px' }}>
                  SHA256-RADAR-RISK-ASSURANCE-CERTIFIED
                </div>
              </div>

              <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{isAr ? 'كبير مسؤولي المخاطر (CRO):' : 'Chief Risk Officer:'}</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {isAr ? 'د. عادل القحطاني — رئيس قطاع المخاطر والامتثال' : 'Dr. Adel Al-Qahtani — Head of Risk & Governance'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={() => window.print()} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }}>
              <span>🖨️ {isAr ? 'طباعة المذكرة الرسمية' : 'Print Dossier'}</span>
            </button>
            <button onClick={handleExportRiskCsv} className="btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>
              <IconDownload size={14} />
              <span>{isAr ? 'تصدير سجل المخاطر CSV' : 'Export Risk CSV'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── DETAIL MODAL: THREAT INSPECTION ──────────────────────────────────── */}
      {activeModalThreat && (
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
          onClick={() => setActiveModalThreat(null)}
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
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(245, 158, 11, 0.2)',
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
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#F59E0B'
                  }}
                >
                  {activeModalThreat.code}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)' }}>
                  HORIZON // {activeModalThreat.earlyWarningHorizonDays} DAYS
                </span>
              </div>

              <button
                onClick={() => setActiveModalThreat(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {isAr ? activeModalThreat.titleAr : activeModalThreat.titleEn}
                </h3>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {isAr ? 'المسؤول المكلف بالتحوط:' : 'Mitigation Owner:'} <strong style={{ color: 'var(--text-primary)' }}>{activeModalThreat.mitigationOwner}</strong>
                </div>
              </div>

              {/* Mitigation Directive */}
              <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {isAr ? 'خطة التحوط والإجراء الوقائي الفوري:' : 'Mitigation Directive:'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {isAr ? activeModalThreat.mitigationActionAr : activeModalThreat.mitigationActionEn}
                </div>
              </div>

              {/* Financial Box */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div style={{ background: 'var(--bg-surface-subtle)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 800 }}>POTENTIAL LOSS</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ef4444', marginTop: '2px' }}>
                    {activeModalThreat.potentialLossSAR.toLocaleString()} SAR
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-subtle)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 800 }}>PROBABILITY</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#F59E0B', marginTop: '2px' }}>
                    {activeModalThreat.probabilityPct}%
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-subtle)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 800 }}>DEFENSE COST</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--status-success)', marginTop: '2px' }}>
                    {activeModalThreat.mitigationCostSAR.toLocaleString()} SAR
                  </div>
                </div>
              </div>

              {/* Trigger Indicator */}
              <div style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {isAr ? 'إشارة التحفيز والمؤشر القائد:' : 'Leading Trigger Metric:'}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {activeModalThreat.leadingIndicatorMetric}
                </div>
              </div>

              {/* Statutory Framework */}
              <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                REGULATORY STANDARD: {activeModalThreat.statutoryRegulation}
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <button
                  onClick={() => handleToggleMitigation(activeModalThreat.id)}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    padding: '10px',
                    fontSize: '13px',
                    background: activeModalThreat.isMitigated ? 'var(--bg-surface-subtle)' : '#F59E0B',
                    borderColor: activeModalThreat.isMitigated ? 'var(--status-success)' : '#D97706',
                    color: activeModalThreat.isMitigated ? 'var(--status-success)' : '#0F172A',
                    justifyContent: 'center'
                  }}
                >
                  <span>{activeModalThreat.isMitigated ? (isAr ? '✓ إعادة فتح الخطر' : 'Reopen Threat') : (isAr ? '🛡️ تفعيل خطة التحوط الآن' : 'Activate Defense Plan')}</span>
                </button>

                {onRequestAssistance && (
                  <button
                    onClick={() => {
                      onRequestAssistance(`${activeModalThreat.code} - ${activeModalThreat.titleAr}`);
                      setActiveModalThreat(null);
                    }}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '10px', fontSize: '13px', justifyContent: 'center' }}
                  >
                    <span>{isAr ? 'طلب استشارة طوارئ' : 'Emergency Advisory'}</span>
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
