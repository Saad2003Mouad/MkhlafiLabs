// MIKHLAFI LABS — Project Performance & Contract Intelligence (protected workspace view)
// Records are loaded exclusively from api.getProjects; claims audits call
// api.verifyProjectClaims and reflect the real backend response. No demo
// fallbacks and no simulated records are ever rendered.

import React, { useState, useEffect, useCallback } from 'react';
import { LocaleMode } from '../../types';
import { IconProjects, IconCheck, IconFileText, IconAlert, IconFilter, IconLock } from '../Icons';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../common/EmptyState';
import { PageHeader } from '../common/PageHeader';

interface ProjectsViewProps {
  locale: LocaleMode;
}

type ProjectRecord = {
  id: string;
  code: string;
  name_en?: string;
  name_ar?: string;
  client_name?: string;
  budget_total_sar?: string | number;
  spent_sar?: string | number;
  variance_sar?: string | number;
  planned_progress?: number;
  actual_progress?: number;
  health?: string;
  change_orders_count?: number;
  contractor_claims_audited?: boolean;
};

interface NoticeState {
  type: 'success' | 'error';
  message: string;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated, tenant, openAuthModal } = useAuth();

  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [totalBudgetSAR, setTotalBudgetSAR] = useState<number>(0);
  const [healthFilter, setHealthFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const currency = tenant?.currency || 'SAR';

  const fetchProjects = useCallback(async () => {
    if (!isAuthenticated) {
      setProjects([]);
      setTotalBudgetSAR(0);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.getProjects();
      setProjects(Array.isArray(res.projects) ? (res.projects as ProjectRecord[]) : []);
      setTotalBudgetSAR(res.totalCapitalBudgetSAR || 0);
    } catch (err) {
      setProjects([]);
      setTotalBudgetSAR(0);
      setError(
        err instanceof Error
          ? err.message
          : (isAr ? 'تعذر تحميل سجلات المشاريع.' : 'Failed to fetch project records.')
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAr]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects, tenant?.organizationId]);

  const showNotice = (state: NoticeState) => {
    setNotice(state);
    setTimeout(() => setNotice(null), 5000);
  };

  const handleVerifyClaims = async (project: ProjectRecord) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setBusyId(project.id);
    try {
      const res = await api.verifyProjectClaims(project.id);
      const code = res.project?.code || project.code;
      showNotice({
        type: 'success',
        message: isAr
          ? `تم تدقيق مستخلصات المقاول لمشروع (${code}) وتسجيل الحدث في سجل التدقيق.`
          : `Contractor claims audited for project ${code} and recorded in the audit trail.`
      });
      await fetchProjects();
    } catch (err) {
      showNotice({
        type: 'error',
        message: err instanceof Error
          ? err.message
          : (isAr ? 'تعذر تنفيذ تدقيق المستخلصات.' : 'Failed to audit the contractor claims.')
      });
    } finally {
      setBusyId(null);
    }
  };

  const healthBadgeClass = (health?: string) => {
    const h = (health || '').toLowerCase();
    if (h === 'on-track') return 'ml-badge ml-badge--success';
    if (h === 'at-risk') return 'ml-badge ml-badge--warning';
    if (h === 'delayed') return 'ml-badge ml-badge--danger';
    return 'ml-badge';
  };

  const healthLabel = (health?: string) => {
    const h = (health || '').toLowerCase();
    if (h === 'on-track') return isAr ? 'ضمن الخطة' : 'ON TRACK';
    if (h === 'at-risk') return isAr ? 'في دائرة الخطر' : 'AT RISK';
    if (h === 'delayed') return isAr ? 'متأخر' : 'DELAYED';
    return (health || '').toUpperCase();
  };

  const healthOptions = Array.from(
    new Set(projects.map((p) => p.health).filter((h): h is string => !!h))
  );

  const filteredProjects = projects.filter((p) =>
    healthFilter === 'all' ? true : p.health === healthFilter
  );

  const auditedCount = projects.filter((p) => !!p.contractor_claims_audited).length;

  const formatAmount = (value?: string | number) =>
    `${(Number(value) || 0).toLocaleString()} ${currency}`;

  return (
    <div className="platform-page-container">
      <PageHeader
        locale={locale}
        icon={<IconProjects size={22} />}
        breadcrumb={[isAr ? 'المنصة' : 'Platform', isAr ? 'محركات الذكاء' : 'Intelligence Engines']}
        title={isAr ? 'محرك ذكاء أداء المشاريع والعقود' : 'Project Performance & Contract Intelligence'}
        subtitle={
          isAr
            ? 'مقارنة المخطط بالمنجز الفعلي، رصد انحراف التكاليف عن الميزانيات المعتمدة، وتدقيق أوامر التغيير والمستخلصات التعاقدية قبل اعتمادها.'
            : 'Comparing planned versus actual execution, tracking cost variance against approved budgets, and auditing change orders and contractor claims before approval.'
        }
        action={
          isAuthenticated ? (
            <div className="kpi-micro-badge">
              <span className="label">{isAr ? 'إجمالي الميزانيات المراقَبة' : 'Monitored Budgets'}</span>
              <span className="value">{totalBudgetSAR.toLocaleString()} {currency}</span>
            </div>
          ) : undefined
        }
      />

      {!isAuthenticated ? (
        <EmptyState
          icon={<IconLock size={30} />}
          title={isAr ? 'سجّل الدخول لعرض سجل مشاريع مؤسستك' : 'Sign in to view your organization’s project registry'}
          description={
            isAr
              ? 'تُسترجع الميزانيات ومؤشرات الإنجاز وحالة المستخلصات مباشرة من مساحة عمل مؤسستك بعد تسجيل الدخول.'
              : 'Budgets, progress indicators, and claims status are loaded directly from your organization workspace after signing in.'
          }
          action={
            <button onClick={openAuthModal} className="ml-btn ml-btn--primary">
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </button>
          }
        />
      ) : (
        <>
          {notice && (
                <div className={`alert-feedback-banner ${notice.type === 'success' ? 'success' : 'error'}`}>
                  {notice.type === 'success' ? <IconCheck size={16} /> : <IconAlert size={16} />}
                  <span>{notice.message}</span>
                </div>
              )}

              {loading ? (
                <div className="skeleton-grid">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="skeleton-card" />
                  ))}
                </div>
              ) : error ? (
                <EmptyState
                  icon={<IconAlert size={30} />}
                  title={isAr ? 'تعذر تحميل سجل المشاريع' : 'Unable to load the project registry'}
                  description={error}
                  action={
                    <button onClick={fetchProjects} className="ml-btn ml-btn--primary">
                      {isAr ? 'إعادة المحاولة' : 'Retry'}
                    </button>
                  }
                />
              ) : (
                <>
                  <div className="stat-grid">
                    <div className="stat-tile">
                      <div className="stat-tile__label">{isAr ? 'المشاريع المراقَبة' : 'Monitored Projects'}</div>
                      <div className="stat-tile__value">{projects.length}</div>
                      <div className="stat-tile__hint">{isAr ? 'عقود نشطة ضمن النطاق' : 'Active contracts in scope'}</div>
                    </div>
                    <div className="stat-tile">
                      <div className="stat-tile__label">{isAr ? 'إجمالي الميزانيات' : 'Total Budgets'}</div>
                      <div className="stat-tile__value">{totalBudgetSAR.toLocaleString()} {currency}</div>
                      <div className="stat-tile__hint">{isAr ? 'كما هو مسجّل في السجلات' : 'As recorded in the registry'}</div>
                    </div>
                    <div className="stat-tile">
                      <div className="stat-tile__label">{isAr ? 'مستخلصات مدققة' : 'Audited Claims'}</div>
                      <div className="stat-tile__value">{auditedCount}</div>
                      <div className="stat-tile__hint">{isAr ? 'تم تدقيقها فعلياً' : 'Actually verified'}</div>
                    </div>
                  </div>

                  {projects.length === 0 ? (
                    <EmptyState
                      icon={<IconProjects size={30} />}
                      title={isAr ? 'لا توجد مشاريع مسجلة حالياً' : 'No projects registered right now'}
                      description={
                        isAr
                          ? 'تُسجَّل المشاريع والعقود في هذه المساحة عبر ربط أنظمة تخطيط الموارد أو استيراد العقود؛ فور التسجيل تظهر هنا مع مؤشرات الإنجاز.'
                          : 'Projects and contracts are registered in this workspace by connecting ERP systems or importing contracts; once registered they appear here with progress indicators.'
                      }
                    />
                  ) : (
                    <>
                      {healthOptions.length > 0 && (
                        <div className="page-filter-bar">
                          <div className="filter-group">
                            <IconFilter size={14} />
                            <span className="filter-label">{isAr ? 'الحالة:' : 'Health:'}</span>
                            <button
                              onClick={() => setHealthFilter('all')}
                              className={`filter-chip ${healthFilter === 'all' ? 'active' : ''}`}
                            >
                              {isAr ? 'الكل' : 'All'} ({projects.length})
                            </button>
                            {healthOptions.map((h) => {
                              const count = projects.filter((p) => p.health === h).length;
                              return (
                                <button
                                  key={h}
                                  onClick={() => setHealthFilter(h)}
                                  className={`filter-chip ${healthFilter === h ? 'active' : ''}`}
                                >
                                  {healthLabel(h)} ({count})
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {filteredProjects.length === 0 ? (
                        <EmptyState
                          icon={<IconFilter size={30} />}
                          title={isAr ? 'لا توجد مشاريع بهذه الحالة' : 'No projects with this status'}
                          description={
                            isAr
                              ? 'اختر حالة أخرى لعرض بقية سجل المشاريع.'
                              : 'Select a different status to view the rest of the project registry.'
                          }
                          action={
                            <button onClick={() => setHealthFilter('all')} className="ml-btn ml-btn--ghost">
                              {isAr ? 'عرض الكل' : 'Show All'}
                            </button>
                          }
                        />
                      ) : (
                        <div className="record-list">
                          {filteredProjects.map((project) => {
                            const planned = Math.min(100, Math.max(0, Number(project.planned_progress) || 0));
                            const actual = Math.min(100, Math.max(0, Number(project.actual_progress) || 0));
                            const variance = Number(project.variance_sar) || 0;
                            const varianceColor = variance > 0 ? 'var(--status-warning)' : 'var(--status-success)';
                            const name = isAr
                              ? (project.name_ar || project.name_en || project.code)
                              : (project.name_en || project.name_ar || project.code);

                            return (
                              <div key={project.id} className="record-row" style={{ alignItems: 'flex-start' }}>
                                <div className="record-row__main">
                                  <div className="va-row-head">
                                    <div className="va-tags">
                                      <span className={healthBadgeClass(project.health)}>
                                        <span className="ml-dot" />
                                        {healthLabel(project.health)}
                                      </span>
                                      <span className="va-mono-id">{project.code}</span>
                                      {project.client_name && <span className="ml-badge">{project.client_name}</span>}
                                    </div>
                                    <span className="va-amount">{formatAmount(project.budget_total_sar)}</span>
                                  </div>

                                  <div className="record-row__title" style={{ marginTop: 6 }}>{name}</div>

                                  <div className="va-progress">
                                    <div>
                                      <div className="va-progress-row">
                                        <span>{isAr ? 'المنجز فعلياً' : 'Actual progress'}</span>
                                        <strong>{actual.toFixed(0)}%</strong>
                                      </div>
                                      <div className="va-progress-track">
                                        <div
                                          className={`va-progress-fill ${
                                            project.health === 'on-track' ? 'va-progress-fill--success' : 'va-progress-fill--warning'
                                          }`}
                                          style={{ width: `${actual}%` }}
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <div className="va-progress-row">
                                        <span>{isAr ? 'المخطط المتعاقد' : 'Contracted plan'}</span>
                                        <strong>{planned.toFixed(0)}%</strong>
                                      </div>
                                      <div className="va-progress-track va-progress-track--thin">
                                        <div className="va-progress-fill va-progress-fill--planned" style={{ width: `${planned}%` }} />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="va-metric-grid">
                                    <div className="va-metric">
                                      <span className="va-metric__k">{isAr ? 'انحراف التكلفة' : 'Cost variance'}</span>
                                      <span
                                        className="va-metric__v"
                                        style={{ color: varianceColor }}
                                      >
                                        {variance > 0 ? '+' : ''}{variance.toLocaleString()} {currency}
                                      </span>
                                    </div>
                                    <div className="va-metric">
                                      <span className="va-metric__k">{isAr ? 'أوامر التغيير' : 'Change orders'}</span>
                                      <span className="va-metric__v">{Number(project.change_orders_count) || 0}</span>
                                    </div>
                                    <div className="va-metric">
                                      <span className="va-metric__k">{isAr ? 'المستخلصات' : 'Claims'}</span>
                                      <span className={`va-metric__v ${project.contractor_claims_audited ? 'va-metric__v--success' : 'va-metric__v--muted'}`}>
                                        {project.contractor_claims_audited
                                          ? (isAr ? 'مدققة' : 'Audited')
                                          : (isAr ? 'بانتظار التدقيق' : 'Pending audit')}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="record-row__actions">
                                  <button
                                    onClick={() => handleVerifyClaims(project)}
                                    disabled={busyId === project.id || !!project.contractor_claims_audited}
                                    className={`ml-btn ml-btn--sm ${
                                      project.contractor_claims_audited ? 'ml-btn--subtle' : 'ml-btn--primary'
                                    }`}
                                  >
                                    <IconFileText size={14} />
                                    <span>
                                      {busyId === project.id
                                        ? (isAr ? 'جارِ التدقيق…' : 'Auditing…')
                                        : project.contractor_claims_audited
                                          ? (isAr ? 'تم التدقيق' : 'Audited')
                                          : (isAr ? 'تدقيق المستخلصات' : 'Audit Claims')}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
        </>
      )}
    </div>
  );
};
