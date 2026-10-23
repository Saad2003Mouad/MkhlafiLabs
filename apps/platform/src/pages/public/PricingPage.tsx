// MIKHLAFI LABS — Public Pricing & Deployment Models Page (/pricing)
// 1) Section 1: The 4 Core Deployment & Operation Options (أين يعمل النظام؟)
//    - Cloud SaaS (Multi-Tenant) → Launches SaaS Onboarding Wizard
//    - Sovereign On-Premise (Air-Gapped) → Launches custom deployment inquiry modal (WhatsApp/Email)
//    - Hybrid Mesh (Local Worker Node) → Launches custom deployment inquiry modal (WhatsApp/Email)
//    - Dedicated Private Cloud (Single-Tenant VPC) → Launches custom deployment inquiry modal (WhatsApp/Email)
// 2) Section 2: Cloud SaaS 3 Tiers (Starter $99, Pro $299, Enterprise $799) with Monthly/Yearly toggle
// 3) Section 3: Enterprise Commitments, Data Privacy & FAQ

import React, { useState } from 'react';
import { LocaleMode } from '../../types';
import { CLOUD_TIERS } from '../../components/website/SaaSOnboardingWizard';
import { SaaSOnboardingWizard } from '../../components/website/SaaSOnboardingWizard';
import { OnPremiseInquiryModal, DeploymentType } from '../../components/website/OnPremiseInquiryModal';
import { FAQS } from '../../data/marketingContent';
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

export const PricingPage: React.FC<PricingPageProps> = ({
  locale,
  onNavigateRegister,
}) => {
  const isAr = locale === 'ar';
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

  const deploymentModels: Array<{
    id: 'saas' | 'onpremise' | 'hybrid' | 'dedicated_cloud';
    icon: string;
    color: string;
    titleAr: string;
    titleEn: string;
    subtitleAr: string;
    subtitleEn: string;
    descAr: string;
    descEn: string;
    badgesAr: string[];
    badgesEn: string[];
    ctaAr: string;
    ctaEn: string;
    action: () => void;
  }> = [
    {
      id: 'saas',
      icon: '☁️',
      color: '#d4a017',
      titleAr: 'السحابة المشتركة باشتراك شهري (Cloud SaaS - Multi-Tenant)',
      titleEn: 'Shared Cloud SaaS (Multi-Tenant)',
      subtitleAr: 'تشغيل فوري في دقائق · صفر بنية تحتية',
      subtitleEn: 'Instant launch · Zero infrastructure burden',
      descAr: 'اشترك مباشرة في إحدى باقاتنا الشهرية وابدأ العمل فوراً. نتكفّل بالاستضافة السحابية، والنسخ الاحتياطي، والتحديثات المستمرة والأمان.',
      descEn: 'Subscribe directly to our monthly plans and launch immediately. We manage cloud hosting, automated backups, security, and continuous updates.',
      badgesAr: ['بدون خوادم خاصة', 'تحديثات تلقائية', 'بدء فوري خلال دقائق'],
      badgesEn: ['No private servers', 'Auto updates', 'Instant start in minutes'],
      ctaAr: 'استعراض الباقات والاشتراك الفوري',
      ctaEn: 'View Plans & Subscribe',
      action: () => openSaaSWizard(),
    },
    {
      id: 'onpremise',
      icon: '🏗️',
      color: '#6366f1',
      titleAr: 'النشر الذاتي الكامل في سيرفر العميل الداخلي (Sovereign On-Premise / Air-Gapped)',
      titleEn: 'Sovereign On-Premise / Air-Gapped',
      subtitleAr: 'البيانات لا تغادر مقرك · سيادة وأمان مطلق',
      subtitleEn: 'Data never leaves your premises · Absolute sovereignty',
      descAr: 'تثبيت المنظومة بالكامل على خوادمك الداخلية (Bare-Metal / VMware) مع دعم الشبكات المعزولة تماماً عن الإنترنت (Air-Gapped).',
      descEn: 'Deploy the entire system inside your corporate servers with support for completely air-gapped, isolated network environments.',
      badgesAr: ['بياناتك داخل مقرك 100%', 'يدعم شبكات Air-Gapped', 'تثبيت سيادي مخصص'],
      badgesEn: ['100% on-premise data', 'Air-Gapped support', 'Full sovereign install'],
      ctaAr: 'طلب دراسة النشر الداخلي',
      ctaEn: 'Request On-Premise Study',
      action: () => openDeploymentModal('onpremise'),
    },
    {
      id: 'hybrid',
      icon: '🔀',
      color: '#10b981',
      titleAr: 'النموذج الهجين الذكي (Hybrid Mesh / Local Worker Node)',
      titleEn: 'Adaptive Hybrid Mesh (Local Worker Node)',
      subtitleAr: 'معالجة محلية داخلية + لوحة تحكم سحابية',
      subtitleEn: 'Local on-premise processing + Secure cloud dashboard',
      descAr: 'عقدة معالجة محلية (Worker Node) تعمل داخل شبكتك لمعالجة القيود دون خروجها، مع لوحة تحكم سحابية مشفرة لسهولة المتابعة.',
      descEn: 'A local worker node runs inside your private LAN to crunch raw ERP numbers locally, while a secure cloud dashboard provides executive insights anywhere.',
      badgesAr: ['أفضل ما في النموذجين', 'المعالجة الحسابية محلياً', 'متابعة تنفيذية من أي مكان'],
      badgesEn: ['Best of both worlds', 'Local number crunching', 'Executive cloud visibility'],
      ctaAr: 'طلب تهيئة النموذج الهجين',
      ctaEn: 'Configure Hybrid Mesh',
      action: () => openDeploymentModal('hybrid'),
    },
    {
      id: 'dedicated_cloud',
      icon: '🛡️',
      color: '#0ea5e9',
      titleAr: 'السحابة الخاصة المعزولة (Dedicated Private Cloud / Single-Tenant VPC)',
      titleEn: 'Dedicated Private Cloud (Single-Tenant VPC)',
      subtitleAr: 'بيئة سحابية معزولة 100% · لا مشاركة في الموارد',
      subtitleEn: '100% isolated private VPC · Zero shared resources',
      descAr: 'حجز بيئة سحابية خاصة مستقلة تماماً لمنشأتك على خوادم سحابية محلية معتمدة (مثل Oracle Cloud الرياض/جدة) مع إدارة فنية شاملة.',
      descEn: 'A completely isolated single-tenant VPC provisioned solely for your enterprise in certified local cloud zones (e.g. Oracle Cloud KSA) with full management.',
      badgesAr: ['عزل كامل للشبكة وقواعد البيانات', 'امتثال للأمن السيبراني (NCA)', 'إدارة وصيانة سحابية شاملة'],
      badgesEn: ['Isolated DB & compute', 'Full NCA compliance', 'Fully managed cloud ops'],
      ctaAr: 'طلب سحابة خاصة معزولة',
      ctaEn: 'Request Private Cloud VPC',
      action: () => openDeploymentModal('dedicated_cloud'),
    },
  ];

  return (
    <div className="public-page pricing-page">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pp-hero pp-hero--center">
        <div className="site-container">
          <div className="pp-hero__inner">
            <span className="pp-eyebrow">
              {isAr ? 'خيارات النشر والتشغيل وباقات الاشتراك' : 'Deployment Models & Subscription Plans'}
            </span>
            <h1 className="ml-display pp-hero__title">
              {isAr
                ? 'أولاً: خيارات النشر والتشغيل (أين يعمل النظام؟)'
                : '1. Deployment & Operation Options (Where Does It Run?)'}
            </h1>
            <p className="pp-hero__lede">
              {isAr
                ? 'توفر منصة مخلافي لابس 4 نماذج تشغيل مرنة تتكيف تماماً مع سياسات الأمان والسيادة الرقمية لمنشأتكم، من السحابة الفورية وحتى الشبكات المعزولة كلياً.'
                : 'MIKHLAFI LABS delivers 4 flexible deployment models tailored to your organization’s security policies and data sovereignty.'}
            </p>
          </div>
        </div>
      </section>

      {/* ── 1. The 4 Deployment Options Grid ─────────────────────────────── */}
      <section className="pp-section pp-section--tight" style={{ paddingTop: 0 }}>
        <div className="site-container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
            marginBottom: 40,
          }}>
            {deploymentModels.map((model) => (
              <div
                key={model.id}
                style={{
                  padding: '28px 24px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--surface-1)',
                  border: '1.5px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  transition: 'all 0.25s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseOver={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = model.color;
                  el.style.boxShadow = `0 10px 30px ${model.color}18, 0 0 0 1px ${model.color}33`;
                  el.style.transform = 'translateY(-3px)';
                }}
                onMouseOut={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'var(--border-subtle)';
                  el.style.boxShadow = 'none';
                  el.style.transform = 'translateY(0)';
                }}
              >
                {/* Top accent line */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  insetInlineStart: 0,
                  insetInlineEnd: 0,
                  height: 3,
                  background: `linear-gradient(90deg, ${model.color}, transparent)`,
                }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <span style={{
                    fontSize: 28,
                    width: 52,
                    height: 52,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-md)',
                    background: `${model.color}14`,
                    border: `1px solid ${model.color}33`,
                    flexShrink: 0,
                  }}>
                    {model.icon}
                  </span>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1.4 }}>
                      {isAr ? model.titleAr : model.titleEn}
                    </h3>
                    <span style={{ fontSize: 12, color: model.color, fontWeight: 700 }}>
                      {isAr ? model.subtitleAr : model.subtitleEn}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                  {isAr ? model.descAr : model.descEn}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(isAr ? model.badgesAr : model.badgesEn).map((badge, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 11,
                        padding: '3px 10px',
                        borderRadius: 20,
                        background: `${model.color}14`,
                        border: `1px solid ${model.color}33`,
                        color: model.color,
                        fontWeight: 600,
                      }}
                    >
                      ✓ {badge}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={model.action}
                  style={{
                    marginTop: 'auto',
                    padding: '12px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: `${model.color}18`,
                    border: `1.5px solid ${model.color}55`,
                    color: model.color,
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
                    (e.currentTarget as HTMLElement).style.background = `${model.color}2e`;
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLElement).style.background = `${model.color}18`;
                  }}
                >
                  <span>{isAr ? model.ctaAr : model.ctaEn}</span>
                  <IconArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Cloud SaaS Subscription Packages ───────────────────────────── */}
      <section id="saas-plans" className="pp-section pp-section--muted">
        <div className="site-container">
          <div className="pp-section__head">
            <span className="pp-eyebrow">
              ☁️ {isAr ? 'ثانياً: باقات السحابة المشتركة (Cloud SaaS)' : '2. Shared Cloud SaaS Packages'}
            </span>
            <h2 className="pp-section__title">
              {isAr ? '3 باقات محددة وشفافة باشتراك شهري أو سنوي' : '3 Transparent Packages with Monthly or Annual Billing'}
            </h2>
            <p className="pp-section__lede">
              {isAr
                ? 'اختر الباقة المناسبة لحجم منشأتكم، مع حدود استخدام واضحة وإمكانية الترقية أو الإلغاء في أي وقت.'
                : 'Choose the tier suited for your operations, with distinct record limits and instant onboarding.'}
            </p>

            {/* Billing cycle toggle */}
            <div style={{
              display: 'inline-flex',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)',
              overflow: 'hidden',
              background: 'var(--surface-2)',
              marginTop: 16,
            }}>
              {(['monthly', 'yearly'] as const).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingView(cycle)}
                  style={{
                    padding: '8px 22px',
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
                      padding: '1px 6px',
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

                  {/* Price display */}
                  <div style={{ margin: '16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>$</span>
                      <span style={{ fontSize: 38, fontWeight: 800, color: tier.color, lineHeight: 1 }}>
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
                      📊 {tier.recordsPerMonth} {isAr ? 'حركة شهرياً' : 'records/mo'}
                    </span>
                  </div>

                  <div className="price-card__list">
                    {(isAr ? tier.featuresAr : tier.featuresEn).map((feat, fIdx) => (
                      <div key={fIdx} className="price-card__item">
                        <IconCheckCircle size={15} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

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

      {/* ── 3. Enterprise Commitments & Security ─────────────────────────── */}
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

      {/* ── 4. Frequently Asked Questions ─────────────────────────────────── */}
      <section className="pp-section pp-section--muted">
        <div className="site-container">
          <div className="pp-section__head">
            <span className="pp-eyebrow">{isAr ? 'الأسئلة الشائعة' : 'Frequently Asked'}</span>
            <h2 className="pp-section__title">
              {isAr ? 'إجابات على أكثر الاستفسارات شيوعاً' : 'Answers to Common Inquiries'}
            </h2>
          </div>

          <div className="pp-faqs">
            {FAQS.map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div key={i} className={`pp-faq ${isOpen ? 'pp-faq--open' : ''}`}>
                  <button
                    type="button"
                    className="pp-faq__q"
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    <span>{isAr ? faq.qAr : faq.qEn}</span>
                    <IconChevronDown size={18} />
                  </button>
                  {isOpen && (
                    <div className="pp-faq__a">
                      <p>{isAr ? faq.aAr : faq.aEn}</p>
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
