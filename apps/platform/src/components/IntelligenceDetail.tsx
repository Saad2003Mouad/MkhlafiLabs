// MIKHLAFI LABS — Financial Intelligence & Forensic Audit detail view
// Connected live to the authenticated backend via api.getFinancialLeaks,
// api.getFinancialAnalytics, api.resolveFinancialLeak and
// api.getTenantAuditLogs. No simulated or demonstration records are rendered.

import React, { useState, useEffect, useCallback } from 'react';
import { LocaleMode } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  IconFinance,
  IconCheckCircle,
  IconShield,
  IconRefresh,
  IconAlert,
  IconArrowRight,
  IconLock,
  IconFileText
} from './Icons';
import { FinancialCharts } from './financial/FinancialCharts';
import { EmptyState } from './common/EmptyState';
import { PageHeader } from './common/PageHeader';

interface IntelligenceDetailProps {
  locale: LocaleMode;
  onBack: () => void;
}

type LeaksResponse = Awaited<ReturnType<typeof api.getFinancialLeaks>>;
type LeakAnomaly = LeaksResponse['anomalies'][number];
type FinancialAnalytics = Awaited<ReturnType<typeof api.getFinancialAnalytics>>;

interface AuditLogEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: unknown;
  ip_address: string | null;
  created_at: string;
}

type NoticeState = { type: 'success' | 'error'; message: string } | null;

export const IntelligenceDetail: React.FC<IntelligenceDetailProps> = ({ locale, onBack }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated, openAuthModal } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'anomalies' | 'charts' | 'causes' | 'reconciliation' | 'audit'
  >('anomalies');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const [anomalies, setAnomalies] = useState<LeakAnomaly[]>([]);
  const [leakTotals, setLeakTotals] = useState<Pick<LeaksResponse, 'activeLeakageSAR' | 'protectedAmountSAR' | 'highSeverityCount' | 'totalCases'> | null>(null);
  const [analytics, setAnalytics] = useState<FinancialAnalytics | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeState>(null);
  const [processingCaseId, setProcessingCaseId] = useState<string | null>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[] | null>(null);
  const [auditLoading, setAuditLoading] = useState<boolean>(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    if (!isAuthenticated) {
      setAnomalies([]);
      setLeakTotals(null);
      setAnalytics(null);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [leaksRes, analyticsRes] = await Promise.all([
        api.getFinancialLeaks(),
        api.getFinancialAnalytics()
      ]);
      setAnomalies(leaksRes.anomalies || []);
      setLeakTotals({
        activeLeakageSAR: leaksRes.activeLeakageSAR || 0,
        protectedAmountSAR: leaksRes.protectedAmountSAR || 0,
        highSeverityCount: leaksRes.highSeverityCount || 0,
        totalCases: leaksRes.totalCases || 0
      });
      setAnalytics(analyticsRes);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : (isAr ? 'تعذر تحميل سجلات التدقيق المالي.' : 'Failed to fetch financial audit records.')
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isAr]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const fetchAuditLogs = useCallback(async () => {
    if (!isAuthenticated) return;
    setAuditLoading(true);
    setAuditError(null);
    try {
      const res = await api.getTenantAuditLogs();
      setAuditLogs((res.logs || []) as AuditLogEntry[]);
    } catch (err) {
      setAuditError(
        err instanceof Error
          ? err.message
          : (isAr ? 'تعذر تحميل سجل التدقيق.' : 'Failed to fetch the audit trail.')
      );
    } finally {
      setAuditLoading(false);
    }
  }, [isAuthenticated, isAr]);

  // Load the audit trail lazily the first time its tab is opened
  useEffect(() => {
    if (activeTab === 'audit' && auditLogs === null && !auditLoading && !auditError) {
      fetchAuditLogs();
    }
  }, [activeTab, auditLogs, auditLoading, auditError, fetchAuditLogs]);

  const showNotice = (state: NoticeState) => {
    setNotice(state);
    setTimeout(() => setNotice(null), 5000);
  };

  const handleResolve = async (anomalyId: string, action: 'FREEZE' | 'LEGITIMATE') => {
    setProcessingCaseId(anomalyId);
    try {
      await api.resolveFinancialLeak(anomalyId, action);
      showNotice({
        type: 'success',
        message: action === 'FREEZE'
          ? (isAr ? 'تم تجميد أمر الصرف وإحالة الفاتورة إلى التدقيق.' : 'Disbursement frozen and the invoice was locked for audit.')
          : (isAr ? 'تم اعتماد الحالة كمشروعة واستبعاد الشبهة.' : 'Case verified as legitimate and dismissed.')
      });
      await fetchRecords();
    } catch (err) {
      showNotice({
        type: 'error',
        message: err instanceof Error
          ? err.message
          : (isAr ? 'تعذر تنفيذ الإجراء.' : 'Failed to execute the action.')
      });
    } finally {
      setProcessingCaseId(null);
    }
  };

  const formatAmount = (value: number | string, code?: string) =>
    `${(Number(value) || 0).toLocaleString()} ${code || 'SAR'}`;

  const formatDate = (value: string) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleString(isAr ? 'ar-SA' : 'en-US');
    } catch {
      return '—';
    }
  };

  const severityBadgeClass = (severity: string) => {
    const s = (severity || '').toLowerCase();
    if (s === 'critical') return 'ml-badge ml-badge--danger';
    if (s === 'high') return 'ml-badge ml-badge--warning';
    if (s === 'medium') return 'ml-badge ml-badge--info';
    return 'ml-badge';
  };

  const statusBadgeClass = (status: string) => {
    if (status === 'FROZEN') return 'ml-badge ml-badge--success';
    if (status === 'LEGITIMATE') return 'ml-badge';
    return 'ml-badge ml-badge--warning';
  };

  const filteredAnomalies = anomalies.filter((a) =>
    selectedSeverity === 'all' ? true : (a.severity || '').toLowerCase() === selectedSeverity
  );

  const openCases = anomalies.filter((a) => a.status === 'DETECTED');
  const frozenCases = anomalies.filter((a) => a.status === 'FROZEN');
  const rootCauses = [...anomalies].sort(
    (a, b) => (Number(b.flagged_amount) || 0) - (Number(a.flagged_amount) || 0)
  );
  const avgConfidence = anomalies.length > 0
    ? (anomalies.reduce((acc, a) => acc + (Number(a.confidence_pct) || 0), 0) / anomalies.length).toFixed(1)
    : null;

  const tabs: Array<{ id: typeof activeTab; labelAr: string; labelEn: string }> = [
    { id: 'anomalies', labelAr: 'الحالات النشطة', labelEn: 'Active Cases' },
    { id: 'charts', labelAr: 'التحليلات والرسوم البيانية', labelEn: 'Charts & Analytics' },
    { id: 'causes', labelAr: 'التحليل السببي', labelEn: 'Causal Analysis' },
    { id: 'reconciliation', labelAr: 'المطابقة الثلاثية', labelEn: '3-Way Reconciliation' },
    { id: 'audit', labelAr: 'سجل التدقيق', labelEn: 'Audit Trail' }
  ];

  return (
    <div className="platform-page-container">
      <PageHeader
        locale={locale}
        icon={<IconFinance size={22} />}
        breadcrumb={[isAr ? 'المنصة' : 'Platform', isAr ? 'محركات الذكاء' : 'Intelligence Engines']}
        title={isAr ? 'الذكاء المالي والتدقيق الجنائي' : 'Financial Intelligence & Forensic Audit'}
        subtitle={
          isAr
            ? 'فحص تفصيلي للتدفقات المالية التشغيلية، رصد الانحرافات عن النطاقات المرجعية، والتحقق من سلامة المطالبات عبر مطابقة أوامر الشراء وسندات الاستلام والفواتير.'
            : 'Detailed examination of operational financial flows, detection of variances against reference baselines, and claim verification through purchase order, receipt, and invoice reconciliation.'
        }
        action={
          <button onClick={onBack} className="ml-btn ml-btn--ghost ml-btn--sm">
            <IconArrowRight size={14} style={{ transform: 'scaleX(-1)' }} />
            <span>{isAr ? 'العودة إلى النظرة العامة' : 'Back to Overview'}</span>
          </button>
        }
      />

      {!isAuthenticated ? (
        <EmptyState
          icon={<IconLock size={30} />}
          title={isAr ? 'سجّل الدخول لعرض تقارير التدقيق لمؤسستك' : 'Sign in to view your organization’s audit records'}
          description={
            isAr
              ? 'تُسترجع حالات التدقيق والتحليلات وسجل الأحداث مباشرة من مساحة عمل مؤسستك بعد تسجيل الدخول.'
              : 'Audit cases, analytics, and the governance event trail are loaded directly from your organization workspace after signing in.'
          }
          action={
            <button onClick={openAuthModal} className="ml-btn ml-btn--primary">
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </button>
          }
        />
      ) : (
        <>
          {/* Live KPI tiles */}
          {leakTotals && (
            <div className="stat-grid">
              <div className="stat-tile">
                <div className="stat-tile__label">{isAr ? 'إجمالي الحالات المرصودة' : 'Total Flagged Cases'}</div>
                <div className="stat-tile__value">{leakTotals.totalCases}</div>
                <div className="stat-tile__hint">{isAr ? 'حالات مطابقة ومراجعة' : 'Cases under reconciliation review'}</div>
              </div>
              <div className="stat-tile">
                <div className="stat-tile__label">{isAr ? 'قيمة الانحرافات النشطة' : 'Active Flagged Amount'}</div>
                <div className="stat-tile__value">{formatAmount(leakTotals.activeLeakageSAR)}</div>
                <div className="stat-tile__hint">{isAr ? 'قيد التحقق قبل أي إجراء' : 'Pending verification before action'}</div>
              </div>
              <div className="stat-tile">
                <div className="stat-tile__label">{isAr ? 'المبالغ المحمية بالتجميد' : 'Protected by Freeze'}</div>
                <div className="stat-tile__value">{formatAmount(leakTotals.protectedAmountSAR)}</div>
                <div className="stat-tile__hint">{isAr ? 'مدفوعات أُوقفت بنجاح' : 'Disbursements successfully held'}</div>
              </div>
              <div className="stat-tile">
                <div className="stat-tile__label">{isAr ? 'حالات عالية الخطورة' : 'High Severity Cases'}</div>
                <div className="stat-tile__value">{leakTotals.highSeverityCount}</div>
                <div className="stat-tile__hint">{isAr ? 'تتطلب مراجعة عاجلة' : 'Requires prompt review'}</div>
              </div>
            </div>
          )}

          {notice && (
            <div className={`alert-feedback-banner ${notice.type === 'success' ? 'success' : 'error'}`}>
              {notice.type === 'success' ? <IconCheckCircle size={16} /> : <IconAlert size={16} />}
              <span>{notice.message}</span>
            </div>
          )}

          {/* Domain tabs */}
          <div className="segmented-control" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`segmented-control__item ${activeTab === tab.id ? 'is-active' : ''}`}
              >
                {isAr ? tab.labelAr : tab.labelEn}
              </button>
            ))}
          </div>

          {/* Main fetch error with retry */}
          {error && (
            <EmptyState
              icon={<IconAlert size={30} />}
              title={isAr ? 'تعذر تحميل سجلات التدقيق المالي' : 'Unable to load financial audit records'}
              description={error}
              action={
                <button onClick={fetchRecords} className="ml-btn ml-btn--primary">
                  {isAr ? 'إعادة المحاولة' : 'Retry'}
                </button>
              }
            />
          )}

          {/* TAB: Active cases */}
          {activeTab === 'anomalies' && !error && (
            <div className="va-section-gap">
              <div className="page-filter-bar">
                <div className="filter-group">
                  <span className="filter-label">{isAr ? 'مستوى الخطورة:' : 'Severity:'}</span>
                  {['all', 'critical', 'high', 'medium', 'low'].map((sev) => {
                    const count = sev === 'all'
                      ? anomalies.length
                      : anomalies.filter((a) => (a.severity || '').toLowerCase() === sev).length;
                    return (
                      <button
                        key={sev}
                        onClick={() => setSelectedSeverity(sev)}
                        className={`filter-chip ${selectedSeverity === sev ? 'active' : ''}`}
                      >
                        {sev === 'all' ? (isAr ? 'الكل' : 'All') : sev.toUpperCase()} ({count})
                      </button>
                    );
                  })}
                </div>
                <button onClick={fetchRecords} className="ml-btn ml-btn--subtle ml-btn--sm">
                  <IconRefresh size={13} />
                  <span>{isAr ? 'تحديث' : 'Refresh'}</span>
                </button>
              </div>

              {isLoading ? (
                <div className="skeleton-grid">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="skeleton-card" />
                  ))}
                </div>
              ) : filteredAnomalies.length === 0 ? (
                <EmptyState
                  icon={<IconCheckCircle size={30} />}
                  title={selectedSeverity === 'all'
                    ? (isAr ? 'لا توجد حالات انحراف مرصودة' : 'No variance cases detected')
                    : (isAr ? 'لا توجد حالات بهذا المستوى من الخطورة' : 'No cases at this severity level')}
                  description={
                    selectedSeverity === 'all'
                      ? (isAr
                          ? 'تُفحص الفواتير والقيود المرتبطة بمؤسستك باستمرار؛ تظهر الحالات هنا فور رصد أي انحراف عن أوامر الشراء وسندات الاستلام.'
                          : 'Your connected invoices and ledger entries are monitored continuously; cases appear here the moment a variance is detected against purchase orders and receipts.')
                      : (isAr
                          ? 'لا توجد حالات بهذا المستوى من الخطورة حالياً.'
                          : 'There are no cases at this severity level right now.')
                  }
                />
              ) : (
                <div className="record-list">
                  {filteredAnomalies.map((item) => (
                    <div key={item.id} className="record-row" style={{ alignItems: 'flex-start' }}>
                      <div className="record-row__main">
                        <div className="va-row-head">
                          <div className="va-tags">
                            <span className={severityBadgeClass(item.severity)}>
                              <span className="ml-dot" />
                              {(item.severity || '').toUpperCase()}
                            </span>
                            <span className={statusBadgeClass(item.status)}>{item.status}</span>
                            <span className="va-mono-id">{item.case_number}</span>
                          </div>
                          <span className="va-amount va-amount--danger">
                            {formatAmount(item.flagged_amount, item.currency)}
                          </span>
                        </div>

                        <div className="record-row__title" style={{ marginTop: 6 }}>{item.target_vendor}</div>
                        <div className="record-row__meta">{isAr ? item.narrative_ar : item.narrative_en}</div>

                        <div className="va-metric-grid">
                          <div className="va-metric">
                            <span className="va-metric__k">{isAr ? 'قاعدة الرصد' : 'Detection Rule'}</span>
                            <span className="va-metric__v va-metric__v--accent">{item.rule_code}</span>
                          </div>
                          <div className="va-metric">
                            <span className="va-metric__k">{isAr ? 'درجة الثقة' : 'Confidence'}</span>
                            <span className="va-metric__v">{Number(item.confidence_pct || 0).toFixed(1)}%</span>
                          </div>
                          <div className="va-metric">
                            <span className="va-metric__k">{isAr ? 'تاريخ الرصد' : 'Detected At'}</span>
                            <span className="va-metric__v va-metric__v--muted">{formatDate(item.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="record-row__actions">
                        {item.status === 'DETECTED' ? (
                          <>
                            <button
                              disabled={processingCaseId === item.id}
                              onClick={() => handleResolve(item.id, 'LEGITIMATE')}
                              className="ml-btn ml-btn--subtle ml-btn--sm"
                            >
                              <IconCheckCircle size={14} />
                              <span>{isAr ? 'مشروعة' : 'Legitimate'}</span>
                            </button>
                            <button
                              disabled={processingCaseId === item.id}
                              onClick={() => handleResolve(item.id, 'FREEZE')}
                              className="ml-btn ml-btn--primary ml-btn--sm"
                            >
                              <IconShield size={14} />
                              <span>{isAr ? 'تجميد الصرف' : 'Freeze Disbursement'}</span>
                            </button>
                          </>
                        ) : (
                          <span className="va-resolved-flag">
                            <IconCheckCircle size={15} />
                            <span>
                              {item.status === 'FROZEN'
                                ? (isAr ? 'مُجمّد ومسجّل' : 'Frozen & Recorded')
                                : (isAr ? 'مُعتمد كمشروعة' : 'Verified Legitimate')}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: Charts & analytics */}
          {activeTab === 'charts' && !error && (
            <FinancialCharts locale={locale} analytics={analytics} isLoading={isLoading} />
          )}

          {/* TAB: Causal analysis */}
          {activeTab === 'causes' && !error && (
            isLoading ? (
              <div className="skeleton-grid va-section-gap">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="skeleton-card" />
                ))}
              </div>
            ) : anomalies.length === 0 ? (
              <div className="va-section-gap">
                <EmptyState
                  icon={<IconFileText size={30} />}
                  title={isAr ? 'لا تتوفر حالات لتحليل أسبابها' : 'No cases available for causal analysis'}
                  description={
                    isAr
                      ? 'يحلّل المحرك السببي الأسباب الجذرية ويولّد التوصيات فور رصد أول انحراف في سجلات مؤسستك المرتبطة.'
                      : 'The causal engine diagnoses root causes and generates recommendations as soon as the first variance is detected in your connected records.'
                  }
                />
              </div>
            ) : (
              <div className="va-stack va-section-gap">
                <div className="ml-panel">
                  <div className="ml-panel__head">
                    <h2 className="ml-title" style={{ fontSize: 16 }}>
                      {isAr ? 'ملخص تحليلي تنفيذي' : 'Executive Analytical Summary'}
                    </h2>
                    <span className="ml-badge ml-badge--danger">
                      {anomalies.length} {isAr ? 'حالات' : 'Cases'}
                    </span>
                  </div>
                  <div className="ml-panel__body">
                    <div className="va-metric-grid">
                      <div className="va-metric">
                        <span className="va-metric__k">{isAr ? 'قيمة الانحرافات النشطة' : 'Active Flagged Amount'}</span>
                        <span className="va-metric__v va-metric__v--danger">{formatAmount(leakTotals?.activeLeakageSAR || 0)}</span>
                      </div>
                      <div className="va-metric">
                        <span className="va-metric__k">{isAr ? 'المبالغ المحمية' : 'Protected Amount'}</span>
                        <span className="va-metric__v va-metric__v--success">{formatAmount(leakTotals?.protectedAmountSAR || 0)}</span>
                      </div>
                      <div className="va-metric">
                        <span className="va-metric__k">{isAr ? 'حالات عالية الخطورة' : 'High Severity Cases'}</span>
                        <span className="va-metric__v va-metric__v--warning">{leakTotals?.highSeverityCount || 0}</span>
                      </div>
                      <div className="va-metric">
                        <span className="va-metric__k">{isAr ? 'متوسط درجة الثقة' : 'Average Confidence'}</span>
                        <span className="va-metric__v">{avgConfidence ? `${avgConfidence}%` : '—'}</span>
                      </div>
                    </div>
                    <p className="ml-body" style={{ marginTop: 'var(--space-4)' }}>
                      {isAr
                        ? 'تعرض القائمة أدناه أبرز الأسباب الجذرية مرتبة حسب قيمة الانحراف المسجّلة لكل حالة، وفق واقع سجلات مؤسستك.'
                        : 'The list below ranks the leading root causes by recorded variance value for each case, based on your organization’s actual records.'}
                    </p>
                  </div>
                </div>

                <div className="ml-panel">
                  <div className="ml-panel__head">
                    <h2 className="ml-title" style={{ fontSize: 16 }}>
                      {isAr ? 'الأسباب الجذرية الأعلى أثراً' : 'Top Root-Cause Drivers'}
                    </h2>
                  </div>
                  <div className="ml-panel__body">
                    <div className="record-list">
                      {rootCauses.slice(0, 5).map((cause, idx) => (
                        <div key={cause.id} className="record-row">
                          <div className="record-row__main">
                            <div className="va-row-head">
                              <div className="va-tags">
                                <span className={severityBadgeClass(cause.severity)}>
                                  <span className="ml-dot" />
                                  {(cause.severity || '').toUpperCase()}
                                </span>
                                <span className="va-mono-id">
                                  {isAr ? `السبب ${idx + 1}` : `Cause ${idx + 1}`} · {cause.rule_code}
                                </span>
                              </div>
                              <span className="va-amount va-amount--danger">
                                {formatAmount(cause.flagged_amount, cause.currency)}
                              </span>
                            </div>
                            <div className="record-row__title" style={{ marginTop: 6 }}>{cause.target_vendor}</div>
                            <div className="record-row__meta">{isAr ? cause.narrative_ar : cause.narrative_en}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="ml-panel">
                  <div className="ml-panel__head">
                    <h2 className="ml-title" style={{ fontSize: 16 }}>
                      {isAr ? 'ضوابط التحكم المتاحة' : 'Available Control Gates'}
                    </h2>
                  </div>
                  <div className="ml-panel__body">
                    <div className="record-list">
                      <div className="record-row">
                        <div className="record-row__main">
                          <div className="record-row__title">
                            {isAr ? 'بوابة المطابقة قبل الصرف' : 'Pre-Disbursement Matching Gate'}
                          </div>
                          <div className="record-row__meta">
                            {isAr
                              ? 'منع تمرير أي أمر صرف إلا بعد تحقق النظام آلياً من وجود سند استلام معتمد وتطابق أمر الشراء المرتبط.'
                              : 'No payment order passes until the system automatically confirms an approved receipt note and a matching purchase order.'}
                          </div>
                        </div>
                      </div>
                      <div className="record-row">
                        <div className="record-row__main">
                          <div className="record-row__title">
                            {isAr ? 'ضوابط حدود الصلاحيات' : 'Delegation Limit Controls'}
                          </div>
                          <div className="record-row__meta">
                            {isAr
                              ? 'رصد أنماط تقسيم الفواتير لتجاوز حدود الاعتماد، مع إحالة الحالات المشبوهة إلى المراجعة قبل الصرف.'
                              : 'Detection of invoice-splitting patterns that bypass approval thresholds, with suspicious cases routed to review before disbursement.'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          {/* TAB: 3-way reconciliation */}
          {activeTab === 'reconciliation' && !error && (
            <div className="va-stack va-section-gap">
              <div className="ml-panel">
                <div className="ml-panel__head">
                  <h2 className="ml-title" style={{ fontSize: 16 }}>
                    {isAr ? 'المطابقة الثلاثية: أمر الشراء + سند الاستلام + الفاتورة' : '3-Way Match: Purchase Order + Receipt + Invoice'}
                  </h2>
                </div>
                <div className="ml-panel__body">
                  <p className="ml-body" style={{ margin: 0 }}>
                    {isAr
                      ? 'تُطابق المطالبات الواردة آلياً بين أوامر الشراء المعتمدة وسندات استلام البضائع وفواتير الموردين؛ ويُعلَّق أي تباين في الكمية أو السعر أو التوريد تلقائياً إلى أن يُحسم عبر إجراء تدقيقي.'
                      : 'Incoming claims are automatically cross-referenced between approved purchase orders, goods receipt notes, and vendor invoices; any quantity, price, or delivery variance is held automatically until resolved through an audit action.'}
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="skeleton-grid">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="skeleton-card" />
                  ))}
                </div>
              ) : anomalies.length === 0 ? (
                <EmptyState
                  icon={<IconFileText size={30} />}
                  title={isAr ? 'لا توجد حالات مطابقة مفتوحة' : 'No reconciliation cases open'}
                  description={
                    isAr
                      ? 'تظهر حالات عدم التطابق هنا فور ربط الفواتير وأوامر الشراء وسندات الاستلام بمساحة عمل مؤسستك.'
                      : 'Mismatch cases appear here as soon as invoices, purchase orders, and receipt notes are connected to your organization workspace.'
                  }
                />
              ) : (
                <div className="stat-grid">
                  <div className="stat-tile">
                    <div className="stat-tile__label">{isAr ? 'حالات مفتوحة' : 'Open Cases'}</div>
                    <div className="stat-tile__value">{openCases.length}</div>
                    <div className="stat-tile__hint">{isAr ? 'بانتظار إجراء تدقيقي' : 'Awaiting an audit action'}</div>
                  </div>
                  <div className="stat-tile">
                    <div className="stat-tile__label">{isAr ? 'حالات مُجمّدة' : 'Frozen Cases'}</div>
                    <div className="stat-tile__value">{frozenCases.length}</div>
                    <div className="stat-tile__hint">{isAr ? 'صرف موقوف ومسجّل' : 'Disbursement held and recorded'}</div>
                  </div>
                  <div className="stat-tile">
                    <div className="stat-tile__label">{isAr ? 'المبالغ المحمية' : 'Protected Amount'}</div>
                    <div className="stat-tile__value">{formatAmount(leakTotals?.protectedAmountSAR || 0)}</div>
                    <div className="stat-tile__hint">{isAr ? 'وفقاً لسجل التجميد الفعلي' : 'Per the actual freeze record'}</div>
                  </div>
                  <div className="stat-tile">
                    <div className="stat-tile__label">{isAr ? 'إجمالي الحالات' : 'Total Cases'}</div>
                    <div className="stat-tile__value">{leakTotals?.totalCases || 0}</div>
                    <div className="stat-tile__hint">{isAr ? 'كل مستويات الخطورة' : 'All severity levels'}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: Immutable audit trail (real tenant audit logs) */}
          {activeTab === 'audit' && !error && (
            <div className="ml-panel va-section-gap">
              <div className="ml-panel__head">
                <h2 className="ml-title" style={{ fontSize: 16 }}>
                  {isAr ? 'سجل أحداث التدقيق لمساحة العمل' : 'Workspace Audit Event Trail'}
                </h2>
                <button onClick={fetchAuditLogs} className="ml-btn ml-btn--subtle ml-btn--sm">
                  <IconRefresh size={13} />
                  <span>{isAr ? 'تحديث' : 'Refresh'}</span>
                </button>
              </div>
              <div className="ml-panel__body">
                {auditLoading ? (
                  <div className="skeleton-grid">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="skeleton-card" />
                    ))}
                  </div>
                ) : auditError ? (
                  <EmptyState
                    compact
                    icon={<IconAlert size={26} />}
                    title={isAr ? 'تعذر تحميل سجل التدقيق' : 'Unable to load the audit trail'}
                    description={auditError}
                    action={
                      <button onClick={fetchAuditLogs} className="ml-btn ml-btn--primary">
                        {isAr ? 'إعادة المحاولة' : 'Retry'}
                      </button>
                    }
                  />
                ) : auditLogs === null || auditLogs.length === 0 ? (
                  <EmptyState
                    compact
                    icon={<IconFileText size={26} />}
                    title={isAr ? 'لا توجد أحداث تدقيق مسجلة بعد' : 'No audit events recorded yet'}
                    description={
                      isAr
                        ? 'يُسجَّل كل إجراء تشغيلي (رصد، تجميد، اعتماد، تحيين) في سجل غير قابل للتعديل فور تنفيذه، ويظهر هنا مباشرة.'
                        : 'Every operational action (detection, freeze, approval, update) is written to an immutable log the moment it executes, and appears here immediately.'
                    }
                  />
                ) : (
                  <div className="record-list">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="record-row">
                        <div className="record-row__main">
                          <div className="va-row-head">
                            <span className="va-mono-id" style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-light)' }}>
                              {log.action}
                            </span>
                            <span className="va-log-time">{formatDate(log.created_at)}</span>
                          </div>
                          <div className="record-row__meta">
                            {log.entity_type}
                            {log.entity_id ? ` · ${String(log.entity_id).substring(0, 8).toUpperCase()}` : ''}
                            {log.ip_address ? ` · ${log.ip_address}` : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
