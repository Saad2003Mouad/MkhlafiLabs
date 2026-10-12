// MIKHLAFI LABS — Public Platform Overview Page (/platform)
// Product architecture showcase, decision intelligence capabilities, and technical specifications
// Accessible without authentication — DOES NOT expose customer data or dashboard

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
  IconArrowRight
} from '../../components/Icons';

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

  const coreEngines = [
    {
      id: 'decision-mesh',
      icon: <IconDecisions size={24} />,
      titleEn: 'Autonomous Decision Engine',
      titleAr: 'محرك القرارات الحتمي',
      descEn: 'Evaluates capital allocations, operational bottlenecks, and procurement tradeoffs against codified business policies.',
      descAr: 'يقيّم تخصيص رأس المال والاختناقات التشغيلية ومفاضلات المشتريات مقابل سياسات الأعمال المحددة بدقة.'
    },
    {
      id: 'financial-variance',
      icon: <IconFinance size={24} />,
      titleEn: 'Financial Variance & Leak Detector',
      titleAr: 'كاشف الهدر والانحراف المالي',
      descEn: 'Scans continuous ledger transactions to identify duplicate disbursements, margin erosions, and unauthorized pricing variances.',
      descAr: 'يمسح حركات القيود المحاسبية باستمرار لكشف المدفوعات المكررة وتآكل الهوامش وانحرافات التسعير غير المصرح بها.'
    },
    {
      id: 'predictive-risk',
      icon: <IconRisk size={24} />,
      titleEn: 'Early Warning Risk Radar',
      titleAr: 'رادار الإنذار المبكر للمخاطر',
      descEn: 'Calculates multi-dimensional operational and liquidity vulnerability scores across entities, projects, and cash flows.',
      descAr: 'يحسب درجات الهشاشة التشغيلية والسيولية متعددة الأبعاد عبر الكيانات والمشاريع والتدفقات النقدية.'
    },
    {
      id: 'project-margin',
      icon: <IconProjects size={24} />,
      titleEn: 'Project Margin & Contract Intelligence',
      titleAr: 'ذكاء هوامش المشاريع والعقود',
      descEn: 'Monitors milestone burn rates, change order slippages, and subcontractor performance across all active enterprise contracts.',
      descAr: 'يراقب معدلات استنزاف الميزانية وانحرافات أوامر التغيير وأداء مقاولي الباطن عبر كافة العقود النشطة.'
    },
    {
      id: 'supplier-procure',
      icon: <IconSupplier size={24} />,
      titleEn: 'Supplier Reliability & Price Intelligence',
      titleAr: 'ذكاء الموردين وعدالة الأسعار',
      descEn: 'Benchmarks vendor delivery latency, defect rates, and unit price divergence across historical purchase orders.',
      descAr: 'يقارن تأخيرات التوريد ومعدلات العيوب وتباين أسعار الوحدة عبر طلبات الشراء التاريخية.'
    },
    {
      id: 'customer-retention',
      icon: <IconCustomer size={24} />,
      titleEn: 'Customer Retention & Exposure Tracker',
      titleAr: 'مراقبة العملاء ومخاطر الائتمان',
      descEn: 'Analyzes ordering velocity decline, payment default risks, and receivable aging to protect enterprise operating revenue.',
      descAr: 'يحلل تباطؤ وتيرة الطلبات ومخاطر التخلف عن السداد وأعمار الذمم المدينة لحماية الإيرادات التشغيلية.'
    },
    {
      id: 'data-observability',
      icon: <IconDataQuality size={24} />,
      titleEn: 'Enterprise Data Observability & Truth Pipeline',
      titleAr: 'حوكمة وجودة البيانات المؤسسية',
      descEn: 'Validates schema consistency, rejects hallucinated records, and ensures mathematical integrity across cross-departmental feeds.',
      descAr: 'يتحقق من اتساق المخططات ويرفض السجلات غير الموثوقة ويضمن السلامة الرياضية للبيانات بين الإدارات.'
    },
    {
      id: 'executive-assistant',
      icon: <IconAssistant size={24} />,
      titleEn: 'Evidence-Grounded AI Assistant',
      titleAr: 'المساعد التنفيذي المدعوم بالأدلة',
      descEn: 'Provides leadership teams with natural-language query capabilities strictly anchored to verified transactional records and audit proofs.',
      descAr: 'يمكّن القيادات من الاستعلام باللغة الطبيعية مع إسناد صارم لسجلات المعاملات الموثقة وأدلة التدقيق.'
    }
  ];

  const architecturalPillars = [
    {
      titleEn: 'Deterministic Auditability',
      titleAr: 'قابلية التدقيق الحتمية',
      descEn: 'Zero black-box hallucinations. Every generated decision includes complete mathematical provenance and verifiable ledger links.',
      descAr: 'لا مخرجات غامضة أو افتراضية. كل قرار استراتيجي يتضمن سلسلة إسناد رياضي كاملة وروابط قيود محاسبية موثقة.'
    },
    {
      titleEn: 'Strict Multi-Tenant Isolation',
      titleAr: 'عزل صارم للمستأجرين',
      descEn: 'Row-level security, separate database schemas, and cryptographic tenant boundary validation prevent cross-organization data leakage.',
      descAr: 'أمان على مستوى الصفوف، مخططات قاعدة بيانات معزولة، وتحقق تشفيري من حدود المستأجر يمنع أي تسريب بين المنظمات.'
    },
    {
      titleEn: 'Sovereign Deployment Models',
      titleAr: 'نماذج النشر السيادي المحلي',
      descEn: 'Deployable on GCC/KSA sovereign cloud infrastructure or air-gapped on-premises data centers complying with NCA regulations.',
      descAr: 'قابلة للنشر على السحابة السيادية داخل المملكة أو مراكز البيانات المغلقة المتوافقة مع معايير الهيئة الوطنية للأمن السيبراني.'
    },
    {
      titleEn: 'Bi-Directional ERP Connectors',
      titleAr: 'موائمات تكامل ERP ثنائية الاتجاه',
      descEn: 'Seamless ingestion pipelines for SAP, Oracle NetSuite, Microsoft Dynamics 365, Odoo, and custom PostgreSQL/REST backends.',
      descAr: 'خطوط استيعاب مرنة لأنظمة SAP وOracle وDynamics 365 وOdoo وواجهات برمجة التطبيقات وقواعد البيانات الخاصة.'
    }
  ];

  return (
    <div className="public-page platform-page">
      {/* Hero Section */}
      <section className="public-hero" style={{ padding: '6rem 0 4rem', background: 'radial-gradient(circle at 50% 0%, var(--accent-subtle) 0%, transparent 70%)' }}>
        <div className="site-container" style={{ textAlign: 'center', maxWidth: '960px', margin: '0 auto' }}>
          <div className="severity-tag optimal" style={{ display: 'inline-flex', marginBottom: '1.5rem', padding: '0.4rem 1rem' }}>
            {isAr ? 'معمارية المنظومة والتقنيات' : 'PLATFORM ARCHITECTURE & CAPABILITIES'}
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.5rem' }}>
            {isAr ? (
              <>منصة الاستخبارات التشغيلية والقرارات الحتمية</>
            ) : (
              <>Cross-Industry Intelligence & Sovereign Decision Mesh</>
            )}
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '780px', margin: '0 auto 2.5rem' }}>
            {isAr
              ? 'بنية تحتية متطورة توحد البيانات المبعثرة في أنظمة ERP والمشاريع والمشتريات وتحولها إلى قرارات تنفيذية قابلة للتنفيذ الفوري مع إسناد محاسبي حتمي.'
              : 'An enterprise intelligence infrastructure that unifies fragmented ERP, project, and supply chain data into deterministically verified operational decisions.'}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onRequestDemo} className="btn-primary" style={{ padding: '0.8rem 1.8rem', fontSize: '1rem' }}>
              <span>{isAr ? 'طلب عرض تقني مفصل' : 'Request Technical Demo'}</span>
              <IconArrowRight size={16} />
            </button>
            <button onClick={onNavigateLogin} className="btn-secondary" style={{ padding: '0.8rem 1.8rem', fontSize: '1rem' }}>
              <span>{isAr ? 'بوابة العملاء المصرح لهم' : 'Authorized Client Portal'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Architecture Overview Diagram Section */}
      <section className="site-section" style={{ padding: '4rem 0', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="site-container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              {isAr ? 'مخطط تدفق الاستخبارات الحتمية' : 'The Deterministic Intelligence Flow'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
              {isAr
                ? 'كيف تنتقل البيانات من الأنظمة الأولية حتى القرار التنفيذي المصادق عليه'
                : 'How raw enterprise transactions transform into audited operational executive directives.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div className="kpi-card" style={{ padding: '1.8rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-light)', marginBottom: '0.5rem' }}>
                {isAr ? 'المرحلة ٠١: الاستيعاب' : 'STAGE 01: INGESTION'}
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>{isAr ? 'موائمات الأنظمة' : 'Sensor Adapters'}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {isAr
                  ? 'سحب دوري ولحظي من أنظمة ERP، والمصارف، وسجلات المخزون، والمناقصات مع تشفير كامل للبيانات أثناء النقل.'
                  : 'Real-time and batch ingestion from ERPs, banks, inventory ledgers, and contract management systems with end-to-end TLS 1.3.'}
              </p>
            </div>

            <div className="kpi-card" style={{ padding: '1.8rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--status-optimal)', marginBottom: '0.5rem' }}>
                {isAr ? 'المرحلة ٠٢: التدقيق' : 'STAGE 02: VALIDATION'}
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>{isAr ? 'فلتر جودة البيانات' : 'Truth Pipeline'}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {isAr
                  ? 'فحص التناقضات الحسابية، وعزل القيود غير المكتملة، وتوحيد مسميات الحسابات وتصنيفات الموردين.'
                  : 'Automated reconciliation, anomaly flagging, missing field isolation, and unified entity mapping across disparate databases.'}
              </p>
            </div>

            <div className="kpi-card" style={{ padding: '1.8rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--status-warning)', marginBottom: '0.5rem' }}>
                {isAr ? 'المرحلة ٠٣: التحليل' : 'STAGE 03: SYNTHESIS'}
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>{isAr ? 'محركات الذكاء الثمانية' : 'Intelligence Mesh'}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {isAr
                  ? 'محاكاة السيناريوهات، واكتشاف الهدر، وتقدير مخاطر التعثر، وحساب الأثر المالي المتوقع بالريال السعودي.'
                  : 'Cross-functional scenario modeling, risk surface calculation, leak detection, and quantified SAR impact projection.'}
              </p>
            </div>

            <div className="kpi-card" style={{ padding: '1.8rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--status-high)', marginBottom: '0.5rem' }}>
                {isAr ? 'المرحلة ٠٤: التنفيذ' : 'STAGE 04: EXECUTION'}
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>{isAr ? 'القرار وسجل التدقيق' : 'Actionable Directives'}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {isAr
                  ? 'إصدار توجيهات تنفيذية برمجية مع سجل تدقيق مشفر غير قابل للتعديل يوضح سبب القرار وصاحب الاعتماد.'
                  : 'Direct dispatch of mitigation workflows, approval queues, and immutable cryptographic audit trails.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Intelligence Engines Grid */}
      <section className="site-section" style={{ padding: '4rem 0', background: 'var(--bg-surface)' }}>
        <div className="site-container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              {isAr ? 'المحركات والقدرات المتخصصة' : 'Specialized Enterprise Engines'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
              {isAr
                ? 'ثمانية محركات مصممة لتغطية كافة المفاصل الحيوية للمؤسسات الكبرى'
                : 'Eight autonomous intelligence engines covering every mission-critical operational juncture.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {coreEngines.map((engine) => (
              <div key={engine.id} className="kpi-card" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: 'var(--accent-light)', marginBottom: '1rem' }}>
                  {engine.icon}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                  {isAr ? engine.titleAr : engine.titleEn}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
                  {isAr ? engine.descAr : engine.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Sovereign Architecture */}
      <section className="site-section" style={{ padding: '4rem 0' }}>
        <div className="site-container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              {isAr ? 'الأمان والسيادة المؤسسية' : 'Security, Compliance & Tenancy'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
              {isAr
                ? 'معايير أمان بنكية تلبي متطلبات الأمن السيبراني وحماية البيانات الوطنية'
                : 'Rigorous enterprise safeguards engineered to meet sovereign data classification mandates.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {architecturalPillars.map((pillar, idx) => (
              <div key={idx} className="kpi-card" style={{ padding: '1.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--status-optimal)' }}>
                  <IconShield size={20} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    {isAr ? pillar.titleAr : pillar.titleEn}
                  </h3>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {isAr ? pillar.descAr : pillar.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="site-section" style={{ padding: '5rem 0', background: 'radial-gradient(ellipse at 50% 100%, var(--accent-subtle) 0%, var(--bg-surface) 70%)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="site-container" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem' }}>
            {isAr ? 'جاهز لترقية ذكاء عملياتك؟' : 'Elevate Your Operational Intelligence'}
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
            {isAr
              ? 'تواصل مع فريقنا الهندسي لحجز استشارة تقنية ونموذج اختبار مخصص لبيانات مؤسستك.'
              : 'Consult with our principal engineers to schedule an architecture deep dive tailored to your infrastructure.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onRequestDemo} className="btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
              <span>{isAr ? 'حجز جلسة استشارية' : 'Schedule Consultation'}</span>
              <IconArrowRight size={16} />
            </button>
            <button onClick={onNavigateRegister} className="btn-secondary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
              <span>{isAr ? 'إنشاء مساحة عمل للمؤسسة' : 'Create Organization Workspace'}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
