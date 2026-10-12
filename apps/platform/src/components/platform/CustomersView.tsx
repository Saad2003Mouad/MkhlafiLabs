import React, { useState } from 'react';
import { LocaleMode, CustomerRiskItem } from '../../types';
import { MOCK_CUSTOMERS } from '../../data/mockData';
import { IconCustomer, IconCheck, IconClock } from '../Icons';

interface CustomersViewProps {
  locale: LocaleMode;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const [customers] = useState<CustomerRiskItem[]>(MOCK_CUSTOMERS);
  const [notice, setNotice] = useState<string | null>(null);

  const handleReviewAccount = (name: string) => {
    setNotice(isAr ? `تمت جدولة مراجعة تنفيذية لحساب (${name}) وإرسال ملخص التدقيق لفريق إدارة العلاقات.` : `Executive account review scheduled for (${name}). Brief dispatched to Account Executive.`);
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

        <div className="kpi-micro-badge warning">
          <span className="label">{isAr ? 'إجمالي الإيرادات المعرضة للمخاطر' : 'Revenue at Risk'}</span>
          <span className="value">1.36M SAR</span>
        </div>
      </div>

      {notice && (
        <div className="alert-feedback-banner success">
          <IconCheck size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Customer Radar Cards */}
      <div className="decisions-grid">
        {customers.map((c) => {
          const isHighRisk = c.churnProbability > 0.5;
          return (
            <div key={c.id} className={`decision-card ${isHighRisk ? 'priority-critical' : 'priority-optimal'}`}>
              <div className="decision-card-header">
                <div className="badge-row">
                  <span className={`severity-tag ${isHighRisk ? 'high' : 'optimal'}`}>
                    {isHighRisk ? (isAr ? 'مخاطر فقدان عالية' : 'HIGH CHURN RISK') : (isAr ? 'علاقة مستقرة' : 'STABLE')}
                  </span>
                  <span className="decision-code">
                    {isAr ? 'احتمالية الفقدان:' : 'Churn Prob:'} {(c.churnProbability * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="decision-financial">
                  <span className="label">{isAr ? 'الإيراد السنوي المعرض للخطر' : 'Revenue at Risk'}</span>
                  <span className="amount">{c.revenueAtRisk}</span>
                </div>
              </div>

              <h3 className="decision-title">
                {isAr ? c.accountNameAr : c.accountNameEn}
              </h3>

              <div className="risk-metric-strip">
                <div className="risk-metric-box">
                  <span className="k">{isAr ? 'اتجاه وتيرة الشراء' : 'Volume Trend'}</span>
                  <span className="v" style={{ color: c.volumeTrend.startsWith('-') ? 'var(--status-danger)' : 'var(--status-success)' }}>
                    {c.volumeTrend}
                  </span>
                </div>
                <div className="risk-metric-box">
                  <span className="k">{isAr ? 'تاريخ التجديد القادم' : 'Renewal Window'}</span>
                  <span className="v">
                    <IconClock size={12} style={{ display: 'inline', marginInlineEnd: '4px' }} />
                    {c.renewalDate}
                  </span>
                </div>
                <div className="risk-metric-box">
                  <span className="k">{isAr ? 'مؤشر الثقة' : 'Confidence'}</span>
                  <span className="v">{isAr ? 'مؤكد بالسجلات' : 'Ledger Verified'}</span>
                </div>
              </div>

              <div className="decision-actions-row">
                <button
                  onClick={() => handleReviewAccount(isAr ? c.accountNameAr : c.accountNameEn)}
                  className="btn-primary"
                  style={{ fontSize: '12px', padding: '8px 14px' }}
                >
                  <IconCustomer size={14} />
                  <span>{isAr ? 'جدولة مراجعة تنفيذية للحساب' : 'Schedule Executive Retention Review'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
