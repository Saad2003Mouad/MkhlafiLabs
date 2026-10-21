// MIKHLAFI LABS — Central Route Definitions & Navigation Registry
// Enforces strict separation between Public Website, Authentication, and Customer Application

export const ROUTES = {
  // ── Public Marketing Website ──────────────────────────────────────────────
  PUBLIC: {
    HOME: '/',
    ABOUT: '/about',
    PLATFORM: '/platform', // Public product architecture & capability showcase (NOT customer dashboard!)
    SOLUTIONS: '/solutions',
    SERVICES: '/services',
    SERVICE_DETAIL: '/services/:serviceId',
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
  },

  // ── Platform Operator Control Center ──────────────────────────────────────
  ADMIN: {
    ROOT: '/admin',
    OVERVIEW: '/admin',
    ORGANIZATIONS: '/admin/organizations',
    USERS: '/admin/users',
    LEADS: '/admin/leads',
    PACKAGES: '/admin/packages',
    SERVICES: '/admin/services',
    LICENSES: '/admin/licenses',
    AUDIT: '/admin/audit'
  }
} as const;

export type RouteCategory = 'public' | 'auth' | 'app' | 'admin' | 'not-found';

export interface RouteMatch {
  category: RouteCategory;
  path: string;
  matchedRoute: string;
  params?: Record<string, string>;
}

export function parseRoute(pathname: string): RouteMatch {
  const normalized = pathname.toLowerCase().replace(/\/+$/, '') || '/';

  // Auth routes
  if (normalized === '/login' || normalized === '/signin' || normalized === '/sign-in' || normalized === '/auth/login') {
    return { category: 'auth', path: normalized, matchedRoute: ROUTES.AUTH.LOGIN };
  }
  if (normalized === '/register' || normalized === '/signup' || normalized === '/sign-up' || normalized === '/auth/register') {
    return { category: 'auth', path: normalized, matchedRoute: ROUTES.AUTH.REGISTER };
  }

  // Platform Administration routes (/admin/*)
  if (normalized === '/admin' || normalized === '/admin/overview' || normalized === '/admin/dashboard' || normalized === '/admin/control') {
    return { category: 'admin', path: normalized, matchedRoute: ROUTES.ADMIN.OVERVIEW };
  }
  if (normalized === '/admin/organizations' || normalized === '/admin/tenants') return { category: 'admin', path: normalized, matchedRoute: ROUTES.ADMIN.ORGANIZATIONS };
  if (normalized === '/admin/users' || normalized === '/admin/members') return { category: 'admin', path: normalized, matchedRoute: ROUTES.ADMIN.USERS };
  if (normalized === '/admin/leads' || normalized === '/admin/inquiries') return { category: 'admin', path: normalized, matchedRoute: ROUTES.ADMIN.LEADS };
  if (normalized === '/admin/packages' || normalized === '/admin/plans') return { category: 'admin', path: normalized, matchedRoute: ROUTES.ADMIN.PACKAGES };
  if (normalized === '/admin/licenses' || normalized === '/admin/license') return { category: 'admin', path: normalized, matchedRoute: ROUTES.ADMIN.LICENSES };
  if (normalized === '/admin/services' || normalized === '/admin/engines' || normalized === '/admin/catalog') return { category: 'admin', path: normalized, matchedRoute: ROUTES.ADMIN.SERVICES };
  if (normalized === '/admin/audit' || normalized === '/admin/logs') return { category: 'admin', path: normalized, matchedRoute: ROUTES.ADMIN.AUDIT };
  if (normalized.startsWith('/admin')) {
    return { category: 'admin', path: normalized, matchedRoute: ROUTES.ADMIN.OVERVIEW };
  }

  // Protected Customer Application routes (/app/*)
  if (normalized === '/app' || normalized === '/app/overview' || normalized === '/app/dashboard' || normalized === '/app/cockpit') {
    return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.ROOT };
  }
  if (normalized === '/app/decisions' || normalized === '/app/decision') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.DECISIONS };
  if (normalized === '/app/risk' || normalized === '/app/risks') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.RISK };
  if (normalized === '/app/projects' || normalized === '/app/project') {
    return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.PROJECTS };
  }
  if (normalized === '/app/suppliers' || normalized === '/app/supplier') {
    return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.SUPPLIERS };
  }
  if (normalized === '/app/customers' || normalized === '/app/customer') {
    return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.CUSTOMERS };
  }
  if (normalized === '/app/data-quality' || normalized === '/app/quality') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.DATA_QUALITY };
  if (normalized === '/app/assistant' || normalized === '/app/ai' || normalized === '/app/chat' || normalized === '/app/copilot') {
    return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.ASSISTANT };
  }
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
  if (normalized === '/app/organization' || normalized === '/app/organizations' || normalized === '/app/branch' || normalized === '/app/branches') {
    return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.ORGANIZATION };
  }
  if (normalized === '/app/billing' || normalized === '/app/subscription') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.BILLING };
  if (normalized === '/app/settings' || normalized === '/app/setting') {
    return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.SETTINGS };
  }
  if (normalized === '/app/finance' || normalized === '/app/financial' || normalized === '/app/detail') {
    return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.FINANCE };
  }

  // Direct top-level workspace aliases (e.g., /finance, /decisions, /risk, /projects, /suppliers, etc.)
  // Resolves directly into customer application view or prompts authentication seamlessly
  if (normalized === '/finance' || normalized === '/financial') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.FINANCE };
  if (normalized === '/decisions' || normalized === '/decision') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.DECISIONS };
  if (normalized === '/risk' || normalized === '/risks') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.RISK };
  if (normalized === '/projects' || normalized === '/project') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.PROJECTS };
  if (normalized === '/suppliers' || normalized === '/supplier') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.SUPPLIERS };
  if (normalized === '/customers' || normalized === '/customer') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.CUSTOMERS };
  if (normalized === '/data-quality' || normalized === '/quality') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.DATA_QUALITY };
  if (normalized === '/assistant' || normalized === '/ai' || normalized === '/chat' || normalized === '/copilot') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.ASSISTANT };
  if (normalized === '/reports' || normalized === '/report') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.REPORTS };
  if (normalized === '/alerts' || normalized === '/alert') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.ALERTS };
  if (normalized === '/integrations' || normalized === '/integration') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.INTEGRATIONS };
  if (normalized === '/workflows' || normalized === '/workflow') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.WORKFLOWS };
  if (normalized === '/organization' || normalized === '/organizations' || normalized === '/branches' || normalized === '/branch') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.ORGANIZATION };
  if (normalized === '/billing' || normalized === '/subscription') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.BILLING };
  if (normalized === '/settings' || normalized === '/setting') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.SETTINGS };
  if (normalized === '/dashboard' || normalized === '/cockpit') return { category: 'app', path: normalized, matchedRoute: ROUTES.APP.ROOT };

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

  // Dedicated Service Pages (/services/:serviceId or /solutions/:serviceId)
  if (normalized.startsWith('/services/') && normalized.length > '/services/'.length) {
    const serviceId = normalized.replace('/services/', '').split('/')[0];
    return {
      category: 'public',
      path: normalized,
      matchedRoute: ROUTES.PUBLIC.SERVICE_DETAIL,
      params: { serviceId }
    };
  }
  if (normalized.startsWith('/solutions/') && normalized.length > '/solutions/'.length) {
    const serviceId = normalized.replace('/solutions/', '').split('/')[0];
    return {
      category: 'public',
      path: normalized,
      matchedRoute: ROUTES.PUBLIC.SERVICE_DETAIL,
      params: { serviceId }
    };
  }

  // Public Marketing routes and common aliases
  if (normalized === '/' || normalized === '/home') return { category: 'public', path: normalized, matchedRoute: ROUTES.PUBLIC.HOME };
  if (normalized === '/about' || normalized === '/about-us' || normalized === '/aboutus') return { category: 'public', path: normalized, matchedRoute: ROUTES.PUBLIC.ABOUT };
  if (normalized === '/platform' || normalized === '/features' || normalized === '/architecture') return { category: 'public', path: normalized, matchedRoute: ROUTES.PUBLIC.PLATFORM };
  if (normalized === '/solutions' || normalized === '/services' || normalized === '/service') return { category: 'public', path: normalized, matchedRoute: ROUTES.PUBLIC.SOLUTIONS };
  if (normalized === '/industries' || normalized === '/sectors') return { category: 'public', path: normalized, matchedRoute: ROUTES.PUBLIC.INDUSTRIES };
  if (normalized === '/pricing' || normalized === '/plans' || normalized === '/packages') return { category: 'public', path: normalized, matchedRoute: ROUTES.PUBLIC.PRICING };
  if (normalized === '/contact' || normalized === '/contact-us' || normalized === '/contactus') return { category: 'public', path: normalized, matchedRoute: ROUTES.PUBLIC.CONTACT };

  // Unknown route -> 404
  return { category: 'not-found', path: normalized, matchedRoute: normalized };
}
