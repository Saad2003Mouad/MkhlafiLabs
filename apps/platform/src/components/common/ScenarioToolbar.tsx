import React from 'react';
import { LocaleMode, ThemeMode, AppRoute, ViewportMode } from '../../types';

interface ScenarioToolbarProps {
  theme: ThemeMode;
  locale: LocaleMode;
  currentRoute: AppRoute;
  viewport: ViewportMode;
  onSelectRoute: (r: AppRoute) => void;
  onSelectTheme: (t: ThemeMode) => void;
  onSelectLocale: (l: LocaleMode) => void;
  onSelectViewport: (v: ViewportMode) => void;
}

export const ScenarioToolbar: React.FC<ScenarioToolbarProps> = ({
  theme,
  locale,
  currentRoute,
  viewport,
  onSelectRoute,
  onSelectTheme,
  onSelectLocale,
  onSelectViewport
}) => {
  const isAr = locale === 'ar';

  return (
    <div className="prototype-toolbar">
      {/* Brand Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className="prototype-badge">
          <span>⚡</span>
          <span>MIKHLAFI LABS // Phase 1.1 Live Product Engine</span>
        </span>
        <span style={{ color: 'var(--text-tertiary)', fontSize: '11px', display: 'none' }}>
          React + TypeScript Foundation
        </span>
      </div>

      {/* Control Groups */}
      <div className="controls-group">
        {/* Page / View Selection */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => onSelectRoute('website')}
            className={`ctrl-btn ${currentRoute === 'website' ? 'active' : ''}`}
            title="Public Corporate Website"
          >
            🌐 {isAr ? 'الموقع العام (Home)' : 'Public Website'}
          </button>
          <button
            onClick={() => onSelectRoute('platform')}
            className={`ctrl-btn ${currentRoute === 'platform' ? 'active' : ''}`}
            title="Customer Executive Cockpit"
          >
            📊 {isAr ? 'لوحة القيادة (Dashboard)' : 'Command Center'}
          </button>
          <button
            onClick={() => onSelectRoute('detail')}
            className={`ctrl-btn ${currentRoute === 'detail' ? 'active' : ''}`}
            title="Financial Intelligence Detail"
          >
            🔍 {isAr ? 'التدقيق المالي (Detail)' : 'Intelligence Detail'}
          </button>
        </div>

        <span style={{ color: 'var(--border-strong)' }}>|</span>

        {/* Theme Switcher */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => onSelectTheme('dark')}
            className={`ctrl-btn ${theme === 'dark' ? 'active' : ''}`}
          >
            🌙 {isAr ? 'داكن' : 'Dark'}
          </button>
          <button
            onClick={() => onSelectTheme('light')}
            className={`ctrl-btn ${theme === 'light' ? 'active' : ''}`}
          >
            ☀️ {isAr ? 'فاتح' : 'Light'}
          </button>
        </div>

        <span style={{ color: 'var(--border-strong)' }}>|</span>

        {/* Locale Switcher (AR RTL / EN LTR) */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => onSelectLocale('ar')}
            className={`ctrl-btn ${locale === 'ar' ? 'active' : ''}`}
          >
            🇸🇦 العربية (RTL)
          </button>
          <button
            onClick={() => onSelectLocale('en')}
            className={`ctrl-btn ${locale === 'en' ? 'active' : ''}`}
          >
            🇬🇧 English (LTR)
          </button>
        </div>

        <span style={{ color: 'var(--border-strong)' }}>|</span>

        {/* Viewport simulation */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => onSelectViewport('desktop')}
            className={`ctrl-btn ${viewport === 'desktop' ? 'active' : ''}`}
          >
            💻 Desktop
          </button>
          <button
            onClick={() => onSelectViewport('mobile')}
            className={`ctrl-btn ${viewport === 'mobile' ? 'active' : ''}`}
          >
            📱 Mobile (390px)
          </button>
        </div>

        <span style={{ color: 'var(--border-strong)' }}>|</span>

        {/* Link to Preserved Legacy Site */}
        <a
          href="/legacy"
          className="ctrl-btn"
          style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}
          title="Open original legacy application"
        >
          ⏪ {isAr ? 'النسخة السابقة (Legacy)' : 'Legacy Version'}
        </a>
      </div>
    </div>
  );
};
