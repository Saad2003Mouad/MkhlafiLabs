// MIKHLAFI LABS — Enterprise Deployment Models & Cloud Plans Showcase (/deployment)
// Sovereign enterprise architecture adapted to your data compliance & security posture
// 1) 4 Operational Models: Cloud SaaS, Sovereign On-Premise, Hybrid Mesh, Dedicated VPC
// 2) 3 Standard Cloud SaaS Tiers: Foundation $99, Professional $299, Enterprise $799
// 3) Specialized Deployment & Engagement FAQs with interactive luxury accordion

import React, { useState } from 'react';
import { LocaleMode } from '../../types';
import { CLOUD_TIERS } from '../../components/website/SaaSOnboardingWizard';
import { SaaSOnboardingWizard } from '../../components/website/SaaSOnboardingWizard';
import { OnPremiseInquiryModal, DeploymentType } from '../../components/website/OnPremiseInquiryModal';
import {
  IconCheckCircle,
  IconArrowRight,
  IconChevronDown,
  IconShield,
} from '../../components/Icons';

interface PricingPageProps {
  locale: LocaleMode;
  onNavigateRegister: () => void;
  onRequestDemo: () => void;
}

interface DeploymentFaq {
  categoryAr: string;
  categoryEn: string;
  qAr: string;
  qEn: string;
  aAr: string;
  aEn: string;
}

const DEPLOYMENT_FAQS: DeploymentFaq[] = [
  {
    categoryAr: 'السيادة والخصوصية',
    categoryEn: 'Sovereignty & Air-Gap',
    qAr: 'هل تخرج أي بيانات مالية خارج مقري في حال اختيار النشر الذاتي (On-Premise)؟',
    qEn: 'Does any financial data leave our servers with Sovereign On-Premise deployment?',
    aAr: 'لا على الإطلاق. وضع النشر الذاتي السيادي مُهندس ليعمل في بيئات Air-Gapped المعزولة فيزيائياً وشبكياً بنسبة 100% عن الإنترنت. قواعد البيانات، محركات الكشف الجنائي الحسابي، ولوحة التحكم تعمل محلياً داخل خوادمكم، ولا تتصل بأي خادم خارجي.',
    aEn: 'Absolutely not. The sovereign on-premise model is engineered to operate in 100% air-gapped, isolated networks with zero internet connectivity. Databases, deterministic forensic engines, and user interfaces run entirely inside your private perimeter.',
  },
  {
    categoryAr: 'النموذج الهجين',
    categoryEn: 'Hybrid Mesh',
    qAr: 'ما هو النموذج الهجين الذكي (Hybrid Mesh) ومتى تختاره المنشأة؟',
    qEn: 'What is the Adaptive Hybrid Mesh model and when should an enterprise choose it?',
    aAr: 'هو الحل الهندسي الأمثل للشركات التي تمنع سياساتها خروج الفواتير وقيود اليومية الخام، ولكن يرغب قادتها في الوصول للوحة المؤشرات والتنبيهات عبر الجوال خارج المكتب. يتم تشغيل وكيل معالجة خفيف (Local Worker) داخل شبكة الـ ERP لمعالجة الأرقام داخلياً، ويُرسل فقط الإشارات والمؤشرات الإحصائية المجمعة والمشفرة للسحابة.',
    aEn: 'It is the optimal compromise for organizations whose security policy strictly prohibits raw ledger records from leaving their LAN, while leadership still requires mobile executive dashboards. A local worker node runs inside your firewall to process raw ERP numbers, dispatching only encrypted aggregated signals to the cloud.',
  },
  {
    categoryAr: 'السحابة المعزولة',
    categoryEn: 'Private Cloud VPC',
    qAr: 'ما الفرق بين السحابة المشتركة (Multi-Tenant) والسحابة الخاصة المعزولة (Single-Tenant VPC)؟',
    qEn: 'What is the difference between Shared Cloud (Multi-Tenant) and Dedicated Private Cloud (Single-Tenant VPC)?',
    aAr: 'في السحابة المشتركة، يتم عزل بيانات كل منشأة تشفيرياً ومنطقياً على نفس الخوادم المدارة. أما في السحابة الخاصة المعزولة، نخصص لمنشأتكم بيئة سحابية كاملة ومستقلة فيزيائياً وشبكياً (VPC) بقواعد بيانات وخوادم مخصصة 100% لكم على مزود سحابي محلي معتمد (مثل Oracle Cloud السعودية في الرياض وجدة) مع الامتثال لضوابط الأمن السيبراني (NCA).',
    aEn: 'In shared cloud, tenants share infrastructure with strict cryptographic logical database isolation. In dedicated private cloud, we provision a completely isolated Virtual Private Cloud (VPC) with single-tenant compute and databases hosted in certified local cloud zones (e.g. Oracle Cloud KSA) conforming strictly to national cybersecurity mandates.',
  },
  {
    categoryAr: 'المرونة والترقية',
    categoryEn: 'Migration & Portability',
    qAr: 'هل يمكننا البدء بالسحابة المشتركة ثم الانتقال لاحقاً للنشر الداخلي بالكامل؟',
    qEn: 'Can we start on the shared cloud and migrate later to full on-premise?',
    aAr: 'نعم وبكل سلاسة. بنيتنا التحتية مصممة باستخدام الحاويات المعيارية (Docker & Kubernetes)، مما يتيح ترحيل كامل بياناتكم، قنوات العمل، وإعداداتكم التاريخية من السحابة إلى خوادمكم الداخلية بنقرة واحدة ودون انقطاع بالتشغيل.',
    aEn: 'Yes, seamlessly. Our architecture is packaged with standardized containers (Docker & Kubernetes), enabling one-click export and migration of your full historical ledger, custom configurations, and audit trails directly into your internal servers.',
  },
  {
    categoryAr: 'الاستهلاك والفوترة',
    categoryEn: 'Quotas & Records',
    qAr: 'كيف يتم احتساب حد الحركات والسجلات الشهرية للباقات؟ وماذا يحدث عند التجاوز؟',
    qEn: 'How are monthly record quotas measured, and what happens if we exceed them?',
    aAr: 'يُقصد بالسجل كل قيد محاسبي أو فاتورة مورد أو حركة تشغيلية يتم استيرادها وتدقيقها عبر محركات المنظومة خلال الشهر. لا يتم احتساب عمليات البحث، استعراض الشاشات، أو استخراج التقارير. وعند الاقتراب من سقف باقتكم، ينبهك النظام مبكراً مع إمكانية الترقية اللحظية للاستيعاب دون أي انقطاع.',
    aEn: 'A record is defined as any ledger posting, vendor invoice, or ERP journal transaction ingested and forensically audited during the billing month. Navigation, search, and report exports are completely free. You receive proactive warnings when nearing limits, with seamless tier upgrade options.',
  },
  {
    categoryAr: 'السرية والضمانات',
    categoryEn: 'NDAs & SLA',
    qAr: 'ما هي التزاماتكم بخصوص السرية (NDA) وضمان مستوى الخدمة (SLA)؟',
    qEn: 'What are your contractual commitments regarding bilateral NDAs and SLA guarantees?',
    aAr: 'تلتزم مخلافي لابس بتوقيع اتفاقيات سرية وعدم إفصاح ثنائية (Bilateral NDAs) ملزمة قانونياً مع كافة العملاء والمؤسسات قبل بدء التشغيل. كما نلتزم باتفاقية مستوى خدمة رسمية (SLA) تضمن استمرارية التشغيل بنسبة 99.9% مع مدير حساب تقني مخصص.',
    aEn: 'MIKHLAFI LABS formally executes legally-binding bilateral Non-Disclosure Agreements (NDAs) prior to any onboarding. We commit to a contractual 99.9% uptime Service Level Agreement (SLA) accompanied by a designated enterprise technical account lead.',
  },
];

export const PricingPage: React.FC<PricingPageProps> = ({
  locale,
  onNavigateRegister,
}) => {
  const isAr = locale === 'ar';
  const [activeTab, setActiveTab] = useState<'deployment' | 'cloud-plans' | 'faqs'>('deployment');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isSaaSWizardOpen, setIsSaaSWizardOpen] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [activeDeploymentModal, setActiveDeploymentModal] = useState<DeploymentType | null>(null);
  const [billingView, setBillingView] = useState<'monthly' | 'yearly'>('monthly');

  const openSaaSWizard = (tierId?: string) => {
    setSelectedTierId(tierId ?? null);
    setIsSaaSWizardOpen(true);
  };

  const openDeploymentModal = (type: DeploymentType) => {
    setActiveDeploymentModal(type);
  };

  const scrollToSection = (sectionId: string, tab: 'deployment' | 'cloud-plans' | 'faqs') => {
    setActiveTab(tab);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const deploymentModels = [
    {
      id: 'saas' as const,
      icon: '☁️',
      color: '#d4a017',
      accentVar: '--accent-base',
      badgeAr: 'تشغيل فوري · صفر بنية تحتية',
      badgeEn: 'Instant Launch · Managed',
      titleAr: 'السحابة المشتركة باشتراك شهري (Cloud SaaS - Multi-Tenant)',
      titleEn: 'Shared Cloud SaaS (Multi-Tenant)',
      targetAr: 'للشركات التي تبحث عن أسرع وقت تشغيل مع إدارة سحابية متكاملة',
      targetEn: 'For organizations seeking immediate time-to-value with zero DevOps burden',
      specAr: 'خوادم مجمعة مع عزل تشفيري مستقل للبيانات وقواعد البيانات',
      specEn: 'Shared clustered infrastructure with cryptographic logical data isolation',
      latency: '< 50ms',
      badgesAr: ['بدون خوادم خاصة', 'تحديثات تلقائية مستمرة', 'ابدأ خلال دقائق'],
      badgesEn: ['Zero private servers', 'Automatic continuous updates', 'Launch in minutes'],
      ctaAr: 'استعراض الباقات والاشتراك الفوري',
      ctaEn: 'View Plans & Subscribe',
      action: () => openSaaSWizard(),
    },
    {
      id: 'onpremise' as const,
      icon: '🏗️',
      color: '#6366f1',
      accentVar: '#6366f1',
      badgeAr: 'سيادة مطلقة · Air-Gapped',
      badgeEn: 'Absolute Sovereignty · Air-Gapped',
      titleAr: 'النشر الذاتي الكامل في سيرفر العميل الداخلي (Sovereign On-Premise)',
      titleEn: 'Sovereign On-Premise / Air-Gapped',
      targetAr: 'للجهات الحكومية، البنوك، والشركات ذات متطلبات الخصوصية الصارمة',
      targetEn: 'For government entities, banks, and enterprises with strict data laws',
      specAr: 'تثبيت كامل داخل شبكتكم وخوادمكم (Bare-Metal / VMware) بدون أي اتصال خارجي',
      specEn: 'Installed inside your own datacenter with zero external internet traffic',
      latency: '< 1ms LAN',
      badgesAr: ['بياناتك لا تغادر مقرك', 'يدعم شبكات Air-Gapped', 'تثبيت مخصص بالكامل'],
      badgesEn: ['Data never leaves premises', 'Air-Gapped support', 'Full custom install'],
      ctaAr: 'طلب دراسة النشر الداخلي',
      ctaEn: 'Request On-Premise Study',
      action: () => openDeploymentModal('onpremise'),
    },
    {
      id: 'hybrid' as const,
      icon: '🔀',
      color: '#10b981',
      accentVar: '#10b981',
      badgeAr: 'معالجة محلية + تحكم سحابي',
      badgeEn: 'Local Processing + Cloud UI',
      titleAr: 'النموذج الهجين الذكي (Hybrid Mesh / Local Worker Node)',
      titleEn: 'Adaptive Hybrid Mesh (Local Worker Node)',
      targetAr: 'للشركات الراغبة بحفظ سرية أرقام الـ ERP مع سهولة المتابعة من أي مكان',
      targetEn: 'For scaling companies wanting raw data privacy with remote mobile visibility',
      specAr: 'وكيل محلي خفيف (Docker Node) يعالج القيود داخلياً ويرسل المؤشرات مشفرة',
      specEn: 'Lightweight local Docker node processes records in LAN, syncing encrypted aggregates',
      latency: 'Local + Real-time Sync',
      badgesAr: ['أفضل ما في النموذجين', 'المعالجة المالية محلياً', 'لوحة تحكم للمدراء'],
      badgesEn: ['Best of both models', 'In-LAN computation', 'Mobile executive dashboard'],
      ctaAr: 'طلب تهيئة النموذج الهجين',
      ctaEn: 'Configure Hybrid Mesh',
      action: () => openDeploymentModal('hybrid'),
    },
    {
      id: 'dedicated_cloud' as const,
      icon: '🛡️',
      color: '#0ea5e9',
      accentVar: '#0ea5e9',
      badgeAr: 'بيئة معزولة 100% · Single-Tenant',
      badgeEn: '100% Isolated · Single-Tenant',
      titleAr: 'السحابة الخاصة المعزولة (Dedicated Private Cloud / Single-Tenant VPC)',
      titleEn: 'Dedicated Private Cloud (Single-Tenant VPC)',
      targetAr: 'للمجموعات الكبرى الراغبة بسحابة مخصصة ومستقلة بالكامل دون عبء الإدارة',
      targetEn: 'For large enterprises requiring isolated cloud resources without on-premise hardware',
      specAr: 'سحابة افتراضية مستقلة (VPC) بقواعد بيانات وخوادم مخصصة لكم داخل السعودية',
      specEn: 'Dedicated single-tenant VPC with isolated database hosted in certified KSA cloud zones',
      latency: '< 20ms Local Cloud',
      badgesAr: ['عزل كامل للشبكة والبيانات', 'امتثال للأمن السيبراني (NCA)', 'إدارة وصيانة سحابية شاملة'],
      badgesEn: ['Physical & network isolation', 'NCA regulatory compliance', 'Fully managed cloud ops'],
      ctaAr: 'طلب سحابة خاصة معزولة',
      ctaEn: 'Request Private Cloud VPC',
      action: () => openDeploymentModal('dedicated_cloud'),
    },
  ];

  return (
    <div className="public-page deployment-page">

      {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
      <section className="pp-hero pp-hero--center">
        <div className="site-container">
          <div className="pp-hero__inner">
            <span className="pp-eyebrow">
              🛡️ {isAr ? 'هندسة التشغيل والسيادة المؤسسية' : 'ENTERPRISE ARCHITECTURE & ENGAGEMENT'}
            </span>
            <h1 className="ml-display pp-hero__title" style={{ fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.25 }}>
              {isAr
                ? 'نماذج التشغيل وباقات الاستخدام المؤسسي'
                : 'Enterprise Deployment Models & Cloud Plans'}
            </h1>
            <p className="pp-hero__lede" style={{ maxWidth: 740, marginInline: 'auto' }}>
              {isAr
                ? 'بنية برمجية سيادية صُممت لتلبي أعلى متطلبات الأمان والامتثال وعزل البيانات: من السحابة المشتركة الفورية وحتى الخوادم الداخلية المعزولة كلياً (Air-Gapped).'
                : 'Sovereign software architecture engineered to satisfy the strictest enterprise privacy mandates: from instant shared cloud to fully air-gapped on-premise deployments.'}
            </p>

            {/* Quick interactive navigation tabs */}
            <div className="deployment-tabs" role="tablist">
              <button
                type="button"
                className={`deployment-tab-btn ${activeTab === 'deployment' ? 'is-active' : ''}`}
                onClick={() => scrollToSection('deployment-models', 'deployment')}
              >
                <span>🏢 {isAr ? 'نماذج التشغيل الأربعة' : '4 Deployment Models'}</span>
              </button>
              <button
                type="button"
                className={`deployment-tab-btn ${activeTab === 'cloud-plans' ? 'is-active' : ''}`}
                onClick={() => scrollToSection('cloud-plans', 'cloud-plans')}
              >
                <span>☁️ {isAr ? 'باقات السحابة المشتركة (SaaS)' : 'Shared Cloud Plans'}</span>
              </button>
              <button
                type="button"
                className={`deployment-tab-btn ${activeTab === 'faqs' ? 'is-active' : ''}`}
                onClick={() => scrollToSection('deployment-faqs', 'faqs')}
              >
                <span>❓ {isAr ? 'الأسئلة الشائعة والضمانات' : 'Architecture & FAQs'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. The 4 Operational Models ──────────────────────────────────── */}
      <section id="deployment-models" className="pp-section pp-section--tight">
        <div className="site-container">
          <div className="pp-section__head" style={{ marginBottom: 32 }}>
            <span className="pp-eyebrow" style={{ color: 'var(--accent-light)' }}>
              {isAr ? 'أين وكيف تعمل المنظومة؟' : 'WHERE DOES THE SYSTEM RUN?'}
            </span>
            <h2 className="pp-section__title" style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}>
              {isAr ? '4 نماذج تشغيل مرنة تتكيف مع سيادتك الرقمية' : '4 Flexible Deployment Models Built for Digital Sovereignty'}
            </h2>
            <p className="pp-section__lede">
              {isAr
                ? 'لا نجبرك على قالب واحد؛ نوفر لك البيئة الهندسية التي تتوافق بدقة مع لوائح الأمن السيبراني وسياسة البيانات في منشأتكم.'
                : 'We don’t force a single pattern; we deliver the exact engineering architecture that satisfies your cybersecurity governance.'}
            </p>
          </div>

          <div className="deployment-grid">
            {deploymentModels.map((model) => (
              <article
                key={model.id}
                className="deploy-arch-card"
                style={{
                  ['--card-accent' as any]: model.color,
                  ['--card-glow' as any]: `${model.color}33`,
                }}
              >
                {/* Glowing top line */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  insetInlineStart: 0,
                  insetInlineEnd: 0,
                  height: 3,
                  background: `linear-gradient(90deg, ${model.color}, transparent)`,
                }} />

                {/* Header with icon and badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 16 }}>
                  <span style={{
                    fontSize: 26,
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-md)',
                    background: `${model.color}18`,
                    border: `1px solid ${model.color}40`,
                    flexShrink: 0,
                  }}>
                    {model.icon}
                  </span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 20,
                    background: `${model.color}15`,
                    color: model.color,
                    border: `1px solid ${model.color}35`,
                  }}>
                    {isAr ? model.badgeAr : model.badgeEn}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  margin: '0 0 8px',
                  lineHeight: 1.4,
                  minHeight: 44,
                }}>
                  {isAr ? model.titleAr : model.titleEn}
                </h3>

                {/* Target profile */}
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 14px', minHeight: 40 }}>
                  {isAr ? model.targetAr : model.targetEn}
                </p>

                {/* Architecture spec pill */}
                <div style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: 16,
                  fontSize: 11.5,
                  color: 'var(--text-tertiary)',
                  lineHeight: 1.5,
                }}>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>
                    ⚙️ {isAr ? 'البنية التقنية:' : 'Architecture:'}
                  </strong>
                  {isAr ? model.specAr : model.specEn}
                </div>

                {/* Badges checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, flex: '1 0 auto' }}>
                  {(isAr ? model.badgesAr : model.badgesEn).map((badge, bIdx) => (
                    <div key={bIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <span style={{ color: model.color, fontSize: 14, fontWeight: 700 }}>✓</span>
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>

                {/* Action CTA */}
                <button
                  type="button"
                  onClick={model.action}
                  style={{
                    width: '100%',
                    padding: '12px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: model.id === 'saas' ? 'var(--accent-base)' : `${model.color}18`,
                    border: `1.5px solid ${model.id === 'saas' ? 'var(--accent-base)' : model.color + '55'}`,
                    color: model.id === 'saas' ? '#000' : model.color,
                    fontWeight: 700,
                    fontSize: 13.5,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                  onMouseOver={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    if (model.id === 'saas') {
                      el.style.opacity = '0.9';
                    } else {
                      el.style.background = `${model.color}30`;
                    }
                  }}
                  onMouseOut={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    if (model.id === 'saas') {
                      el.style.opacity = '1';
                    } else {
                      el.style.background = `${model.color}18`;
                    }
                  }}
                >
                  <span>{isAr ? model.ctaAr : model.ctaEn}</span>
                  <IconArrowRight size={14} />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Cloud SaaS Subscription Plans ─────────────────────────────── */}
      <section id="cloud-plans" className="pp-section pp-section--muted">
        <div className="site-container">
          <div className="pp-section__head">
            <span className="pp-eyebrow" style={{ color: 'var(--accent-light)' }}>
              ☁️ {isAr ? 'الاشتراك السحابي الفوري' : 'INSTANT CLOUD TIERS'}
            </span>
            <h2 className="pp-section__title">
              {isAr ? 'باقات السحابة المشتركة (Cloud SaaS)' : 'Shared Cloud Subscription Plans'}
            </h2>
            <p className="pp-section__lede">
              {isAr
                ? '3 باقات واضحة ومحددة. بدون تكاليف إعداد خفية. يمكنك الترقية أو إلغاء الاشتراك في أي وقت.'
                : '3 transparent tiers. Zero setup fees. Upgrade, downgrade, or cancel anytime.'}
            </p>

            {/* Billing Toggle */}
            <div style={{
              display: 'inline-flex',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)',
              overflow: 'hidden',
              background: 'var(--surface-2)',
              marginTop: 18,
            }}>
              {(['monthly', 'yearly'] as const).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingView(cycle)}
                  style={{
                    padding: '9px 24px',
                    border: 'none',
                    cursor: 'pointer',
                    background: billingView === cycle ? 'var(--accent-base)' : 'transparent',
                    color: billingView === cycle ? '#000' : 'var(--text-secondary)',
                    fontWeight: billingView === cycle ? 700 : 400,
                    fontSize: 13,
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {cycle === 'monthly'
                    ? (isAr ? 'اشتراك شهري' : 'Monthly')
                    : (isAr ? 'اشتراك سنوي' : 'Annual')}
                  {cycle === 'yearly' && (
                    <span style={{
                      fontSize: 10,
                      background: 'var(--status-success)',
                      color: '#fff',
                      padding: '2px 7px',
                      borderRadius: 20,
                      fontWeight: 700,
                    }}>
                      {isAr ? 'وفّر 20%' : 'Save 20%'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="site-pricing">
            {CLOUD_TIERS.map((tier) => {
              const price = billingView === 'yearly' ? tier.priceYearly : tier.priceMonthly;
              const sarPrice = Math.round(price * 3.75);

              return (
                <article
                  key={tier.id}
                  className={`price-card ${tier.popular ? 'price-card--featured' : ''}`}
                  style={{ position: 'relative', overflow: 'hidden' }}
                >
                  {tier.popular && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      insetInlineStart: 0,
                      insetInlineEnd: 0,
                      height: 3,
                      background: `linear-gradient(90deg, ${tier.color}, ${tier.color}aa)`,
                    }} />
                  )}

                  <span className="ml-badge price-card__badge">
                    {isAr ? tier.badgeAr : tier.badgeEn}
                  </span>

                  <div>
                    <h3 className="price-card__name">{isAr ? tier.nameAr : tier.nameEn}</h3>
                    <p className="price-card__desc">{isAr ? tier.subtitleAr : tier.subtitleEn}</p>
                  </div>

                  {/* Price presentation */}
                  <div style={{ margin: '18px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>$</span>
                      <span style={{ fontSize: 40, fontWeight: 800, color: tier.color, lineHeight: 1 }}>
                        {price}
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        /{isAr ? 'شهر' : 'mo'}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginInlineStart: 6 }}>
                        (~{sarPrice} {isAr ? 'ر.س' : 'SAR'})
                      </span>
                    </div>

                    {billingView === 'yearly' && (
                      <div style={{ fontSize: 12, color: 'var(--status-success)', marginTop: 4 }}>
                        {isAr
                          ? `يُدفع $${price * 12} (~${Math.round(price * 12 * 3.75)} ر.س) سنوياً`
                          : `$${price * 12} (~${Math.round(price * 12 * 3.75)} SAR) billed annually`}
                      </div>
                    )}
                    {billingView === 'monthly' && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                        {isAr
                          ? `$${tier.priceYearly}/شهر عند اختيار الدفع السنوي`
                          : `$${tier.priceYearly}/mo when billed annually`}
                      </div>
                    )}
                  </div>

                  {/* Quotas & limits */}
                  <div style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                    marginBottom: 16,
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      🔧 {isAr ? `${tier.engines} محركات ذكاء` : `${tier.engines} engines`}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>·</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      👥 {tier.maxUsers === 'unlimited' ? (isAr ? 'مستخدمون غير محدودين' : 'Unlimited') : `حتى ${tier.maxUsers} مستخدمين`}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>·</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      📊 {tier.recordsPerMonth} {isAr ? 'حركة شهرياً' : 'rec/mo'}
                    </span>
                  </div>

                  {/* Features list */}
                  <div className="price-card__list">
                    {(isAr ? tier.featuresAr : tier.featuresEn).map((feat, fIdx) => (
                      <div key={fIdx} className="price-card__item">
                        <IconCheckCircle size={15} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    type="button"
                    className={`ml-btn ${tier.popular ? 'ml-btn--primary' : 'ml-btn--ghost'} pp-price__cta`}
                    onClick={() => openSaaSWizard(tier.id)}
                  >
                    <span>{isAr ? 'اشترك في هذه الباقة' : 'Subscribe to this Plan'}</span>
                    <IconArrowRight size={15} />
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. Enterprise Sovereignty Commitment ─────────────────────────── */}
      <section className="pp-section">
        <div className="site-container">
          <div className="pp-assure">
            <span className="pp-assure__icon" aria-hidden="true">
              <IconShield size={26} />
            </span>
            <div className="pp-assure__body">
              <h2 className="pp-assure__title">
                {isAr ? 'ضمانات السيادة، التشفير والامتثال المؤسسي' : 'Sovereignty, Encryption & Enterprise Compliance'}
              </h2>
              <p className="pp-assure__text">
                {isAr
                  ? 'سواء اخترت السحابة المشتركة أو النشر الداخلي الكامل، تلتزم مخلافي لابس بتشفير AES-256 للبيانات أثناء الراحة والعبور، وتطبيق مبدأ المعرفة الصفرية (Zero-Knowledge) بحيث لا يمكن لأي طرف الاطلاع على أرقام أو أسرار منشأتكم.'
                  : 'Whether you choose shared cloud or sovereign on-premise, MIKHLAFI LABS guarantees AES-256 encryption at rest and in transit, zero third-party telemetry, and enterprise NDAs.'}
              </p>
              <div className="pp-assure__points">
                <span className="ml-badge">{isAr ? 'تشفير AES-256 كامل' : 'AES-256 Encryption'}</span>
                <span className="ml-badge">{isAr ? 'اتفاقيات NDA سرية صارمة' : 'Bilateral NDAs'}</span>
                <span className="ml-badge">{isAr ? 'امتثال الأمن السيبراني (NCA)' : 'NCA Compliance'}</span>
                <span className="ml-badge">{isAr ? 'عزل كامل لبيانات كل عميل' : 'Strict Tenant Isolation'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Luxury Enterprise FAQs ────────────────────────────────────── */}
      <section id="deployment-faqs" className="pp-section pp-section--muted">
        <div className="site-container">
          <div className="pp-section__head" style={{ marginBottom: 32 }}>
            <span className="pp-eyebrow" style={{ color: 'var(--accent-light)' }}>
              {isAr ? 'الأسئلة الشائعة حول النشر والتعاقد' : 'DEPLOYMENT & ARCHITECTURE FAQS'}
            </span>
            <h2 className="pp-section__title" style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}>
              {isAr ? 'إجابات تقنية وقانونية على أكثر استفسارات القادة' : 'Technical & Legal Answers to Enterprise Questions'}
            </h2>
            <p className="pp-section__lede">
              {isAr
                ? 'كل ما تحتاج معرفته حول أمان البيانات، شروط النشر، الاستضافة، وعقود مستوى الخدمة.'
                : 'Everything you need to know about data governance, SLA guarantees, deployment timelines, and legal commitments.'}
            </p>
          </div>

          <div className="deploy-faq-wrap">
            {DEPLOYMENT_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className={`deploy-faq-card ${isOpen ? 'is-open' : ''}`}>
                  <button
                    type="button"
                    className="deploy-faq-header"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                  >
                    <div className="deploy-faq-title-wrap">
                      <span className="deploy-faq-tag">
                        {isAr ? faq.categoryAr : faq.categoryEn}
                      </span>
                      <h4 className="deploy-faq-question">
                        {isAr ? faq.qAr : faq.qEn}
                      </h4>
                    </div>
                    <span className="deploy-faq-icon" aria-hidden="true">
                      <IconChevronDown size={16} />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="deploy-faq-body">
                      <p style={{ margin: 0 }}>
                        {isAr ? faq.aAr : faq.aEn}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {/* 1. Cloud SaaS Onboarding Wizard */}
      <SaaSOnboardingWizard
        locale={locale}
        isOpen={isSaaSWizardOpen}
        initialTierId={selectedTierId}
        onClose={() => setIsSaaSWizardOpen(false)}
        onComplete={() => {
          setIsSaaSWizardOpen(false);
          onNavigateRegister();
        }}
      />

      {/* 2. Custom Deployment Inquiry Modal (On-Premise / Hybrid / Dedicated Cloud) */}
      {activeDeploymentModal && (
        <OnPremiseInquiryModal
          locale={locale}
          isOpen={true}
          deploymentType={activeDeploymentModal}
          onClose={() => setActiveDeploymentModal(null)}
        />
      )}
    </div>
  );
};
