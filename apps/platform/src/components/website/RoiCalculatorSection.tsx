// MIKHLAFI LABS — Enterprise Margin Leakage & ROI Simulator
// Interactive executive calculator proving immediate financial upside and payback timeline

import React, { useState, useMemo } from 'react';
import { LocaleMode } from '../../types';
import { IconArrowRight, IconShield, IconCheckCircle } from '../Icons';

interface RoiCalculatorSectionProps {
  locale: LocaleMode;
  onRequestAudit: (calculatedSavings?: string) => void;
}

export const RoiCalculatorSection: React.FC<RoiCalculatorSectionProps> = ({
  locale,
  onRequestAudit
}) => {
  const isAr = locale === 'ar';

  const [annualSpend, setAnnualSpend] = useState<number>(75); // in Millions SAR
  const [entitiesCount, setEntitiesCount] = useState<number>(4);
  const [industry, setIndustry] = useState<string>('contracting');

  // Multiplier matrix based on sector complexity
  const industryMultipliers: Record<string, { leakRate: number; nameAr: string; nameEn: string }> = {
    contracting: { leakRate: 0.038, nameAr: 'المقاولات والإنشاءات', nameEn: 'Contracting & Construction' },
    manufacturing: { leakRate: 0.032, nameAr: 'التصنيع وسلاسل الإمداد', nameEn: 'Manufacturing & Supply Chain' },
    retail: { leakRate: 0.027, nameAr: 'التجزئة والتوزيع بالجملة', nameEn: 'Retail & Wholesale Distribution' },
    healthcare: { leakRate: 0.034, nameAr: 'الرعاية الصحية والمستشفيات', nameEn: 'Healthcare Networks' },
    holding: { leakRate: 0.041, nameAr: 'المجموعات القابضة متعددة الأنشطة', nameEn: 'Multi-Entity Conglomerates' }
  };

  const calculation = useMemo(() => {
    const rate = industryMultipliers[industry]?.leakRate || 0.034;
    // Adjust slightly for number of entities (more branches = higher leak probability)
    const entityFriction = 1 + (entitiesCount - 1) * 0.04;
    const totalSpendSar = annualSpend * 1_000_000;
    const estimatedLeakSar = Math.round(totalSpendSar * rate * entityFriction);
    const recoveredSar = Math.round(estimatedLeakSar * 0.82); // 82% verified recovery rate
    const paybackDays = Math.max(12, Math.round(30 - (annualSpend / 20)));

    // Categorical breakdown
    const duplicatePmt = Math.round(recoveredSar * 0.34);
    const vendorRateDrift = Math.round(recoveredSar * 0.28);
    const projectMarginLeak = Math.round(recoveredSar * 0.25);
    const dataIntegrityLoss = Math.round(recoveredSar * 0.13);

    return {
      estimatedLeakSar,
      recoveredSar,
      paybackDays,
      duplicatePmt,
      vendorRateDrift,
      projectMarginLeak,
      dataIntegrityLoss
    };
  }, [annualSpend, entitiesCount, industry]);

  const formatSar = (val: number) => {
    return new Intl.NumberFormat(isAr ? 'ar-SA' : 'en-US', {
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <section className="site-section roi-calculator-section" id="roi-calculator" style={{ background: 'var(--bg-surface-elevated)', padding: '5.5rem 0', position: 'relative' }}>
      <div className="site-container">
        <div className="section-head">
          <span className="section-eyebrow" style={{ color: 'var(--status-success)' }}>
            {isAr ? 'حاسبة العائد الاستثماري الحتمي' : 'DETERMINISTIC ROI SIMULATOR'}
          </span>
          <h2 className="section-title">
            {isAr
              ? 'احسب حجم الهدر المالي غير المرئي في مؤسستك الآن'
              : 'Estimate silent margin leakage across your enterprise'}
          </h2>
          <p className="section-subtitle">
            {isAr
              ? 'استناداً إلى بيانات تدقيق مئات الآلاف من القيود المحاسبية، كم ريـالاً يمكنك استرداده قبل نهاية هذا الربع؟'
              : 'Grounded in verifiable audit benchmarks across Saudi & GCC conglomerates. See your projected capital recovery.'}
          </p>
        </div>

        <div
          style={{
            maxWidth: '1080px',
            margin: '0 auto',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-elevated)',
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1.1fr) minmax(340px, 1.2fr)',
            gap: 0
          }}
        >
          {/* Controls Column */}
          <div style={{ padding: '36px', borderInlineEnd: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '26px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {isAr ? 'إجمالي المشتريات والإنفاق التشغيلي السنوي:' : 'Annual Procurement & Operating Spend:'}
                </label>
                <span style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--accent-light)' }}>
                  {annualSpend} {isAr ? 'مليون ر.س' : 'M SAR'}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="5"
                value={annualSpend}
                onChange={(e) => setAnnualSpend(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-light)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                <span>10M SAR</span>
                <span>250M SAR</span>
                <span>500M+ SAR</span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {isAr ? 'عدد الفروع أو الشركات التابعة:' : 'Number of Operating Entities / Subsidiaries:'}
                </label>
                <span style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--accent-light)' }}>
                  {entitiesCount} {isAr ? (entitiesCount > 2 ? 'شركات' : 'شركتين') : 'Entities'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="1"
                value={entitiesCount}
                onChange={(e) => setEntitiesCount(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-light)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                <span>{isAr ? 'كيان منفرد' : '1 Entity'}</span>
                <span>8</span>
                <span>15+ {isAr ? 'فرع' : 'Branches'}</span>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                {isAr ? 'القطاع التشغيلي الرئيسي:' : 'Primary Industry Sector:'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                {Object.entries(industryMultipliers).map(([key, ind]) => (
                  <button
                    key={key}
                    onClick={() => setIndustry(key)}
                    style={{
                      textAlign: 'start',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: industry === key ? '1px solid var(--accent-light)' : '1px solid var(--border-subtle)',
                      background: industry === key ? 'var(--accent-subtle)' : 'var(--bg-surface-elevated)',
                      color: industry === key ? 'var(--accent-light)' : 'var(--text-secondary)',
                      fontSize: '13px',
                      fontWeight: industry === key ? 800 : 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{isAr ? ind.nameAr : ind.nameEn}</span>
                    {industry === key && <IconCheckCircle size={15} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div
            style={{
              padding: '36px',
              background: 'radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 80%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '24px'
            }}
          >
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--status-success)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {isAr ? 'الوفر والاسترداد الصافي المتوقع' : 'PROJECTED RECOVERABLE CASH'}
              </span>

              <div style={{ fontSize: 'clamp(2.4rem, 4vw, 3.4rem)', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--status-success)', margin: '8px 0 4px', lineHeight: 1 }}>
                {formatSar(calculation.recoveredSar)} <span style={{ fontSize: '1.4rem' }}>{isAr ? 'ر.س' : 'SAR'}</span>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {isAr
                  ? `بناءً على تتبع متوسط هدر سنوي يقارب ${formatSar(calculation.estimatedLeakSar)} ريال في قطاع ${industryMultipliers[industry].nameAr}.`
                  : `From approximately ${formatSar(calculation.estimatedLeakSar)} SAR in silent annual leakage.`}
              </div>
            </div>

            {/* Breakdown Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{isAr ? 'المدفوعات المكررة' : 'Duplicate Vouchers'}</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  {formatSar(calculation.duplicatePmt)} ر.س
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{isAr ? 'تباين أسعار الموردين' : 'Vendor Rate Drift'}</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  {formatSar(calculation.vendorRateDrift)} ر.س
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{isAr ? 'انحراف هوامش المشاريع' : 'Project Margin Leaks'}</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  {formatSar(calculation.projectMarginLeak)} ر.س
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{isAr ? 'فترة استرداد التكلفة' : 'Payback Timeline'}</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-light)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  {calculation.paybackDays} {isAr ? 'يوماً' : 'Days'}
                </div>
              </div>
            </div>

            {/* Action CTA Box */}
            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-primary)', fontWeight: 700 }}>
                <IconShield size={16} color="var(--status-success)" />
                <span>{isAr ? 'فحص عينة تجريبية مشفرة مجاناً بلا التزام' : 'Free Non-Invasive Pilot On Your Ledger'}</span>
              </div>
              <button
                onClick={() => onRequestAudit(formatSar(calculation.recoveredSar))}
                className="btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 700, justifyContent: 'center' }}
              >
                <span>{isAr ? 'تأكيد الحسبة على بياناتك الفعلية' : 'Validate These Numbers On Your Ledger'}</span>
                <IconArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
