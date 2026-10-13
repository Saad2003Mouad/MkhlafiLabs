import React, { useState, useEffect } from 'react';
import { LocaleMode } from '../../types';
import { IconWorkflow, IconCheck, IconRefresh } from '../Icons';
import { api } from '../../api/client';

interface WorkflowsViewProps {
  locale: LocaleMode;
}

export const WorkflowsView: React.FC<WorkflowsViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const res = await api.getWorkflows();
      setWorkflows(res.workflows || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const toggleWorkflow = async (id: string, nameAr: string, nameEn: string) => {
    setTogglingId(id);
    try {
      const res = await api.toggleWorkflow(id);
      if (res.success) {
        setWorkflows((prev) =>
          prev.map((w) => (w.id === id ? { ...w, active: res.workflow.active, executions_count: res.workflow.executions_count } : w))
        );
        const name = isAr ? nameAr : nameEn;
        const msg = res.workflow.active
          ? (isAr ? `تم تفعيل سياسة الحوكمة (${name}) بنجاح.` : `Policy (${name}) activated.`)
          : (isAr ? `تم تعطيل سياسة الحوكمة (${name}).` : `Policy (${name}) paused.`);
        setFeedback(msg);
      }
    } catch (err: any) {
      setFeedback(err.message || 'Toggle failed.');
    } finally {
      setTogglingId(null);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const totalInterventions = workflows.reduce((sum, w) => sum + parseInt(w.executions_count || 0, 10), 0);

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
              ? 'برمجة قواعد التحوط الإداري والمالي لتنفيذ إجراءات وقائية فور رصد الانحرافات المحاسبية تلقائياً في دفتر الأستاذ.'
              : 'Deterministic policy rules executing precautionary governance actions upon signal detection.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={fetchWorkflows}
            disabled={loading}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '7px 12px' }}
          >
            <IconRefresh size={14} className={loading ? 'spinning' : ''} />
            <span>{loading ? (isAr ? 'جارِ التحديث...' : 'Updating...') : (isAr ? 'تحديث' : 'Refresh')}</span>
          </button>
          <div className="kpi-micro-badge">
            <span className="label">{isAr ? 'إجمالي التدخلات الوقائية' : 'Automated Interventions'}</span>
            <span className="value">{totalInterventions} Actions</span>
          </div>
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
        {workflows.map((wf) => {
          const isToggling = togglingId === wf.id;
          const name = isAr ? wf.name_ar : wf.name_en;
          const trigger = isAr ? wf.trigger_ar : wf.trigger_en;
          const action = isAr ? wf.action_ar : wf.action_en;

          return (
            <div key={wf.id} className="decision-card">
              <div className="decision-card-header">
                <div className="badge-row">
                  <span className={`severity-tag ${wf.active ? 'optimal' : 'medium'}`}>
                    {wf.active ? (isAr ? 'مفعل — حماية حية' : 'ACTIVE — LIVE') : (isAr ? 'معطل مؤقتاً' : 'PAUSED')}
                  </span>
                  <span className="category-pill">{wf.code || 'GOVERNANCE'}</span>
                </div>
                <div className="decision-financial">
                  <span className="label">{isAr ? 'مرات التنفيذ' : 'Executions'}</span>
                  <span className="amount">{wf.executions_count || 0}</span>
                </div>
              </div>

              <h3 className="decision-title">{name}</h3>

              <div className="decision-narrative-strip" style={{ margin: '12px 0' }}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {isAr ? 'شرط الإطلاق (الاستشعار الذكي):' : 'Trigger Condition:'}
                  </span>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-primary)' }}>
                    {trigger}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {isAr ? 'الإجراء الوقائي المنفذ:' : 'Precautionary Action:'}
                  </span>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--status-success)' }}>
                    {action}
                  </p>
                </div>
              </div>

              <div className="decision-actions-row">
                <button
                  onClick={() => toggleWorkflow(wf.id, wf.name_ar, wf.name_en)}
                  disabled={isToggling}
                  className={wf.active ? 'btn-secondary' : 'btn-primary'}
                  style={{ fontSize: '12px', padding: '8px 14px' }}
                >
                  <span>
                    {isToggling
                      ? (isAr ? 'جارِ التحديث...' : 'Updating...')
                      : (wf.active ? (isAr ? 'تعطيل السياسة' : 'Pause Policy') : (isAr ? 'تفعيل السياسة' : 'Activate Policy'))}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
