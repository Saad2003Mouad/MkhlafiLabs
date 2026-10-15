import React, { useState, useEffect } from 'react';
import { LocaleMode } from '../../types';
import { IconProjects, IconCheck, IconFileText, IconAlertTriangle } from '../Icons';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { ProjectMarginWorkbench } from '../projects/ProjectMarginWorkbench';

interface ProjectsViewProps {
  locale: LocaleMode;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated } = useAuth();
  const [viewMode, setViewMode] = useState<'workbench' | 'database'>('workbench');
  const [projects, setProjects] = useState<any[]>([]);
  const [totalBudgetSAR, setTotalBudgetSAR] = useState<number>(0);
  const [isDemoDataset, setIsDemoDataset] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [healthFilter, setHealthFilter] = useState<string>('all');
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [auditedClaims, setAuditedClaims] = useState<{ [key: string]: boolean }>({});

  const fetchProjects = async () => {
    setLoading(true);
    if (!isAuthenticated) {
      setProjects([]);
      setTotalBudgetSAR(0);
      setIsDemoDataset(false);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getProjects();
      if (res && Array.isArray(res.projects)) {
        setProjects(res.projects);
        setTotalBudgetSAR(res.totalCapitalBudgetSAR || 0);
        setIsDemoDataset(false);
        const map: { [key: string]: boolean } = {};
        res.projects.forEach((p: any) => {
          map[p.id] = !!p.contractor_claims_audited;
        });
        setAuditedClaims(map);
      } else {
        setProjects([]);
        setTotalBudgetSAR(0);
      }
    } catch (err: any) {
      setNotice({
        type: 'error',
        message: err.message || (isAr ? 'فشل جلب بيانات المشاريع' : 'Failed to load project records')
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [isAuthenticated]);

  const handleVerifyClaims = async (projectId: string, code: string) => {
    if (!isAuthenticated) {
      setNotice({
        type: 'warning',
        message: isAr ? 'يتطلب تدقيق المستخلصات تسجيل الدخول لمساحة عمل المنشأة.' : 'Authentication required to audit contractor claims.'
      });
      return;
    }

    try {
      await api.verifyProjectClaims(projectId);
      setAuditedClaims((prev) => ({ ...prev, [projectId]: true }));
      setNotice({
        type: 'success',
        message: isAr
          ? `تم تدقيق مطالبات المقاول لمشروع ${code} بنجاح وتسجيل حدث التدقيق في PostgreSQL.`
          : `Contractor claims audited for ${code} & recorded in PostgreSQL.`
      });
      setTimeout(() => setNotice(null), 4000);
      await fetchProjects();
    } catch (err: any) {
      setNotice({
        type: 'error',
        message: err.message || (isAr ? 'فشل تدقيق المستخلصات' : 'Error auditing claims')
      });
      setTimeout(() => setNotice(null), 4000);
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (healthFilter === 'all') return true;
    return p.health === healthFilter;
  });

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
            <span className="current">{isAr ? 'ذكاء أداء المشاريع والعقود' : 'Project Intelligence'}</span>
          </div>
          <h1 className="page-title">
            <IconProjects size={24} />
            <span>{isAr ? 'محرك ذكاء أداء المشاريع ومطابقة العقود' : 'Project Performance & Contract Intelligence'}</span>
          </h1>
          <p className="page-subtitle">
            {isAr
              ? 'مقارنة المخطط بالمنجز الفعلي، كشف انحراف التكاليف عن الميزانية المعتمدة، وتدقيق أوامر التغيير والمستخلصات التعاقدية.'
              : 'Tracking planned vs actual execution milestones, budget burn velocity, and unapproved change order claims.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {isDemoDataset && (
            <span className="severity-tag warning" style={{ fontSize: '11px', padding: '6px 12px' }}>
              {isAr ? 'نموذج بيانات توضيحي' : 'Demonstration Dataset'}
            </span>
          )}
          <div className="kpi-micro-badge">
            <span className="label">{isAr ? 'إجمالي الميزانيات قيد المراقبة' : 'Monitored Capital Budget'}</span>
            <span className="value">{(totalBudgetSAR / 1e6).toFixed(1)}M SAR</span>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', margin: '14px 0 20px 0', overflowX: 'auto' }}>
        <button
          onClick={() => setViewMode('workbench')}
          className={`ctrl-btn ${viewMode === 'workbench' ? 'active' : ''}`}
          style={{
            fontWeight: viewMode === 'workbench' ? 800 : 500,
            background: viewMode === 'workbench' ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(99, 102, 241, 0.15))' : undefined,
            borderColor: viewMode === 'workbench' ? '#8B5CF6' : undefined,
            color: viewMode === 'workbench' ? '#C4B5FD' : undefined
          }}
        >
          {isAr ? '🔬 رادار إدارة القيمة المكتسبة (EVM) وتدقيق أوامر التغيير (Workbench)' : '🔬 Project EVM & Variation Order Assurance Workbench'}
        </button>
        <button
          onClick={() => setViewMode('database')}
          className={`ctrl-btn ${viewMode === 'database' ? 'active' : ''}`}
          style={{ fontWeight: viewMode === 'database' ? 700 : 500 }}
        >
          {isAr
            ? `📋 سجل عقود ومشاريع المنشأة الحالية (${projects.length})`
            : `📋 Enterprise Active Project Contracts (${projects.length})`}
        </button>
      </div>

      {viewMode === 'workbench' ? (
        <ProjectMarginWorkbench
          locale={locale}
          initialScenario="infrastructure"
          isEmbeddedInPublicPage={false}
        />
      ) : (
        <>
          {notice && (
            <div className={`alert-feedback-banner ${notice.type === 'error' ? 'error' : notice.type === 'warning' ? 'warning' : 'success'}`}>
              {notice.type === 'error' || notice.type === 'warning' ? <IconAlertTriangle size={16} /> : <IconCheck size={16} />}
              <span>{notice.message}</span>
            </div>
          )}

          {/* Filter Bar */}
          <div className="page-filter-bar">
        <div className="filter-group">
          <span className="filter-label">{isAr ? 'حالة المشروع:' : 'Health Status:'}</span>
          <button
            onClick={() => setHealthFilter('all')}
            className={`filter-chip ${healthFilter === 'all' ? 'active' : ''}`}
          >
            {isAr ? `كافة المشاريع (${projects.length})` : `All Projects (${projects.length})`}
          </button>
          <button
            onClick={() => setHealthFilter('on-track')}
            className={`filter-chip ${healthFilter === 'on-track' ? 'active' : ''}`}
          >
            {isAr ? 'ضمن الخطة' : 'On Track'}
          </button>
          <button
            onClick={() => setHealthFilter('at-risk')}
            className={`filter-chip ${healthFilter === 'at-risk' ? 'active' : ''}`}
          >
            {isAr ? 'في دائرة الخطر' : 'At Risk'}
          </button>
        </div>
      </div>

      {/* Empty State */}
      {!loading && filteredProjects.length === 0 && (
        <div className="decision-card" style={{ textAlign: 'center', padding: '40px 20px', marginTop: '20px' }}>
          <IconProjects size={36} style={{ color: 'var(--text-secondary)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {isAr ? 'لا توجد مشاريع مسجلة حالياً في مساحة العمل' : 'No Monitored Projects Found'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
            {isAr
              ? 'يمكنك ربط نظام إدارة المشاريع (ERP/Oracle) أو استيراد عقود المشاريع لبدء تدقيق الإنجاز الفعلي والمستخلصات.'
              : 'Connect your ERP project management module or import project baseline schedules to track milestone variance.'}
          </p>
        </div>
      )}

      {/* Projects Grid */}
      <div className="decisions-grid">
        {filteredProjects.length === 0 ? (
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
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🏗️</span>
            <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '6px' }}>
              {isAr ? 'لا توجد مشاريع رأسمالية مسجلة حالياً' : 'No Capital Projects Registered'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
              {isAr
                ? 'يتم تتبع مؤشرات الإنجاز الميداني وأوامر التغيير فور تسجيل مشاريع المؤسسة أو ربط نظام إدارة المشاريع.'
                : 'Project performance baselines and contractor claims track dynamically once capital projects are configured.'}
            </p>
          </div>
        ) : (
          filteredProjects.map((p) => {
          const isClaimsAudited = auditedClaims[p.id] || p.contractor_claims_audited;
          const name = isAr ? (p.name_ar || p.nameAr) : (p.name_en || p.nameEn);
          const planned = Number(p.planned_progress ?? p.plannedProgress ?? 0);
          const actual = Number(p.actual_progress ?? p.actualProgress ?? 0);
          const budget = p.budgetTotal || (p.budget_total_sar ? `${(parseFloat(p.budget_total_sar) / 1e6).toFixed(1)}M SAR` : '0 SAR');
          const variance = p.varianceSAR || (p.variance_sar ? `+${parseFloat(p.variance_sar).toLocaleString()} SAR` : '0 SAR');
          const changeOrders = p.change_orders_count ?? p.changeOrdersCount ?? 0;

          return (
            <div key={p.id} className="decision-card">
              <div className="decision-card-header">
                <div className="badge-row">
                  <span className={`severity-tag ${p.health === 'on-track' ? 'optimal' : 'high'}`}>
                    {p.health === 'on-track' ? (isAr ? 'ضمن الخطة' : 'ON TRACK') : (isAr ? 'في دائرة الخطر' : 'AT RISK')}
                  </span>
                  <span className="decision-code">{p.code}</span>
                </div>
                <div className="decision-financial">
                  <span className="label">{isAr ? 'الميزانية المعتمدة' : 'Approved Budget'}</span>
                  <span className="amount">{budget}</span>
                </div>
              </div>

              <h3 className="decision-title">
                {name}
              </h3>

              {p.client_name && (
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {isAr ? `الجهة المالكة: ${p.client_name}` : `Client: ${p.client_name}`}
                </div>
              )}

              {/* Progress Bars */}
              <div style={{ margin: '14px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{isAr ? 'الإنجاز الفعلي' : 'Actual Progress'}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{actual}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, Math.max(0, actual))}%`, height: '100%', background: p.health === 'on-track' ? 'var(--status-success)' : 'var(--status-warning)' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{isAr ? 'المخطط التعاقدي' : 'Planned Baseline'}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{planned}%</span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, Math.max(0, planned))}%`, height: '100%', background: 'var(--border-strong)' }} />
                  </div>
                </div>
              </div>

              <div className="risk-metric-strip">
                <div className="risk-metric-box">
                  <span className="k">{isAr ? 'انحراف التكلفة' : 'Cost Variance'}</span>
                  <span className="v" style={{ color: p.health === 'on-track' ? 'var(--status-success)' : 'var(--status-warning)' }}>
                    {variance}
                  </span>
                </div>
                <div className="risk-metric-box">
                  <span className="k">{isAr ? 'أوامر التغيير' : 'Change Orders'}</span>
                  <span className="v">{changeOrders}</span>
                </div>
                <div className="risk-metric-box">
                  <span className="k">{isAr ? 'تدقيق المطالبات' : 'Claims Audit'}</span>
                  <span className="v" style={{ color: isClaimsAudited ? 'var(--status-success)' : 'var(--text-secondary)' }}>
                    {isClaimsAudited ? (isAr ? 'مدقق ومطابق' : 'Verified') : (isAr ? 'بانتظار الفحص' : 'Pending')}
                  </span>
                </div>
              </div>

              <div className="decision-actions-row">
                <button
                  onClick={() => handleVerifyClaims(p.id, p.code)}
                  className={isClaimsAudited ? 'btn-secondary' : 'btn-primary'}
                  disabled={isClaimsAudited}
                  style={{ fontSize: '12px', padding: '8px 14px' }}
                >
                  <IconFileText size={14} />
                  <span>
                    {isClaimsAudited
                      ? (isAr ? 'تم تدقيق مطالبات المقاول' : 'Contractor Claims Audited')
                      : (isAr ? 'تدقيق ومطابقة مستخلصات المقاول' : 'Audit Contractor Claims')}
                  </span>
                </button>
              </div>
            </div>
          );
        })
      )}
      </div>
      </>
      )}
    </div>
  );
};
