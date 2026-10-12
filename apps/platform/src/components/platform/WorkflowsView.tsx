import React, { useState } from 'react';
import { LocaleMode } from '../../types';
import { IconWorkflow, IconCheck } from '../Icons';

interface WorkflowsViewProps {
  locale: LocaleMode;
}

interface WorkflowRule {
  id: string;
  nameAr: string;
  nameEn: string;
  triggerAr: string;
  triggerEn: string;
  actionAr: string;
  actionEn: string;
  active: boolean;
  executionsCount: number;
}

export const WorkflowsView: React.FC<WorkflowsViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const [workflows, setWorkflows] = useState<WorkflowRule[]>([
    {
      id: 'wf-1',
      nameAr: 'تجميد مدفوعات الفواتير المكررة فورياً',
      nameEn: 'Instant Freeze on Suspected Duplicate Invoices',
      triggerAr: 'رصد تشابه رقم الفاتورة وتاريخ الصرف لنفس المورد بمبلغ يتجاوز 10,000 ريال',
      triggerEn: 'Detection of matching invoice/date disbursement exceeding 10,000 SAR',
      actionAr: 'تجميد أمر الدفع في ERP وإرسال تنبيه عاجل لمدير التدقيق',
      actionEn: 'Block ERP disbursement queue and escalate to Audit Director',
      active: true,
      executionsCount: 14
    },
    {
      id: 'wf-2',
      nameAr: 'تصعيد انحراف أسعار عقود التوريد',
      nameEn: 'Escalation for Supplier Price Variance',
      triggerAr: 'تجاوز سعر الوحدة المفوتر بنسبة +10% عن العقد الأساسي المسجل',
      triggerEn: 'Unit invoice price exceeding contractual baseline by +10%',
      actionAr: 'إدراج بند مراجعة أسعار في طابور قرارات المشتريات',
      actionEn: 'Create mandatory price review item in Procurement Decision Queue',
      active: true,
      executionsCount: 8
    },
    {
      id: 'wf-3',
      nameAr: 'إنذار تأخر مستخلصات المشاريع الحرجة',
      nameEn: 'Early Warning on Critical Project Progress Slippage',
      triggerAr: 'تأخر الإنجاز الفعلي عن المخطط بأكثر من 10% على المسار الحرج',
      triggerEn: 'Actual milestone lagging contractual schedule by >10%',
      actionAr: 'توليد إنذار مبكر لمدير العمليات التنفيذي',
      actionEn: 'Dispatch early warning notification to Operations Director',
      active: false,
      executionsCount: 3
    }
  ]);

  const [feedback, setFeedback] = useState<string | null>(null);

  const toggleWorkflow = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          const newState = !w.active;
          const msg = newState
            ? (isAr ? `تم تفعيل سياسة الحوكمة (${w.nameAr}) بنجاح.` : `Policy (${w.nameEn}) activated.`)
            : (isAr ? `تم تعطيل سياسة الحوكمة (${w.nameAr}).` : `Policy (${w.nameEn}) paused.`);
          setFeedback(msg);
          setTimeout(() => setFeedback(null), 3000);
          return { ...w, active: newState };
        }
        return w;
      })
    );
  };

  return (
    <div className="platform-page-container">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <div className="page-breadcrumb">
            <span>{isAr ? 'المنصة' : 'Platform'}</span>
            <span>/</span>
            <span>{isAr ? 'مركز القيادة' : 'Command'}</span>
            <span>/</span>
            <span className="current">{isAr ? 'سير العمل والأتمتة' : 'Workflows & Policies'}</span>
          </div>
          <h1 className="page-title">
            <IconWorkflow size={24} />
            <span>{isAr ? 'سياسات الأتمتة والتحوط والحوكمة الذكية' : 'Automated Mitigation Policies & Workflows'}</span>
          </h1>
          <p className="page-subtitle">
            {isAr
              ? 'برمجة قواعد التحوط الإداري والمالي لتنفيذ إجراءات وقائية فور رصد الانحرافات المحاسبية تلقائياً.'
              : 'Deterministic policy rules executing precautionary governance actions upon signal detection.'}
          </p>
        </div>

        <div className="kpi-micro-badge">
          <span className="label">{isAr ? 'إجمالي التدخلات الوقائية' : 'Automated Interventions'}</span>
          <span className="value">25 Actions</span>
        </div>
      </div>

      {feedback && (
        <div className="alert-feedback-banner success">
          <IconCheck size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Workflows Grid */}
      <div className="decisions-grid">
        {workflows.map((wf) => (
          <div key={wf.id} className="decision-card">
            <div className="decision-card-header">
              <div className="badge-row">
                <span className={`severity-tag ${wf.active ? 'optimal' : 'medium'}`}>
                  {wf.active ? (isAr ? 'نشط ومفعل' : 'ACTIVE') : (isAr ? 'متوقف مؤقتاً' : 'PAUSED')}
                </span>
                <span className="category-pill">
                  {wf.executionsCount} {isAr ? 'تدخلات سابقة' : 'Triggers'}
                </span>
              </div>
            </div>

            <h3 className="decision-title">{isAr ? wf.nameAr : wf.nameEn}</h3>

            <div style={{ margin: '12px 0', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{isAr ? 'شرط الإطلاق (Trigger):' : 'Trigger Rule:'} </span>
                <span>{isAr ? wf.triggerAr : wf.triggerEn}</span>
              </div>
              <div>
                <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>{isAr ? 'الإجراء الآلي (Action):' : 'Automated Action:'} </span>
                <span>{isAr ? wf.actionAr : wf.actionEn}</span>
              </div>
            </div>

            <div className="decision-actions-row">
              <button
                onClick={() => toggleWorkflow(wf.id)}
                className={wf.active ? 'btn-secondary' : 'btn-primary'}
                style={{ fontSize: '12px', padding: '8px 14px' }}
              >
                <span>
                  {wf.active
                    ? (isAr ? 'إيقاف السياسة مؤقتاً' : 'Pause Policy')
                    : (isAr ? 'تفعيل السياسة' : 'Activate Policy')}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
