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

  const routeOptions: Array<{ id: AppRoute; labelAr: string; labelEn: string }> = [
    { id: 'website', labelAr: '🌐 الموقع الرئيسي', labelEn: '🌐 Website Home' },
    { id: 'platform-overview', labelAr: '📊 مركز القيادة', labelEn: '📊 Command Center' },
    { id: 'platform-finance', labelAr: '💰 الذكاء المالي', labelEn: '💰 Financial Intel' },
    { id: 'platform-decisions', labelAr: '🎯 مركز القرارات', labelEn: '🎯 Decision Center' },
    { id: 'platform-risk', labelAr: '⚠️ ذكاء المخاطر', labelEn: '⚠️ Risk Intelligence' },
    { id: 'platform-projects', labelAr: '🏗️ ذكاء المشاريع', labelEn: '🏗️ Project Intel' },
    { id: 'platform-suppliers', labelAr: '🚚 ذكاء الموردين', labelEn: '🚚 Supplier Intel' },
    { id: 'platform-customers', labelAr: '👥 ذكاء العملاء', labelEn: '👥 Customer Intel' },
    { id: 'platform-data-quality', labelAr: '🔍 جودة البيانات', labelEn: '🔍 Data Quality' },
    { id: 'platform-assistant', labelAr: '🤖 المساعد الذكي', labelEn: '🤖 AI Assistant' },
    { id: 'platform-workflows', labelAr: '⚡ سير العمل', labelEn: '⚡ Workflows' },
    { id: 'platform-reports', labelAr: '📄 تقارير التدقيق', labelEn: '📄 Audit Reports' },
    { id: 'platform-alerts', labelAr: '🔔 التنبيهات', labelEn: '🔔 Alerts' },
    { id: 'platform-integrations', labelAr: '🔌 تكامل ERP', labelEn: '🔌 Integrations' },
    { id: 'platform-organization', labelAr: '🏢 المؤسسة والفروع', labelEn: '🏢 Organization' },
    { id: 'platform-billing', labelAr: '💳 الاشتراكات', labelEn: '💳 Billing' },
    { id: 'platform-settings', labelAr: '⚙️ الإعدادات', labelEn: '⚙️ Settings' }
  ];

  return (
    <div className="prototype-toolbar">
      {/* Brand Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className="prototype-badge">
          <span>⚡</span>
          <span>MIKHLAFI LABS // Phase 1.2 Enterprise Navigation Engine</span>
        </span>
      </div>

      {/* Control Groups */}
      <div className="controls-group">
        {/* Quick Page Route Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => onSelectRoute('website')}
            className={`ctrl-btn ${currentRoute === 'website' ? 'active' : ''}`}
            title="Public Corporate Website"
          >
            🌐 {isAr ? 'الموقع العام' : 'Public Site'}
          </button>
          <button
            onClick={() => onSelectRoute('platform-overview')}
            className={`ctrl-btn ${currentRoute === 'platform-overview' ? 'active' : ''}`}
            title="Customer Executive Cockpit"
          >
            📊 {isAr ? 'المنصة' : 'Platform'}
          </button>

          {/* Quick Route Switcher Select */}
          <select
            value={currentRoute}
            onChange={(e) => onSelectRoute(e.target.value as AppRoute)}
            className="ctrl-btn"
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            {routeOptions.map((opt) => (
              <option key={opt.id} value={opt.id} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                {isAr ? opt.labelAr : opt.labelEn}
              </option>
            ))}
          </select>
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
            📱 Mobile
          </button>
        </div>
      </div>
    </div>
  );
};
