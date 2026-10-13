import React, { useState, useEffect } from 'react';
import { LocaleMode } from '../../types';
import { MOCK_SUPPLIERS } from '../../data/mockData';
import { IconSupplier, IconCheck, IconTrendingUp } from '../Icons';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface SuppliersViewProps {
  locale: LocaleMode;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated } = useAuth();
  const [suppliers, setSuppliers] = useState<any[]>(MOCK_SUPPLIERS);
  const [totalSpendSAR, setTotalSpendSAR] = useState<number>(5570000);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [notice, setNotice] = useState<string | null>(null);
  const [auditedSuppliers, setAuditedSuppliers] = useState<{ [key: string]: boolean }>({});

  const fetchSuppliers = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.getSuppliers();
      if (res.suppliers && res.suppliers.length > 0) {
        setSuppliers(res.suppliers);
        setTotalSpendSAR(res.totalMonitoredContractsSAR);
        const map: { [key: string]: boolean } = {};
        res.suppliers.forEach((s: any) => {
          map[s.id] = !!s.is_audited;
        });
        setAuditedSuppliers(map);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [isAuthenticated]);

  const handleAuditVendor = async (supplierId: string, name: string) => {
    if (isAuthenticated) {
      try {
        await api.auditSupplier(supplierId);
        setAuditedSuppliers((prev) => ({ ...prev, [supplierId]: true }));
        const msg = isAr
          ? `تم بدء فحص المقارنة السعرية لـ (${name}) مع أسعار الأساس وتوثيق التدقيق في PostgreSQL.`
          : `Price benchmark audit initiated for (${name}) against catalog baseline & saved in PostgreSQL.`;
        setNotice(msg);
        setTimeout(() => setNotice(null), 4000);
        await fetchSuppliers();
        return;
      } catch (err: any) {
        setNotice(err.message || 'Error auditing vendor');
        setTimeout(() => setNotice(null), 4000);
      }
    }

    // Demo fallback
    setAuditedSuppliers((prev) => ({ ...prev, [supplierId]: true }));
    setNotice(isAr ? `(عرض تجريبي) تم بدء فحص المقارنة السعرية لـ (${name}).` : `(Demo) Price benchmark audit initiated for (${name}).`);
    setTimeout(() => setNotice(null), 4000);
  };

  const filteredSuppliers = suppliers.filter((s) => {
    if (statusFilter === 'all') return true;
    const risk = s.risk_status || s.riskStatus;
    return risk === statusFilter;
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
            <span>{isAr ? 'ذكاء الموردين والمشتريات' : 'Supplier Intelligence'}</span>
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
          <span className="value">{(totalSpendSAR / 1e6).toFixed(2)}M SAR</span>
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
          <span className="filter-label">{isAr ? 'تصنيف المورد:' : 'Supplier Risk:'}</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`}
          >
            {isAr ? `كافة الموردين (${suppliers.length})` : `All Suppliers (${suppliers.length})`}
          </button>
          <button
            onClick={() => setStatusFilter('critical')}
            className={`filter-chip ${statusFilter === 'critical' ? 'active' : ''}`}
          >
            {isAr ? 'حرج (انحراف سعري)' : 'Critical Creep'}
          </button>
          <button
            onClick={() => setStatusFilter('optimal')}
            className={`filter-chip ${statusFilter === 'optimal' ? 'active' : ''}`}
          >
            {isAr ? 'مثالي ومطابق' : 'Optimal'}
          </button>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="decisions-grid">
        {filteredSuppliers.map((s) => {
          const isAudited = auditedSuppliers[s.id] || s.is_audited;
          const name = isAr ? (s.name_ar || s.nameAr) : (s.name_en || s.nameEn);
          const score = s.rating_score ?? s.ratingScore ?? 75;
          const creep = s.price_creep_rate || s.priceCreepRate || '+0.0%';
          const delivery = s.on_time_delivery_rate || s.onTimeDeliveryRate || '90%';
          const contractsVal = s.activeContractsVal || (s.active_contracts_val_sar ? `${(parseFloat(s.active_contracts_val_sar) / 1e6).toFixed(2)}M SAR` : '0 SAR');
          const riskStatus = s.risk_status || s.riskStatus || 'moderate';

          return (
            <div key={s.id} className="decision-card">
              <div className="decision-card-header">
                <div className="badge-row">
                  <span className={`severity-tag ${riskStatus === 'optimal' ? 'optimal' : riskStatus === 'critical' ? 'critical' : 'medium'}`}>
                    {riskStatus.toUpperCase()}
                  </span>
                  <span className="category-pill">{isAr ? `تقييم الأداء: ${score}/100` : `Score: ${score}/100`}</span>
                </div>
                <div className="decision-financial">
                  <span className="label">{isAr ? 'حجم العقود النشطة' : 'Active Contracts'}</span>
                  <span className="amount">{contractsVal}</span>
                </div>
              </div>

              <h3 className="decision-title">
                {name}
              </h3>

              <div className="risk-metric-strip">
                <div className="risk-metric-box">
                  <span className="k">{isAr ? 'التصاعد السعري (Price Creep)' : 'Price Creep'}</span>
                  <span className="v" style={{ color: riskStatus === 'critical' ? 'var(--status-critical)' : 'var(--text-primary)' }}>
                    {creep}
                  </span>
                </div>
                <div className="risk-metric-box">
                  <span className="k">{isAr ? 'الالتزام بمواعيد التوريد' : 'On-Time Delivery'}</span>
                  <span className="v">{delivery}</span>
                </div>
                <div className="risk-metric-box">
                  <span className="k">{isAr ? 'فحص المقارنة السعرية' : 'Price Benchmark'}</span>
                  <span className="v" style={{ color: isAudited ? 'var(--status-success)' : 'var(--text-secondary)' }}>
                    {isAudited ? (isAr ? 'تم الفحص' : 'Audited') : (isAr ? 'غير مفحوص' : 'Pending')}
                  </span>
                </div>
              </div>

              {s.last_audit_notes && (
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '10px 0', background: 'var(--bg-surface-elevated)', padding: '8px 12px', borderRadius: '4px' }}>
                  {s.last_audit_notes}
                </div>
              )}

              <div className="decision-actions-row">
                <button
                  onClick={() => handleAuditVendor(s.id, name)}
                  className={isAudited ? 'btn-secondary' : 'btn-primary'}
                  disabled={isAudited}
                  style={{ fontSize: '12px', padding: '8px 14px' }}
                >
                  <IconTrendingUp size={14} />
                  <span>
                    {isAudited
                      ? (isAr ? 'تم فحص ومقارنة الأسعار' : 'Benchmark Audit Active')
                      : (isAr ? 'بدء فحص المقارنة السعرية في ERP' : 'Initiate Benchmark Audit')}
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
