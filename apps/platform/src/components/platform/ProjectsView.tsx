import React, { useState, useEffect } from 'react';
import { LocaleMode } from '../../types';
import { MOCK_PROJECTS } from '../../data/mockData';
import { IconProjects, IconCheck, IconFileText } from '../Icons';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface ProjectsViewProps {
  locale: LocaleMode;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<any[]>(MOCK_PROJECTS);
  const [totalBudgetSAR, setTotalBudgetSAR] = useState<number>(14100000);
  const [healthFilter, setHealthFilter] = useState<string>('all');
  const [notice, setNotice] = useState<string | null>(null);
  const [auditedClaims, setAuditedClaims] = useState<{ [key: string]: boolean }>({});

  const fetchProjects = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.getProjects();
      if (res.projects && res.projects.length > 0) {
        setProjects(res.projects);
        setTotalBudgetSAR(res.totalCapitalBudgetSAR);
        const map: { [key: string]: boolean } = {};
        res.projects.forEach((p: any) => {
          map[p.id] = !!p.contractor_claims_audited;
        });
        setAuditedClaims(map);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [isAuthenticated]);

  const handleVerifyClaims = async (projectId: string, code: string) => {
    if (isAuthenticated) {
      try {
        await api.verifyProjectClaims(projectId);
        setAuditedClaims((prev) => ({ ...prev, [projectId]: true }));
        const msg = isAr
          ? `تم تدقيق مطالبات المقاول لمشروع ${code} بنجاح وتسجيل حدث التدقيق في PostgreSQL.`
          : `Contractor claims audited for ${code} & recorded in PostgreSQL.`;
        setNotice(msg);
        setTimeout(() => setNotice(null), 4000);
        await fetchProjects();
        return;
      } catch (err: any) {
        setNotice(err.message || 'Error auditing claims');
        setTimeout(() => setNotice(null), 4000);
      }
    }

    // Demo fallback
    setAuditedClaims((prev) => ({ ...prev, [projectId]: true }));
    setNotice(isAr ? `(عرض تجريبي) تم تدقيق مطالبات المقاول لمشروع ${code}.` : `(Demo) Claims audited for ${code}.`);
    setTimeout(() => setNotice(null), 4000);
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
            <span>{isAr ? 'ذكاء أداء المشاريع والعقود' : 'Project Intelligence'}</span>
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

        <div className="kpi-micro-badge">
          <span className="label">{isAr ? 'إجمالي الميزانيات قيد المراقبة' : 'Monitored Capital Budget'}</span>
          <span className="value">{(totalBudgetSAR / 1e6).toFixed(1)}M SAR</span>
        </div>
      </div>

      {notice && (
        <div className="alert-feedback-banner success">
          <IconCheck size={16} />
          <span>{notice}</span>
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

      {/* Projects Grid */}
      <div className="decisions-grid">
        {filteredProjects.map((p) => {
          const isClaimsAudited = auditedClaims[p.id] || p.contractor_claims_audited;
          const name = isAr ? (p.name_ar || p.nameAr) : (p.name_en || p.nameEn);
          const planned = p.planned_progress ?? p.plannedProgress;
          const actual = p.actual_progress ?? p.actualProgress;
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
                    <div style={{ width: `${actual}%`, height: '100%', background: p.health === 'on-track' ? 'var(--status-success)' : 'var(--status-warning)' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{isAr ? 'المخطط التعاقدي' : 'Planned Baseline'}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{planned}%</span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${planned}%`, height: '100%', background: 'var(--border-strong)' }} />
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
        })}
      </div>
    </div>
  );
};
