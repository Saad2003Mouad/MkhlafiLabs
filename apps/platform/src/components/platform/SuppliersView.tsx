import React, { useState } from 'react';
import { LocaleMode, SupplierItem } from '../../types';
import { MOCK_SUPPLIERS } from '../../data/mockData';
import { IconSupplier, IconCheck, IconTrendingUp } from '../Icons';

interface SuppliersViewProps {
  locale: LocaleMode;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const [suppliers] = useState<SupplierItem[]>(MOCK_SUPPLIERS);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [notice, setNotice] = useState<string | null>(null);

  const filteredSuppliers = suppliers.filter((s) => {
    if (statusFilter === 'all') return true;
    return s.riskStatus === statusFilter;
  });

  const handleAuditVendor = (name: string) => {
    setNotice(isAr ? `تم بدء فحص المقارنة السعرية لـ (${name}) مع متوسطات عروض الأسعار المسجلة في ERP.` : `Price benchmark audit initiated for (${name}) against recorded catalog baselines.`);
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
            <span className="current">{isAr ? 'ذكاء الموردين والمشتريات' : 'Supplier Intelligence'}</span>
          </div>
          <h1 className="page-title">
            <IconSupplier size={24} />
            <span>{isAr ? 'محرك ذكاء الموردين وبطاقات الأداء وسلاسل الشراء' : 'Supplier Intelligence & Procurement Scorecards'}</span>
          </h1>
          <p className="page-subtitle">
            {isAr
              ? 'مراقبة تباين وتصاعد أسعار الموردين (Price Creep)، قياس موثوقية مواعيد التوريد وجودة الاستلام، وكشف تركز المخاطر على جهات محددة.'
              : 'Tracking supplier price creep, on-time delivery adherence, and vendor concentration risks using verified purchase order data.'}
          </p>
        </div>

        <div className="kpi-micro-badge">
          <span className="label">{isAr ? 'حجم العقود قيد المتابعة' : 'Monitored Contracts'}</span>
          <span className="value">5.57M SAR</span>
        </div>
      </div>

      {notice && (
        <div className="alert-feedback-banner success">
          <IconCheck size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="page-filter-bar">
        <div className="filter-group">
          <span className="filter-label">{isAr ? 'حالة المورد:' : 'Supplier Status:'}</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`}
          >
            {isAr ? 'كافة الموردين (3)' : 'All Vendors (3)'}
          </button>
          <button
            onClick={() => setStatusFilter('critical')}
            className={`filter-chip ${statusFilter === 'critical' ? 'active' : ''}`}
          >
            <span className="dot critical" />
            {isAr ? 'تباين سعري حرج' : 'Critical Price Variance'}
          </button>
          <button
            onClick={() => setStatusFilter('optimal')}
            className={`filter-chip ${statusFilter === 'optimal' ? 'active' : ''}`}
          >
            <span className="dot optimal" />
            {isAr ? 'أداء نموذجي' : 'Optimal'}
          </button>
        </div>

        <div className="meta-stats">
          <span>{isAr ? 'مستخلصات المشتريات: فحص حتمي مستمر' : 'Audits: Continuous Deterministic Scans'}</span>
        </div>
      </div>

      {/* Supplier Cards */}
      <div className="decisions-grid">
        {filteredSuppliers.map((supplier) => (
          <div key={supplier.id} className={`decision-card priority-${supplier.riskStatus === 'critical' ? 'critical' : 'optimal'}`}>
            <div className="decision-card-header">
              <div className="badge-row">
                <span className={`severity-tag ${supplier.riskStatus === 'optimal' ? 'optimal' : supplier.riskStatus === 'critical' ? 'high' : 'medium'}`}>
                  {supplier.riskStatus.toUpperCase()}
                </span>
                <span className="decision-code">
                  {isAr ? 'مؤشر الأداء:' : 'Score:'} {supplier.ratingScore}/100
                </span>
              </div>
              <div className="decision-financial">
                <span className="label">{isAr ? 'قيمة العقود النشطة' : 'Active Contracts'}</span>
                <span className="amount">{supplier.activeContractsVal}</span>
              </div>
            </div>

            <h3 className="decision-title">
              {isAr ? supplier.nameAr : supplier.nameEn}
            </h3>

            {/* Metrics Strip */}
            <div className="risk-metric-strip">
              <div className="risk-metric-box">
                <span className="k">{isAr ? 'معدل تصاعد الأسعار' : 'Price Creep'}</span>
                <span className="v" style={{ color: supplier.riskStatus === 'critical' ? 'var(--status-danger)' : 'var(--status-success)' }}>
                  {supplier.priceCreepRate}
                </span>
              </div>
              <div className="risk-metric-box">
                <span className="k">{isAr ? 'الالتزام بمواعيد التوريد' : 'On-Time Delivery'}</span>
                <span className="v">{supplier.onTimeDeliveryRate}</span>
              </div>
              <div className="risk-metric-box">
                <span className="k">{isAr ? 'تقييم الجودة' : 'Quality Rating'}</span>
                <span className="v">{supplier.ratingScore}%</span>
              </div>
            </div>

            <div className="decision-actions-row">
              <button
                onClick={() => handleAuditVendor(isAr ? supplier.nameAr : supplier.nameEn)}
                className="btn-primary"
                style={{ fontSize: '12px', padding: '8px 14px' }}
              >
                <IconTrendingUp size={14} />
                <span>{isAr ? 'بدء تدقيق مقارنة الأسعار مع السوق' : 'Run Benchmark Price Audit'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
