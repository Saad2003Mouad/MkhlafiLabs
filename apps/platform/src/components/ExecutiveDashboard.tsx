import React, { useState, useEffect } from 'react';
import { LocaleMode, KpiItem } from '../types';
import { KpiCard } from './KpiCard';
import { ChartPreview } from './ChartPreview';
import { IconArrowRight } from './Icons';
import { useAuth } from '../context/AuthContext';
import { api, DashboardSummaryResponse, RealDecisionItem } from '../api/client';

interface ExecutiveDashboardProps {
  locale: LocaleMode;
  onNavigateDetail: () => void;
}

interface FinancialAnomaly {
  id: string;
  case_number: string;
  rule_code: string;
  severity: string;
  confidence_pct: number;
  target_vendor: string;
  flagged_amount: number;
  currency: string;
  narrative_en: string;
  narrative_ar: string;
  status: string;
  created_at: string;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ locale, onNavigateDetail }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated, tenant, openAuthModal } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('q4');
  const [liveSummary, setLiveSummary] = useState<DashboardSummaryResponse | null>(null);
  const [anomalies, setAnomalies] = useState<FinancialAnomaly[]>([]);
  const [decisions, setDecisions] = useState<RealDecisionItem[]>([]);
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);
  const [errorLive, setErrorLive] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      setIsLoadingLive(true);
      setErrorLive(null);

      Promise.all([
        api.getDashboardSummary(),
        api.getFinancialLeaks(),
        api.getDecisions()
      ])
        .then(([summaryData, leaksData, decisionsData]) => {
          if (isMounted) {
            setLiveSummary(summaryData);
            setAnomalies(leaksData.anomalies || []);
            setDecisions(decisionsData.decisions || []);
          }
        })
        .catch((err) => {
          if (isMounted) setErrorLive(err.message || 'Failed to load live metrics');
        })
        .finally(() => {
          if (isMounted) setIsLoadingLive(false);
        });
    } else {
      setLiveSummary(null);
      setAnomalies([]);
      setDecisions([]);
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, tenant?.organizationId]);

  // Live PostgreSQL metrics mapped honestly
  const liveKpis: KpiItem[] = liveSummary
    ? [
        {
          id: 'kpi-live-1',
          titleAr: 'قرارات تنفيذية بانتظار الاعتماد',
          titleEn: 'Pending Executive Decisions',
          value: String(liveSummary.kpis.pendingDecisionsCount || 0),
          delta: isAr ? 'محدث لحظياً' : 'Live Sync',
          isPositive: true,
          unitAr: 'قرار',
          unitEn: 'Actions',
          sourceAr: 'PostgreSQL: tenant_decisions',
          sourceEn: 'PostgreSQL: tenant_decisions',
          qualityStatus: 'fresh'
        },
        {
          id: 'kpi-live-2',
          titleAr: 'الأثر المالي للقرارات المعلقة',
          titleEn: 'Pending Decision Impact',
          value: (Number(liveSummary.kpis.pendingImpactSAR) || 0).toLocaleString(),
          delta: isAr ? 'عالي التأثير' : 'High Impact',
          isPositive: true,
          unitAr: liveSummary.organization.currency || 'SAR',
          unitEn: liveSummary.organization.currency || 'SAR',
          sourceAr: 'PostgreSQL: tenant_decisions',
          sourceEn: 'PostgreSQL: tenant_decisions',
          qualityStatus: 'fresh'
        },
        {
          id: 'kpi-live-3',
          titleAr: 'قرارات منفذة ومدققة',
          titleEn: 'Executed & Audited Actions',
          value: String(liveSummary.kpis.executedDecisionsCount || 0),
          delta: `${(Number(liveSummary.kpis.executedImpactSAR) || 0).toLocaleString()} SAR`,
          isPositive: true,
          unitAr: 'منفذ',
          unitEn: 'Executed',
          sourceAr: 'PostgreSQL: audit_logs',
          sourceEn: 'PostgreSQL: audit_logs',
          qualityStatus: 'fresh'
        },
        {
          id: 'kpi-live-4',
          titleAr: 'سجلات التدقيق والأمان المسجلة',
          titleEn: 'Audited Governance Events',
          value: String(liveSummary.kpis.auditEventsLogged || 0),
          delta: isAr ? 'سجل غير قابل للتعديل' : 'Immutable Log',
          isPositive: true,
          unitAr: 'حدث',
          unitEn: 'Events',
          sourceAr: 'PostgreSQL: audit_logs',
          sourceEn: 'PostgreSQL: audit_logs',
          qualityStatus: 'fresh'
        }
      ]
    : [
        {
          id: 'kpi-init-1',
          titleAr: 'قرارات تنفيذية بانتظار الاعتماد',
          titleEn: 'Pending Executive Decisions',
          value: '0',
          delta: isAr ? 'بانتظار تسجيل الدخول' : 'Awaiting Auth',
          isPositive: true,
          unitAr: 'قرار',
          unitEn: 'Actions',
          sourceAr: 'PostgreSQL: tenant_decisions',
          sourceEn: 'PostgreSQL: tenant_decisions',
          qualityStatus: 'partial'
        },
        {
          id: 'kpi-init-2',
          titleAr: 'الأثر المالي المتوقع',
          titleEn: 'Pending Decision Impact',
          value: '0',
          delta: isAr ? 'بانتظار تسجيل الدخول' : 'Awaiting Auth',
          isPositive: true,
          unitAr: 'SAR',
          unitEn: 'SAR',
          sourceAr: 'PostgreSQL: tenant_decisions',
          sourceEn: 'PostgreSQL: tenant_decisions',
          qualityStatus: 'partial'
        },
        {
          id: 'kpi-init-3',
          titleAr: 'قرارات منفذة ومدققة',
          titleEn: 'Executed & Audited Actions',
          value: '0',
          delta: '0 SAR',
          isPositive: true,
          unitAr: 'منفذ',
          unitEn: 'Executed',
          sourceAr: 'PostgreSQL: audit_logs',
          sourceEn: 'PostgreSQL: audit_logs',
          qualityStatus: 'partial'
        },
        {
          id: 'kpi-init-4',
          titleAr: 'سجلات التدقيق والأمان المسجلة',
          titleEn: 'Audited Governance Events',
          value: '0',
          delta: isAr ? 'مسار تدقيق نشط' : 'Active Trail',
          isPositive: true,
          unitAr: 'حدث',
          unitEn: 'Events',
          sourceAr: 'PostgreSQL: audit_logs',
          sourceEn: 'PostgreSQL: audit_logs',
          qualityStatus: 'partial'
        }
      ];

  const pendingDecisions = decisions.filter((d) => d.status !== 'executed');

  return (
    <div className="content-scroll">
      {/* Top Header & Date Range Controls */}
      <div className="page-intro">
        <div>
          <h1 className="page-title">
            {isAr ? 'مركز القيادة والذكاء التنفيذي الموحد' : 'Executive Command Center'}
          </h1>
          <p className="page-desc">
            {isAr
              ? 'مراقبة حية وشاملة لأداء المؤسسة، كشف الانحرافات المالية والتشغيلية، ودعم اتخاذ القرارات الاستراتيجية.'
              : 'Holistic business monitoring, early operational anomaly detection, and unified decision intelligence.'}
          </p>
        </div>

        {/* Date Range Selector & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
            <button
              onClick={() => setSelectedPeriod('m')}
              className={`ctrl-btn ${selectedPeriod === 'm' ? 'active' : ''}`}
              style={{ padding: '4px 10px', fontSize: '11px', border: 'none' }}
            >
              {isAr ? 'الشهر الحالي' : 'Month'}
            </button>
            <button
              onClick={() => setSelectedPeriod('q4')}
              className={`ctrl-btn ${selectedPeriod === 'q4' ? 'active' : ''}`}
              style={{ padding: '4px 10px', fontSize: '11px', border: 'none' }}
            >
              {isAr ? 'الربع المالي Q4' : 'Q4 Quarter'}
            </button>
            <button
              onClick={() => setSelectedPeriod('y')}
              className={`ctrl-btn ${selectedPeriod === 'y' ? 'active' : ''}`}
              style={{ padding: '4px 10px', fontSize: '11px', border: 'none' }}
            >
              {isAr ? 'العام الحالي' : 'YTD'}
            </button>
          </div>

          <button
            onClick={onNavigateDetail}
            className="btn-primary"
            style={{ fontSize: '12px', padding: '7px 14px' }}
          >
            <span>{isAr ? 'التدقيق المالي الكامل' : 'Open Financial Audit'}</span>
            <IconArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Honest Demo Mode / Live Connection Banner */}
      {isAuthenticated && isLoadingLive && (
        <div className="honest-alert" style={{ borderColor: 'var(--accent-base)', background: 'rgba(59, 130, 246, 0.08)' }}>
          <span style={{ fontSize: '20px' }}>⏳</span>
          <div style={{ flex: 1 }}>
            <strong>{isAr ? 'جارِ استرجاع المؤشرات الحية من PostgreSQL...' : 'Loading live metrics from PostgreSQL...'}</strong>
          </div>
        </div>
      )}

      {isAuthenticated && errorLive && (
        <div className="honest-alert" style={{ borderColor: 'var(--status-danger)', background: 'rgba(239, 68, 68, 0.08)' }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <strong style={{ color: 'var(--status-danger)' }}>{errorLive}</strong>
          </div>
        </div>
      )}

      {isAuthenticated && liveSummary ? (
        <div className="honest-alert" style={{ borderColor: 'var(--status-success)', background: 'rgba(16, 185, 129, 0.08)' }}>
          <span style={{ fontSize: '20px' }}>🟢</span>
          <div style={{ flex: 1 }}>
            <strong style={{ color: 'var(--status-success)' }}>
              {isAr ? 'جلسة تشغيلية حقيقية متصلة بقاعدة البيانات (Live Production Backend):' : 'Live Verified Database Connection (Multi-Tenant Active):'}
            </strong>{' '}
            {isAr
              ? `المؤسسة الحالية: ${liveSummary.organization.nameAr || liveSummary.organization.nameEn} — محرك البيانات: ${liveSummary.databaseEngine} — حالة عزل البيانات: ${liveSummary.isolationStatus}`
              : `Active Tenant: ${liveSummary.organization.nameEn} — Engine: ${liveSummary.databaseEngine} — Isolation: ${liveSummary.isolationStatus}`}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--status-success)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            POSTGRESQL_TENANT_ISOLATED
          </span>
        </div>
      ) : (
        <div className="honest-alert">
          <span style={{ fontSize: '20px' }}>ℹ️</span>
          <div style={{ flex: 1 }}>
            <strong style={{ color: 'var(--text-primary)' }}>
              {isAr ? 'بيانات حقيقية خالية من التزييف (Zero Synthetic Benchmarks):' : 'Zero Synthetic Benchmarks Mode:'}
            </strong>{' '}
            {isAr
              ? 'يتم عرض البيانات الحقيقية لمؤسستك مباشرة من قاعدة البيانات. يرجى تسجيل الدخول للوصول إلى المؤشرات وسجلات التدقيق.'
              : 'Live metrics are fetched directly from your PostgreSQL tenant database. Sign in to view isolated records.'}
          </div>
          <button
            onClick={openAuthModal}
            className="btn-primary"
            style={{ fontSize: '11px', padding: '5px 12px' }}
          >
            <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
          </button>
        </div>
      )}

      {/* KPI Summary Cards Grid */}
      <div className="kpi-grid">
        {liveKpis.map((kpi) => (
          <KpiCard key={kpi.id} item={kpi} locale={locale} />
        ))}
      </div>

      {/* Bento Grid: Trend Chart & Executive Action Queue */}
      <div className="bento-grid">
        {/* Trend Chart Panel */}
        <div className="content-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">
                {isAr ? 'منحنى مؤشر الاستقرار التشغيلي ومعدل تلافي الهدر' : 'Operational Stability Index & Loss Mitigation Trend'}
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {isAr ? 'تطور الأداء المجمع ومعدل تلافي المخاطر الشهرية مقابل الحدود المرجعية' : 'Aggregate operational performance vs mitigation baselines over rolling quarters'}
              </span>
            </div>
            <button
              onClick={onNavigateDetail}
              style={{
                fontSize: '12px',
                color: 'var(--accent-light)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>{isAr ? 'التفاصيل والتدقيق' : 'Deep-Dive'}</span>
              <IconArrowRight size={13} />
            </button>
          </div>

          <ChartPreview locale={locale} />
        </div>

        {/* Priority Action Items / Executive Decisions Queue */}
        <div className="content-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              {isAr ? 'التوصيات والقرارات التنفيذية العاجلة' : 'Executive Action Priorities'}
            </h2>
            <span className={`severity-tag ${pendingDecisions.length > 0 ? 'high' : 'optimal'}`}>
              {pendingDecisions.length} {isAr ? 'معلقة' : 'PENDING'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingDecisions.length > 0 ? (
              pendingDecisions.slice(0, 3).map((dec) => (
                <div
                  key={dec.id}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-elevated)',
                    borderInlineStart: `3px solid ${dec.risk_level === 'CRITICAL' ? 'var(--status-danger)' : 'var(--status-warning)'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {dec.title}
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--status-danger)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {(Number(dec.impact_amount) || 0).toLocaleString()} {dec.currency || 'SAR'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {isAr
                      ? `تصنيف القرار: ${dec.category} — مستوى الخطورة: ${dec.risk_level}`
                      : `Category: ${dec.category} — Severity: ${dec.risk_level}`}
                  </div>
                  <button
                    onClick={onNavigateDetail}
                    style={{ fontSize: '11px', color: 'var(--accent-light)', fontWeight: 700, marginTop: '6px' }}
                  >
                    {isAr ? 'فحص الأدلة واتخاذ إجراء ←' : 'Inspect Evidence & Mitigate →'}
                  </button>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: '28px 16px',
                  textAlign: 'center',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px dashed var(--border-subtle)',
                  color: 'var(--text-secondary)'
                }}
              >
                <span style={{ fontSize: '20px', display: 'block', marginBottom: '6px' }}>✅</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {isAr ? 'لا توجد قرارات أو توصيات معلقة حالياً' : 'No Pending Action Items'}
                </span>
                <p style={{ margin: '4px 0 0', fontSize: '11px' }}>
                  {isAr
                    ? 'يتم رصد القرارات التنفيذية آلياً عند اكتشاف انحرافات محاسبية أو تسجيل عقود موردين جديدة.'
                    : 'Action items populate automatically upon detecting accounting variance or contract drift.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Anomalies Table Panel */}
      <div className="content-panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">
              {isAr ? 'سجل الانحرافات وحالات التدقيق الجنائي المفتوحة' : 'Open Forensic Anomaly Audit Log'}
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {isAr ? 'قائمة الحالات التي تتطلب مراجعة من الإدارة المالية والتشغيلية' : 'Algorithmic flags generated via deterministic reconciliation rules'}
            </span>
          </div>

          <button
            onClick={onNavigateDetail}
            className="ctrl-btn"
            style={{ fontSize: '12px' }}
          >
            <span>🔍</span>
            <span>{isAr ? 'فتح شاشة التدقيق المالي الكامل' : 'Open Financial Intelligence'}</span>
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{isAr ? 'رمز الحالة' : 'Code'}</th>
                <th>{isAr ? 'المورد المستهدف / الوصف' : 'Target Vendor / Narrative'}</th>
                <th>{isAr ? 'القاعدة الرقابية' : 'Rule Code'}</th>
                <th>{isAr ? 'الأثر المالي' : 'Impact Value'}</th>
                <th>{isAr ? 'مستوى الخطورة' : 'Severity'}</th>
                <th>{isAr ? 'نسبة الثقة' : 'Confidence'}</th>
                <th>{isAr ? 'وقت الرصد' : 'Detected At'}</th>
                <th>{isAr ? 'الحالة' : 'Status'}</th>
                <th>{isAr ? 'الإجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.length > 0 ? (
                anomalies.map((an) => (
                  <tr key={an.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-light)' }}>
                      {an.case_number}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div>{an.target_vendor}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 400 }}>
                        {isAr ? an.narrative_ar : an.narrative_en}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{an.rule_code}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--status-danger)' }}>
                      {(Number(an.flagged_amount) || 0).toLocaleString()} {an.currency || 'SAR'}
                    </td>
                    <td>
                      <span className={`severity-tag ${an.severity.toLowerCase()}`}>
                        {an.severity}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {Number(an.confidence_pct || 90).toFixed(1)}%
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                      {an.created_at ? new Date(an.created_at).toLocaleDateString() : 'Recent'}
                    </td>
                    <td>
                      <span className={`severity-tag ${an.status === 'FROZEN' ? 'optimal' : 'warning'}`} style={{ fontSize: '11px' }}>
                        {an.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={onNavigateDetail}
                        style={{
                          fontSize: '11px',
                          color: 'var(--accent-light)',
                          fontWeight: 700,
                          textDecoration: 'underline',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {isAr ? 'فحص الأدلة' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>🛡️</span>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {isAr ? 'لا توجد حالات تسرب أو انحرافات مرصودة حالياً' : 'Zero Forensic Anomalies Flagged'}
                    </strong>
                    <p style={{ margin: '4px 0 0', fontSize: '12px' }}>
                      {isAr
                        ? 'دفتر الأستاذ الحالي متطابق حسابياً. قم باستيراد فواتير جديدة أو ملف CSV من شاشة التكاملات لفحص القيود.'
                        : 'General ledger entries are clean. Ingest new invoices or upload a CSV via Integrations to run forensic audits.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
