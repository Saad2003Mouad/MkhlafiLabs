import React, { useState } from 'react';
import { LocaleMode, DecisionItem } from '../../types';
import { MOCK_DECISIONS } from '../../data/mockData';
import { IconDecisions, IconCheck, IconClock, IconFilter, IconArrowRight } from '../Icons';

interface DecisionsViewProps {
  locale: LocaleMode;
  onNavigateDetail?: (id: string) => void;
}

export const DecisionsView: React.FC<DecisionsViewProps> = ({ locale, onNavigateDetail }) => {
  const isAr = locale === 'ar';
  const [decisions, setDecisions] = useState<DecisionItem[]>(MOCK_DECISIONS);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const filteredDecisions = decisions.filter((d) => {
    if (filterPriority === 'all') return true;
    return d.priority === filterPriority;
  });

  const handleAction = (id: string, actionType: 'approve' | 'clarify') => {
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
      ? (isAr ? `تم اعتماد الإجراء للقرار ${target?.code || id} وتحديث سجل التدقيق بنجاح.` : `Action executed for ${target?.code || id}. Audit log updated.`)
      : (isAr ? `تم طلب إيضاح إضافي من ${target?.assignedTo} بنجاح.` : `Clarification requested from ${target?.assignedTo}.`);
    
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
          <span className="value">362,400 SAR</span>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="alert-feedback-banner success">
          <IconCheck size={16} />
          <span>{actionFeedback}</span>
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
            {isAr ? 'الكل (3)' : 'All (3)'}
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
          <span>{isAr ? 'آخر تحديث للسجل: قبل دقيقتين' : 'Ledger synced: 2m ago'}</span>
        </div>
      </div>

      {/* Decisions List */}
      <div className="decisions-grid">
        {filteredDecisions.map((decision) => (
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
        ))}
      </div>
    </div>
  );
};
