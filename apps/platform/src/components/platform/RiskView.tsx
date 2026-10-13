import React, { useState, useEffect } from 'react';
import { LocaleMode } from '../../types';
import { MOCK_RISKS } from '../../data/mockData';
import { IconRisk, IconShield, IconCheck } from '../Icons';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface RiskViewProps {
  locale: LocaleMode;
}

export const RiskView: React.FC<RiskViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated } = useAuth();
  const [risks, setRisks] = useState<any[]>(MOCK_RISKS);
  const [totalExposureSAR, setTotalExposureSAR] = useState<number>(1710000);
  const [selectedRiskCategory, setSelectedRiskCategory] = useState<string>('all');
  const [simulatedMitigations, setSimulatedMitigations] = useState<{ [key: string]: boolean }>({});
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const fetchRisks = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.getRisks();
      if (res.risks && res.risks.length > 0) {
        setRisks(res.risks);
        setTotalExposureSAR(res.totalMonitoredExposureSAR);
        const map: { [key: string]: boolean } = {};
        res.risks.forEach((r: any) => {
          map[r.id] = !!r.is_mitigated;
        });
        setSimulatedMitigations(map);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchRisks();
  }, [isAuthenticated]);

  const toggleMitigation = async (riskId: string) => {
    if (isAuthenticated) {
      try {
        const res = await api.toggleRiskMitigation(riskId);
        const nextMitigated = res.risk?.is_mitigated;
        setSimulatedMitigations((prev) => ({ ...prev, [riskId]: nextMitigated }));
        const risk = risks.find((r) => r.id === riskId);
        const code = risk?.code || res.risk?.code;
        const msg = nextMitigated
          ? (isAr ? `تم تفعيل خطة التحوط للمخاطر (${code}) وتحديث السجلات في PostgreSQL.` : `Mitigation plan activated for ${code} & recorded in PostgreSQL.`)
          : (isAr ? `تمت إعادة مؤشر المخاطر (${code}) للوضع النشط.` : `Risk indicator ${code} reset to active baseline.`);
        setBannerNotice(msg);
        setTimeout(() => setBannerNotice(null), 3500);
        await fetchRisks();
        return;
      } catch (err: any) {
        setBannerNotice(err.message || 'Error updating risk');
        setTimeout(() => setBannerNotice(null), 3500);
      }
    }

    // Demo fallback for unauthenticated
    setSimulatedMitigations((prev) => {
      const updated = { ...prev, [riskId]: !prev[riskId] };
      const risk = risks.find((r) => r.id === riskId);
      const isNowMitigated = updated[riskId];
      const msg = isNowMitigated
        ? (isAr ? `(عرض تجريبي) تمت محاكاة تفعيل خطة التحوط للمخاطر (${risk?.code}).` : `(Demo) Mitigation plan simulated for ${risk?.code}.`)
        : (isAr ? `(عرض تجريبي) تمت إعادة مؤشر المخاطر (${risk?.code}) للوضع النشط.` : `(Demo) Risk indicator ${risk?.code} reset.`);
      setBannerNotice(msg);
      setTimeout(() => setBannerNotice(null), 3500);
      return updated;
    });
  };

  const filteredRisks = risks.filter((r) => {
    if (selectedRiskCategory === 'all') return true;
    const cat = (r.category_en || r.categoryEn || '').toLowerCase();
    return cat.includes(selectedRiskCategory);
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
          <span className="value">{totalExposureSAR.toLocaleString()} SAR</span>
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
            {isAr ? `كافة القطاعات (${risks.length})` : `All Domains (${risks.length})`}
          </button>
          <button
            onClick={() => setSelectedRiskCategory('supply')}
            className={`filter-chip ${selectedRiskCategory === 'supply' ? 'active' : ''}`}
          >
            {isAr ? 'سلاسل الإمداد' : 'Supply Chain'}
          </button>
          <button
            onClick={() => setSelectedRiskCategory('liquid')}
            className={`filter-chip ${selectedRiskCategory === 'liquid' ? 'active' : ''}`}
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
          const severity = risk.severity || 'high';
          const code = risk.code;
          const title = isAr ? (risk.title_ar || risk.titleAr) : (risk.title_en || risk.titleEn);
          const category = isAr ? (risk.category_ar || risk.categoryAr) : (risk.category_en || risk.categoryEn);
          const exposure = risk.exposure_formatted || (risk.financial_exposure_sar ? `${parseFloat(risk.financial_exposure_sar).toLocaleString()} SAR` : risk.impactSAR);
          const mitigationPlan = isAr ? (risk.mitigation_plan_ar || risk.mitigationPlanAr) : (risk.mitigation_plan_en || risk.mitigationPlanEn);

          return (
            <div key={risk.id} className={`decision-card ${isMitigated ? 'mitigated' : `priority-${severity}`}`}>
              <div className="decision-card-header">
                <div className="badge-row">
                  <span className={`severity-tag ${isMitigated ? 'optimal' : severity}`}>
                    {isMitigated ? (isAr ? 'تم التحوط' : 'MITIGATED') : severity.toUpperCase()}
                  </span>
                  <span className="decision-code">{code}</span>
                  <span className="category-pill">{category}</span>
                </div>
                <div className="decision-financial">
                  <span className="label">{isAr ? 'التعرض المالي المحسوب' : 'Exposure Estimate'}</span>
                  <span className="amount" style={{ textDecoration: isMitigated ? 'line-through' : 'none' }}>
                    {exposure}
                  </span>
                </div>
              </div>

              <h3 className="decision-title">
                {title}
              </h3>

              <div className="risk-metric-strip">
                <div className="risk-metric-box">
                  <span className="k">{isAr ? 'الاحتمالية المحسوبة' : 'Calculated Probability'}</span>
                  <span className="v">{(risk.probability || 'MEDIUM').toUpperCase()}</span>
                </div>
                <div className="risk-metric-box">
                  <span className="k">{isAr ? 'مستوى الخطورة' : 'Severity Level'}</span>
                  <span className="v">{severity.toUpperCase()}</span>
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
                  {mitigationPlan}
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
                      ? (isAr ? 'إلغاء التحوط وإعادة التعرض المالي' : 'Reset Baseline Exposure')
                      : (isAr ? 'تفعيل خطة التحوط المؤسسية' : 'Activate Mitigation Plan')}
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
