// MIKHLAFI LABS — Central REST API & Security Gateway (apps/api)
// Adheres to Section 12 (API Specifications) of Master Architecture v1.0

import http from 'http';

const PORT = process.env.API_PORT || 4000;

export const routes = {
  // Public Catalog
  'GET /catalog/services': (req, res) => {
    return jsonResponse(res, 200, {
      services: [
        { id: 'financial-intelligence', nameAr: 'كشف الهدر المالي والاختلالات', nameEn: 'Financial Leak Detection', status: 'active' },
        { id: 'executive-decisions', nameAr: 'مركز القرارات التنفيذية', nameEn: 'Executive Decision Center', status: 'active' },
        { id: 'risk-prediction', nameAr: 'التنبؤ بالمخاطر والإنذار المبكر', nameEn: 'Predictive Risk Intelligence', status: 'active' },
        { id: 'project-intelligence', nameAr: 'ذكاء أداء المشاريع والإنشاءات', nameEn: 'Project & Construction Intelligence', status: 'active' },
        { id: 'supplier-intelligence', nameAr: 'ذكاء الموردين والمشتريات', nameEn: 'Supplier Intelligence & Procurement', status: 'active' },
        { id: 'customer-intelligence', nameAr: 'مراقبة العملاء ومخاطر فقدانهم', nameEn: 'Customer & Revenue Retention', status: 'active' },
        { id: 'ai-assistant', nameAr: 'المساعد التنفيذي المدعوم بالبيانات', nameEn: 'Grounded Executive AI Assistant', status: 'active' },
        { id: 'data-quality', nameAr: 'مراقبة جودة البيانات والربط', nameEn: 'Data Quality & Normalization', status: 'active' }
      ]
    });
  },

  'GET /catalog/plans': (req, res) => {
    return jsonResponse(res, 200, {
      plans: [
        { id: 'starter-finance', nameAr: 'حزمة التدقيق المالي الأساسية', priceMonthlySAR: 18500, modulesCount: 2 },
        { id: 'core-enterprise', nameAr: 'الحزمة المؤسسية المتقدمة', priceMonthlySAR: 34000, modulesCount: 4 },
        { id: 'full-intelligence', nameAr: 'منظومة الذكاء الشاملة للمجموعات', priceMonthlySAR: 62000, modulesCount: 8 }
      ]
    });
  },

  // Account & Tenant Isolation (Section 5 & 7)
  'GET /me': (req, res) => {
    return jsonResponse(res, 200, {
      user: {
        id: 'usr-saad-01',
        name: 'Saad Al-Mikhlafi',
        email: 's.mikhlafi@mikhlafi-labs.com',
        role: 'Platform Super Admin',
        currentOrganizationId: 'org-al-yusr-holding'
      }
    });
  },

  'GET /organizations': (req, res) => {
    return jsonResponse(res, 200, {
      organizations: [
        { id: 'org-al-yusr-holding', nameAr: 'مجموعة اليسر القابضة للإنشاءات والتوريد', tier: 'enterprise', activeModules: 8 },
        { id: 'org-riyadh-contracting', nameAr: 'شركة المقاولات الحديثة المتطورة', tier: 'growth', activeModules: 4 },
        { id: 'org-gulf-logistics', nameAr: 'مجموعة الخليج للخدمات اللوجستية', tier: 'starter', activeModules: 2 }
      ]
    });
  },

  // Quote Requests (Section 8)
  'POST /quote-requests': (req, res, body) => {
    const quoteId = `QR-${Date.now().toString(36).toUpperCase()}`;
    return jsonResponse(res, 201, {
      status: 'success',
      quoteRequestId: quoteId,
      state: 'New',
      receivedAt: new Date().toISOString(),
      messageAr: 'تم استلام طلب التخصيص بنجاح وسيتم التدقيق وإصدار عرض السعر خلال 24 ساعة.'
    });
  },

  // Audit Logs (Section 5 & 12)
  'GET /admin/audit-logs': (req, res) => {
    return jsonResponse(res, 200, {
      logs: [
        { id: 'aud-01', action: 'DECISION_APPROVED', target: 'INV-8912', actor: 'Saad Al-Mikhlafi', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: 'aud-02', action: 'TENANT_ENTITLEMENT_SYNC', target: 'org-al-yusr-holding', actor: 'System Worker', timestamp: new Date(Date.now() - 7200000).toISOString() }
      ]
    });
  },

  // Health
  'GET /health': (req, res) => {
    return jsonResponse(res, 200, { status: 'healthy', uptime: process.uptime(), timestamp: new Date().toISOString() });
  }
};

function jsonResponse(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data, null, 2));
}

export function createApiServer() {
  return http.createServer((req, res) => {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
      return res.end();
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const routeKey = `${req.method} ${parsedUrl.pathname}`;
    const handler = routes[routeKey];

    if (handler) {
      if (req.method === 'POST' || req.method === 'PUT') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const parsedBody = body ? JSON.parse(body) : {};
            handler(req, res, parsedBody);
          } catch (e) {
            jsonResponse(res, 400, { error: 'Invalid JSON payload' });
          }
        });
      } else {
        handler(req, res);
      }
    } else {
      jsonResponse(res, 404, { error: 'Route not found', requested: routeKey });
    }
  });
}

if (process.argv[1] && process.argv[1].endsWith('index.js')) {
  const server = createApiServer();
  server.listen(PORT, () => {
    console.log(`[MIKHLAFI LABS API] Running on http://localhost:${PORT}`);
  });
}
