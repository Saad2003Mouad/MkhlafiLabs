// MIKHLAFI LABS — Central Application Entry Point & Unified Router
// Enforces strict separation between Public Website, Dedicated Auth, and Protected Customer Application

import React, { useState, useEffect, useCallback } from 'react';
import { ThemeMode, LocaleMode } from './types';
import { ROUTES, parseRoute, RouteMatch } from './router/routes';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';

// Layouts & Guards
import { PublicLayout } from './layouts/PublicLayout';
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './guards/ProtectedRoute';

// Platform Administration Page
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

// Public Website Pages
import { WebsiteHome } from './components/website/WebsiteHome';
import { AboutPage } from './pages/public/AboutPage';
import { PlatformOverviewPage } from './pages/public/PlatformOverviewPage';
import { SolutionsPage } from './pages/public/SolutionsPage';
import { IndustriesPage } from './pages/public/IndustriesPage';
import { PricingPage } from './pages/public/PricingPage';
import { ContactPage } from './pages/public/ContactPage';

// Dedicated Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// 404 Not Found Page
import { NotFoundPage } from './pages/not-found/NotFoundPage';

// Protected Customer Application Views
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

const AppRouterContent: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [locale, setLocale] = useState<LocaleMode>('ar');
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');

  const { isAuthModalOpen, closeAuthModal, refreshAuth } = useAuth();

  // Navigation handler
  const navigate = useCallback((targetPath: string) => {
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    setCurrentPath(targetPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen to browser forward/back buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Global click interception for internal links
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      // If href is an internal path and not an anchor scroll or external link
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !target.getAttribute('download') &&
        target.getAttribute('target') !== '_blank'
      ) {
        e.preventDefault();
        navigate(href);
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [navigate]);

  // Sync theme and locale attributes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', locale);
  }, [locale]);

  const routeMatch: RouteMatch = parseRoute(currentPath);

  // ── Render Dedicated Auth Pages ───────────────────────────────────────────
  if (routeMatch.category === 'auth') {
    if (routeMatch.matchedRoute === ROUTES.AUTH.LOGIN) {
      return (
        <LoginPage
          locale={locale}
          theme={theme}
          onToggleLocale={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onNavigateHome={() => navigate(ROUTES.PUBLIC.HOME)}
          onNavigateRegister={(returnUrl) =>
            navigate(returnUrl ? `${ROUTES.AUTH.REGISTER}?returnUrl=${encodeURIComponent(returnUrl)}` : ROUTES.AUTH.REGISTER)
          }
          onLoginSuccess={(dest) => navigate(dest || ROUTES.APP.ROOT)}
        />
      );
    }

    if (routeMatch.matchedRoute === ROUTES.AUTH.REGISTER) {
      return (
        <RegisterPage
          locale={locale}
          theme={theme}
          onToggleLocale={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onNavigateHome={() => navigate(ROUTES.PUBLIC.HOME)}
          onNavigateLogin={(returnUrl) =>
            navigate(returnUrl ? `${ROUTES.AUTH.LOGIN}?returnUrl=${encodeURIComponent(returnUrl)}` : ROUTES.AUTH.LOGIN)
          }
          onRegisterSuccess={(dest) => navigate(dest || ROUTES.APP.ROOT)}
        />
      );
    }
  }

  // ── Render Protected Customer Application Workspace (/app/*) ──────────────
  if (routeMatch.category === 'app') {
    const renderCustomerView = () => {
      switch (routeMatch.matchedRoute) {
        case ROUTES.APP.FINANCE:
          return <IntelligenceDetail locale={locale} onBack={() => navigate(ROUTES.APP.OVERVIEW)} />;
        case ROUTES.APP.DECISIONS:
          return <DecisionsView locale={locale} onNavigateDetail={() => navigate(ROUTES.APP.FINANCE)} />;
        case ROUTES.APP.RISK:
          return <RiskView locale={locale} />;
        case ROUTES.APP.PROJECTS:
          return <ProjectsView locale={locale} />;
        case ROUTES.APP.SUPPLIERS:
          return <SuppliersView locale={locale} />;
        case ROUTES.APP.CUSTOMERS:
          return <CustomersView locale={locale} />;
        case ROUTES.APP.DATA_QUALITY:
          return <DataQualityView locale={locale} />;
        case ROUTES.APP.ASSISTANT:
          return <AssistantView locale={locale} />;
        case ROUTES.APP.REPORTS:
          return <ReportsView locale={locale} />;
        case ROUTES.APP.ALERTS:
          return <AlertsView locale={locale} />;
        case ROUTES.APP.INTEGRATIONS:
          return <IntegrationsView locale={locale} />;
        case ROUTES.APP.WORKFLOWS:
          return <WorkflowsView locale={locale} />;
        case ROUTES.APP.ORGANIZATION:
          return <OrganizationView locale={locale} />;
        case ROUTES.APP.BILLING:
          return <BillingView locale={locale} />;
        case ROUTES.APP.SETTINGS:
          return <SettingsView locale={locale} />;
        case ROUTES.APP.ROOT:
        case ROUTES.APP.OVERVIEW:
        default:
          return <ExecutiveDashboard locale={locale} onNavigateDetail={() => navigate(ROUTES.APP.FINANCE)} />;
      }
    };

    return (
      <ProtectedRoute
        currentPath={currentPath}
        locale={locale}
        onRedirectToLogin={(returnPath) =>
          navigate(`${ROUTES.AUTH.LOGIN}?returnUrl=${encodeURIComponent(returnPath)}`)
        }
      >
        <CustomerLayout
          theme={theme}
          locale={locale}
          currentPath={routeMatch.matchedRoute}
          onNavigate={navigate}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onToggleLocale={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
        >
          {renderCustomerView()}
        </CustomerLayout>
      </ProtectedRoute>
    );
  }

  // ── Render Platform Operator Control Center (/admin/*) ────────────────────
  if (routeMatch.category === 'admin') {
    return (
      <ProtectedRoute
        currentPath={currentPath}
        locale={locale}
        onRedirectToLogin={(returnPath) =>
          navigate(`${ROUTES.AUTH.LOGIN}?returnUrl=${encodeURIComponent(returnPath)}`)
        }
      >
        <AdminLayout
          theme={theme}
          locale={locale}
          currentPath={routeMatch.matchedRoute}
          onNavigate={navigate}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onToggleLocale={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
        >
          <AdminDashboardPage
            locale={locale}
            currentRoute={routeMatch.matchedRoute}
            onNavigate={navigate}
          />
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  // ── Render 404 Not Found Page ───────────────────────────────────────────────
  if (routeMatch.category === 'not-found') {
    return (
      <PublicLayout
        locale={locale}
        theme={theme}
        onToggleLocale={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onNavigate={navigate}
      >
        <NotFoundPage
          locale={locale}
          onNavigate={navigate}
        />
      </PublicLayout>
    );
  }

  // ── Render Public Marketing Website ────────────────────────────────────────
  const renderPublicPage = () => {
    switch (routeMatch.matchedRoute) {
      case ROUTES.PUBLIC.ABOUT:
        return (
          <AboutPage
            locale={locale}
            onNavigate={navigate}
          />
        );
      case ROUTES.PUBLIC.PLATFORM:
        return (
          <PlatformOverviewPage
            locale={locale}
            onNavigateLogin={() => navigate(ROUTES.AUTH.LOGIN)}
            onNavigateRegister={() => navigate(ROUTES.AUTH.REGISTER)}
            onRequestDemo={() => navigate(ROUTES.PUBLIC.CONTACT)}
          />
        );
      case ROUTES.PUBLIC.SOLUTIONS:
        return (
          <SolutionsPage
            locale={locale}
            onNavigateRegister={() => navigate(ROUTES.AUTH.REGISTER)}
            onRequestDemo={() => navigate(ROUTES.PUBLIC.CONTACT)}
          />
        );
      case ROUTES.PUBLIC.INDUSTRIES:
        return (
          <IndustriesPage
            locale={locale}
            onNavigateRegister={() => navigate(ROUTES.AUTH.REGISTER)}
            onRequestDemo={() => navigate(ROUTES.PUBLIC.CONTACT)}
          />
        );
      case ROUTES.PUBLIC.PRICING:
        return (
          <PricingPage
            locale={locale}
            onNavigateRegister={() => navigate(ROUTES.AUTH.REGISTER)}
            onRequestDemo={() => navigate(ROUTES.PUBLIC.CONTACT)}
          />
        );
      case ROUTES.PUBLIC.CONTACT:
        return (
          <ContactPage
            locale={locale}
          />
        );
      case ROUTES.PUBLIC.HOME:
      default:
        return (
          <WebsiteHome
            locale={locale}
            onNavigatePlatform={() => navigate(ROUTES.PUBLIC.PLATFORM)}
            onNavigateDetail={() => {
              navigate(ROUTES.PUBLIC.SOLUTIONS);
            }}
          />
        );
    }
  };

  return (
    <>
      <PublicLayout
        locale={locale}
        theme={theme}
        onToggleLocale={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onNavigate={navigate}
      >
        {renderPublicPage()}
      </PublicLayout>

      {/* Auxiliary Auth Modal if triggered */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        locale={locale}
        onAuthSuccess={() => {
          refreshAuth();
          navigate(ROUTES.APP.ROOT);
        }}
      />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRouterContent />
    </AuthProvider>
  );
};
