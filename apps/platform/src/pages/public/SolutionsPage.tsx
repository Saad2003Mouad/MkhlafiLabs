// MIKHLAFI LABS — Public Solutions Page (/solutions)
// Outlines enterprise solutions across executive decision intelligence, financial variance, supply risk, and project margins

import React from 'react';
import { LocaleMode } from '../../types';
import {
  IconCheckCircle,
  IconArrowRight
} from '../../components/Icons';

interface SolutionsPageProps {
  locale: LocaleMode;
  onNavigateRegister: () => void;
  onRequestDemo: () => void;
}

export const SolutionsPage: React.FC<SolutionsPageProps> = ({
  locale,
  onNavigateRegister,
  onRequestDemo
}) => {
  const isAr = locale === 'ar';

  const solutions = [
    {
      id: 'financial-leak-detection',
      badgeEn: 'FINANCIAL INTEGRITY',
      badgeAr: 'السلامة المالية',
      titleEn: 'Autonomous Financial Leak & Variance Prevention',
      titleAr: 'منظومة كشف الهدر والانحراف المالي المستمر',
      descEn: 'Stop silent margin erosion before quarterly closes. MIKHLAFI LABS continuously audits ledger postings, purchase vouchers, and billing disbursements against agreed contract rate cards.',
      descAr: 'أوقف تآكل الهوامش الصامت قبل الإقفالات الربعية. تقوم المنظومة بالتدقيق المستمر للقيود المحاسبية وسندات الشراء ومطابقتها مع بنود العقود المعتمدة.',
      metrics: [
        { labelEn: 'Average Leak Discovery', labelAr: 'متوسط اكتشاف الهدر', val: '2.4% - 4.8%' },
        { labelEn: 'Audit Latency', labelAr: 'زمن فحص القيود', val: '< 15 mins' },
        { labelEn: 'False Positive Ratio', labelAr: 'معدل الإنذارات الخاطئة', val: '< 0.05%' }
      ],
      pointsEn: [
        'Automated detection of duplicate disbursements and split requisitions',
        'Cross-vendor price divergence and unapproved rate escalations',
        'Early identification of unbilled completed milestones and revenue slippage'
      ],
      pointsAr: [
        'كشف آلي للمدفوعات المكررة وتجزئة طلبات الشراء للالتفاف على الصلاحيات',
        'رصد تباين أسعار الموردين للسلع المتطابقة وتجاوزات أسعار العقود',
        'اكتشاف مبكر للمعالم المنجزة غير المفوترة وتأخر تحصيل المستحقات'
      ]
    },
    {
      id: 'executive-decision-mesh',
      badgeEn: 'CAPITAL ALLOCATION',
      badgeAr: 'تخصيص رأس المال',
      titleEn: 'Executive Decision Mesh & Strategic Directives',
      titleAr: 'شبكة القرارات التنفيذية وتوجيه الموارد',
      descEn: 'Transform raw reports into prioritized, mathematically verified operational directives. Every recommended action includes quantifiable upside, downstream risk, and designated owners.',
      descAr: 'تحويل التقارير الجامدة إلى توجيهات تشغيلية مصنفة حسب الأولوية وموثقة حسابياً. كل توصية تتضمن الأثر المالي المتوقع والمخاطر المترتبة ومسؤول التنفيذ.',
      metrics: [
        { labelEn: 'Decision Velocity', labelAr: 'تسريع وتيرة القرار', val: '4.2x Faster' },
        { labelEn: 'Audit Trail Depth', labelAr: 'عمق الإسناد الحسابي', val: '100% Proven' },
        { labelEn: 'Cross-Entity Alignment', labelAr: 'توافق الفروع والشركات', val: 'Single Mesh' }
      ],
      pointsEn: [
        'Deterministic ranking of pending operational and capital trade-offs',
        'Immediate calculation of working capital impact and liquidity runway',
        'Cryptographic audit trail detailing exact rationale and decision lineage'
      ],
      pointsAr: [
        'ترتيب حتمي للمفاضلات التشغيلية والاستثمارية العالقة بحسب الجدوى',
        'حساب فوري للأثر على رأس المال العامل وفترة تغطية السيولة النقدية',
        'سجل تدقيق مشفر يوثق المبررات الحسابية ومسار اعتماد كل قرار'
      ]
    },
    {
      id: 'procurement-supply-risk',
      badgeEn: 'SUPPLY RESILIENCE',
      badgeAr: 'مرونة سلاسل الإمداد',
      titleEn: 'Supplier Reliability & Procurement Risk Radar',
      titleAr: 'رادار مخاطر التوريد وموثوقية سلاسل الإمداد',
      descEn: 'Protect continuous manufacturing and project lifecycles from supplier defaults, sudden material price shocks, and shipping disruptions.',
      descAr: 'حماية خطوط الإنتاج ودورات حياة المشاريع من تعثر الموردين، وتقلبات أسعار المواد المفاجئة، واختناقات الشحن واللوجستيات.',
      metrics: [
        { labelEn: 'Lead Time Prediction', labelAr: 'دقة توقع مواعيد الوصول', val: '94.8%' },
        { labelEn: 'Concentration Risk Index', labelAr: 'مؤشر تركز الموردين', val: 'Real-time' },
        { labelEn: 'Cost Variance Saved', labelAr: 'وفر تباين تكاليف الشراء', val: 'SAR Millions' }
      ],
      pointsEn: [
        'Single-source vendor dependency detection across all entities',
        'Lead-time slippage prediction based on historical customs and transit telemetry',
        'Fair market price benchmark engine for critical materials and equipment'
      ],
      pointsAr: [
        'كشف تركز الشراء والاعتمادية الخطرة على موردين أحاديين عبر الشركات التابعة',
        'تنبؤ مبكر بتأخر الشحنات استناداً إلى بيانات التخليص الجمركي والنقل السابقة',
        'محرك المقارنة المعيارية للأسعار العادلة للمواد الخام والمعدات الحيوية'
      ]
    },
    {
      id: 'project-margin-protection',
      badgeEn: 'PROJECT GOVERNANCE',
      badgeAr: 'حوكمة المشاريع',
      titleEn: 'Contract Margin Assurance & Project Telemetry',
      titleAr: 'حماية هوامش العقود والمشاريع الاستراتيجية',
      descEn: 'Eliminate project cost overruns caused by late change order approvals, untracked subcontractor claims, and uncoordinated equipment idle times.',
      descAr: 'القضاء على تجاوزات تكاليف المشاريع الناتجة عن تأخر أوامر التغيير، ومطالبات مقاولي الباطن غير الموثقة، وأوقات توقف المعدات.',
      metrics: [
        { labelEn: 'Margin Protection', labelAr: 'حماية الهامش الربحي', val: '+3.8% Avg' },
        { labelEn: 'Claim Settlement Speed', labelAr: 'سرعة تسوية المطالبات', val: '65% Faster' },
        { labelEn: 'Subcontractor Tracking', labelAr: 'متابعة مقاولي الباطن', val: 'Full Visibility' }
      ],
      pointsEn: [
        'Daily burn rate variance vs. contractual baseline milestones',
        'Subcontractor productivity scoring and back-charge verification',
        'Continuous predictive forecasting of project completion date and final margin'
      ],
      pointsAr: [
        'مقارنة يومية بين وتيرة استنزاف الميزانية والجدول الزمني المرجعي المعتمد',
        'تقييم كفاءة مقاولي الباطن والتحقق من صحة الخصومات والمستخلصات',
        'تنبؤ مستمر ومبكر بتاريخ الإنجاز الفعلي والهامش الربحي النهائي المتوقع'
      ]
    }
  ];

  return (
    <div className="public-page solutions-page">
      {/* Hero */}
      <section className="public-hero" style={{ padding: '6rem 0 4rem', background: 'radial-gradient(circle at 50% 0%, var(--accent-subtle) 0%, transparent 70%)' }}>
        <div className="site-container" style={{ textAlign: 'center', maxWidth: '960px', margin: '0 auto' }}>
          <div className="severity-tag optimal" style={{ display: 'inline-flex', marginBottom: '1.5rem', padding: '0.4rem 1rem' }}>
            {isAr ? 'حلول الأعمال المؤسسية' : 'ENTERPRISE SOLUTIONS'}
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.5rem' }}>
            {isAr ? (
              <>حلول تقنية لحماية الهوامش وتسريع القرارات</>
            ) : (
              <>High-Stakes Solutions for Complex Enterprises</>
            )}
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '780px', margin: '0 auto 2.5rem' }}>
            {isAr
              ? 'حلول متخصصة ومصممة بدقة للتعامل مع التحديات الأكثر كلفة في إدارة المؤسسات والشركات القابضة متعددة الفروع.'
              : 'Engineered solutions addressing the most expensive operational friction points in multi-entity conglomerates and holding groups.'}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onRequestDemo} className="btn-primary" style={{ padding: '0.8rem 1.8rem', fontSize: '1rem' }}>
              <span>{isAr ? 'طلب دراسة حالة مخصصة' : 'Request Case Study'}</span>
              <IconArrowRight size={16} />
            </button>
            <button onClick={onNavigateRegister} className="btn-secondary" style={{ padding: '0.8rem 1.8rem', fontSize: '1rem' }}>
              <span>{isAr ? 'بدء تجربة المنظومة' : 'Start Workspace'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Solutions Detail List */}
      <section className="site-section" style={{ padding: '4rem 0' }}>
        <div className="site-container" style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
          {solutions.map((sol, index) => (
            <div
              key={sol.id}
              className="kpi-card"
              style={{
                padding: '2.5rem',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <span className="severity-tag optimal" style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>
                  {isAr ? sol.badgeAr : sol.badgeEn}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                  0{index + 1} / 04
                </span>
              </div>

              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>
                {isAr ? sol.titleAr : sol.titleEn}
              </h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '900px' }}>
                {isAr ? sol.descAr : sol.descEn}
              </p>

              {/* KPI Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
                {sol.metrics.map((m, mIdx) => (
                  <div key={mIdx} style={{ padding: '1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '0.3rem' }}>
                      {isAr ? m.labelAr : m.labelEn}
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-light)' }}>
                      {m.val}
                    </div>
                  </div>
                ))}
              </div>

              {/* Feature Points */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  {isAr ? 'القدرات ومسار التنفيذ:' : 'Core Capabilities & Deliverables:'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.8rem' }}>
                  {(isAr ? sol.pointsAr : sol.pointsEn).map((pt, pIdx) => (
                    <div key={pIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                      <span style={{ color: 'var(--status-optimal)', marginTop: '2px' }}>
                        <IconCheckCircle size={16} />
                      </span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {pt}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="site-section" style={{ padding: '4rem 0', background: 'var(--bg-surface-elevated)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="site-container" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
            {isAr ? 'احمِ عمليات مؤسستك من الهدر غير المرئي' : 'Protect Your Enterprise Margins Today'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
            {isAr
              ? 'اطلب عرضاً توضيحياً حياً واستكشف كيف تكشف منصة مخلافي لابس الانحرافات الخفية في بيانات أعمالك.'
              : 'Schedule an executive presentation and discover how MIKHLAFI LABS uncovers hidden operational leaks.'}
          </p>
          <button onClick={onRequestDemo} className="btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
            <span>{isAr ? 'طلب عرض توضيحي مباشر' : 'Request Executive Demo'}</span>
            <IconArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
};
