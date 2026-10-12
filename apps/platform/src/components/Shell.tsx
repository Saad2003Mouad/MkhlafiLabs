import React from 'react';
import { LocaleMode, ThemeMode, ViewMode } from '../types';
import {
  IconDashboard,
  IconFinance,
  IconDecisions,
  IconRisk,
  IconProjects,
  IconAssistant
} from './Icons';

interface ShellProps {
  theme: ThemeMode;
  locale: LocaleMode;
  view: ViewMode;
  onSelectView: (v: ViewMode) => void;
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({
  locale,
  view,
  onSelectView,
  children
}) => {
  const isAr = locale === 'ar';

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <div className="brand-icon">M</div>
          <div className="brand-text">
            <span className="brand-title">MIKHLAFI LABS</span>
            <span className="brand-subtitle">SYSTEMS · INTEL</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">
            {isAr ? 'مساحة العمل الأساسية' : 'CORE WORKSPACE'}
          </div>

          <button
            onClick={() => onSelectView('dashboard')}
            className={`nav-item ${view === 'dashboard' ? 'active' : ''}`}
          >
            <IconDashboard />
            <span>{isAr ? 'نظرة عامة / القيادة' : 'Executive Overview'}</span>
          </button>

          <div className="nav-section-title">
            {isAr ? 'محركات الذكاء والتحليل' : 'INTELLIGENCE SUITE'}
          </div>

          <button
            onClick={() => onSelectView('intelligence-detail')}
            className={`nav-item ${view === 'intelligence-detail' ? 'active' : ''}`}
          >
            <IconFinance />
            <span>{isAr ? 'الذكاء المالي وكشف الشذوذ' : 'Financial Intelligence'}</span>
          </button>

          <button
            onClick={() => onSelectView('dashboard')}
            className="nav-item"
          >
            <IconDecisions />
            <span>{isAr ? 'مركز القرارات التنفيذية' : 'Executive Decisions'}</span>
          </button>

          <button
            onClick={() => onSelectView('dashboard')}
            className="nav-item"
          >
            <IconRisk />
            <span>{isAr ? 'ذكاء إدارة المخاطر' : 'Risk Intelligence'}</span>
          </button>

          <button
            onClick={() => onSelectView('dashboard')}
            className="nav-item"
          >
            <IconProjects />
            <span>{isAr ? 'ذكاء المشاريع (اختياري)' : 'Project Intelligence'}</span>
          </button>

          <button
            onClick={() => onSelectView('dashboard')}
            className="nav-item"
          >
            <IconAssistant />
            <span>{isAr ? 'المساعد الذكي للأعمال' : 'AI Assistant'}</span>
          </button>

          <div className="nav-section-title">
            {isAr ? 'إدارة المؤسسة' : 'ORGANIZATION'}
          </div>

          <button className="nav-item">
            <span>🏢</span>
            <span>{isAr ? 'الفروع والمستودعات' : 'Branches & Hubs'}</span>
          </button>

          <button className="nav-item">
            <span>🛡️</span>
            <span>{isAr ? 'سجلات التدقيق والأمان' : 'Security & Audit'}</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Region */}
      <main className="app-main">
        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            <div className="workspace-badge">
              <span>🏛️</span>
              <span>{isAr ? 'المؤسسة: مجموعة التقنية القابضة' : 'Workspace: Tech Holdings Group'}</span>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              HQ — Main Branch
            </div>
          </div>

          <div className="header-right">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-success)' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {isAr ? 'متصل بالخادم' : 'Server Online'}
              </span>
            </div>

            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
              SA
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};
