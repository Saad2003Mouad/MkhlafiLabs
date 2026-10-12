// MIKHLAFI LABS — Central Route Definitions & Navigation Registry
// Enforces strict separation between Public Website, Authentication, and Customer Application

export const ROUTES = {
  // ── Public Marketing Website ──────────────────────────────────────────────
  PUBLIC: {
    HOME: '/',
    ABOUT: '/about',
    PLATFORM: '/platform', // Public product architecture & capability showcase (NOT customer dashboard!)
    SOLUTIONS: '/solutions',
    INDUSTRIES: '/industries',
    PRICING: '/pricing',
    CONTACT: '/contact'
  },

  // ── Dedicated Authentication ──────────────────────────────────────────────
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register'
  },

  // ── Protected Customer Application Workspace ─────────────────────────────
  APP: {
    ROOT: '/app',
    OVERVIEW: '/app',
    DECISIONS: '/app/decisions',
    RISK: '/app/risk',
    PROJECTS: '/app/projects',
    SUPPLIERS: '/app/suppliers',
    CUSTOMERS: '/app/customers',
    DATA_QUALITY: '/app/data-quality',
    ASSISTANT: '/app/assistant',
    REPORTS: '/app/reports',
    ALERTS: '/app/alerts',
    INTEGRATIONS: '/app/integrations',
    WORKFLOWS: '/app/workflows',
    ORGANIZATION: '/app/organization',
    BILLING: '/app/billing',
    SETTINGS: '/app/settings',
    FINANCE: '/app/finance'
  }
} as const;

export type RouteCategory = 'public' | 'auth' | 'app' | 'not-found';

export interface RouteMatch {
  category: RouteCategory;
  path: string;
  matchedRoute: string;
}

export function parseRoute(pathname: string): RouteMatch {
  const normalized = pathname.toLowerCase().replace(/\/+$/, '') || '/';

  // Auth routes
  if (normalized === '/login') return { category: 'auth', path: normalized, matchedRoute: ROUTES.AUTH.LOGIN };
  if (normalized === '/register') return { category: 'auth', path: normalized, matchedRoute: ROUTES.AUTH.REGISTER };

  // Protected Customer Application routes
  if (normalized === '/app' || normalized === '/app/overview') {
    return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.ROOT };
  }
  if (normalized === '/app/decisions') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.DECISIONS };
  if (normalized === '/app/risk') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.RISK };
  if (normalized === '/app/projects' || normalized === '/app/project') {
    return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.PROJECTS };
  }
  if (normalized === '/app/suppliers' || normalized === '/app/supplier') {
    return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.SUPPLIERS };
  }
  if (normalized === '/app/customers' || normalized === '/app/customer') {
    return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.CUSTOMERS };
  }
  if (normalized === '/app/data-quality') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.DATA_QUALITY };
  if (normalized === '/app/assistant') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.ASSISTANT };
  if (normalized === '/app/reports' || normalized === '/app/report') {
    return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.REPORTS };
  }
  if (normalized === '/app/alerts' || normalized === '/app/alert') {
    return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.ALERTS };
  }
  if (normalized === '/app/integrations' || normalized === '/app/integration') {
    return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.INTEGRATIONS };
  }
  if (normalized === '/app/workflows' || normalized === '/app/workflow') {
    return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.WORKFLOWS };
  }
  if (normalized === '/app/organization' || normalized === '/app/branch') {
    return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.ORGANIZATION };
  }
  if (normalized === '/app/billing') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.BILLING };
  if (normalized === '/app/settings' || normalized === '/app/setting') {
    return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.SETTINGS };
  }
  if (normalized === '/app/finance' || normalized === '/app/detail') {
    return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.FINANCE };
  }

  // Legacy platform redirects to /app routes if bookmarked
  if (normalized === '/platform/decisions') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.DECISIONS };
  if (normalized === '/platform/risk') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.RISK };
  if (normalized === '/platform/projects') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.PROJECTS };
  if (normalized === '/platform/suppliers') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.SUPPLIERS };
  if (normalized === '/platform/customers') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.CUSTOMERS };
  if (normalized === '/platform/data-quality') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.DATA_QUALITY };
  if (normalized === '/platform/assistant') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.ASSISTANT };
  if (normalized === '/platform/reports') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.REPORTS };
  if (normalized === '/platform/alerts') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.ALERTS };
  if (normalized === '/platform/integrations') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.INTEGRATIONS };
  if (normalized === '/platform/workflows') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.WORKFLOWS };
  if (normalized === '/platform/organization') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.ORGANIZATION };
  if (normalized === '/platform/billing') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.BILLING };
  if (normalized === '/platform/settings') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.SETTINGS };
  if (normalized === '/platform/finance') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.FINANCE };

  // Public Marketing routes
  if (normalized === '/') return { category: 'public', path: normalized, matchedRoute: ROUTES.PUBLIC.HOME };
  if (normalized === '/about') return { category: 'public', path: normalized, matchedRoute: ROUTES.PUBLIC.ABOUT };
  if (normalized === '/platform') return { category: 'public', path: normalized, matchedRoute: ROUTES.PUBLIC.PLATFORM };
  if (normalized === '/solutions') return { category: 'public', path: normalized, matchedRoute: ROUTES.PUBLIC.SOLUTIONS };
  if (normalized === '/industries') return { category: 'public', path: normalized, matchedRoute: ROUTES.PUBLIC.INDUSTRIES };
  if (normalized === '/pricing') return { category: 'public', path: normalized, matchedRoute: ROUTES.PUBLIC.PRICING };
  if (normalized === '/contact') return { category: 'public', path: normalized, matchedRoute: ROUTES.PUBLIC.CONTACT };

  // Unknown route -> 404
  return { category: 'not-found', path: normalized, matchedRoute: normalized };
}
