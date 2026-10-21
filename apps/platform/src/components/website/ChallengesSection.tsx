// MIKHLAFI LABS — Public Website: Operational Blind Spots
// Industry-neutral view of where enterprises lose operational signal, followed
// by a structural comparison of deterministic analysis against retrospective
// reporting. Contains no invented figures and no fabricated performance claims.

import React, { useState } from 'react';
import { LocaleMode } from '../../types';
import {
  IconAlertTriangle,
  IconTrendingUp,
  IconFileText,
  IconProjects,
  IconSupplier,
  IconLayers,
  IconCheckCircle,
  IconX
} from '../Icons';

interface ChallengesSectionProps {
  locale: LocaleMode;
}

export const ChallengesSection: React.FC<ChallengesSectionProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const [activeView, setActiveView] = useState<'signals' | 'comparison'>('signals');

  const signals = [
    {
      num: '01',
      icon: <IconFileText size={20} />,
      titleAr: 'الانحراف على مستوى الحركة الواحدة',
      titleEn: 'Variance at the record level',
      descAr: 'قيود وفواتير متشابهة، وأسعار غير مطابقة لأوامر الشراء الأصلية، وفروق تُبتلع داخل الإجماليات الشهرية بدل أن تُرصد عند حدوثها.',
      descEn: 'Similar entries, invoices off original purchase orders, and variances absorbed into monthly totals instead of surfaced as they occur.'
    },
    {
      num: '02',
      icon: <IconTrendingUp size={20} />,
      titleAr: 'دوران العملاء والعقود',
      titleEn: 'Customer and contract erosion',
      descAr: 'تباطؤ متدرّج في إعادة الشراء، وتآكل مبالغ العقود الكبرى، وإشارات فقدان لا يلتقطها تقرير مبيعات نمطي.',
      descEn: 'Gradual slowdown in repeat business, erosion of large contract value, and churn signals a standard sales report does not isolate.'
    },
    {
      num: '03',
      icon: <IconProjects size={20} />,
      titleAr: 'هوامش المشاريع وأوامر التغيير',
      titleEn: 'Project margin and change orders',
      descAr: 'أعمال منفّذة دون اعتماد موثّق، وتجاوز بنود الموازنة، ومستخلصات معلّقة تشدّ السيولة بعيداً عن الأرباح المعلنة.',
      descEn: 'Work executed without documented approval, budget lines exceeded, and pending claims that pull cash away from reported profit.'
    },
    {
      num: '04',
      icon: <IconSupplier size={20} />,
      titleAr: 'أداء الموردين وسلاسل الإمداد',
      titleEn: 'Supplier and supply-chain performance',
      descAr: 'تأخر توريد، ونسب إرجاع مرتفعة، وانحراف في الجودة يتراكم بصمت حتى يتعطّل خط إنتاج أو موقع عمل.',
      descEn: 'Delivery slippage, elevated return rates, and quality drift that accumulate quietly until a production line or site is disrupted.'
    },
    {
      num: '05',
      icon: <IconAlertTriangle size={20} />,
      titleAr: 'الانحراف بين الأنظمة والفروع',
      titleEn: 'Cross-system and cross-branch drift',
      descAr: 'تباعد بين بيانات ERP والأنظمة الفرعية، وتعارض مسميات الجهات والعملات، وتضارب في الأرقام بين الفروع.',
      descEn: 'Gaps between ERP and subsidiary systems, mismatched entity and currency naming, and conflicting figures across branches.'
    },
    {
      num: '06',
      icon: <IconLayers size={20} />,
      titleAr: 'جودة البيانات ومسارات التدقيق',
      titleEn: 'Data quality and audit trails',
      descAr: 'حقول ناقصة، وسجلات موزّعة بين الجداول، وفجوات في مسار التدقيق تُصعّب المراجعة الخارجية والامتثال.',
      descEn: 'Missing fields, records scattered across spreadsheets, and audit-trail gaps that complicate external review and compliance.'
    }
  ];

  const comparisonRows = [
    {
      dimensionAr: 'توقيت المعالجة',
      dimensionEn: 'Processing trigger',
      legacyAr: 'مراجعة دورية بعد إقفال الفترة وبعد خروج المبلغ',
      legacyEn: 'Periodic review after period close and after cash has left',
      oursAr: 'فحص مستمر على مستوى الحركة قبل اعتماد الصرف',
      oursEn: 'Continuous record-level checks before settlement is approved'
    },
    {
      dimensionAr: 'مخرج التحليل',
      dimensionEn: 'Analysis output',
      legacyAr: 'مؤشرات مجمّعة تنتظر أسبوعاً من الفرز اليدوي',
      legacyEn: 'Aggregated metrics waiting on a week of manual triage',
      oursAr: 'أولوية تنفيذية مسندة بمالك مسؤول لكل إجراء',
      oursEn: 'An executive priority queue with an accountable owner per action'
    },
    {
      dimensionAr: 'أساس الاستنتاج',
      dimensionEn: 'Basis of conclusion',
      legacyAr: 'تقديرات احتمالية وتنبؤات غير قابلة للتتبع',
      legacyEn: 'Probabilistic estimates and forecasts that cannot be traced',
      oursAr: 'قواعد حسابية قطعية مرتبطة بسجلها المصدر',
      oursEn: 'Deterministic arithmetic rules linked to their source record'
    },
    {
      dimensionAr: 'طريقة التطبيق',
      dimensionEn: 'Deployment approach',
      legacyAr: 'توسّع في الاستبدال وإعادة هندسة الأنظمة',
      legacyEn: 'System replacement and re-engineering programmes',
      oursAr: 'طبقة قراءة غير تطفلية فوق الأنظمة القائمة',
      oursEn: 'A non-invasive read layer above the systems already in place'
    },
    {
      dimensionAr: 'المسؤولية والأثر',
      dimensionEn: 'Ownership and impact',
      legacyAr: 'نتائج بدون مالك أو متابعة تنفيذ',
      legacyEn: 'Findings with no owner and no execution follow-through',
      oursAr: 'تتبّع الأثر المتحقق لكل قرار حتى الإغلاق مع سجل تدقيق كامل',
      oursEn: 'Verified impact tracked per decision to closure with a full audit trail'
    }
  ];

  return (
    <section className="site-section site-section--alt" id="challenges">
      <div className="ml-container">
        <div className="site-section__head">
          <span className="ml-eyebrow">{isAr ? 'أين يضيع التشغيل' : 'WHERE OPERATIONS DRIFT'}</span>
          <h2 className="ml-heading site-section__title">
            {isAr
              ? 'البيانات موجودة. الإشارة هي ما يغيب.'
              : 'The data is already there. The signal is what is missing.'}
          </h2>
          <p className="ml-lead site-section__lead">
            {isAr
              ? 'أنظمة ERP تُسجّل ما حدث، لكنها لا تُخرج قراراً. نكشف الانحراف بين الأرقام والعمليات الفعلية، ونحوّله إلى أولويات تنفيذية موثّقة بمالك مسؤول — في المقاولات والصناعة واللوجستيات والتجزئة والخدمات والمجموعات القابضة.'
              : 'ERPs record what happened, but they do not produce a decision. We surface the drift between recorded figures and actual operations and turn it into a prioritized, owner-assigned queue — across contracting, manufacturing, logistics, retail, services, and holding groups.'}
          </p>

          <div
            className="ml-segmented"
            role="tablist"
            aria-label={isAr ? 'عرض القسم' : 'Section view'}
            style={{ marginTop: 28, flexWrap: 'wrap' }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'signals'}
              onClick={() => setActiveView('signals')}
              className={`ml-segmented__item ${activeView === 'signals' ? 'is-active' : ''}`}
            >
              {isAr ? 'مواضع الانحراف' : 'Blind spots'}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'comparison'}
              onClick={() => setActiveView('comparison')}
              className={`ml-segmented__item ${activeView === 'comparison' ? 'is-active' : ''}`}
            >
              {isAr ? 'المقارنة المنهجية' : 'Methodology comparison'}
            </button>
          </div>
        </div>

        {activeView === 'signals' && (
          <div className="site-grid site-grid--3">
            {signals.map((item) => (
              <article key={item.num} className="site-tile" style={{ cursor: 'default' }}>
                <span className="site-tile__index">{item.num}</span>
                <span className="site-tile__icon">{item.icon}</span>
                <h3 className="site-tile__title">{isAr ? item.titleAr : item.titleEn}</h3>
                <p className="site-tile__desc">{isAr ? item.descAr : item.descEn}</p>
              </article>
            ))}
          </div>
        )}

        {activeView === 'comparison' && (
          <div className="home-compare">
            <div className="home-compare__row home-compare__row--head">
              <div className="home-compare__cell">{isAr ? 'المعيار' : 'Dimension'}</div>
              <div className="home-compare__cell">
                {isAr ? 'التقارير الرجعية التقليدية' : 'Conventional retrospective reporting'}
              </div>
              <div className="home-compare__cell home-compare__cell--accent">
                {isAr ? 'طبقة الذكاء الحتمي من MIKHLAFI LABS' : 'MIKHLAFI LABS deterministic layer'}
              </div>
            </div>
            {comparisonRows.map((row, i) => (
              <div className="home-compare__row" key={i}>
                <div className="home-compare__cell home-compare__cell--dim">
                  {isAr ? row.dimensionAr : row.dimensionEn}
                </div>
                <div className="home-compare__cell">
                  <span className="home-compare__point">
                    <IconX size={14} />
                    <span>
                      <span className="home-compare__mobile-label">
                        {isAr ? 'التقارير التقليدية' : 'Conventional'}
                      </span>
                      {isAr ? row.legacyAr : row.legacyEn}
                    </span>
                  </span>
                </div>
                <div className="home-compare__cell">
                  <span className="home-compare__point home-compare__point--accent">
                    <IconCheckCircle size={15} />
                    <span>
                      <span className="home-compare__mobile-label">
                        {isAr ? 'MIKHLAFI LABS' : 'MIKHLAFI LABS'}
                      </span>
                      {isAr ? row.oursAr : row.oursEn}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
