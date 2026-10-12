// @mikhlafi-labs/catalog — Service Catalog & Plan Definitions
// Master Architecture v1.0 Section 6.1 & 6.2

export class CatalogService {
  static getServices() {
    return [
      { id: 'financial-intelligence', code: 'FIN', nameAr: 'كشف الهدر المالي والاختلالات', status: 'published' },
      { id: 'executive-decisions', code: 'DEC', nameAr: 'مركز القرارات التنفيذية', status: 'published' },
      { id: 'risk-prediction', code: 'RSK', nameAr: 'التنبؤ بالمخاطر والإنذار المبكر', status: 'published' },
      { id: 'project-intelligence', code: 'PRJ', nameAr: 'ذكاء أداء المشاريع والإنشاءات', status: 'published' },
      { id: 'supplier-intelligence', code: 'SUP', nameAr: 'ذكاء الموردين والمشتريات', status: 'published' },
      { id: 'customer-intelligence', code: 'CUS', nameAr: 'مراقبة العملاء ومخاطر فقدانهم', status: 'published' },
      { id: 'ai-assistant', code: 'AST', nameAr: 'المساعد التنفيذي المدعوم بالبيانات', status: 'published' },
      { id: 'data-quality', code: 'DQL', nameAr: 'مراقبة جودة البيانات والربط', status: 'published' }
    ];
  }
}
