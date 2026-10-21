// MIKHLAFI LABS — Executive Decision Center
// All records are loaded exclusively from the authenticated backend.
// No simulated or demonstration records are ever rendered.

import React, { useState, useEffect, useCallback } from 'react';
import { LocaleMode } from '../../types';
import { IconDecisions, IconCheck, IconClock, IconFilter, IconArrowRight, IconAlert } from '../Icons';
import { useAuth } from '../../context/AuthContext';
import { api, RealDecisionItem } from '../../api/client';
import { EmptyState } from '../common/EmptyState';
import { PageHeader } from '../common/PageHeader';

interface DecisionsViewProps {
  locale: LocaleMode;
  onNavigateDetail?: (id: string) => void;
}

export const DecisionsView: React.FC<DecisionsViewProps> = ({ locale, onNavigateDetail }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated, tenant, openAuthModal } = useAuth();
  const [realDecisions, setRealDecisions] = useState<RealDecisionItem[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchRealDecisions = useCallback(async () => {
    if (!isAuthenticated) {
      setRealDecisions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.getDecisions();
      setRealDecisions(res.decisions || []);
    } catch {
      setRealDecisions([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchRealDecisions();
  }, [fetchRealDecisions, tenant?.organizationId]);

  const handleExecuteDecision = async (id: string) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    try {
      await api.executeDecision(id);
      setActionFeedback({ type: 'success', message: isAr ? 'تم اعتماد القرار وتسجيل حدث التدقيق.' : 'Decision executed & audit event recorded.' });
      await fetchRealDecisions();
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || (isAr ? 'تعذر تنفيذ القرار.' : 'Unable to execute decision.') });
    }
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const filteredDecisions = realDecisions.filter((d) => {
    if (filterPriority === 'all') return true;
    return (d.risk_level || '').toLowerCase() === filterPriority;
  });

  const totalActiveImpact = realDecisions.reduce((sum, d) => sum + (Number(d.impact_amount) || 0), 0);

  const counts = {
    all: realDecisions.length,
    critical: realDecisions.filter((d) => (d.risk_level || '').toLowerCase() === 'critical').length,
    high: realDecisions.filter((d) => (d.risk_level || '').toLowerCase() === 'high').length
  };

  return (
    <div className="platform-page-container">
      <PageHeader
        locale={locale}
        icon={<IconDecisions size={22} />}
        breadcrumb={[isAr ? 'المنصة' : 'Platform', isAr ? 'محركات الذكاء' : 'Intelligence Suite']}
        title={isAr ? 'مركز القرارات التنفيذية' : 'Executive Decision Center'}
        subtitle={
          isAr
            ? 'تحويل الإشارات والانحرافات المرصودة إلى قرارات قيادية مرتبة حسب الأولوية، مدعومة بالأدلة وتتبّع الأثر.'
            : 'Translating detected signals and variance into prioritized executive actions with evidence and impact tracking.'
        }
        action={
          <div className="kpi-micro-badge">
            <span className="label">{isAr ? 'إجمالي الأثر المالي النشط' : 'Active Financial Impact'}</span>
            <span className="value">
              {isAuthenticated ? `${totalActiveImpact.toLocaleString()} ${tenant?.currency || 'SAR'}` : '—'}
            </span>
          </div>
        }
      />

      {actionFeedback && (
        <div className={`alert-feedback-banner ${actionFeedback.type === 'error' ? 'error' : 'success'}`}>
          {actionFeedback.type === 'error' ? <IconAlert size={16} /> : <IconCheck size={16} />}
          <span>{actionFeedback.message}</span>
        </div>
      )}

          {!isAuthenticated ? (
            <EmptyState
              icon={<IconDecisions size={30} />}
              title={isAr ? 'سجّل الدخول لعرض قرارات مؤسستك' : 'Sign in to view your organization’s decisions'}
              description={
                isAr
                  ? 'تُسترجَع القرارات التنفيذية مباشرة من مساحة عمل مؤسستك بعد تسجيل الدخول.'
                  : 'Executive decisions are loaded directly from your organization workspace after signing in.'
              }
              action={
                <button onClick={openAuthModal} className="btn-primary">
                  {isAr ? 'تسجيل الدخول' : 'Sign In'}
                </button>
              }
            />
          ) : (
            <>
              <div className="page-filter-bar">
                <div className="filter-group">
                  <IconFilter size={14} />
                  <span className="filter-label">{isAr ? 'الأولوية:' : 'Priority:'}</span>
                  <button onClick={() => setFilterPriority('all')} className={`filter-chip ${filterPriority === 'all' ? 'active' : ''}`}>
                    {isAr ? `الكل (${counts.all})` : `All (${counts.all})`}
                  </button>
                  <button onClick={() => setFilterPriority('critical')} className={`filter-chip ${filterPriority === 'critical' ? 'active' : ''}`}>
                    <span className="dot critical" />
                    {isAr ? `حرجة (${counts.critical})` : `Critical (${counts.critical})`}
                  </button>
                  <button onClick={() => setFilterPriority('high')} className={`filter-chip ${filterPriority === 'high' ? 'active' : ''}`}>
                    <span className="dot high" />
                    {isAr ? `عالية (${counts.high})` : `High (${counts.high})`}
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="skeleton-grid">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="skeleton-card" />
                  ))}
                </div>
              ) : filteredDecisions.length === 0 ? (
                <EmptyState
                  icon={<IconDecisions size={30} />}
                  title={isAr ? 'لا توجد قرارات تنفيذية معلّقة' : 'No pending executive decisions'}
                  description={
                    isAr
                      ? 'تُنشأ القرارات التنفيذية تلقائياً عند رصد انحرافات في الأسعار أو المطالبات أو المؤشرات التشغيلية المرتبطة بمصادر بيانات مؤسستك.'
                      : 'Executive decisions are created automatically when deviations are detected across supplier pricing, claims, or operational signals from your connected data sources.'
                  }
                />
              ) : (
                <div className="decisions-grid">
                  {filteredDecisions.map((decision) => (
                    <article key={decision.id} className={`decision-card priority-${decision.risk_level}`}>
                      <div className="decision-card-header">
                        <div className="badge-row">
                          <span className={`severity-tag ${decision.risk_level}`}>{(decision.risk_level || '').toUpperCase()}</span>
                          <span className="decision-code">DEC-{decision.id.substring(0, 6).toUpperCase()}</span>
                        </div>
                        <div className="decision-financial">
                          <span className="label">{isAr ? 'الأثر المالي الموثق' : 'Verified Impact'}</span>
                          <span className="amount">
                            {(Number(decision.impact_amount) || 0).toLocaleString()} {decision.currency || 'SAR'}
                          </span>
                        </div>
                      </div>

                      <h3 className="decision-title">{decision.title}</h3>

                      <p className="decision-impact-desc">
                        {isAr
                          ? `قرار تشغيلي ضمن تصنيف ${decision.category}. يتطلب اعتماد المسؤول التنفيذي لتنفيذه وتسجيله في سجل التدقيق.`
                          : `Operational decision in the ${decision.category} category. Requires authorized executive execution and audit logging.`}
                      </p>

                      <div className="decision-meta-grid">
                        <div className="meta-item">
                          <span className="meta-k">{isAr ? 'المؤسسة:' : 'Tenant:'}</span>
                          <span className="meta-v">{tenant?.orgNameEn || '—'}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-k">{isAr ? 'تاريخ الإنشاء:' : 'Created:'}</span>
                          <span className="meta-v date">
                            <IconClock size={12} />
                            {new Date(decision.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-k">{isAr ? 'الحالة:' : 'Status:'}</span>
                          <span
                            className="meta-v status-pill"
                            style={{ color: decision.status === 'executed' ? 'var(--status-success)' : undefined }}
                          >
                            {decision.status === 'executed'
                              ? isAr ? 'منفذ ومدقق' : 'Executed & Audited'
                              : isAr ? 'بانتظار الاعتماد' : 'Pending Approval'}
                          </span>
                        </div>
                      </div>

                      <div className="decision-actions-row">
                        {decision.status === 'executed' ? (
                          <div className="decision-executed-flag">
                            <IconCheck size={16} />
                            <span>{isAr ? 'تم التنفيذ وتسجيل التدقيق' : 'Executed & Audited'}</span>
                          </div>
                        ) : (
                          <button onClick={() => handleExecuteDecision(decision.id)} className="btn-primary">
                            <IconCheck size={14} />
                            <span>{isAr ? 'اعتماد وتنفيذ' : 'Approve & Execute'}</span>
                          </button>
                        )}

                        {onNavigateDetail && (
                          <button
                            onClick={() => onNavigateDetail(decision.id)}
                            className="ctrl-btn"
                            style={{ marginInlineStart: 'auto' }}
                          >
                            <span>{isAr ? 'ملف الأدلة' : 'Case Files'}</span>
                            <IconArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
    </div>
  );
};
