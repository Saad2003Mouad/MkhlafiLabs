import React, { useState, useEffect } from 'react';
import { LocaleMode } from '../../types';
import { IconRisk, IconShield, IconCheck } from '../Icons';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface RiskViewProps {
  locale: LocaleMode;
}

export const RiskView: React.FC<RiskViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated } = useAuth();
  const [risks, setRisks] = useState<any[]>([]);
  const [totalExposureSAR, setTotalExposureSAR] = useState<number>(0);
  const [selectedRiskCategory, setSelectedRiskCategory] = useState<string>('all');
  const [simulatedMitigations, setSimulatedMitigations] = useState<{ [key: string]: boolean }>({});
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoDataset, setIsDemoDataset] = useState<boolean>(false);

  const fetchRisks = async () => {
    setLoading(true);
    if (!isAuthenticated) {
      setRisks([]);
      setTotalExposureSAR(0);
      setIsDemoDataset(false);
      setLoading(false);
      return;
    }
    try {
      const res = await api.getRisks();
      if (res && Array.isArray(res.risks)) {
        setRisks(res.risks);
        setTotalExposureSAR(res.totalMonitoredExposureSAR || 0);
        setIsDemoDataset(false);
        const map: { [key: string]: boolean } = {};
        res.risks.forEach((r: any) => {
          map[r.id] = !!r.is_mitigated;
        });
        setSimulatedMitigations(map);
      } else {
        setRisks([]);
        setTotalExposureSAR(0);
        setIsDemoDataset(false);
      }
    } catch (err: any) {
      setRisks([]);
      setTotalExposureSAR(0);
      setIsDemoDataset(false);
      setBannerNotice(err.message || (isAr ? 'فشل تحميل بيانات المخاطر' : 'Failed to fetch risk records'));
    } finally {
      setLoading(false);
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
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {isDemoDataset && (
            <span className="severity-tag warning" style={{ fontSize: '11px', padding: '6px 12px' }}>
              {isAr ? 'نموذج بيانات توضيحي' : 'Demonstration Dataset'}
            </span>
          )}
          <div className="kpi-micro-badge warning">
            <span className="label">{isAr ? 'إجمالي التعرض المالي المرصود' : 'Aggregate Monitored Exposure'}</span>
            <span className="value">{totalExposureSAR.toLocaleString()} SAR</span>
          </div>
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

      {/* Empty State */}
      {!loading && filteredRisks.length === 0 && (
        <div className="decision-card" style={{ textAlign: 'center', padding: '40px 20px', marginTop: '20px' }}>
          <IconRisk size={36} style={{ color: 'var(--text-secondary)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {isAr ? 'لا توجد مخاطر مسجلة حالياً' : 'No Monitored Risks Found'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
            {isAr
              ? 'لم يتم رصد أي مخاطر نشطة في سلاسل الإمداد أو السيولة لمساحة العمل الحالية.'
              : 'Zero active risks detected for the current workspace.'}
          </p>
        </div>
      )}

      {/* Risk Cards */}
      <div className="decisions-grid">
        {filteredRisks.length === 0 ? (
          <div
            className="content-panel"
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '48px 20px',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🛡️</span>
            <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '6px' }}>
              {isAr ? 'لا توجد مخاطر تشغيلية مسجلة حالياً' : 'Zero Operational Risks Flagged'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
              {isAr
                ? 'كافة المؤشرات التشغيلية وسلاسل الإمداد ومسارات التوريد ضمن الحدود المرجعية الآمنة.'
                : 'All operational parameters and supply chain routes are operating within safe baselines.'}
            </p>
          </div>
        ) : (
          filteredRisks.map((risk) => {
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
        })
      )}
      </div>
    </div>
  );
};
