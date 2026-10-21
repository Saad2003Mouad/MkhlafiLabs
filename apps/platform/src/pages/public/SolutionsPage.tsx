// MIKHLAFI LABS — Public Solutions & Engines Directory (/solutions)
// Catalog of the intelligence engines with category filtering, search, and deep links.
// Content source: the operator-owned service catalog (see hooks/publishedEngines.ts),
// with the static catalog as a fallback. No operational records.

import React, { useState } from 'react';
import { LocaleMode } from '../../types';
import { usePublishedEngines } from '../../hooks/publishedEngines';
import {
  IconCheckCircle,
  IconArrowRight,
  IconShield,
  IconFileText,
  IconAlertTriangle,
  IconTrendingUp,
  IconTruck,
  IconUsers,
  IconBot,
  IconDatabase
} from '../../components/Icons';

interface SolutionsPageProps {
  locale: LocaleMode;
  onNavigate?: (path: string) => void;
  onNavigateRegister: () => void;
  onRequestDemo: (serviceName?: string) => void;
}

export const SolutionsPage: React.FC<SolutionsPageProps> = ({
  locale,
  onNavigate,
  onNavigateRegister,
  onRequestDemo
}) => {
  const isAr = locale === 'ar';
  const engines = usePublishedEngines();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const engineTotal = engines.length;

  const handleServiceClick = (serviceId: string) => {
    if (onNavigate) {
      onNavigate(`/services/${serviceId}`);
    } else {
      window.history.pushState({}, '', `/services/${serviceId}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const getEngineIcon = (iconName: string, size = 22) => {
    switch (iconName) {
      case 'file-text': return <IconFileText size={size} />;
      case 'check-circle': return <IconCheckCircle size={size} />;
      case 'alert-triangle': return <IconAlertTriangle size={size} />;
      case 'trending-up': return <IconTrendingUp size={size} />;
      case 'truck': return <IconTruck size={size} />;
      case 'users': return <IconUsers size={size} />;
      case 'bot': return <IconBot size={size} />;
      case 'database': return <IconDatabase size={size} />;
      default: return <IconShield size={size} />;
    }
  };

  const categories = [
    { id: 'all', labelAr: `كل المحركات (${engineTotal})`, labelEn: `All engines (${engineTotal})` },
    { id: 'finance', labelAr: 'المالية والسيولة', labelEn: 'Finance & liquidity' },
    { id: 'operations', labelAr: 'المشاريع والعمليات', labelEn: 'Projects & operations' },
    { id: 'supply', labelAr: 'الموردون والعملاء', labelEn: 'Suppliers & customers' },
    { id: 'governance', labelAr: 'الحوكمة والذكاء', labelEn: 'Governance & AI' }
  ];

  const mapCategory = (id: string): string => {
    if (id === 'financial-leak-detection' || id === 'risk-radar') return 'finance';
    if (id === 'executive-decisions' || id === 'project-margins') return 'operations';
    if (id === 'supplier-intelligence' || id === 'customer-retention') return 'supply';
    if (id === 'executive-assistant' || id === 'data-quality-governance') return 'governance';
    return 'all';
  };

  const filteredServices = engines.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || mapCategory(s.id) === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      (isAr ? s.titleAr : s.titleEn).toLowerCase().includes(q) ||
      (isAr ? s.taglineAr : s.taglineEn).toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const comparisonRows = [
    {
      dimAr: 'توقيت التدخل',
      dimEn: 'Intervention timing',
      convAr: 'تقارير بعد حدوث الحدث',
      convEn: 'Reporting after the event has happened',
      oursAr: 'فحوصات ضمن دورة العمل قبل الاعتماد',
      oursEn: 'Checks within the working cycle, before approval'
    },
    {
      dimAr: 'عمق الدليل',
      dimEn: 'Evidence depth',
      convAr: 'أرقام مجمعة ومؤشرات عامة',
      convEn: 'Aggregated totals and high-level indicators',
      oursAr: 'كل سند وقيد وبند بمصدره',
      oursEn: 'Each voucher, entry, and line item with its source'
    },
    {
      dimAr: 'قابلية التتبع',
      dimEn: 'Traceability',
      convAr: 'نتيجة لا يصاحبها مصدر',
      convEn: 'A result with no attached provenance',
      oursAr: 'ارتباط مباشر بالسجل المصدر وزمن الرصد',
      oursEn: 'Direct link to the source record and detection time'
    },
    {
      dimAr: 'الإجراء',
      dimEn: 'Action',
      convAr: 'رسوم بيانية يترك تحليلها للقارئ',
      convEn: 'Charts left for the reader to interpret',
      oursAr: 'أولوية واضحة مع مسؤولية مقترحة ومراجعة موثقة',
      oursEn: 'Clear priority with suggested ownership and a documented review'
    },
    {
      dimAr: 'ملاءمة القطاع',
      dimEn: 'Sector fit',
      convAr: 'قوالب مالية بحتة في كثير من الأدوات',
      convEn: 'Finance-only templates in many tools',
      oursAr: 'محركات تشغيلية تناسب المقاولات والتصنيع واللوجستيات والتجزئة والخدمات',
      oursEn: 'Operational engines suited to contracting, manufacturing, logistics, retail, and services'
    }
  ];

  return (
    <div>
      {/* Hero */}
      <section className="pp-hero">
        <div className="ml-container pp-hero__inner">
          <span className="pp-hero__eyebrow">
            {isAr ? 'دليل المحركات' : 'SOLUTIONS DIRECTORY'}
          </span>
          <h1 className="ml-display pp-hero__title">
            {isAr
              ? 'محركات استخباراتية واضحة النطاق لحماية القرار والتشغيل'
              : 'Clearly scoped intelligence engines for operational control'}
          </h1>
          <p className="ml-lead pp-hero__lead">
            {isAr
              ? `تعرض ${engineTotal} محركات تعمل فوق أنظمتك الحالية. اختر محركاً لاستعراض منهجيته وأسئلته الشائعة ونطاق تكامله.`
              : `${engineTotal} engines run over your existing systems. Pick one to review its methodology, integration scope, and questions teams usually ask.`}
          </p>
          <div className="pp-hero__actions">
            <button onClick={() => onRequestDemo()} className="ml-btn ml-btn--primary ml-btn--lg">
              <span>{isAr ? 'طلب جلسة استعراض' : 'Book a walkthrough'}</span>
              <IconArrowRight size={16} />
            </button>
            <button onClick={onNavigateRegister} className="ml-btn ml-btn--ghost ml-btn--lg">
              <span>{isAr ? 'إنشاء مساحة عمل' : 'Create a workspace'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="ml-section--tight">
        <div className="ml-container">
          <div className="pp-filter">
            <div className="industry-switch" style={{ margin: 0 }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`industry-switch__btn ${selectedCategory === cat.id ? 'is-active' : ''}`}
                  aria-pressed={selectedCategory === cat.id}
                >
                  {isAr ? cat.labelAr : cat.labelEn}
                </button>
              ))}
            </div>

            <div className="pp-search">
              <label className="ml-sr-only" htmlFor="pp-engine-search">
                {isAr ? 'بحث في المحركات' : 'Search engines'}
              </label>
              <input
                id="pp-engine-search"
                type="search"
                className="ml-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'ابحث في المحركات…' : 'Search engines…'}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Engine grid */}
      <section style={{ paddingBottom: 'clamp(56px, 8vw, 104px)' }}>
        <div className="ml-container">
          {filteredServices.length === 0 ? (
            <div className="ml-panel">
              <div className="ml-panel__body pp-success">
                <p className="pp-success__desc">
                  {isAr
                    ? 'لا توجد محركات مطابقة لهذا البحث. جرّب مصطلحاً آخر أو اعرض كل المحركات.'
                    : 'No engines match this search. Try another term or view the full list.'}
                </p>
                <button
                  type="button"
                  className="ml-btn ml-btn--ghost"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  <span>{isAr ? 'عرض كل المحركات' : 'View all engines'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="pp-engine-grid">
              {filteredServices.map((service) => (
                <article
                  key={service.id}
                  className="pp-engine"
                  style={{ '--pp-accent': service.accentColor } as React.CSSProperties}
                >
                  <div className="pp-engine__head">
                    <span className="pp-engine__icon" aria-hidden="true">
                      {getEngineIcon(service.iconName, 20)}
                    </span>
                    <span className="pp-engine__meta">
                      <span className="ml-badge">{`#${service.engineNumber}`}</span>
                      <span className="ml-badge ml-badge--accent">{isAr ? service.badgeAr : service.badgeEn}</span>
                    </span>
                  </div>

                  <div>
                    <h2 className="pp-engine__title">
                      {isAr ? service.titleAr : service.titleEn}
                    </h2>
                    <p className="pp-engine__tagline" style={{ marginTop: 6 }}>
                      {isAr ? service.taglineAr : service.taglineEn}
                    </p>
                  </div>

                  <p className="pp-engine__desc">
                    {isAr ? service.heroDescriptionAr : service.heroDescriptionEn}
                  </p>

                  <div className="pp-engine__actions">
                    <button
                      type="button"
                      className="ml-btn ml-btn--primary"
                      onClick={() => handleServiceClick(service.id)}
                    >
                      <span>{isAr ? 'تفاصيل المحرك' : 'Engine details'}</span>
                      <IconArrowRight size={15} />
                    </button>
                    <button
                      type="button"
                      className="ml-btn ml-btn--ghost"
                      onClick={() => onRequestDemo(isAr ? service.titleAr : service.titleEn)}
                    >
                      <span>{isAr ? 'طلب تجربة' : 'Request a pilot'}</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Comparison */}
      <section className="site-section site-section--alt">
        <div className="ml-container">
          <div className="site-section__head site-section__head--center">
            <span className="ml-eyebrow">{isAr ? 'مقارنة منهجية' : 'METHOD COMPARISON'}</span>
            <h2 className="ml-heading site-section__title">
              {isAr
                ? 'الفرق بين التقرير السلبي والفحص الحتمي'
                : 'The difference between passive reporting and deterministic checks'}
            </h2>
            <p className="ml-lead site-section__lead" style={{ marginInline: 'auto', textAlign: 'center' }}>
              {isAr
                ? 'الاختلاف في الطريقة لا في الوعود: كيف تُعرض النتائج ومن يستطيع تتبعها.'
                : 'A difference in method rather than promises: how results are presented and how far they can be traced.'}
            </p>
          </div>

          <div className="pp-compare">
            <div style={{ overflowX: 'auto' }}>
              <table className="pp-compare__table">
                <thead>
                  <tr>
                    <th scope="col">{isAr ? 'البُعد' : 'Dimension'}</th>
                    <th scope="col">{isAr ? 'التقارير التقليدية' : 'Conventional reporting'}</th>
                    <th scope="col">{isAr ? 'MIKHLAFI LABS' : 'MIKHLAFI LABS'}</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx}>
                      <td>{isAr ? row.dimAr : row.dimEn}</td>
                      <td>{isAr ? row.convAr : row.convEn}</td>
                      <td className="pp-compare__cell--good">{isAr ? row.oursAr : row.oursEn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="site-section site-section--tight">
        <div className="ml-container">
          <div className="site-cta">
            <span className="ml-eyebrow">{isAr ? 'تجربة عملية' : 'HANDS-ON EVALUATION'}</span>
            <h2 className="ml-heading site-section__title">
              {isAr ? 'جرّب المحركات على نطاق مؤسستك' : 'Evaluate the engines in your own context'}
            </h2>
            <p className="ml-lead site-section__lead" style={{ marginInline: 'auto', textAlign: 'center' }}>
              {isAr
                ? 'تحدث مع فريقنا لاستعراض المحرك المناسب لقطاعك، أو أنشئ مساحة عمل لبدء التقييم.'
                : 'Talk to us about the engine that fits your sector, or create a workspace to start evaluating.'}
            </p>
            <div className="site-cta__actions">
              <button onClick={() => onRequestDemo()} className="ml-btn ml-btn--primary ml-btn--lg">
                <span>{isAr ? 'طلب عرض مخصص' : 'Request a tailored demo'}</span>
                <IconArrowRight size={16} />
              </button>
              <button onClick={onNavigateRegister} className="ml-btn ml-btn--ghost ml-btn--lg">
                <span>{isAr ? 'إنشاء حساب مؤسسي' : 'Create an enterprise account'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
