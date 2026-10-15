import React, { useState, useEffect } from 'react';
import { LocaleMode } from '../../types';
import { IconSupplier, IconCheck, IconTrendingUp } from '../Icons';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { SupplierRiskWorkbench } from '../suppliers/SupplierRiskWorkbench';

interface SuppliersViewProps {
  locale: LocaleMode;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated } = useAuth();
  const [viewMode, setViewMode] = useState<'workbench' | 'database'>('workbench');
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [totalSpendSAR, setTotalSpendSAR] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [notice, setNotice] = useState<string | null>(null);
  const [auditedSuppliers, setAuditedSuppliers] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoDataset, setIsDemoDataset] = useState<boolean>(false);

  const fetchSuppliers = async () => {
    setLoading(true);
    if (!isAuthenticated) {
      setSuppliers([]);
      setTotalSpendSAR(0);
      setIsDemoDataset(false);
      setLoading(false);
      return;
    }
    try {
      const res = await api.getSuppliers();
      if (res && Array.isArray(res.suppliers)) {
        setSuppliers(res.suppliers);
        setTotalSpendSAR(res.totalMonitoredContractsSAR || 0);
        setIsDemoDataset(false);
        const map: { [key: string]: boolean } = {};
        res.suppliers.forEach((s: any) => {
          map[s.id] = !!s.is_audited;
        });
        setAuditedSuppliers(map);
      } else {
        setSuppliers([]);
        setTotalSpendSAR(0);
        setIsDemoDataset(false);
      }
    } catch (err: any) {
      setSuppliers([]);
      setTotalSpendSAR(0);
      setIsDemoDataset(false);
      setNotice(err.message || (isAr ? 'فشل تحميل بيانات الموردين' : 'Failed to fetch supplier records'));
    } finally {
      setLoading(false);
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

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {isDemoDataset && (
            <span className="severity-tag warning" style={{ fontSize: '11px', padding: '6px 12px' }}>
              {isAr ? 'نموذج بيانات توضيحي' : 'Demonstration Dataset'}
            </span>
          )}
          <div className="kpi-micro-badge">
            <span className="label">{isAr ? 'حجم العقود قيد المتابعة' : 'Monitored Contracts'}</span>
            <span className="value">{(totalSpendSAR / 1e6).toFixed(2)}M SAR</span>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', margin: '14px 0 20px 0', overflowX: 'auto' }}>
        <button
          onClick={() => setViewMode('workbench')}
          className={`ctrl-btn ${viewMode === 'workbench' ? 'active' : ''}`}
          style={{
            fontWeight: viewMode === 'workbench' ? 800 : 500,
            background: viewMode === 'workbench' ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(8, 145, 178, 0.15))' : undefined,
            borderColor: viewMode === 'workbench' ? '#06B6D4' : undefined,
            color: viewMode === 'workbench' ? '#67E8F9' : undefined
          }}
        >
          {isAr ? '🔬 رادار ذكاء الموردين ومحاكي الشراء الموحد (Workbench)' : '🔬 Supplier Intelligence & Group Spend Workbench'}
        </button>
        <button
          onClick={() => setViewMode('database')}
          className={`ctrl-btn ${viewMode === 'database' ? 'active' : ''}`}
          style={{ fontWeight: viewMode === 'database' ? 700 : 500 }}
        >
          {isAr
            ? `📋 سجل موردي المنشأة المسجلين (${suppliers.length})`
            : `📋 Enterprise Vendor Records (${suppliers.length})`}
        </button>
      </div>

      {viewMode === 'workbench' ? (
        <SupplierRiskWorkbench
          locale={locale}
          initialScenario="fmcg_retail"
          isEmbeddedInPublicPage={false}
        />
      ) : (
        <>
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

      {/* Empty State */}
      {!loading && filteredSuppliers.length === 0 && (
        <div className="decision-card" style={{ textAlign: 'center', padding: '40px 20px', marginTop: '20px' }}>
          <IconSupplier size={36} style={{ color: 'var(--text-secondary)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {isAr ? 'لا يوجد موردون مسجلون حالياً' : 'No Monitored Suppliers Found'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
            {isAr
              ? 'لم يتم تسجيل أي عقود توريد أو أوامر شراء لمساحة العمل الحالية.'
              : 'Zero active supplier contracts or purchase orders found for the current workspace.'}
          </p>
        </div>
      )}

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
      </>
      )}
    </div>
  );
};
