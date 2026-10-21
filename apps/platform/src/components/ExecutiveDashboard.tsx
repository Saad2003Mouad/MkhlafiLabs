// MIKHLAFI LABS — Executive Command Center (protected workspace overview)
// Every metric and record on this screen is fetched live from the
// authenticated backend (api.getDashboardSummary, api.getDecisions,
// api.getFinancialLeaks). No simulated or demonstration data is rendered.

import React, { useState, useEffect, useCallback } from 'react';
import { LocaleMode } from '../types';
import {
  IconDashboard,
  IconDecisions,
  IconActivity,
  IconArrowRight,
  IconLock,
  IconAlert
} from './Icons';
import { useAuth } from '../context/AuthContext';
import { api, DashboardSummaryResponse, RealDecisionItem } from '../api/client';
import { EmptyState } from './common/EmptyState';
import { PageHeader } from './common/PageHeader';

interface ExecutiveDashboardProps {
  locale: LocaleMode;
  onNavigateDetail: () => void;
}

type LeakAnomaly = Awaited<ReturnType<typeof api.getFinancialLeaks>>['anomalies'][number];

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ locale, onNavigateDetail }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated, tenant, openAuthModal } = useAuth();

  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [decisions, setDecisions] = useState<RealDecisionItem[]>([]);
  const [anomalies, setAnomalies] = useState<LeakAnomaly[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const currency = tenant?.currency || summary?.organization.currency || 'SAR';

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) {
      setSummary(null);
      setDecisions([]);
      setAnomalies([]);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [summaryData, decisionsData, leaksData] = await Promise.all([
        api.getDashboardSummary(),
        api.getDecisions(),
        api.getFinancialLeaks()
      ]);
      setSummary(summaryData);
      setDecisions(decisionsData.decisions || []);
      setAnomalies(leaksData.anomalies || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : (isAr ? 'تعذر تحميل مؤشرات مساحة العمل.' : 'Failed to load workspace metrics.'));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isAr]);

  useEffect(() => {
    fetchData();
  }, [fetchData, tenant?.organizationId]);

  const formatAmount = (value: number | string, code?: string) =>
    `${(Number(value) || 0).toLocaleString()} ${code || currency}`;

  const formatDate = (value: string) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString(isAr ? 'ar-SA' : 'en-US');
    } catch {
      return '—';
    }
  };

  const kpis = summary?.kpis;
  const pendingDecisions = decisions.filter((d) => d.status !== 'executed');
  const recentAnomalies = [...anomalies]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
  const hasAnyRecords = decisions.length > 0 || anomalies.length > 0 ||
    (kpis != null && (kpis.auditEventsLogged > 0 || kpis.totalBranches > 0));

  const severityBadge = (severity: string) => {
    const s = (severity || '').toLowerCase();
    if (s === 'critical') return 'ml-badge ml-badge--danger';
    if (s === 'high') return 'ml-badge ml-badge--warning';
    if (s === 'medium') return 'ml-badge ml-badge--info';
    return 'ml-badge';
  };

  return (
    <div className="platform-page-container">
      <PageHeader
        locale={locale}
        icon={<IconDashboard size={22} />}
        breadcrumb={[isAr ? 'المنصة' : 'Platform', isAr ? 'مساحة العمل' : 'Workspace']}
        title={isAr ? 'مركز القيادة والذكاء التنفيذي' : 'Executive Command Center'}
        subtitle={
          isAr
            ? 'نظرة تشغيلية موحدة على مؤشرات مؤسستك: القرارات قيد الاعتماد، الإشارات والانحرافات المرصودة، وسجل الأحداث التدقيقية — كلها مأخوذة مباشرة من مساحة عملك.'
            : 'A unified operational view across your organization: decisions awaiting approval, detected signals and variances, and the governance event trail — all loaded live from your workspace.'
        }
        action={
          isAuthenticated ? (
            <button onClick={onNavigateDetail} className="ml-btn ml-btn--ghost ml-btn--sm">
              <span>{isAr ? 'الذكاء المالي والتدقيق' : 'Financial Intelligence'}</span>
              <IconArrowRight size={14} />
            </button>
          ) : undefined
        }
      />

      {!isAuthenticated ? (
        <EmptyState
          icon={<IconLock size={30} />}
          title={isAr ? 'سجّل الدخول لعرض مؤشرات مؤسستك' : 'Sign in to view your organization’s metrics'}
          description={
            isAr
              ? 'تُسترجع المؤشرات التنفيذية وسجلات القرارات والإشارات مباشرة من مساحة عمل مؤسستك بعد تسجيل الدخول.'
              : 'Executive metrics, decision records, and detected signals are loaded directly from your organization workspace after signing in.'
          }
          action={
            <button onClick={openAuthModal} className="ml-btn ml-btn--primary">
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </button>
          }
        />
      ) : isLoading ? (
        <div className="skeleton-grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={<IconAlert size={30} />}
          title={isAr ? 'تعذر تحميل مؤشرات مساحة العمل' : 'Unable to load workspace metrics'}
          description={error}
          action={
            <button onClick={fetchData} className="ml-btn ml-btn--primary">
              {isAr ? 'إعادة المحاولة' : 'Retry'}
            </button>
          }
        />
      ) : (
        <>
          {/* Live KPI tiles — values straight from the dashboard summary endpoint */}
          {kpis && (
            <div className="stat-grid">
              <div className="stat-tile">
                <div className="stat-tile__label">{isAr ? 'قرارات بانتظار الاعتماد' : 'Pending Decisions'}</div>
                <div className="stat-tile__value">{kpis.pendingDecisionsCount || 0}</div>
                <div className="stat-tile__hint">{isAr ? 'بانتظار اعتماد مخوّل' : 'Awaiting authorized execution'}</div>
              </div>
              <div className="stat-tile">
                <div className="stat-tile__label">{isAr ? 'أثر القرارات المعلّقة' : 'Pending Decision Impact'}</div>
                <div className="stat-tile__value">{formatAmount(kpis.pendingImpactSAR || 0)}</div>
                <div className="stat-tile__hint">{isAr ? 'الأثر المجمّع للقرارات المفتوحة' : 'Combined impact of open decisions'}</div>
              </div>
              <div className="stat-tile">
                <div className="stat-tile__label">{isAr ? 'قرارات منفّذة' : 'Executed Decisions'}</div>
                <div className="stat-tile__value">{kpis.executedDecisionsCount || 0}</div>
                <div className="stat-tile__hint">
                  {isAr ? 'الأثر المنفّذ:' : 'Executed impact:'} {formatAmount(kpis.executedImpactSAR || 0)}
                </div>
              </div>
              <div className="stat-tile">
                <div className="stat-tile__label">{isAr ? 'أحداث التدقيق المسجلة' : 'Audit Events Logged'}</div>
                <div className="stat-tile__value">{kpis.auditEventsLogged || 0}</div>
                <div className="stat-tile__hint">{isAr ? 'سجل حوكمة غير قابل للتعديل' : 'Immutable governance trail'}</div>
              </div>
              <div className="stat-tile">
                <div className="stat-tile__label">{isAr ? 'الفروع' : 'Branches'}</div>
                <div className="stat-tile__value">{kpis.totalBranches || 0}</div>
                <div className="stat-tile__hint">{isAr ? 'وحدات تقارير ضمن النطاق' : 'Reporting units in scope'}</div>
              </div>
            </div>
          )}

          {/* Onboarding — shown only when the workspace genuinely has no activity yet */}
          {!hasAnyRecords && (
            <EmptyState
              icon={<IconActivity size={30} />}
              title={isAr ? 'مساحة العمل جاهزة وتفتقر إلى السجلات التشغيلية' : 'Your workspace is ready but has no operational records yet'}
              description={
                isAr
                  ? 'تظهر القرارات التنفيذية والإشارات المرصودة تلقائياً بمجرد ربط مصادر بيانات مؤسستك (أنظمة تخطيط الموارد، قنوات البيانات، استيراد الملفات) من شاشة التكاملات.'
                  : 'Executive decisions and detected signals appear automatically once your organization’s data sources (ERP systems, data channels, file imports) are connected from the Integrations screen.'
              }
            />
          )}

          {/* Pending executive actions */}
          <div className="ml-panel va-section-gap">
            <div className="ml-panel__head">
              <h2 className="ml-title" style={{ fontSize: 16 }}>
                {isAr ? 'القرارات التنفيذية قيد الانتظار' : 'Pending Executive Decisions'}
              </h2>
              <span className="ml-badge ml-badge--accent">
                {pendingDecisions.length} {isAr ? 'معلّقة' : 'Pending'}
              </span>
            </div>
            <div className="ml-panel__body">
              {pendingDecisions.length === 0 ? (
                <EmptyState
                  compact
                  icon={<IconDecisions size={26} />}
                  title={isAr ? 'لا توجد قرارات معلّقة حالياً' : 'No decisions awaiting approval'}
                  description={
                    isAr
                      ? 'تُنشأ القرارات التنفيذية تلقائياً عند رصد انحرافات في بيانات المؤسسة المرتبطة بمحركات الذكاء، وتظهر هنا فور اكتشافها.'
                      : 'Executive decisions are created automatically when variances are detected in your connected operational data, and appear here as soon as they are found.'
                  }
                />
              ) : (
                <div className="record-list">
                  {pendingDecisions.slice(0, 5).map((decision) => (
                    <div key={decision.id} className="record-row">
                      <div className="record-row__main">
                        <div className="va-row-head">
                          <div className="va-tags">
                            <span className={severityBadge(decision.risk_level)}>
                              <span className="ml-dot" />
                              {(decision.risk_level || '').toUpperCase()}
                            </span>
                            <span className="va-mono-id">DEC-{decision.id.substring(0, 6).toUpperCase()}</span>
                          </div>
                          <span className="va-amount">{formatAmount(decision.impact_amount, decision.currency)}</span>
                        </div>
                        <div className="record-row__title" style={{ marginTop: 6 }}>{decision.title}</div>
                        <div className="record-row__meta">
                          {decision.category} · {isAr ? 'تاريخ الإنشاء:' : 'Created:'} {formatDate(decision.created_at)}
                        </div>
                      </div>
                      <div className="record-row__actions">
                        <button onClick={onNavigateDetail} className="ml-btn ml-btn--subtle ml-btn--sm">
                          <span>{isAr ? 'فحص الأدلة' : 'Inspect Evidence'}</span>
                          <IconArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recently detected signals */}
          <div className="ml-panel va-section-gap">
            <div className="ml-panel__head">
              <h2 className="ml-title" style={{ fontSize: 16 }}>
                {isAr ? 'أحدث الإشارات والانحرافات المرصودة' : 'Recently Detected Signals'}
              </h2>
              <span className="ml-badge">
                {anomalies.length} {isAr ? 'إشارات' : 'Signals'}
              </span>
            </div>
            <div className="ml-panel__body">
              {recentAnomalies.length === 0 ? (
                <EmptyState
                  compact
                  icon={<IconActivity size={26} />}
                  title={isAr ? 'لا توجد انحرافات مرصودة حالياً' : 'No variances detected right now'}
                  description={
                    isAr
                      ? 'تُفحص السجلات التشغيلية المرتبطة بمؤسستك باستمرار؛ تظهر الإشارات هنا فور رصد أي انحراف عن النطاقات المرجعية.'
                      : 'Your connected operational records are monitored continuously; signals appear here the moment a variance is detected against reference baselines.'
                  }
                />
              ) : (
                <div className="record-list">
                  {recentAnomalies.map((anomaly) => (
                    <div key={anomaly.id} className="record-row">
                      <div className="record-row__main">
                        <div className="va-row-head">
                          <div className="va-tags">
                            <span className={severityBadge(anomaly.severity)}>
                              <span className="ml-dot" />
                              {(anomaly.severity || '').toUpperCase()}
                            </span>
                            <span className="va-mono-id">{anomaly.case_number}</span>
                          </div>
                          <span className="va-amount va-amount--danger">
                            {formatAmount(anomaly.flagged_amount, anomaly.currency)}
                          </span>
                        </div>
                        <div className="record-row__title" style={{ marginTop: 6 }}>{anomaly.target_vendor}</div>
                        <div className="record-row__meta">
                          {isAr ? anomaly.narrative_ar : anomaly.narrative_en}
                        </div>
                        <div className="record-row__meta">
                          <span className="va-mono-id">{anomaly.rule_code}</span> · {formatDate(anomaly.created_at)}
                        </div>
                      </div>
                      <div className="record-row__actions">
                        <button onClick={onNavigateDetail} className="ml-btn ml-btn--subtle ml-btn--sm">
                          <span>{isAr ? 'فحص الحالة' : 'Inspect Case'}</span>
                          <IconArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
