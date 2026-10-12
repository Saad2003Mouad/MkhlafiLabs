import React, { useState, useEffect } from 'react';
import { ThemeMode, LocaleMode, AppRoute, ViewportMode } from './types';
import { ScenarioToolbar } from './components/common/ScenarioToolbar';
import { WebsiteHome } from './components/website/WebsiteHome';
import { Shell } from './components/Shell';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { IntelligenceDetail } from './components/IntelligenceDetail';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [locale, setLocale] = useState<LocaleMode>('ar');
  const [viewport, setViewport] = useState<ViewportMode>('desktop');

  // Determine initial route from URL pathname
  const getInitialRoute = (): AppRoute => {
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/platform/intelligence') || path.startsWith('/detail')) {
      return 'detail';
    }
    if (path.startsWith('/platform') || path.startsWith('/dashboard') || path.startsWith('/app') || path.startsWith('/prototype')) {
      return 'platform';
    }
    return 'website';
  };

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getInitialRoute);

  // Sync route with URL history
  const navigateRoute = (targetRoute: AppRoute) => {
    setCurrentRoute(targetRoute);
    let targetPath = '/';
    if (targetRoute === 'platform') targetPath = '/platform';
    if (targetRoute === 'detail') targetPath = '/platform/intelligence';

    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getInitialRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Synchronize HTML attributes with current theme and locale
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', locale);
  }, [locale]);

  return (
    <div className="prototype-root">
      {/* Universal Scenario & Inspection Bar */}
      <ScenarioToolbar
        theme={theme}
        locale={locale}
        currentRoute={currentRoute}
        viewport={viewport}
        onSelectRoute={navigateRoute}
        onSelectTheme={setTheme}
        onSelectLocale={setLocale}
        onSelectViewport={setViewport}
      />

      {/* Main Viewport Container (with 390px mobile simulation support) */}
      <div className={`viewport-container ${viewport === 'mobile' ? 'simulated-mobile' : ''}`}>
        <div className="page-wrapper" style={{ width: '100%' }}>
          {currentRoute === 'website' ? (
            /* Redesigned Public Corporate Website */
            <WebsiteHome
              locale={locale}
              theme={theme}
              onToggleLocale={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              onNavigatePlatform={() => navigateRoute('platform')}
              onNavigateDetail={() => navigateRoute('detail')}
            />
          ) : (
            /* Redesigned Customer Platform Shell */
            <Shell
              theme={theme}
              locale={locale}
              currentRoute={currentRoute}
              onNavigateRoute={navigateRoute}
              onNavigateHome={() => navigateRoute('website')}
              onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              onToggleLocale={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
            >
              {currentRoute === 'platform' ? (
                <ExecutiveDashboard
                  locale={locale}
                  onNavigateDetail={() => navigateRoute('detail')}
                />
              ) : (
                <IntelligenceDetail
                  locale={locale}
                  onBack={() => navigateRoute('platform')}
                />
              )}
            </Shell>
          )}
        </div>
      </div>
    </div>
  );
};
