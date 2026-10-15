import React, { useState, useEffect } from 'react';
import { LocaleMode } from '../../types';
import { IconCustomer, IconCheck, IconClock } from '../Icons';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface CustomersViewProps {
  locale: LocaleMode;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [totalRevenueAtRiskSAR, setTotalRevenueAtRiskSAR] = useState<number>(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [scheduledReviews, setScheduledReviews] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoDataset, setIsDemoDataset] = useState<boolean>(false);

  const fetchCustomers = async () => {
    setLoading(true);
    if (!isAuthenticated) {
      setCustomers([]);
      setTotalRevenueAtRiskSAR(0);
      setIsDemoDataset(false);
      setLoading(false);
      return;
    }
    try {
      const res = await api.getCustomers();
      if (res && Array.isArray(res.customers)) {
        setCustomers(res.customers);
        setTotalRevenueAtRiskSAR(res.totalRevenueAtRiskSAR || 0);
        setIsDemoDataset(false);
        const map: { [key: string]: boolean } = {};
        res.customers.forEach((c: any) => {
          map[c.id] = !!c.review_scheduled;
        });
        setScheduledReviews(map);
      } else {
        setCustomers([]);
        setTotalRevenueAtRiskSAR(0);
        setIsDemoDataset(false);
      }
    } catch (err: any) {
      setCustomers([]);
      setTotalRevenueAtRiskSAR(0);
      setIsDemoDataset(false);
      setNotice(err.message || (isAr ? 'فشل تحميل بيانات العملاء' : 'Failed to fetch customer records'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [isAuthenticated]);

  const handleReviewAccount = async (customerId: string, name: string) => {
    if (isAuthenticated) {
      try {
        await api.reviewCustomer(customerId);
        setScheduledReviews((prev) => ({ ...prev, [customerId]: true }));
        const msg = isAr
          ? `تمت جدولة مراجعة تنفيذية لحساب (${name}) وتوثيق القرار في PostgreSQL.`
          : `Executive review scheduled for (${name}) & saved in PostgreSQL.`;
        setNotice(msg);
        setTimeout(() => setNotice(null), 4000);
        await fetchCustomers();
        return;
      } catch (err: any) {
        setNotice(err.message || 'Error scheduling review');
        setTimeout(() => setNotice(null), 4000);
      }
    }

    // Demo fallback
    setScheduledReviews((prev) => ({ ...prev, [customerId]: true }));
    setNotice(isAr ? `(عرض تجريبي) تمت جدولة مراجعة تنفيذية لحساب (${name}).` : `(Demo) Review scheduled for (${name}).`);
    setTimeout(() => setNotice(null), 4000);
  };

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
            <span className="current">{isAr ? 'ذكاء ومراقبة العملاء' : 'Customer Intelligence'}</span>
          </div>
          <h1 className="page-title">
            <IconCustomer size={24} />
            <span>{isAr ? 'محرك ذكاء العملاء ورادار مخاطر فقدان العقود (Churn Radar)' : 'Customer Intelligence & Churn Radar'}</span>
          </h1>
          <p className="page-subtitle">
            {isAr
              ? 'رصد تراجع وتيرة التعاملات وتأخر التجديدات ومؤشرات فقدان كبار العملاء بدقة استباقية قائمة على السجلات المالية وتواريخ العقود.'
              : 'Detecting subtle transaction volume contractions, contract renewal hazards, and revenue at risk before cancellations occur.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {isDemoDataset && (
            <span className="severity-tag warning" style={{ fontSize: '11px', padding: '6px 12px' }}>
              {isAr ? 'نموذج بيانات توضيحي' : 'Demonstration Dataset'}
            </span>
          )}
          <div className="kpi-micro-badge warning">
            <span className="label">{isAr ? 'إجمالي الإيرادات المعرضة للمخاطر' : 'Revenue at Risk'}</span>
            <span className="value">{(totalRevenueAtRiskSAR / 1e6).toFixed(2)}M SAR</span>
          </div>
        </div>
      </div>

      {notice && (
        <div className="alert-feedback-banner success">
          <IconCheck size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && customers.length === 0 && (
        <div className="decision-card" style={{ textAlign: 'center', padding: '40px 20px', marginTop: '20px' }}>
          <IconCustomer size={36} style={{ color: 'var(--text-secondary)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {isAr ? 'لا يوجد عملاء قيد المتابعة حالياً' : 'No Monitored Customers Found'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
            {isAr
              ? 'لم يتم تسجيل أي حسابات عملاء أو مؤشرات إيرادات معرضة للخطر لمساحة العمل الحالية.'
              : 'Zero active customer accounts or churn signals found for the current workspace.'}
          </p>
        </div>
      )}

      {/* Customer Radar Cards */}
      <div className="decisions-grid">
        {customers.map((c) => {
          const isReviewed = scheduledReviews[c.id] || c.review_scheduled;
          const churnProb = c.churn_probability ?? c.churnProbability ?? 0.5;
          const isHighRisk = churnProb > 0.5;
          const name = isAr ? (c.account_name_ar || c.accountNameAr) : (c.account_name_en || c.accountNameEn);
          const trend = c.volume_trend || c.volumeTrend || '-0%';
          const renewal = c.renewal_date || c.renewalDate || '2026-12-31';
          const revenueAtRisk = c.revenueAtRisk || (c.revenue_at_risk_sar ? `${parseFloat(c.revenue_at_risk_sar).toLocaleString()} SAR` : '0 SAR');

          return (
            <div key={c.id} className="decision-card">
              <div className="decision-card-header">
                <div className="badge-row">
                  <span className={`severity-tag ${isHighRisk ? 'critical' : 'optimal'}`}>
                    {isHighRisk ? (isAr ? 'احتمال فقدان مرتفع' : 'HIGH CHURN RISK') : (isAr ? 'حساب مستقر' : 'STABLE')}
                  </span>
                  <span className="category-pill">{isAr ? `تاريخ التجديد: ${renewal}` : `Renewal: ${renewal}`}</span>
                </div>
                <div className="decision-financial">
                  <span className="label">{isAr ? 'الإيراد السنوي المعرض للخطر' : 'Revenue at Risk'}</span>
                  <span className="amount">{revenueAtRisk}</span>
                </div>
              </div>

              <h3 className="decision-title">
                {name}
              </h3>

              <div className="risk-metric-strip">
                <div className="risk-metric-box">
                  <span className="k">{isAr ? 'وتيرة الطلبات (Volume Trend)' : 'Volume Velocity'}</span>
                  <span className="v" style={{ color: trend.startsWith('-') ? 'var(--status-critical)' : 'var(--status-success)' }}>
                    {trend}
                  </span>
                </div>
                <div className="risk-metric-box">
                  <span className="k">{isAr ? 'احتمالية الفقدان المقدرة' : 'Churn Probability'}</span>
                  <span className="v">{(churnProb * 100).toFixed(0)}%</span>
                </div>
                <div className="risk-metric-box">
                  <span className="k">{isAr ? 'المراجعة التنفيذية' : 'Executive Review'}</span>
                  <span className="v" style={{ color: isReviewed ? 'var(--status-success)' : 'var(--text-secondary)' }}>
                    {isReviewed ? (isAr ? 'مجدولة' : 'Scheduled') : (isAr ? 'غير مجدولة' : 'Pending')}
                  </span>
                </div>
              </div>

              <div className="decision-actions-row">
                <button
                  onClick={() => handleReviewAccount(c.id, name)}
                  className={isReviewed ? 'btn-secondary' : 'btn-primary'}
                  disabled={isReviewed}
                  style={{ fontSize: '12px', padding: '8px 14px' }}
                >
                  <IconClock size={14} />
                  <span>
                    {isReviewed
                      ? (isAr ? 'تمت جدولة المراجعة التنفيذية' : 'Executive Review Scheduled')
                      : (isAr ? 'جدولة مراجعة تنفيذية فورية' : 'Schedule Executive Review')}
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
