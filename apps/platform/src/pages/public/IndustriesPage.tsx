// MIKHLAFI LABS — Public Industries Page (/industries)
// Cross-industry adaptability: manufacturing, logistics, retail, holdings,
// contracting, and specialized services — grounded in INDUSTRY_BRIEFS + WORKFLOW.

import React from 'react';
import { LocaleMode } from '../../types';
import { INDUSTRY_BRIEFS, WORKFLOW } from '../../data/marketingContent';
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
      icon: <IconProjects size={22} />,
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
      icon: <IconSupplier size={22} />,
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
        'انحرافات فواتير الوقود وتكاليف المسارات الالتفافية غير المصرح بها',
        'تأخيرات التخليص الجمركي التي تترتب عليها رسوم أرضيات وغرامات تأخير باهظة'
      ],
      valueEn: 'Real-time telemetry reconciliation, automated detention dispute dossiers, and multi-leg cost optimization.',
      valueAr: 'مطابقة لحظية للبيانات التشغيلية، وملفات مؤتمتة للاعتراض على غرامات التأخير، وتحسين كفاءة الرحلات.'
    },
    {
      id: 'enterprise-retail-fmcg',
      icon: <IconFinance size={22} />,
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
      icon: <IconRisk size={22} />,
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
      <section className="pp-hero pp-hero--center">
        <div className="site-container">
          <div className="pp-hero__inner">
            <span className="pp-eyebrow">
              {isAr ? 'القطاعات والصناعات' : 'Cross-Industry Applicability'}
            </span>
            <h1 className="ml-display pp-hero__title">
              {isAr
                ? 'منظومة واحدة… مصمّمة لتعقيد كل قطاع'
                : 'One platform, engineered for the complexity of every sector'}
            </h1>
            <p className="pp-hero__lede">
              {isAr
                ? 'تتكيف المنظومة مع مختلف القطاعات من خلال نماذج أنطولوجيا ديناميكية وموائمات تربط بنى البيانات التشغيلية المتنوعة — دون تغيير أنظمتك القائمة.'
                : 'The platform adapts to diverse operational domains through specialized semantic ontologies and universal transaction adapters — without changing the systems you already run.'}
            </p>
            <div className="pp-hero__actions">
              <button type="button" className="ml-btn ml-btn--primary" onClick={onRequestDemo}>
                <span>{isAr ? 'حجز جلسة استكشافية للقطاع' : 'Explore Industry Fit'}</span>
                <IconArrowRight size={16} />
              </button>
              <button type="button" className="ml-btn ml-btn--ghost" onClick={onNavigateRegister}>
                <span>{isAr ? 'تسجيل مؤسسة جديدة' : 'Register Organization'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage bands — sanctioned INDUSTRY_BRIEFS copy */}
      <section className="pp-section pp-section--tight">
        <div className="site-container">
          <div className="pp-section__head">
            <span className="pp-eyebrow">
              {isAr ? 'نطاق التغطية' : 'Coverage Bands'}
            </span>
            <h2 className="pp-section__title">
              {isAr ? 'أربعة نطاقات تشغيلية أساسية' : 'Four core operational domains'}
            </h2>
          </div>
          <div className="site-grid site-grid--4">
            {INDUSTRY_BRIEFS.map((band, bandIdx) => (
              <article key={band.id} className="pp-band">
                <span className="pp-band__index">{String(bandIdx + 1).padStart(2, '0')}</span>
                <h3 className="pp-band__title">{isAr ? band.titleAr : band.titleEn}</h3>
                <p className="pp-band__desc">{isAr ? band.descAr : band.descEn}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed industry cards */}
      <section className="pp-section">
        <div className="site-container">
          <div className="pp-section__head">
            <span className="pp-eyebrow">
              {isAr ? 'تفاصيل القطاعات' : 'Sector Detail'}
            </span>
            <h2 className="pp-section__title">
              {isAr ? 'الاحتكاك التشغيلي ومداخل المعالجة' : 'Operational friction and where the platform intervenes'}
            </h2>
          </div>

          <div className="pp-ind-grid">
            {industries.map((ind) => (
              <article key={ind.id} className="pp-ind">
                <div className="pp-ind__head">
                  <span className="pp-ind__icon" aria-hidden="true">{ind.icon}</span>
                  <div>
                    <h3 className="pp-ind__title">{isAr ? ind.titleAr : ind.titleEn}</h3>
                    <p className="pp-ind__tagline">{isAr ? ind.taglineAr : ind.taglineEn}</p>
                  </div>
                </div>

                <div className="pp-ind__body">
                  <div className="pp-ind__label">
                    {isAr ? 'تحديات القطاع الحرجة' : 'Critical Friction Points'}
                  </div>
                  <ul className="pp-ind__list">
                    {(isAr ? ind.challengesAr : ind.challengesEn).map((c, cIdx) => (
                      <li key={cIdx}>
                        <span className="pp-ind__dot" aria-hidden="true" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pp-ind__value">
                  <div className="pp-ind__label pp-ind__label--value">
                    {isAr ? 'القيمة المحققة من المنظومة' : 'Platform Value Delivered'}
                  </div>
                  <p>{isAr ? ind.valueAr : ind.valueEn}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Shared four-stage method (WORKFLOW) */}
      <section className="pp-section pp-section--muted">
        <div className="site-container">
          <div className="pp-section__head">
            <span className="pp-eyebrow">{isAr ? 'المنهجية المشتركة' : 'Shared Method'}</span>
            <h2 className="pp-section__title">
              {isAr ? 'أربع مراحل تعمل بالطريقة نفسها عبر كل قطاع' : 'Four stages that behave the same way in every sector'}
            </h2>
            <p className="pp-section__lede">
              {isAr
                ? 'يتغير محتوى البيانات من قطاع لآخر، أما منهج الاتصال والمعايرة والتحليل والقرار فيبقى ثابتاً.'
                : 'The data changes from one sector to the next; the method of connecting, normalizing, analyzing, and deciding stays fixed.'}
            </p>
          </div>

          <ol className="pp-steps">
            {WORKFLOW.map((step) => (
              <li key={step.index} className="pp-step">
                <span className="pp-step__index">{step.index}</span>
                <div className="pp-step__body">
                  <h3 className="pp-step__title">{isAr ? step.titleAr : step.titleEn}</h3>
                  <p className="pp-step__desc">{isAr ? step.descAr : step.descEn}</p>
                  <div className="pp-step__tags">
                    {step.tags.map((tag) => (
                      <span key={tag} className="ml-badge">{tag}</span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="pp-cta">
        <div className="site-container">
          <div className="pp-cta__inner">
            <span className="pp-eyebrow">{isAr ? 'مواءمة خاصة' : 'Bespoke Alignment'}</span>
            <h2 className="pp-cta__title">
              {isAr ? 'هل يواجه قطاعك قيوداً خاصة؟' : 'Does Your Industry Have Unique Constraints?'}
            </h2>
            <p className="pp-cta__lede">
              {isAr
                ? 'فريقنا الهندسي يبني موائمات مخصصة تلبي خصوصية كل قطاع دون الحاجة لتغيير أنظمتك القائمة.'
                : 'Our engineering team constructs bespoke ontology adapters mapped to your exact operational schemas.'}
            </p>
            <div className="pp-cta__actions">
              <button type="button" className="ml-btn ml-btn--primary" onClick={onRequestDemo}>
                <span>{isAr ? 'التواصل مع مستشاري المنظومة' : 'Consult With Our Engineers'}</span>
                <IconArrowRight size={16} />
              </button>
              <button type="button" className="ml-btn ml-btn--ghost" onClick={onNavigateRegister}>
                <span>{isAr ? 'إنشاء حساب مؤسسي' : 'Create Organization Account'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
