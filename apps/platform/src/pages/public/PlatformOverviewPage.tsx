// MIKHLAFI LABS — Public Platform Overview Page (/platform)
// Architecture, intelligence engines, and integration model — public, unauthenticated.
// Exposes NO customer data: every number shown is derived from the static catalog.

import React from 'react';
import { LocaleMode } from '../../types';
import {
  IconDecisions,
  IconRisk,
  IconFinance,
  IconProjects,
  IconSupplier,
  IconCustomer,
  IconDataQuality,
  IconAssistant,
  IconShield,
  IconArrowRight,
  IconServer,
  IconWorkflow
} from '../../components/Icons';
import { usePublishedEngines } from '../../hooks/publishedEngines';

interface PlatformOverviewPageProps {
  locale: LocaleMode;
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
  onRequestDemo: () => void;
}

export const PlatformOverviewPage: React.FC<PlatformOverviewPageProps> = ({
  locale,
  onNavigateLogin,
  onNavigateRegister,
  onRequestDemo
}) => {
  const isAr = locale === 'ar';
  const engineCount = usePublishedEngines().length;

  const coreEngines = [
    {
      id: 'decision-mesh',
      icon: <IconDecisions size={22} />,
      titleEn: 'Autonomous Decision Engine',
      titleAr: 'محرك القرارات الحتمي',
      descEn: 'Evaluates allocations, operational bottlenecks, and procurement tradeoffs against codified business policies.',
      descAr: 'يقيّم تخصيص الموارد والاختناقات التشغيلية ومفاضلات المشتريات مقابل سياسات الأعمال المعتمدة.'
    },
    {
      id: 'financial-variance',
      icon: <IconFinance size={22} />,
      titleEn: 'Financial Variance & Leak Detector',
      titleAr: 'كاشف الهدر والانحراف المالي',
      descEn: 'Scans ledger transactions to identify duplicate disbursements, margin erosion, and unapproved pricing variances.',
      descAr: 'يمسح حركات القيود لكشف المدفوعات المكررة وتآكل الهوامش وانحرافات التسعير غير المعتمدة.'
    },
    {
      id: 'predictive-risk',
      icon: <IconRisk size={22} />,
      titleEn: 'Early Warning Risk Radar',
      titleAr: 'رادار الإنذار المبكر للمخاطر',
      descEn: 'Ranks operational and liquidity exposure across entities, projects, and cash flows.',
      descAr: 'يرتب المخاطر التشغيلية والسيولية عبر الكيانات والمشاريع والتدفقات النقدية.'
    },
    {
      id: 'project-margin',
      icon: <IconProjects size={22} />,
      titleEn: 'Project Margin & Contract Intelligence',
      titleAr: 'ذكاء هوامش المشاريع والعقود',
      descEn: 'Monitors milestone burn, change-order slippage, and subcontractor performance across active contracts.',
      descAr: 'يراقب استنزاف الميزانية وانحرافات أوامر التغيير وأداء مقاولي الباطن عبر العقود النشطة.'
    },
    {
      id: 'supplier-procure',
      icon: <IconSupplier size={22} />,
      titleEn: 'Supplier Reliability & Price Intelligence',
      titleAr: 'ذكاء الموردين وعدالة الأسعار',
      descEn: 'Benchmarks delivery latency, defect rates, and unit price divergence across purchase history.',
      descAr: 'يقارن تأخيرات التوريد ومعدلات العيوب وتباين أسعار الوحدة عبر سجل المشتريات.'
    },
    {
      id: 'customer-retention',
      icon: <IconCustomer size={22} />,
      titleEn: 'Customer Retention & Exposure Tracker',
      titleAr: 'مراقبة العملاء ومخاطر الائتمان',
      descEn: 'Analyses ordering velocity, payment risk, and receivable ageing to protect operating revenue.',
      descAr: 'يحلل وتيرة الطلبات ومخاطر السداد وأعمار الذمم المدينة لحماية الإيراد التشغيلي.'
    },
    {
      id: 'data-observability',
      icon: <IconDataQuality size={22} />,
      titleEn: 'Data Observability & Truth Pipeline',
      titleAr: 'حوكمة وجودة البيانات',
      descEn: 'Validates schema consistency, rejects unverifiable records, and keeps cross-department feeds intact.',
      descAr: 'يتحقق من اتساق المخططات ويرفض السجلات غير القابلة للتحقق ويحافظ على سلامة البيانات بين الإدارات.'
    },
    {
      id: 'executive-assistant',
      icon: <IconAssistant size={22} />,
      titleEn: 'Evidence-Grounded AI Assistant',
      titleAr: 'المساعد التنفيذي المدعوم بالأدلة',
      descEn: 'Natural-language queries anchored strictly to verified records and audit evidence.',
      descAr: 'استعلام باللغة الطبيعية مع إسناد صارم للسجلات الموثقة وأدلة التدقيق.'
    }
  ];

  const architecturalPillars = [
    {
      titleEn: 'Deterministic auditability',
      titleAr: 'قابلية تدقيق حتمية',
      descEn: 'No black-box output. Each recommendation carries its provenance and a link back to the underlying records.',
      descAr: 'لا مخرجات غامضة. كل توصية تحمل مصدرها وارتباطها بالسجلات الأساسية.'
    },
    {
      titleEn: 'Strict multi-tenant isolation',
      titleAr: 'عزل صارم بين المستأجرين',
      descEn: 'Row-level security, separate schemas, and boundary validation prevent cross-organization exposure.',
      descAr: 'أمان على مستوى الصفوف ومخططات منفصلة وتحقق من الحدود يمنع أي تداخل بين المنظمات.'
    },
    {
      titleEn: 'Sovereign deployment models',
      titleAr: 'نماذج نشر سيادية',
      descEn: 'Deploy on sovereign cloud infrastructure or air-gapped on-premises estates, per your compliance regime.',
      descAr: 'النشر على بنية سحابية سيادية أو داخل مراكز بيانات مغلقة حسب متطلبات امتثالك.'
    },
    {
      titleEn: 'Bi-directional ERP connectors',
      titleAr: 'موائمات ERP ثنائية الاتجاه',
      descEn: 'Ingestion pipelines for SAP, Oracle, Microsoft Dynamics 365, Odoo, and custom PostgreSQL or REST backends.',
      descAr: 'خطوط استيعاب لأنظمة SAP وOracle وDynamics 365 وOdoo وقواعد PostgreSQL وواجهات REST الخاصة.'
    }
  ];

  const flowStages = [
    {
      n: '01',
      titleAr: 'الاستيعاب',
      titleEn: 'Ingestion',
      descAr: 'سحب دوري ولحظي من أنظمة ERP والبنوك وسجلات المخزون والمناقصات مع تشفير أثناء النقل.',
      descEn: 'Scheduled and near-real-time pulls from ERP, banking, inventory, and contract systems, encrypted in transit.',
      outAr: 'مصادر بيانات موصولة',
      outEn: 'Connected data sources'
    },
    {
      n: '02',
      titleAr: 'التحقق',
      titleEn: 'Validation',
      descAr: 'فحص التناقضات الحسابية، وعزل القيود الناقصة، وتوحيد مسميات الحسابات والتصنيفات.',
      descEn: 'Reconciliation checks, incomplete-entry isolation, and unified entity and account mapping.',
      outAr: 'سجلات موحّدة وموثوقة',
      outEn: 'Normalized, verified records'
    },
    {
      n: '03',
      titleAr: 'التحليل',
      titleEn: 'Synthesis',
      descAr: 'تطبيق محركات الذكاء الثمانية: الانحرافات، المخاطر، الهوامش، الموردين، والعملاء.',
      descEn: 'The eight engines run across variance, risk, margins, suppliers, customers, and governance.',
      outAr: 'نتائج مرتبة حسب الأولوية',
      outEn: 'Prioritized findings'
    },
    {
      n: '04',
      titleAr: 'القرار',
      titleEn: 'Execution',
      descAr: 'توجيهات قابلة للتنفيذ مع سجل تدقيق غير قابل للتعديل يوضح سبب كل توصية وصاحب الاعتماد.',
      descEn: 'Actionable directives with a tamper-evident trail showing the rationale and approval owner.',
      outAr: 'توجيه موثّق وقابل للمتابعة',
      outEn: 'Documented, trackable directive'
    }
  ];

  return (
    <div>
      {/* Hero */}
      <section className="pp-hero">
        <div className="ml-container pp-hero__inner">
          <span className="pp-hero__eyebrow">
            {isAr ? 'معمارية المنصة وقدراتها' : 'PLATFORM ARCHITECTURE'}
          </span>
          <h1 className="ml-display pp-hero__title">
            {isAr
              ? 'طبقة استخبارات تشغيلية موحدة فوق أنظمتك القائمة'
              : 'A unified operational intelligence layer above your existing systems'}
          </h1>
          <p className="ml-lead pp-hero__lead">
            {isAr
              ? 'تجمع المنصة البيانات المبعثرة في أنظمة ERP والمشاريع والمشتريات وتحولها إلى نتائج قابلة للتتبع والتحقق، دون تعديل بنيتك التحتية الحالية.'
              : 'It consolidates fragmented ERP, project, and procurement data into verifiable, traceable outcomes — without changing your underlying infrastructure.'}
          </p>
          <div className="pp-hero__actions">
            <button onClick={onRequestDemo} className="ml-btn ml-btn--primary ml-btn--lg">
              <span>{isAr ? 'طلب عرض تقني' : 'Request a technical demo'}</span>
              <IconArrowRight size={16} />
            </button>
            <button onClick={onNavigateLogin} className="ml-btn ml-btn--ghost ml-btn--lg">
              <span>{isAr ? 'بوابة العملاء' : 'Client portal'}</span>
            </button>
          </div>

          <dl className="pp-hero__meta">
            <div className="pp-fact">
              <dt className="pp-fact__value">{engineCount}</dt>
              <dd className="pp-fact__label">
                {isAr ? 'محركات ذكاء ضمن الشبكة التشغيلية' : 'intelligence engines in the mesh'}
              </dd>
            </div>
            <div className="pp-fact">
              <dt className="pp-fact__value">{isAr ? 'قراءة فقط' : 'Read-only'}</dt>
              <dd className="pp-fact__label">
                {isAr ? 'بصمة تكامل غير تطفلية على أنظمتك' : 'non-invasive integration footprint'}
              </dd>
            </div>
            <div className="pp-fact">
              <dt className="pp-fact__value">{isAr ? 'سيادي' : 'Sovereign'}</dt>
              <dd className="pp-fact__label">
                {isAr ? 'سحابي محلي في اليمن أو نشر مغلق داخل مؤسستك' : 'local cloud in Yemen or air-gapped on-prem'}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Intelligence flow */}
      <section className="site-section">
        <div className="ml-container">
          <div className="site-section__head">
            <span className="ml-eyebrow">{isAr ? 'تدفق الاستخبارات' : 'INTELLIGENCE FLOW'}</span>
            <h2 className="ml-heading site-section__title">
              {isAr ? 'من الحركة الخام إلى القرار الموثق' : 'From raw transactions to an evidenced decision'}
            </h2>
            <p className="ml-lead site-section__lead">
              {isAr
                ? 'أربع مراحل متسقة تفصل بوضوح بين ما تم التحقق منه وما لم يتحقق منه بعد.'
                : 'Four consistent stages that keep verified facts clearly separated from anything still unconfirmed.'}
            </p>
          </div>

          <div className="pp-steps">
            {flowStages.map((s) => (
              <article key={s.n} className="pp-step">
                <span className="pp-step__num">{s.n}</span>
                <h3 className="pp-step__title">{isAr ? s.titleAr : s.titleEn}</h3>
                <p className="pp-step__desc">{isAr ? s.descAr : s.descEn}</p>
                <span className="pp-step__out">
                  {isAr ? 'المخرَج: ' : 'OUTPUT: '}
                  <strong>{isAr ? s.outAr : s.outEn}</strong>
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Engines */}
      <section className="site-section site-section--alt">
        <div className="ml-container">
          <div className="site-section__head">
            <span className="ml-eyebrow">{isAr ? 'المحركات' : 'THE ENGINES'}</span>
            <h2 className="ml-heading site-section__title">
              {isAr ? 'ثمانية محركات تغطي مفاصل العمل الحيوية' : 'Eight engines across the operational core'}
            </h2>
            <p className="ml-lead site-section__lead">
              {isAr
                ? 'كل محرك مسؤول عن نطاق واحد واضح، ويمكن تشغيلها مجتمعة أو تدريجياً حسب نطاق مؤسستك.'
                : 'Each engine owns one clear domain, and they can run together or be introduced progressively.'}
            </p>
          </div>

          <div className="site-grid site-grid--4">
            {coreEngines.map((engine) => (
              <article key={engine.id} className="site-tile">
                <div className="site-tile__icon" aria-hidden="true">
                  {engine.icon}
                </div>
                <h3 className="site-tile__title">
                  {isAr ? engine.titleAr : engine.titleEn}
                </h3>
                <p className="site-tile__desc">
                  {isAr ? engine.descAr : engine.descEn}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture pillars */}
      <section className="site-section">
        <div className="ml-container">
          <div className="site-section__head">
            <span className="ml-eyebrow">{isAr ? 'المعمارية' : 'ARCHITECTURE'}</span>
            <h2 className="ml-heading site-section__title">
              {isAr ? 'ضوابط معمارية تليق بالبيئات المؤسسية' : 'Architectural controls enterprises expect'}
            </h2>
            <p className="ml-lead site-section__lead">
              {isAr
                ? 'أمان، عزل، نشر، وتكامل — أربعة محاور تحكم كيفية تشغيل المنصة داخل مؤسستك.'
                : 'Security, isolation, deployment, and integration — the four constraints on how the platform runs in your estate.'}
            </p>
          </div>

          <div className="site-grid site-grid--2">
            {architecturalPillars.map((p, idx) => (
              <article key={idx} className="site-tile">
                <div className="site-tile__icon" aria-hidden="true">
                  {idx === 0 ? <IconShield size={22} /> : idx === 1 ? <IconServer size={22} /> : idx === 2 ? <IconWorkflow size={22} /> : <IconDecisions size={22} />}
                </div>
                <h3 className="site-tile__title">
                  {isAr ? p.titleAr : p.titleEn}
                </h3>
                <p className="site-tile__desc">
                  {isAr ? p.descAr : p.descEn}
                </p>
              </article>
            ))}
          </div>

          <div className="pp-gap-lg" style={{ textAlign: 'center' }}>
            <div className="pp-strip">
              {['SAP', 'Oracle', 'Microsoft Dynamics 365', 'Odoo', 'PostgreSQL', 'REST / Webhooks'].map((n) => (
                <span key={n} className="ml-badge">
                  {n}
                </span>
              ))}
            </div>
            <p className="ml-hint pp-gap-lg" style={{ textAlign: 'center' }}>
              {isAr ? 'موائمات دعم لأنظمة المؤسسات القائمة' : 'Connector support for common enterprise systems'}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="site-section site-section--tight">
        <div className="ml-container">
          <div className="site-cta">
            <span className="ml-eyebrow">{isAr ? 'الخطوة التالية' : 'NEXT STEP'}</span>
            <h2 className="ml-heading site-section__title">
              {isAr ? 'راجع المعمارية مع فريقنا' : 'Review the architecture with our team'}
            </h2>
            <p className="ml-lead site-section__lead" style={{ marginInline: 'auto', textAlign: 'center' }}>
              {isAr
                ? 'احجز جلسة استعراض تقنية، أو أنشئ مساحة عمل لتجربة المنصة داخل مؤسستك.'
                : 'Book a technical walkthrough, or create a workspace to evaluate the platform in your context.'}
            </p>
            <div className="site-cta__actions">
              <button onClick={onRequestDemo} className="ml-btn ml-btn--primary ml-btn--lg">
                <span>{isAr ? 'حجز جلسة استعراض' : 'Schedule a walkthrough'}</span>
                <IconArrowRight size={16} />
              </button>
              <button onClick={onNavigateRegister} className="ml-btn ml-btn--ghost ml-btn--lg">
                <span>{isAr ? 'إنشاء مساحة عمل' : 'Create a workspace'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
