// MIKHLAFI LABS — Automation Policies & Workflows
// Policy records are loaded exclusively from the authenticated backend.
// Toggling a policy reflects the API response — no fabricated execution counters.

import React, { useCallback, useEffect, useState } from 'react';
import { LocaleMode } from '../../types';
import { IconWorkflow, IconRefresh, IconCheck, IconAlertTriangle } from '../Icons';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { EmptyState } from '../common/EmptyState';
import { PageHeader } from '../common/PageHeader';

interface WorkflowsViewProps {
  locale: LocaleMode;
}

interface WorkflowRecord {
  id: string;
  code?: string;
  name_ar?: string;
  name_en?: string;
  trigger_ar?: string;
  trigger_en?: string;
  action_ar?: string;
  action_en?: string;
  active?: boolean;
  executions_count?: number | string;
  last_executed_at?: string | null;
}

interface ToggleResult {
  success: boolean;
  workflow?: WorkflowRecord;
}

interface Feedback {
  message: string;
  type: 'success' | 'error';
}

export const WorkflowsView: React.FC<WorkflowsViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated, tenant, openAuthModal } = useAuth();

  const [workflows, setWorkflows] = useState<WorkflowRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const fetchWorkflows = useCallback(async () => {
    if (!isAuthenticated) {
      setWorkflows([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.getWorkflows();
      setWorkflows(Array.isArray(res.workflows) ? res.workflows : []);
    } catch (err) {
      setWorkflows([]);
      setError(err instanceof Error ? err.message : (isAr ? 'تعذر جلب سياسات الأتمتة.' : 'Unable to load automation policies.'));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAr]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows, tenant?.organizationId]);

  const handleToggle = async (wf: WorkflowRecord) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    const name = isAr ? wf.name_ar || wf.name_en || wf.id : wf.name_en || wf.name_ar || wf.id;
    setTogglingId(wf.id);
    try {
      const res = (await api.toggleWorkflow(wf.id)) as ToggleResult;
      if (res.success && res.workflow) {
        await fetchWorkflows();
        setFeedback({
          type: 'success',
          message: res.workflow.active
            ? (isAr ? `تم تفعيل السياسة (${name}).` : `Policy (${name}) activated.`)
            : (isAr ? `تم إيقاف السياسة (${name}).` : `Policy (${name}) paused.`)
        });
      } else {
        setFeedback({
          type: 'error',
          message: isAr
            ? `تعذر تحديث حالة السياسة (${name}).`
            : `The state of policy (${name}) could not be updated.`
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error && err.message
          ? err.message
          : (isAr ? 'تعذر تحديث حالة السياسة.' : 'Unable to update the policy state.')
      });
    } finally {
      setTogglingId(null);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const activeCount = workflows.filter((w) => w.active).length;
  const pausedCount = workflows.length - activeCount;
  const totalExecutions = workflows.reduce((sum, w) => sum + (Number(w.executions_count) || 0), 0);

  const filtered = workflows.filter((w) => {
    if (filter === 'active') return Boolean(w.active);
    if (filter === 'paused') return !w.active;
    return true;
  });

  return (
    <div className="platform-page-container">
      <PageHeader
        locale={locale}
        icon={<IconWorkflow size={22} />}
        breadcrumb={[isAr ? 'المنصة' : 'Platform', isAr ? 'الأتمتة' : 'Automation']}
        title={isAr ? 'سياسات الأتمتة وسير العمل' : 'Automation Policies & Workflows'}
        subtitle={
          isAr
            ? 'قواعد تراقب الإشارات التشغيلية في مؤسستك وتنفّذ الإجراءات المحددة تلقائياً، مع تسجيل كامل لكل تنفيذ.'
            : 'Rules that monitor your organization’s operational signals, carry out the defined actions automatically, and keep a full record of every execution.'
        }
        action={
          <div className="vc-header-actions">
            <button onClick={() => fetchWorkflows()} disabled={loading} className="ml-btn ml-btn--subtle ml-btn--sm">
              <IconRefresh size={14} className={loading ? 'spin' : undefined} />
              <span>{loading ? (isAr ? 'جارِ التحديث…' : 'Updating…') : (isAr ? 'تحديث' : 'Refresh')}</span>
            </button>
          </div>
        }
      />

      {feedback && (
        <div className={`alert-feedback-banner ${feedback.type === 'error' ? 'error' : 'success'}`}>
          {feedback.type === 'error' ? <IconAlertTriangle size={16} /> : <IconCheck size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {!isAuthenticated ? (
        <EmptyState
          icon={<IconWorkflow size={30} />}
          title={isAr ? 'سجّل الدخول لعرض سياسات الأتمتة' : 'Sign in to view your automation policies'}
          description={
            isAr
              ? 'تُسترجع السياسات وسجلات التنفيذ مباشرة من مساحة عمل مؤسستك بعد تسجيل الدخول.'
              : 'Policies and execution records are loaded directly from your organization workspace after signing in.'
          }
          action={
            <button onClick={openAuthModal} className="ml-btn ml-btn--primary">
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </button>
          }
        />
      ) : loading ? (
        <>
          <div className="skeleton-grid">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
          <div className="vc-skeleton-list">
            {[0, 1, 2].map((i) => (
              <div key={i} className="vc-skeleton-row" />
            ))}
          </div>
        </>
      ) : error ? (
        <EmptyState
          icon={<IconAlertTriangle size={30} />}
          title={isAr ? 'تعذر جلب سياسات الأتمتة' : 'Unable to load automation policies'}
          description={error}
          action={
            <button onClick={() => fetchWorkflows()} className="ml-btn ml-btn--primary">
              <IconRefresh size={14} />
              <span>{isAr ? 'إعادة المحاولة' : 'Retry'}</span>
            </button>
          }
        />
      ) : workflows.length === 0 ? (
        <EmptyState
          icon={<IconWorkflow size={30} />}
          title={isAr ? 'لا توجد سياسات أتمتة بعد' : 'No automation policies yet'}
          description={
            isAr
              ? 'تظهر السياسات المخصصة لمؤسستك هنا فور اعتمادها، وتُعرض لكل سياسة شرط التشغيل والإجراء المنفذ وعدد مرات التنفيذ المسجلة فعلياً.'
              : 'Policies provisioned for your organization appear here once they are approved. Each one shows its trigger, its action, and the executions actually recorded against it.'
          }
          action={
            <button onClick={() => fetchWorkflows()} className="ml-btn ml-btn--ghost">
              <IconRefresh size={14} />
              <span>{isAr ? 'تحديث' : 'Refresh'}</span>
            </button>
          }
        />
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-tile">
              <div className="stat-tile__label">{isAr ? 'السياسات' : 'Policies'}</div>
              <div className="stat-tile__value">{workflows.length.toLocaleString()}</div>
              <div className="stat-tile__hint">{isAr ? 'سياسات مسجلة لمؤسستك' : 'Registered for your organization'}</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile__label">{isAr ? 'مفعّلة' : 'Active'}</div>
              <div className="stat-tile__value">{activeCount.toLocaleString()}</div>
              <div className="stat-tile__hint">{isAr ? 'تراقب الإشارات الآن' : 'Monitoring signals now'}</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile__label">{isAr ? 'موقوفة' : 'Paused'}</div>
              <div className="stat-tile__value">{pausedCount.toLocaleString()}</div>
              <div className="stat-tile__hint">{isAr ? 'لا تنفّذ حتى إعادة التفعيل' : 'No execution until reactivated'}</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile__label">{isAr ? 'مرات التنفيذ' : 'Executions'}</div>
              <div className="stat-tile__value">{totalExecutions.toLocaleString()}</div>
              <div className="stat-tile__hint">{isAr ? 'مسجلة عبر كل السياسات' : 'Recorded across all policies'}</div>
            </div>
          </div>

          <div className="page-filter-bar">
            <div className="filter-group">
              <span className="filter-label">{isAr ? 'الحالة:' : 'State:'}</span>
              <div className="ml-segmented" role="tablist" aria-label={isAr ? 'تصفية السياسات' : 'Filter policies'}>
                <button
                  role="tab"
                  aria-selected={filter === 'all'}
                  onClick={() => setFilter('all')}
                  className={`ml-segmented__item ${filter === 'all' ? 'is-active' : ''}`}
                >
                  {isAr ? `الكل (${workflows.length})` : `All (${workflows.length})`}
                </button>
                <button
                  role="tab"
                  aria-selected={filter === 'active'}
                  onClick={() => setFilter('active')}
                  className={`ml-segmented__item ${filter === 'active' ? 'is-active' : ''}`}
                >
                  {isAr ? `مفعّلة (${activeCount})` : `Active (${activeCount})`}
                </button>
                <button
                  role="tab"
                  aria-selected={filter === 'paused'}
                  onClick={() => setFilter('paused')}
                  className={`ml-segmented__item ${filter === 'paused' ? 'is-active' : ''}`}
                >
                  {isAr ? `موقوفة (${pausedCount})` : `Paused (${pausedCount})`}
                </button>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              compact
              icon={<IconWorkflow size={30} />}
              title={isAr ? 'لا توجد سياسات بهذه الحالة' : 'No policies in this state'}
              description={
                isAr
                  ? 'اختر حالة أخرى لعرض بقية السياسات المسجلة لمؤسستك.'
                  : 'Select another state to view the remaining policies registered for your organization.'
              }
              action={
                <button onClick={() => setFilter('all')} className="ml-btn ml-btn--subtle ml-btn--sm">
                  {isAr ? 'عرض الكل' : 'Show all'}
                </button>
              }
            />
          ) : (
            <div className="record-list">
              {filtered.map((wf) => {
                const name = isAr ? wf.name_ar || wf.name_en || wf.id : wf.name_en || wf.name_ar || wf.id;
                const trigger = isAr ? wf.trigger_ar || wf.trigger_en : wf.trigger_en || wf.trigger_ar;
                const action = isAr ? wf.action_ar || wf.action_en : wf.action_en || wf.action_ar;
                const isToggling = togglingId === wf.id;

                return (
                  <article key={wf.id} className="record-row vc-row">
                    <div className="record-row__main">
                      <div className="record-row__title">{name}</div>
                      <div className="record-row__meta">
                        {[
                          wf.code,
                          trigger ? `${isAr ? 'الشرط' : 'Trigger'}: ${trigger}` : undefined,
                          action ? `${isAr ? 'الإجراء' : 'Action'}: ${action}` : undefined,
                          wf.last_executed_at
                            ? `${isAr ? 'آخر تنفيذ' : 'Last run'}: ${new Date(wf.last_executed_at).toLocaleString(locale)}`
                            : undefined
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </div>
                    </div>

                    <div className="vc-side-stat">
                      <span className="vc-side-stat__label">{isAr ? 'مرات التنفيذ' : 'Executions'}</span>
                      <span className="vc-side-stat__value">{(Number(wf.executions_count) || 0).toLocaleString()}</span>
                    </div>

                    <div className="record-row__actions">
                      <span className={`ml-badge ${wf.active ? 'ml-badge--success' : 'ml-badge--warning'}`}>
                        <span className="ml-dot" />
                        {wf.active ? (isAr ? 'مفعّلة' : 'Active') : (isAr ? 'موقوفة' : 'Paused')}
                      </span>
                      <button
                        onClick={() => handleToggle(wf)}
                        disabled={isToggling}
                        className={`ml-btn ml-btn--sm ${wf.active ? 'ml-btn--subtle' : 'ml-btn--primary'}`}
                        aria-label={
                          wf.active
                            ? (isAr ? `إيقاف ${name}` : `Pause ${name}`)
                            : (isAr ? `تفعيل ${name}` : `Activate ${name}`)
                        }
                      >
                        <span>
                          {isToggling
                            ? (isAr ? 'جارِ التحديث…' : 'Updating…')
                            : wf.active
                              ? (isAr ? 'إيقاف' : 'Pause')
                              : (isAr ? 'تفعيل' : 'Activate')}
                        </span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
