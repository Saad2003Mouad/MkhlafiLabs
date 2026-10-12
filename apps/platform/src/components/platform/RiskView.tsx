import React, { useState } from 'react';
import { LocaleMode, RiskItem } from '../../types';
import { MOCK_RISKS } from '../../data/mockData';
import { IconRisk, IconShield, IconCheck } from '../Icons';

interface RiskViewProps {
  locale: LocaleMode;
}

export const RiskView: React.FC<RiskViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const [risks] = useState<RiskItem[]>(MOCK_RISKS);
  const [selectedRiskCategory, setSelectedRiskCategory] = useState<string>('all');
  const [simulatedMitigations, setSimulatedMitigations] = useState<{ [key: string]: boolean }>({});
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const toggleMitigation = (riskId: string) => {
    setSimulatedMitigations((prev) => {
      const updated = { ...prev, [riskId]: !prev[riskId] };
      const risk = risks.find((r) => r.id === riskId);
      const isNowMitigated = updated[riskId];
      const msg = isNowMitigated
        ? (isAr ? `تمت محاكاة تفعيل خطة التحوط للمخاطر (${risk?.code}). تم خفض التعرض المالي التقديري.` : `Mitigation plan simulated for ${risk?.code}. Exposure reduced.`)
        : (isAr ? `تمت إعادة مؤشر المخاطر (${risk?.code}) للوضع النشط.` : `Risk indicator ${risk?.code} reset to active baseline.`);
      setBannerNotice(msg);
      setTimeout(() => setBannerNotice(null), 3500);
      return updated;
    });
  };

  const filteredRisks = risks.filter((r) => {
    if (selectedRiskCategory === 'all') return true;
    return r.categoryEn.toLowerCase().includes(selectedRiskCategory);
  });

  return (
    <div className="platform-page-container">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <div className="page-breadcrumb">
            <span>{isAr ? 'المنصة' : 'Platform'}</span>
            <span>/</span>
            <span>{isAr ? 'محركات الذكاء' : 'Intelligence Suite'}</span>
            <span>/</span>
            <span className="current">{isAr ? 'التنبؤ بالمخاطر والإنذار المبكر' : 'Predictive Risk Intelligence'}</span>
          </div>
          <h1 className="page-title">
            <IconRisk size={24} />
            <span>{isAr ? 'محرك التنبؤ بالمخاطر والإنذار المبكر' : 'Predictive Risk Intelligence Engine'}</span>
          </h1>
          <p className="page-subtitle">
            {isAr
              ? 'مراقبة نقاط الاختناق في سلاسل التوريد والسيولة النقدية وتآكل العقود قبل تفاقمها إلى أزمات تشغيلية، مع خطط تحوط قابلة للقياس.'
              : 'Continuous monitoring of supply bottlenecks, cash flow stress, and contract attrition before operational crises manifest.'}
          </p>
        </div>

        {/* Aggregate Exposure Pill */}
        <div className="kpi-micro-badge warning">
          <span className="label">{isAr ? 'إجمالي التعرض المالي المرصود' : 'Aggregate Monitored Exposure'}</span>
          <span className="value">1,710,000 SAR</span>
        </div>
      </div>

      {bannerNotice && (
        <div className="alert-feedback-banner success">
          <IconCheck size={16} />
          <span>{bannerNotice}</span>
        </div>
      )}

      {/* Category Pills & Matrix Summary */}
      <div className="page-filter-bar">
        <div className="filter-group">
          <span className="filter-label">{isAr ? 'تصنيف المخاطر:' : 'Risk Category:'}</span>
          <button
            onClick={() => setSelectedRiskCategory('all')}
            className={`filter-chip ${selectedRiskCategory === 'all' ? 'active' : ''}`}
          >
            {isAr ? 'كافة القطاعات (3)' : 'All Domains (3)'}
          </button>
          <button
            onClick={() => setSelectedRiskCategory('supply')}
            className={`filter-chip ${selectedRiskCategory === 'supply' ? 'active' : ''}`}
          >
            {isAr ? 'سلاسل الإمداد' : 'Supply Chain'}
          </button>
          <button
            onClick={() => setSelectedRiskCategory('liquidity')}
            className={`filter-chip ${selectedRiskCategory === 'liquidity' ? 'active' : ''}`}
          >
            {isAr ? 'السيولة والتدفقات' : 'Liquidity & Cash'}
          </button>
          <button
            onClick={() => setSelectedRiskCategory('customer')}
            className={`filter-chip ${selectedRiskCategory === 'customer' ? 'active' : ''}`}
          >
            {isAr ? 'إيرادات العملاء' : 'Customer Retention'}
          </button>
        </div>

        <div className="meta-stats">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-warning)' }} />
            {isAr ? 'مصفوفة الاحتمالية: نشطة' : 'Predictive Matrix: Active'}
          </span>
        </div>
      </div>

      {/* Risk Cards */}
      <div className="decisions-grid">
        {filteredRisks.map((risk) => {
          const isMitigated = simulatedMitigations[risk.id];
          return (
            <div key={risk.id} className={`decision-card ${isMitigated ? 'mitigated' : `priority-${risk.severity}`}`}>
              <div className="decision-card-header">
                <div className="badge-row">
                  <span className={`severity-tag ${isMitigated ? 'optimal' : risk.severity}`}>
                    {isMitigated ? (isAr ? 'تم التحوط' : 'MITIGATED') : risk.severity.toUpperCase()}
                  </span>
                  <span className="decision-code">{risk.code}</span>
                  <span className="category-pill">{isAr ? risk.categoryAr : risk.categoryEn}</span>
                </div>
                <div className="decision-financial">
                  <span className="label">{isAr ? 'التعرض المالي المحسوب' : 'Exposure Estimate'}</span>
                  <span className="amount" style={{ textDecoration: isMitigated ? 'line-through' : 'none' }}>
                    {risk.impactSAR}
                  </span>
                </div>
              </div>

              <h3 className="decision-title">
                {isAr ? risk.titleAr : risk.titleEn}
              </h3>

              <div className="risk-metric-strip">
                <div className="risk-metric-box">
                  <span className="k">{isAr ? 'الاحتمالية المحسوبة' : 'Calculated Probability'}</span>
                  <span className="v">{risk.probability.toUpperCase()}</span>
                </div>
                <div className="risk-metric-box">
                  <span className="k">{isAr ? 'مستوى الخطورة' : 'Severity Level'}</span>
                  <span className="v">{risk.severity.toUpperCase()}</span>
                </div>
                <div className="risk-metric-box">
                  <span className="k">{isAr ? 'طريقة الرصد' : 'Detection Signal'}</span>
                  <span className="v">{isAr ? 'حسابي حتمي' : 'Deterministic'}</span>
                </div>
              </div>

              <div className="mitigation-box">
                <div className="mitigation-header">
                  <IconShield size={14} />
                  <span style={{ fontWeight: 700, fontSize: '11px', color: 'var(--text-primary)' }}>
                    {isAr ? 'خطة التحوط وخفض المخاطر المعتمدة:' : 'Approved Risk Mitigation Protocol:'}
                  </span>
                </div>
                <p className="mitigation-text">
                  {isAr ? risk.mitigationPlanAr : risk.mitigationPlanEn}
                </p>
              </div>

              <div className="decision-actions-row">
                <button
                  onClick={() => toggleMitigation(risk.id)}
                  className={isMitigated ? 'btn-secondary' : 'btn-primary'}
                  style={{ fontSize: '12px', padding: '8px 14px' }}
                >
                  <IconShield size={14} />
                  <span>
                    {isMitigated
                      ? (isAr ? 'إلغاء المحاكاة والعودة للأساس' : 'Reset Baseline Exposure')
                      : (isAr ? 'محاكاة تفعيل خطة التحوط' : 'Simulate Mitigation Action')}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
