import React, { useState, useEffect } from 'react';
import { ThemeMode, LocaleMode, AppRoute, ViewportMode } from './types';
import { ScenarioToolbar } from './components/common/ScenarioToolbar';
import { WebsiteHome } from './components/website/WebsiteHome';
import { Shell } from './components/Shell';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { IntelligenceDetail } from './components/IntelligenceDetail';
import { DecisionsView } from './components/platform/DecisionsView';
import { RiskView } from './components/platform/RiskView';
import { ProjectsView } from './components/platform/ProjectsView';
import { SuppliersView } from './components/platform/SuppliersView';
import { CustomersView } from './components/platform/CustomersView';
import { DataQualityView } from './components/platform/DataQualityView';
import { AssistantView } from './components/platform/AssistantView';
import { ReportsView } from './components/platform/ReportsView';
import { AlertsView } from './components/platform/AlertsView';
import { IntegrationsView } from './components/platform/IntegrationsView';
import { WorkflowsView } from './components/platform/WorkflowsView';
import { OrganizationView } from './components/platform/OrganizationView';
import { BillingView } from './components/platform/BillingView';
import { SettingsView } from './components/platform/SettingsView';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [locale, setLocale] = useState<LocaleMode>('ar');
  const [viewport, setViewport] = useState<ViewportMode>('desktop');

  // Determine initial route from URL pathname
  const getInitialRoute = (): AppRoute => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/platform/decisions')) return 'platform-decisions';
    if (path.includes('/platform/risk')) return 'platform-risk';
    if (path.includes('/platform/project')) return 'platform-projects';
    if (path.includes('/platform/supplier')) return 'platform-suppliers';
    if (path.includes('/platform/customer')) return 'platform-customers';
    if (path.includes('/platform/data-quality')) return 'platform-data-quality';
    if (path.includes('/platform/assistant')) return 'platform-assistant';
    if (path.includes('/platform/report')) return 'platform-reports';
    if (path.includes('/platform/alert')) return 'platform-alerts';
    if (path.includes('/platform/integration')) return 'platform-integrations';
    if (path.includes('/platform/workflow')) return 'platform-workflows';
    if (path.includes('/platform/organization') || path.includes('/platform/branch')) return 'platform-organization';
    if (path.includes('/platform/billing')) return 'platform-billing';
    if (path.includes('/platform/setting')) return 'platform-settings';
    if (path.includes('/platform/finance') || path.includes('/detail')) return 'platform-finance';
    if (path.startsWith('/platform') || path.startsWith('/dashboard') || path.startsWith('/app') || path.startsWith('/overview')) {
      return 'platform-overview';
    }
    return 'website';
  };

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getInitialRoute);

  // Sync route with URL history
  const navigateRoute = (targetRoute: AppRoute) => {
    setCurrentRoute(targetRoute);
    let targetPath = '/';
    switch (targetRoute) {
      case 'platform-overview':
        targetPath = '/platform';
        break;
      case 'platform-finance':
        targetPath = '/platform/finance';
        break;
      case 'platform-decisions':
        targetPath = '/platform/decisions';
        break;
      case 'platform-risk':
        targetPath = '/platform/risk';
        break;
      case 'platform-projects':
        targetPath = '/platform/projects';
        break;
      case 'platform-suppliers':
        targetPath = '/platform/suppliers';
        break;
      case 'platform-customers':
        targetPath = '/platform/customers';
        break;
      case 'platform-data-quality':
        targetPath = '/platform/data-quality';
        break;
      case 'platform-assistant':
        targetPath = '/platform/assistant';
        break;
      case 'platform-reports':
        targetPath = '/platform/reports';
        break;
      case 'platform-alerts':
        targetPath = '/platform/alerts';
        break;
      case 'platform-integrations':
        targetPath = '/platform/integrations';
        break;
      case 'platform-workflows':
        targetPath = '/platform/workflows';
        break;
      case 'platform-organization':
        targetPath = '/platform/organization';
        break;
      case 'platform-billing':
        targetPath = '/platform/billing';
        break;
      case 'platform-settings':
        targetPath = '/platform/settings';
        break;
      case 'website':
      default:
        targetPath = '/';
        break;
    }

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

  const renderPlatformContent = () => {
    switch (currentRoute) {
      case 'platform-overview':
        return (
          <ExecutiveDashboard
            locale={locale}
            onNavigateDetail={() => navigateRoute('platform-finance')}
          />
        );
      case 'platform-finance':
        return (
          <IntelligenceDetail
            locale={locale}
            onBack={() => navigateRoute('platform-overview')}
          />
        );
      case 'platform-decisions':
        return (
          <DecisionsView
            locale={locale}
            onNavigateDetail={() => navigateRoute('platform-finance')}
          />
        );
      case 'platform-risk':
        return <RiskView locale={locale} />;
      case 'platform-projects':
        return <ProjectsView locale={locale} />;
      case 'platform-suppliers':
        return <SuppliersView locale={locale} />;
      case 'platform-customers':
        return <CustomersView locale={locale} />;
      case 'platform-data-quality':
        return <DataQualityView locale={locale} />;
      case 'platform-assistant':
        return <AssistantView locale={locale} />;
      case 'platform-reports':
        return <ReportsView locale={locale} />;
      case 'platform-alerts':
        return <AlertsView locale={locale} />;
      case 'platform-integrations':
        return <IntegrationsView locale={locale} />;
      case 'platform-workflows':
        return <WorkflowsView locale={locale} />;
      case 'platform-organization':
        return <OrganizationView locale={locale} />;
      case 'platform-billing':
        return <BillingView locale={locale} />;
      case 'platform-settings':
        return <SettingsView locale={locale} />;
      default:
        return (
          <ExecutiveDashboard
            locale={locale}
            onNavigateDetail={() => navigateRoute('platform-finance')}
          />
        );
    }
  };

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
              onNavigatePlatform={() => navigateRoute('platform-overview')}
              onNavigateDetail={(modId) => {
                if (modId === 'financial-intelligence') navigateRoute('platform-finance');
                else if (modId === 'executive-decisions') navigateRoute('platform-decisions');
                else if (modId === 'risk-prediction') navigateRoute('platform-risk');
                else if (modId === 'project-intelligence') navigateRoute('platform-projects');
                else if (modId === 'supplier-intelligence') navigateRoute('platform-suppliers');
                else if (modId === 'customer-intelligence') navigateRoute('platform-customers');
                else if (modId === 'ai-assistant') navigateRoute('platform-assistant');
                else if (modId === 'data-quality') navigateRoute('platform-data-quality');
                else navigateRoute('platform-overview');
              }}
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
              {renderPlatformContent()}
            </Shell>
          )}
        </div>
      </div>
    </div>
  );
};
