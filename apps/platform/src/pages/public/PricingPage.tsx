// MIKHLAFI LABS — Public Pricing & Engagement Models Page (/pricing)
// Transparent enterprise deployment tiers and customized licensing models

import React from 'react';
import { LocaleMode } from '../../types';
import {
  IconCheckCircle,
  IconArrowRight,
  IconShield
} from '../../components/Icons';

interface PricingPageProps {
  locale: LocaleMode;
  onNavigateRegister: () => void;
  onRequestDemo: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({
  locale,
  onNavigateRegister,
  onRequestDemo
}) => {
  const isAr = locale === 'ar';

  const packages = [
    {
      id: 'core-intelligence',
      nameEn: 'Core Intelligence Edition',
      nameAr: 'إصدار الاستخبارات الأساسي',
      targetEn: 'Mid-sized operating entities and fast-scaling organizations.',
      targetAr: 'المؤسسات متوسطة الحجم والشركات في طور التوسع السريع.',
      badgeEn: 'CLOUD HOSTED',
      badgeAr: 'استضافة سحابية',
      featuresEn: [
        'Single organization workspace with up to 5 branch profiles',
        'Financial Variance & Duplicate Disbursement Detector',
        'Executive Decision Center with ranked priority directives',
        'Standard ERP connectors (REST / Webhook / Daily CSV)',
        'Role-based access control (RBAC) & standard audit logs',
        'Standard business-hours engineering support SLA'
      ],
      featuresAr: [
        'مساحة عمل مؤسسية واحدة مع دعم حتى 5 فروع تشغيلية',
        'كاشف الانحرافات المالية والمدفوعات المكررة الآلي',
        'مركز القرارات التنفيذية مع تصنيف التوصيات حسب الأثر',
        'موائمات ERP القياسية (REST API / Webhooks / ملفات يومية)',
        'صلاحيات وصول مبنية على الأدوار (RBAC) وسجل تدقيق قياسي',
        'دعم هندسي خلال ساعات العمل الرسمية'
      ]
    },
    {
      id: 'enterprise-sovereign',
      nameEn: 'Sovereign Enterprise Edition',
      nameAr: 'إصدار المؤسسات السيادي',
      targetEn: 'Multi-entity conglomerates, holding groups, and regulated enterprises.',
      targetAr: 'المجموعات القابضة والشركات متعددة الكيانات والمؤسسات الخاضعة للوائح التنظيمية.',
      badgeEn: 'MOST POPULAR',
      badgeAr: 'الأكثر اعتماداً',
      featured: true,
      featuresEn: [
        'Multi-tenant group management with unlimited branches & subsidiaries',
        'All eight core intelligence engines (Decisions, Risk, Margin, Supply, Churn)',
        'Bi-directional ERP sync (SAP, Oracle, Microsoft Dynamics, Odoo)',
        'Evidence-grounded natural language AI assistant',
        'Cryptographic audit trails & automated compliance reporting',
        'Dedicated Solutions Architect & 99.9% uptime SLA guarantee',
        'Hosted on certified KSA/GCC sovereign cloud infrastructure'
      ],
      featuresAr: [
        'إدارة متعددة المستأجرين للشركات التابعة وفروعها بلا حدود',
        'كافة محركات الذكاء الثمانية (القرارات، المخاطر، الهوامش، الموردين، الحوكمة)',
        'مزامنة ERP ثنائية الاتجاه (SAP, Oracle, Dynamics 365, Odoo)',
        'المساعد التنفيذي الذكي المدعوم بالأدلة وسجلات القيود',
        'سجلات تدقيق مشفرة وتقارير امتثال وحوكمة مؤتمتة',
        'مهندس حلول مخصص وضمان تشغيل 99.9% لاتفاقية مستوى الخدمة',
        'استضافة على بنية تحتية سحابية سيادية معتمدة داخل المملكة'
      ]
    },
    {
      id: 'dedicated-onprem',
      nameEn: 'Mission-Critical Dedicated / Air-Gapped',
      nameAr: 'الإصدار المخصص وشبكات العزل التام (Air-Gapped)',
      targetEn: 'Defense, sovereign infrastructure, and strict on-premises compliance mandates.',
      targetAr: 'الجهات الحيوية والسيادية والمؤسسات ذات متطلبات العزل المحلي التام.',
      badgeEn: 'ON-PREMISES / PRIVATE CLUSTER',
      badgeAr: 'نشر محلي مغلق',
      featuresEn: [
        'Air-gapped deployment in private customer data center or VPC',
        'Zero outbound network traffic; fully local telemetry & inference',
        'Custom proprietary hardware cryptographic security module (HSM) signing',
        'Custom semantic ontology development for internal legacy mainframe databases',
        'Source-code escrow & national cybersecurity framework (NCA) compliance audit',
        '24/7/365 dedicated mission-critical incident response team'
      ],
      featuresAr: [
        'نشر معزول كلياً داخل مراكز بيانات العميل الخاصة أو السحابة الخاصة (VPC)',
        'انعدام حركة المرور الخارجية؛ معالجة وتحليل محلي بالكامل دون اتصال خارجي',
        'تكامل مع وحدات الأمان التشفيري للأجهزة (HSM) للتوثيق الداخلي',
        'بناء أنطولوجيا مخصصة للأنظمة المركزية القديمة وقواعد البيانات المعقدة',
        'إيداع الكود المصدري وتدقيق شامل للامتثال لضوابط الأمن السيبراني (NCA)',
        'فريق دعم واستجابة للطوارئ متاح على مدار الساعة طوال أيام العام'
      ]
    }
  ];

  return (
    <div className="public-page pricing-page">
      {/* Hero */}
      <section className="public-hero" style={{ padding: '6rem 0 4rem', background: 'radial-gradient(circle at 50% 0%, var(--accent-subtle) 0%, transparent 70%)' }}>
        <div className="site-container" style={{ textAlign: 'center', maxWidth: '960px', margin: '0 auto' }}>
          <div className="severity-tag optimal" style={{ display: 'inline-flex', marginBottom: '1.5rem', padding: '0.4rem 1rem' }}>
            {isAr ? 'الباقات ونماذج التعاقد' : 'DEPLOYMENT & LICENSING MODELS'}
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.5rem' }}>
            {isAr ? (
              <>عقود شفافة مصممة حسب حجم وبيئة مؤسستك</>
            ) : (
              <>Enterprise Licensing Tailored to Your Scale</>
            )}
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '780px', margin: '0 auto 2.5rem' }}>
            {isAr
              ? 'تعتمد التكلفة على عدد الكيانات وحجم تدفق الحركات التشغيلية ونموذج النشر (سحابي سيادي أو محلي مغلق). لا رسوم خفية أو تكاليف غير معلنة.'
              : 'Licensing is structured around transactional ingestion volume, operating subsidiaries, and deployment architecture. No ambiguous seat markups.'}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onRequestDemo} className="btn-primary" style={{ padding: '0.8rem 1.8rem', fontSize: '1rem' }}>
              <span>{isAr ? 'طلب تسعير مخصص للمؤسسة' : 'Request Enterprise Quote'}</span>
              <IconArrowRight size={16} />
            </button>
            <button onClick={onNavigateRegister} className="btn-secondary" style={{ padding: '0.8rem 1.8rem', fontSize: '1rem' }}>
              <span>{isAr ? 'إنشاء حساب تجريبي للمؤسسة' : 'Create Trial Workspace'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="site-section" style={{ padding: '4rem 0' }}>
        <div className="site-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'stretch' }}>
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="kpi-card"
                style={{
                  padding: '2.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  background: pkg.featured ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                  border: pkg.featured ? '2px solid var(--accent-base)' : '1px solid var(--border-subtle)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className={`severity-tag ${pkg.featured ? 'high' : 'optimal'}`} style={{ fontSize: '0.72rem', padding: '0.25rem 0.75rem' }}>
                    {isAr ? pkg.badgeAr : pkg.badgeEn}
                  </span>
                </div>

                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  {isAr ? pkg.nameAr : pkg.nameEn}
                </h2>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  {isAr ? pkg.targetAr : pkg.targetEn}
                </p>

                <div style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '1.25rem 0', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-light)', marginBottom: '0.25rem' }}>
                    {isAr ? 'تسعير مخصص للمؤسسة' : 'Custom Enterprise Quote'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    {isAr ? 'يحدد بناءً على حجم العمليات وموائمات الأنظمة' : 'Structured by monthly transaction volume & entity count'}
                  </div>
                </div>

                <div style={{ flex: 1, marginBottom: '2rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
                    {isAr ? 'الميزات المشمولة:' : 'Included Specifications:'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(isAr ? pkg.featuresAr : pkg.featuresEn).map((f, fIdx) => (
                      <div key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                        <span style={{ color: 'var(--status-optimal)', marginTop: '2px' }}>
                          <IconCheckCircle size={15} />
                        </span>
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={onRequestDemo}
                  className={pkg.featured ? 'btn-primary' : 'btn-secondary'}
                  style={{ width: '100%', padding: '0.75rem', justifyContent: 'center' }}
                >
                  <span>{isAr ? 'طلب عرض سعر مفصل' : 'Request Custom Proposal'}</span>
                  <IconArrowRight size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assurance and SLA section */}
      <section className="site-section" style={{ padding: '4rem 0', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="site-container" style={{ maxWidth: '840px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ color: 'var(--status-optimal)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <IconShield size={36} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>
            {isAr ? 'ضمانات الامتثال واستمرارية الأعمال' : 'Sovereignty & Enterprise SLA Commitments'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            {isAr
              ? 'تلتزم مخلافي لابس باتفاقيات سرية صارمة (NDA) وعدم مشاركة البيانات مع أي أطراف خارجية، مع إمكانية مراجعة الكود البرمجي والتدقيق المستقل لشهادات الأمن السيبراني.'
              : 'MIKHLAFI LABS guarantees strict bilateral NDAs, zero third-party telemetry exposure, independent penetration audits, and formal source escrow agreements upon request.'}
          </p>
        </div>
      </section>
    </div>
  );
};
