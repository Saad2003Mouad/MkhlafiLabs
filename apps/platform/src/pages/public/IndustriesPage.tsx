// MIKHLAFI LABS — Public Industries Page (/industries)
// Outlines cross-industry adaptability: Manufacturing, Logistics, Retail, Healthcare, Holding Groups

import React from 'react';
import { LocaleMode } from '../../types';
import {
  IconArrowRight,
  IconProjects,
  IconSupplier,
  IconFinance,
  IconRisk
} from '../../components/Icons';

interface IndustriesPageProps {
  locale: LocaleMode;
  onNavigateRegister: () => void;
  onRequestDemo: () => void;
}

export const IndustriesPage: React.FC<IndustriesPageProps> = ({
  locale,
  onNavigateRegister,
  onRequestDemo
}) => {
  const isAr = locale === 'ar';

  const industries = [
    {
      id: 'industrial-manufacturing',
      icon: <IconProjects size={28} />,
      titleEn: 'Industrial & Heavy Manufacturing',
      titleAr: 'الصناعات الثقيلة والتصنيع المتقدم',
      taglineEn: 'OEE optimization, raw material price variance, and scrap rate controls.',
      taglineAr: 'تحسين الفعالية الكلية للمعدات (OEE)، وضبط تباين أسعار المواد الخام ومعدلات الهالك.',
      challengesEn: [
        'Sudden raw material price surges eroding agreed finished goods margins',
        'Unscheduled machine maintenance halting batch assembly lines',
        'Fragmented ERP inventory counts failing to match shop floor realities'
      ],
      challengesAr: [
        'تقلبات أسعار المواد الخام المفاجئة التي تؤدي لتآكل هوامش المنتجات النهائية',
        'الصيانة غير المجدولة للمعدات التي تعطل خطوط التجميع والإنتاج',
        'عدم تطابق أرصدة المخزون في نظام ERP مع الواقع الفعلي في المستودعات'
      ],
      valueEn: 'Early alert on scrap anomalies, vendor bulk discounts enforcement, and deterministic maintenance scheduling.',
      valueAr: 'تنبيه مبكر بانحرافات الهالك، وتطبيق خصومات الكميات المتفق عليها، وجدولة استباقية للصيانة.'
    },
    {
      id: 'logistics-distribution',
      icon: <IconSupplier size={28} />,
      titleEn: 'Logistics, Fleet & Distribution Networks',
      titleAr: 'الخدمات اللوجستية وإدارة الأساطيل والتوزيع',
      taglineEn: 'Route margin analysis, fuel variance tracking, and 3PL vendor performance.',
      taglineAr: 'تحليل هوامش مسارات النقل، وضبط استهلاك الوقود، ومراقبة أداء مزودي الخدمات 3PL.',
      challengesEn: [
        'Empty deadhead miles reducing gross fleet profit margins',
        'Fuel surcharge slippages and unauthorized detour costs',
        'Customs clearance delays generating compounding port demurrage fees'
      ],
      challengesAr: [
        'مسافات العودة الفارغة (Deadhead) التي تخفض هوامش أرباح الأسطول',
        'انحرافات فواتير الوقود وتكاليف المسارات الالتفافة غير المصرح بها',
        'تأخيرات التخليص الجمركي التي تترتب عليها رسوم أرضيات وغرامات تأخير باهظة'
      ],
      valueEn: 'Real-time telemetry reconciliation, automated detention dispute dossiers, and multi-leg cost optimization.',
      valueAr: 'مطابقة لحظية للبيانات التشغيلية، وملفات مؤتمتة للاعتراض على غرامات التأخير، وتحسين كفاءة الرحلات.'
    },
    {
      id: 'enterprise-retail-fmcg',
      icon: <IconFinance size={28} />,
      titleEn: 'Enterprise Retail & Wholesale FMCG',
      titleAr: 'تجارة التجزئة الكبرى والسلع الاستهلاكية',
      taglineEn: 'Dead stock liquidation velocity, promotional leakage, and supplier rebate audits.',
      taglineAr: 'تسريع تصفية المخزون الراكد، وضبط هدر الحملات الترويجية، وتدقيق خصومات الموردين (Rebates).',
      challengesEn: [
        'Vendor volume rebates going uncollected due to missing milestone tracking',
        'Over-stocking seasonal SKUs leading to heavy terminal markdowns',
        'Branch-level shrinkage and point-of-sale pricing discrepancies'
      ],
      challengesAr: [
        'ضياع مبالغ خصومات الموردين المستحقة بسبب عدم تتبع تحقيق أهداف الشراء',
        'تكدس الأصناف الموسمية في المستودعات مما يضطر الشركة لخصومات قاسية',
        'فروقات الأسعار بين الفروع ونقاط البيع وحالات التلف غير المبرر'
      ],
      valueEn: 'Automated rebate reconciliation, SKU rationalization alerts, and dynamic margin protection.',
      valueAr: 'مطابقة آلية لخصومات الموردين، وتنبيهات بترشيد الأصناف، وحماية هوامش الربح على مستوى الفرع.'
    },
    {
      id: 'conglomerates-holdings',
      icon: <IconRisk size={28} />,
      titleEn: 'Multi-Entity Conglomerates & Holding Groups',
      titleAr: 'المجموعات القابضة والشركات متعددة الكيانات',
      taglineEn: 'Cross-entity liquidity balancing, centralized procurement, and unified governance.',
      taglineAr: 'موازنة السيولة بين الكيانات التابعة، وتوحيد المشتريات المركزية، وحوكمة التدقيق الموحدة.',
      challengesEn: [
        'Siloed financial systems preventing a unified group liquidity view',
        'Sub-entities buying identical materials from the same supplier at differing prices',
        'Delayed executive visibility into subsidiary operational losses'
      ],
      challengesAr: [
        'أنظمة محاسبية منعزلة تمنع الرؤية الموحدة لموقف السيولة النقدية للمجموعة',
        'شراء الشركات التابعة نفس المواد من نفس المورد بأسعار متفاوتة دون تفاوض مركزي',
        'تأخر وصول مؤشرات خسائر الشركات التابعة للقيادة التنفيذية في الوقت المناسب'
      ],
      valueEn: 'Holistic multi-tenant group cockpit, consolidated vendor bargaining power, and instant cross-subsidiary risk scoring.',
      valueAr: 'لوحة قيادة موحدة متعددة المستأجرين، وقوة تفاوض شرائية موحدة، وتقييم لحظي لمخاطر الشركات التابعة.'
    }
  ];

  return (
    <div className="public-page industries-page">
      {/* Hero */}
      <section className="public-hero" style={{ padding: '6rem 0 4rem', background: 'radial-gradient(circle at 50% 0%, var(--accent-subtle) 0%, transparent 70%)' }}>
        <div className="site-container" style={{ textAlign: 'center', maxWidth: '960px', margin: '0 auto' }}>
          <div className="severity-tag optimal" style={{ display: 'inline-flex', marginBottom: '1.5rem', padding: '0.4rem 1rem' }}>
            {isAr ? 'القطاعات والصناعات' : 'CROSS-INDUSTRY APPLICABILITY'}
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.5rem' }}>
            {isAr ? (
              <>مصممة للمؤسسات ذات العمليات المعقدة</>
            ) : (
              <>Engineered for High-Complexity Operations</>
            )}
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '780px', margin: '0 auto 2.5rem' }}>
            {isAr
              ? 'تتكيف المنظومة مع مختلف القطاعات من خلال نماذج أنطولوجيا ديناميكية وموائمات تربط بنى البيانات التشغيلية المتنوعة.'
              : 'Our platform adapts to diverse operational domains through specialized semantic ontologies and universal transaction adapters.'}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onRequestDemo} className="btn-primary" style={{ padding: '0.8rem 1.8rem', fontSize: '1rem' }}>
              <span>{isAr ? 'حجز جلسة استكشافية للقطاع' : 'Explore Industry Fit'}</span>
              <IconArrowRight size={16} />
            </button>
            <button onClick={onNavigateRegister} className="btn-secondary" style={{ padding: '0.8rem 1.8rem', fontSize: '1rem' }}>
              <span>{isAr ? 'تسجيل مؤسسة جديدة' : 'Register Organization'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="site-section" style={{ padding: '4rem 0' }}>
        <div className="site-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
            {industries.map((ind) => (
              <div
                key={ind.id}
                className="kpi-card"
                style={{
                  padding: '2.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ color: 'var(--accent-light)', marginBottom: '1.25rem' }}>
                  {ind.icon}
                </div>

                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  {isAr ? ind.titleAr : ind.titleEn}
                </h2>

                <p style={{ fontSize: '0.95rem', color: 'var(--accent-light)', fontWeight: 600, marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  {isAr ? ind.taglineAr : ind.taglineEn}
                </p>

                <div style={{ marginBottom: '1.5rem', flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
                    {isAr ? 'تحديات القطاع الحرجة:' : 'Critical Friction Points:'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {(isAr ? ind.challengesAr : ind.challengesEn).map((c, cIdx) => (
                      <div key={cIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--status-high)', marginTop: '3px', fontSize: '12px' }}>●</span>
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {c}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.2rem', background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--status-optimal)', marginBottom: '0.3rem' }}>
                    {isAr ? 'القيمة المحققة من المنظومة:' : 'Platform Value Delivered:'}
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                    {isAr ? ind.valueAr : ind.valueEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="site-section" style={{ padding: '4rem 0', background: 'var(--bg-surface-elevated)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="site-container" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
            {isAr ? 'هل يواجه قطاعك تحديات بيانات خاصة؟' : 'Does Your Industry Have Unique Constraints?'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
            {isAr
              ? 'فريقنا الهندسي يبني موائمات مخصصة تلبي خصوصية كل قطاع دون الحاجة لتغيير أنظمتك القائمة.'
              : 'Our engineering team constructs bespoke ontology adapters mapping to your exact ERP schemas.'}
          </p>
          <button onClick={onRequestDemo} className="btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
            <span>{isAr ? 'التواصل مع مستشاري المنظومة' : 'Consult With Our Engineers'}</span>
            <IconArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
};
