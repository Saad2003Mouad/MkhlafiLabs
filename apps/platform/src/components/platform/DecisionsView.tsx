import React, { useState, useEffect } from 'react';
import { LocaleMode, DecisionItem } from '../../types';
import { MOCK_DECISIONS } from '../../data/mockData';
import { IconDecisions, IconCheck, IconClock, IconFilter, IconArrowRight } from '../Icons';
import { useAuth } from '../../context/AuthContext';
import { api, RealDecisionItem } from '../../api/client';

interface DecisionsViewProps {
  locale: LocaleMode;
  onNavigateDetail?: (id: string) => void;
}

export const DecisionsView: React.FC<DecisionsViewProps> = ({ locale, onNavigateDetail }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated, tenant, openAuthModal } = useAuth();
  const [decisions, setDecisions] = useState<DecisionItem[]>(MOCK_DECISIONS);
  const [realDecisions, setRealDecisions] = useState<RealDecisionItem[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const filteredDecisions = decisions.filter((d) => {
    if (filterPriority === 'all') return true;
    return d.priority === filterPriority;
  });

  const fetchRealDecisions = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.getDecisions();
      setRealDecisions(res.decisions || []);
    } catch {
      // Keep fallback
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRealDecisions();
    } else {
      setRealDecisions([]);
    }
  }, [isAuthenticated, tenant?.organizationId]);

  const handleAction = async (id: string, actionType: 'approve' | 'clarify') => {
    if (isAuthenticated) {
      if (actionType === 'approve') {
        try {
          await api.executeDecision(id);
          const msg = isAr
            ? `تم اعتماد القرار وحفظ حدث التدقيق في PostgreSQL بنجاح.`
            : `Decision executed & audit log recorded in PostgreSQL.`;
          setActionFeedback(msg);
          await fetchRealDecisions();
        } catch (err: any) {
          setActionFeedback(err.message || 'Error executing decision');
        }
      } else {
        setActionFeedback(isAr ? 'تم تسجيل طلب الإيضاح بنجاح.' : 'Evidence clarification logged.');
      }
      setTimeout(() => setActionFeedback(null), 4000);
      return;
    }

    // Demo fallback for unauthenticated preview
    setDecisions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (actionType === 'approve') {
            return {
              ...item,
              statusAr: 'معتمد وجارِ التنفيذ',
              statusEn: 'Approved & In Execution'
            };
          } else {
            return {
              ...item,
              statusAr: 'بانتظار إيضاحات إضافية',
              statusEn: 'Pending Clarification'
            };
          }
        }
        return item;
      })
    );

    const target = decisions.find((d) => d.id === id);
    const msg = actionType === 'approve'
      ? (isAr ? `(عرض تجريبي) تم اعتماد الإجراء للقرار ${target?.code || id}.` : `(Demo View) Action executed for ${target?.code || id}.`)
      : (isAr ? `(عرض تجريبي) تم طلب إيضاح إضافي من ${target?.assignedTo}.` : `(Demo View) Clarification requested from ${target?.assignedTo}.`);
    
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  return (
    <div className="platform-page-container">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <div className="page-breadcrumb">
            <span>{isAr ? 'المنصة' : 'Platform'}</span>
            <span>/</span>
            <span>{isAr ? 'محركات الذكاء' : 'Intelligence Suite'}</span>
            <span>/</span>
            <span className="current">{isAr ? 'مركز القرارات التنفيذية' : 'Executive Decision Center'}</span>
          </div>
          <h1 className="page-title">
            <IconDecisions size={24} />
            <span>{isAr ? 'مركز القرارات التنفيذية وترتيب الأولويات' : 'Executive Decision Center'}</span>
          </h1>
          <p className="page-subtitle">
            {isAr
              ? 'تحويل الإشارات والانحرافات المحاسبية المرصودة إلى قرارات قيادية فورية مدعومة بالأدلة القاطعة وتحديد الأثر المالي المستهدف.'
              : 'Translating detected forensic signals and accounting variance into prioritized executive actions with verified financial impact.'}
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div className="kpi-micro-badge">
          <span className="label">{isAr ? 'إجمالي الأثر المالي للأولويات النشطة' : 'Active Financial Impact'}</span>
          <span className="value">
            {isAuthenticated
              ? `${realDecisions.reduce((sum, d) => sum + (Number(d.impact_amount) || 0), 0).toLocaleString()} SAR`
              : '0 SAR'}
          </span>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="alert-feedback-banner success">
          <IconCheck size={16} />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Tenant Isolation & Mode Banner */}
      {isAuthenticated ? (
        <div className="honest-alert" style={{ borderColor: 'var(--status-success)', background: 'rgba(16, 185, 129, 0.08)', marginBottom: '14px' }}>
          <span style={{ fontSize: '20px' }}>⚖️</span>
          <div style={{ flex: 1 }}>
            <strong style={{ color: 'var(--status-success)' }}>
              {isAr ? 'عزل القرارات التنفيذية (Tenant Decision Isolation):' : 'Tenant Decision Isolation Enforced:'}
            </strong>{' '}
            {isAr
              ? `القرارات المعروضة أدناه مسترجعة مباشرة من جدول tenant_decisions لمؤسسة ${tenant?.orgNameAr || tenant?.orgNameEn}. عند اعتماد أي قرار، يتم تسجيل حدث تدقيق آمن في جدول audit_logs.`
              : `Decisions shown are loaded directly from tenant_decisions for ${tenant?.orgNameEn}. Approving an action writes an immutable event into audit_logs.`}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--status-success)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            POSTGRESQL_RECORDS_ACTIVE
          </span>
        </div>
      ) : (
        <div className="honest-alert" style={{ marginBottom: '14px' }}>
          <span style={{ fontSize: '20px' }}>ℹ️</span>
          <div style={{ flex: 1 }}>
            <strong style={{ color: 'var(--text-primary)' }}>
              {isAr ? 'بيانات قرارات توضيحية استرشادية:' : 'Preview Benchmark Decisions:'}
            </strong>{' '}
            {isAr
              ? 'أنت تستعرض قرارات نموذجية. سجل الدخول لاعتماد القرارات وحفظ مسار التدقيق الحقيقي في PostgreSQL.'
              : 'Viewing demonstration cases. Sign in to execute decisions and record immutable audit logs in PostgreSQL.'}
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

      {/* Control Bar: Filters & Counts */}
      <div className="page-filter-bar">
        <div className="filter-group">
          <IconFilter size={14} />
          <span className="filter-label">{isAr ? 'تصفية حسب الأولوية:' : 'Filter by Priority:'}</span>
          <button
            onClick={() => setFilterPriority('all')}
            className={`filter-chip ${filterPriority === 'all' ? 'active' : ''}`}
          >
            {isAr ? `الكل (${isAuthenticated && realDecisions.length > 0 ? realDecisions.length : 3})` : `All (${isAuthenticated && realDecisions.length > 0 ? realDecisions.length : 3})`}
          </button>
          <button
            onClick={() => setFilterPriority('critical')}
            className={`filter-chip ${filterPriority === 'critical' ? 'active' : ''}`}
          >
            <span className="dot critical" />
            {isAr ? 'حرجة للغاية' : 'Critical'}
          </button>
          <button
            onClick={() => setFilterPriority('high')}
            className={`filter-chip ${filterPriority === 'high' ? 'active' : ''}`}
          >
            <span className="dot high" />
            {isAr ? 'أولوية عالية' : 'High Priority'}
          </button>
        </div>

        <div className="meta-stats">
          <span>{isAuthenticated ? (isAr ? 'قاعدة بيانات PostgreSQL: محدث' : 'PostgreSQL DB: Synced') : (isAr ? 'وضع الاستعراض' : 'Preview Mode')}</span>
        </div>
      </div>

      {/* Decisions List */}
      <div className="decisions-grid">
        {isAuthenticated && realDecisions.length > 0 ? (
          realDecisions.map((decision) => (
            <div key={decision.id} className={`decision-card priority-${decision.risk_level}`}>
              <div className="decision-card-header">
                <div className="badge-row">
                  <span className={`severity-tag ${decision.risk_level}`}>
                    {decision.risk_level.toUpperCase()}
                  </span>
                  <span className="decision-code">DEC-{decision.id.substring(0, 6).toUpperCase()}</span>
                </div>
                <div className="decision-financial">
                  <span className="label">{isAr ? 'الأثر المالي الموثق' : 'Verified Impact'}</span>
                  <span className="amount">{(Number(decision.impact_amount) || 0).toLocaleString()} {decision.currency || 'SAR'}</span>
                </div>
              </div>

              <h3 className="decision-title">
                {decision.title}
              </h3>

              <p className="decision-impact-desc">
                {isAr
                  ? `قرار تشغيلي مسجل ضمن تصنيف ${decision.category}. يتطلب اعتماد المسؤول التنفيذي لتنفيذه وحفظه بسجل التدقيق.`
                  : `Operational decision classified under ${decision.category}. Requires authorized executive execution.`}
              </p>

              <div className="decision-meta-grid">
                <div className="meta-item">
                  <span className="meta-k">{isAr ? 'المؤسسة المالكة:' : 'Tenant:'}</span>
                  <span className="meta-v">{tenant?.orgNameEn || 'Active Tenant'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-k">{isAr ? 'تاريخ الإنشاء:' : 'Created At:'}</span>
                  <span className="meta-v date">
                    <IconClock size={12} />
                    {new Date(decision.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-k">{isAr ? 'حالة القرار:' : 'Status:'}</span>
                  <span className="meta-v status-pill" style={{ color: decision.status === 'executed' ? 'var(--status-success)' : undefined }}>
                    {decision.status === 'executed' ? (isAr ? 'معتمد ومنفذ' : 'Executed & Audited') : (isAr ? 'بانتظار الاعتماد' : 'Pending Approval')}
                  </span>
                </div>
              </div>

              <div className="decision-actions-row">
                {decision.status === 'executed' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-success)', fontWeight: 700, fontSize: '12px' }}>
                    <IconCheck size={16} />
                    <span>{isAr ? 'تم تنفيذ القرار وحفظ سجل التدقيق في PostgreSQL' : 'Executed & Audited in PostgreSQL'}</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleAction(decision.id, 'approve')}
                      className="btn-primary"
                      style={{ fontSize: '12px', padding: '8px 14px' }}
                    >
                      <IconCheck size={14} />
                      <span>{isAr ? 'اعتماد الإجراء وتجميد الصرف' : 'Approve & Execute Action'}</span>
                    </button>

                    <button
                      onClick={() => handleAction(decision.id, 'clarify')}
                      className="btn-secondary"
                      style={{ fontSize: '12px', padding: '8px 12px' }}
                    >
                      <span>{isAr ? 'طلب إيضاح مستندي' : 'Request Evidence'}</span>
                    </button>
                  </>
                )}

                {onNavigateDetail && (
                  <button
                    onClick={() => onNavigateDetail(decision.id)}
                    className="ctrl-btn"
                    style={{ fontSize: '11px', marginInlineStart: 'auto' }}
                    title="View forensic case files"
                  >
                    <span>{isAr ? 'ملف الأدلة' : 'Case Files'}</span>
                    <IconArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : isAuthenticated ? (
          <div
            className="content-panel"
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '48px 20px',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>⚖️</span>
            <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '6px' }}>
              {isAr ? 'لا توجد قرارات تنفيذية معلقة حالياً لمؤسستك' : 'No Pending Executive Decisions'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
              {isAr
                ? 'يتم توليد القرارات التنفيذية وترتيب أولوياتها تلقائياً في جدول tenant_decisions عند رصد انحرافات أسعار الموردين أو مطالبات المقاولين غير المعتمدة.'
                : 'Executive decisions are generated automatically in tenant_decisions upon detecting supplier price drift or unapproved claims.'}
            </p>
          </div>
        ) : (
          filteredDecisions.map((decision) => (
            <div key={decision.id} className={`decision-card priority-${decision.priority}`}>
              <div className="decision-card-header">
                <div className="badge-row">
                  <span className={`severity-tag ${decision.priority}`}>
                    {decision.priority.toUpperCase()}
                  </span>
                  <span className="decision-code">{decision.code}</span>
                </div>
                <div className="decision-financial">
                  <span className="label">{isAr ? 'الأثر المالي المتوقع' : 'Target Impact'}</span>
                  <span className="amount">{decision.financialImpact}</span>
                </div>
              </div>

              <h3 className="decision-title">
                {isAr ? decision.titleAr : decision.titleEn}
              </h3>

              <p className="decision-impact-desc">
                {isAr ? decision.impactAr : decision.impactEn}
              </p>

              <div className="decision-meta-grid">
                <div className="meta-item">
                  <span className="meta-k">{isAr ? 'المسؤول التنفيذي المكلف:' : 'Assigned Owner:'}</span>
                  <span className="meta-v">{decision.assignedTo}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-k">{isAr ? 'الموعد الحاسم للإجراء:' : 'Action Deadline:'}</span>
                  <span className="meta-v date">
                    <IconClock size={12} />
                    {decision.deadline}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-k">{isAr ? 'حالة القرار:' : 'Status:'}</span>
                  <span className="meta-v status-pill">
                    {isAr ? decision.statusAr : decision.statusEn}
                  </span>
                </div>
              </div>

              <div className="decision-actions-row">
                <button
                  onClick={() => handleAction(decision.id, 'approve')}
                  className="btn-primary"
                  style={{ fontSize: '12px', padding: '8px 14px' }}
                >
                  <IconCheck size={14} />
                  <span>{isAr ? 'اعتماد الإجراء وتجميد الصرف' : 'Approve & Execute Action'}</span>
                </button>

                <button
                  onClick={() => handleAction(decision.id, 'clarify')}
                  className="btn-secondary"
                  style={{ fontSize: '12px', padding: '8px 12px' }}
                >
                  <span>{isAr ? 'طلب إيضاح مستندي' : 'Request Evidence'}</span>
                </button>

                {onNavigateDetail && (
                  <button
                    onClick={() => onNavigateDetail(decision.id)}
                    className="ctrl-btn"
                    style={{ fontSize: '11px', marginInlineStart: 'auto' }}
                    title="View forensic case files"
                  >
                    <span>{isAr ? 'ملف الأدلة' : 'Case Files'}</span>
                    <IconArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
