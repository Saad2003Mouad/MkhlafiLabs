import React, { useState } from 'react';
import { LocaleMode, ProjectItem } from '../../types';
import { MOCK_PROJECTS } from '../../data/mockData';
import { IconProjects, IconCheck, IconFileText } from '../Icons';

interface ProjectsViewProps {
  locale: LocaleMode;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const [projects] = useState<ProjectItem[]>(MOCK_PROJECTS);
  const [healthFilter, setHealthFilter] = useState<string>('all');
  const [notice, setNotice] = useState<string | null>(null);

  const filteredProjects = projects.filter((p) => {
    if (healthFilter === 'all') return true;
    return p.health === healthFilter;
  });

  const handleVerifyClaims = (code: string) => {
    setNotice(isAr ? `تم تدقيق مطالبات المقاول لمشروع ${code}. لم يتم العثور على ازدواجية في مستخلصات الصرف.` : `Contractor claims audited for ${code}. Zero duplicate disbursement found.`);
    setTimeout(() => setNotice(null), 4000);
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

        <div className="kpi-micro-badge">
          <span className="label">{isAr ? 'إجمالي الميزانيات قيد المراقبة' : 'Monitored Capital Budget'}</span>
          <span className="value">14.1M SAR</span>
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
          <span className="filter-label">{isAr ? 'حالة المشاريع:' : 'Project Health:'}</span>
          <button
            onClick={() => setHealthFilter('all')}
            className={`filter-chip ${healthFilter === 'all' ? 'active' : ''}`}
          >
            {isAr ? 'كافة المشاريع (3)' : 'All Projects (3)'}
          </button>
          <button
            onClick={() => setHealthFilter('on-track')}
            className={`filter-chip ${healthFilter === 'on-track' ? 'active' : ''}`}
          >
            <span className="dot optimal" />
            {isAr ? 'ضمن الجدول (On-Track)' : 'On Track'}
          </button>
          <button
            onClick={() => setHealthFilter('at-risk')}
            className={`filter-chip ${healthFilter === 'at-risk' ? 'active' : ''}`}
          >
            <span className="dot critical" />
            {isAr ? 'معرض للانحراف (At Risk)' : 'At Risk'}
          </button>
        </div>

        <div className="meta-stats">
          <span>{isAr ? 'المطابقة الحسابية: متصلة بـ Primavera & SAP' : 'Feeds: Primavera & SAP Integrated'}</span>
        </div>
      </div>

      {/* Projects List */}
      <div className="decisions-grid">
        {filteredProjects.map((project) => {
          const progressGap = project.plannedProgress - project.actualProgress;
          return (
            <div key={project.id} className="decision-card">
              <div className="decision-card-header">
                <div className="badge-row">
                  <span className={`severity-tag ${project.health === 'on-track' ? 'optimal' : 'high'}`}>
                    {project.health === 'on-track' ? (isAr ? 'منتظم' : 'ON TRACK') : (isAr ? 'انحراف زمني' : 'AT RISK')}
                  </span>
                  <span className="decision-code">{project.code}</span>
                  <span className="category-pill">
                    {project.changeOrdersCount} {isAr ? 'أوامر تغيير' : 'Change Orders'}
                  </span>
                </div>
                <div className="decision-financial">
                  <span className="label">{isAr ? 'الميزانية الكلية' : 'Total Budget'}</span>
                  <span className="amount">{project.budgetTotal}</span>
                </div>
              </div>

              <h3 className="decision-title">
                {isAr ? project.nameAr : project.nameEn}
              </h3>

              {/* Progress Comparison Meter */}
              <div className="project-progress-container" style={{ margin: '14px 0', padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
                  <span>{isAr ? 'الإنجاز الفعلي المحقق:' : 'Actual Progress:'} <strong>{project.actualProgress}%</strong></span>
                  <span style={{ color: 'var(--text-secondary)' }}>{isAr ? 'المخطط التعاقدي:' : 'Contractual Target:'} <strong>{project.plannedProgress}%</strong></span>
                </div>

                {/* Visual Progress Bar */}
                <div style={{ position: 'relative', height: '10px', background: 'var(--border-subtle)', borderRadius: '5px', overflow: 'hidden' }}>
                  {/* Planned Target Marker */}
                  <div
                    style={{
                      position: 'absolute',
                      height: '100%',
                      width: `${project.plannedProgress}%`,
                      background: 'rgba(255,255,255,0.15)',
                      insetInlineStart: 0
                    }}
                  />
                  {/* Actual Progress Fill */}
                  <div
                    style={{
                      position: 'absolute',
                      height: '100%',
                      width: `${project.actualProgress}%`,
                      background: project.health === 'on-track' ? 'var(--status-success)' : 'var(--status-danger)',
                      borderRadius: '5px',
                      insetInlineStart: 0
                    }}
                  />
                </div>

                {progressGap > 0 && (
                  <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--status-danger)', fontWeight: 600 }}>
                    ⚠️ {isAr ? `تأخر الإنجاز عن الخطة بمقدار ${progressGap}% على المسار الحرج.` : `Execution lagging behind schedule by ${progressGap}%.`}
                  </div>
                )}
              </div>

              <div className="decision-meta-grid">
                <div className="meta-item">
                  <span className="meta-k">{isAr ? 'انحراف التكلفة:' : 'Cost Variance:'}</span>
                  <span className="meta-v" style={{ color: project.varianceSAR.startsWith('+') ? 'var(--status-danger)' : 'var(--status-success)' }}>
                    {project.varianceSAR}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-k">{isAr ? 'مطالبات التعاقد:' : 'Contract Claims:'}</span>
                  <span className="meta-v">
                    {project.changeOrdersCount > 0 ? (isAr ? 'مستخلصات تحتاج مراجعة' : 'Claims Pending Audit') : (isAr ? 'لا توجد معلقات' : 'Zero Pending')}
                  </span>
                </div>
              </div>

              <div className="decision-actions-row">
                <button
                  onClick={() => handleVerifyClaims(project.code)}
                  className="btn-primary"
                  style={{ fontSize: '12px', padding: '8px 14px' }}
                >
                  <IconFileText size={14} />
                  <span>{isAr ? 'تدقيق مطالبات المقاول والمستخلصات' : 'Audit Contractor Milestone Claims'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
