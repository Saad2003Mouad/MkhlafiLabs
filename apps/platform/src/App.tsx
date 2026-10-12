import React, { useState, useEffect } from 'react';
import { ThemeMode, LocaleMode, ViewMode, ViewportMode } from './types';
import { Shell } from './components/Shell';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { IntelligenceDetail } from './components/IntelligenceDetail';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [locale, setLocale] = useState<LocaleMode>('ar');
  const [view, setView] = useState<ViewMode>('dashboard');
  const [viewport, setViewport] = useState<ViewportMode>('desktop');

  // Synchronize HTML attributes with current theme and direction
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', locale);
  }, [locale]);

  return (
    <div className="prototype-root">
      {/* Top Prototype Inspection Bar */}
      <div className="prototype-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="prototype-badge">
            <span>⚡</span>
            <span>MIKHLAFI LABS — React / TypeScript Visual Prototype</span>
          </span>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>
            Phase 1 Deliverable (Section 19)
          </span>
        </div>

        <div className="controls-group">
          {/* View mode switcher */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setView('dashboard')}
              className={`ctrl-btn ${view === 'dashboard' ? 'active' : ''}`}
            >
              📊 {locale === 'ar' ? 'لوحة القيادة (Dashboard)' : 'Dashboard'}
            </button>
            <button
              onClick={() => setView('intelligence-detail')}
              className={`ctrl-btn ${view === 'intelligence-detail' ? 'active' : ''}`}
            >
              🔍 {locale === 'ar' ? 'تفاصيل الذكاء (Detail)' : 'Intelligence Detail'}
            </button>
          </div>

          <span style={{ color: 'var(--border-strong)' }}>|</span>

          {/* Theme switcher (Light/Dark) */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setTheme('dark')}
              className={`ctrl-btn ${theme === 'dark' ? 'active' : ''}`}
            >
              🌙 {locale === 'ar' ? 'داكن (Dark)' : 'Dark'}
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`ctrl-btn ${theme === 'light' ? 'active' : ''}`}
            >
              ☀️ {locale === 'ar' ? 'فاتح (Light)' : 'Light'}
            </button>
          </div>

          <span style={{ color: 'var(--border-strong)' }}>|</span>

          {/* Locale switcher (AR RTL / EN LTR) */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setLocale('ar')}
              className={`ctrl-btn ${locale === 'ar' ? 'active' : ''}`}
            >
              🇸🇦 العربية (RTL)
            </button>
            <button
              onClick={() => setLocale('en')}
              className={`ctrl-btn ${locale === 'en' ? 'active' : ''}`}
            >
              🇬🇧 English (LTR)
            </button>
          </div>

          <span style={{ color: 'var(--border-strong)' }}>|</span>

          {/* Viewport simulation */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setViewport('desktop')}
              className={`ctrl-btn ${viewport === 'desktop' ? 'active' : ''}`}
            >
              💻 Desktop
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`ctrl-btn ${viewport === 'mobile' ? 'active' : ''}`}
            >
              📱 Mobile (390px)
            </button>
          </div>
        </div>
      </div>

      {/* Viewport Frame */}
      <div className={`viewport-container ${viewport === 'mobile' ? 'simulated-mobile' : ''}`}>
        <Shell
          theme={theme}
          locale={locale}
          view={view}
          onSelectView={setView}
        >
          {view === 'dashboard' ? (
            <ExecutiveDashboard
              locale={locale}
              onNavigateDetail={() => setView('intelligence-detail')}
            />
          ) : (
            <IntelligenceDetail
              locale={locale}
              onBack={() => setView('dashboard')}
            />
          )}
        </Shell>
      </div>
    </div>
  );
};
