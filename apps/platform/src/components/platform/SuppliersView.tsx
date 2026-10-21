// MIKHLAFI LABS — Supplier Intelligence & Procurement Scorecards (protected workspace view)
// Records are loaded exclusively from api.getSuppliers; benchmark audits call
// api.auditSupplier and reflect the real backend response. No demo fallbacks
// and no simulated records are ever rendered.

import React, { useState, useEffect, useCallback } from 'react';
import { LocaleMode } from '../../types';
import { IconSupplier, IconCheck, IconTrendingUp, IconAlert, IconFilter, IconLock } from '../Icons';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../common/EmptyState';
import { PageHeader } from '../common/PageHeader';

interface SuppliersViewProps {
  locale: LocaleMode;
}

type SupplierRecord = {
  id: string;
  code: string;
  name_en?: string;
  name_ar?: string;
  rating_score?: number;
  price_creep_rate?: string;
  price_creep_pct?: string | number;
  on_time_delivery_rate?: string;
  active_contracts_val_sar?: string | number;
  risk_status?: string;
  is_audited?: boolean;
  last_audit_notes?: string;
};

interface NoticeState {
  type: 'success' | 'error';
  message: string;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated, tenant, openAuthModal } = useAuth();

  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [totalContractsSAR, setTotalContractsSAR] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const currency = tenant?.currency || 'SAR';

  const fetchSuppliers = useCallback(async () => {
    if (!isAuthenticated) {
      setSuppliers([]);
      setTotalContractsSAR(0);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSuppliers();
      setSuppliers(Array.isArray(res.suppliers) ? (res.suppliers as SupplierRecord[]) : []);
      setTotalContractsSAR(res.totalMonitoredContractsSAR || 0);
    } catch (err) {
      setSuppliers([]);
      setTotalContractsSAR(0);
      setError(
        err instanceof Error
          ? err.message
          : (isAr ? 'تعذر تحميل سجلات الموردين.' : 'Failed to fetch supplier records.')
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAr]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers, tenant?.organizationId]);

  const showNotice = (state: NoticeState) => {
    setNotice(state);
    setTimeout(() => setNotice(null), 5000);
  };

  const handleAudit = async (supplier: SupplierRecord) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setBusyId(supplier.id);
    try {
      const res = await api.auditSupplier(supplier.id);
      const name = isAr
        ? (res.supplier?.name_ar || supplier.name_ar || supplier.name_en || supplier.code)
        : (res.supplier?.name_en || supplier.name_en || supplier.name_ar || supplier.code);
      showNotice({
        type: 'success',
        message: isAr
          ? `تم بدء فحص المقارنة السعرية للمورد (${name}) وتسجيل النتيجة في سجل التدقيق.`
          : `Price benchmark audit completed for supplier ${name} and recorded in the audit trail.`
      });
      await fetchSuppliers();
    } catch (err) {
      showNotice({
        type: 'error',
        message: err instanceof Error
          ? err.message
          : (isAr ? 'تعذر تنفيذ فحص المقارنة السعرية.' : 'Failed to run the benchmark audit.')
      });
    } finally {
      setBusyId(null);
    }
  };

  const statusBadgeClass = (status?: string, audited?: boolean) => {
    const s = (status || '').toLowerCase();
    if (s === 'critical') return 'ml-badge ml-badge--danger';
    if (s === 'optimal' || audited) return 'ml-badge ml-badge--success';
    if (s === 'moderate') return 'ml-badge ml-badge--warning';
    return 'ml-badge';
  };

  const statusLabel = (status?: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'critical') return isAr ? 'حرج' : 'CRITICAL';
    if (s === 'optimal') return isAr ? 'مثالي' : 'OPTIMAL';
    if (s === 'moderate') return isAr ? 'معتدل' : 'MODERATE';
    return (status || '').toUpperCase();
  };

  const statusOptions = Array.from(
    new Set(suppliers.map((s) => s.risk_status).filter((s): s is string => !!s))
  );

  const filteredSuppliers = suppliers.filter((s) =>
    statusFilter === 'all' ? true : s.risk_status === statusFilter
  );

  const auditedCount = suppliers.filter((s) => !!s.is_audited).length;

  const formatAmount = (value?: string | number) =>
    `${(Number(value) || 0).toLocaleString()} ${currency}`;

  const priceCreep = (s: SupplierRecord) => {
    if (s.price_creep_rate) return s.price_creep_rate;
    if (s.price_creep_pct != null && s.price_creep_pct !== '') return `${Number(s.price_creep_pct).toFixed(1)}%`;
    return '—';
  };

  return (
    <div className="platform-page-container">
      <PageHeader
        locale={locale}
        icon={<IconSupplier size={22} />}
        breadcrumb={[isAr ? 'المنصة' : 'Platform', isAr ? 'محركات الذكاء' : 'Intelligence Engines']}
        title={isAr ? 'محرك ذكاء الموردين وبطاقات الأداء' : 'Supplier Intelligence & Procurement Scorecards'}
        subtitle={
          isAr
            ? 'رصد تدرّج أسعار الموردين وموثوقية مواعيد التوريد وتوزّع المخاطر على الموردين، مع فحوص مقارنة سعرية قابلة للتدقيق.'
            : 'Tracking supplier price progression, delivery reliability, and risk concentration across the vendor base, with auditable price benchmark checks.'
        }
        action={
          isAuthenticated ? (
            <div className="kpi-micro-badge">
              <span className="label">{isAr ? 'إجمالي العقود المراقَبة' : 'Monitored Contracts'}</span>
              <span className="value">{totalContractsSAR.toLocaleString()} {currency}</span>
            </div>
          ) : undefined
        }
      />

      {!isAuthenticated ? (
        <EmptyState
          icon={<IconLock size={30} />}
          title={isAr ? 'سجّل الدخول لعرض سجل موردي مؤسستك' : 'Sign in to view your organization’s supplier registry'}
          description={
            isAr
              ? 'تُسترجع بطاقات أداء الموردين ومؤشرات الأسعار وحالة الفحوص مباشرة من مساحة عمل مؤسستك بعد تسجيل الدخول.'
              : 'Supplier scorecards, price indicators, and audit status are loaded directly from your organization workspace after signing in.'
          }
          action={
            <button onClick={openAuthModal} className="ml-btn ml-btn--primary">
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </button>
          }
        />
      ) : (
        <>
          {notice && (
                <div className={`alert-feedback-banner ${notice.type === 'success' ? 'success' : 'error'}`}>
                  {notice.type === 'success' ? <IconCheck size={16} /> : <IconAlert size={16} />}
                  <span>{notice.message}</span>
                </div>
              )}

              {loading ? (
                <div className="skeleton-grid">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="skeleton-card" />
                  ))}
                </div>
              ) : error ? (
                <EmptyState
                  icon={<IconAlert size={30} />}
                  title={isAr ? 'تعذر تحميل سجل الموردين' : 'Unable to load the supplier registry'}
                  description={error}
                  action={
                    <button onClick={fetchSuppliers} className="ml-btn ml-btn--primary">
                      {isAr ? 'إعادة المحاولة' : 'Retry'}
                    </button>
                  }
                />
              ) : (
                <>
                  <div className="stat-grid">
                    <div className="stat-tile">
                      <div className="stat-tile__label">{isAr ? 'الموردون المراقَبون' : 'Monitored Suppliers'}</div>
                      <div className="stat-tile__value">{suppliers.length}</div>
                      <div className="stat-tile__hint">{isAr ? 'علاقات توريد نشطة' : 'Active supply relationships'}</div>
                    </div>
                    <div className="stat-tile">
                      <div className="stat-tile__label">{isAr ? 'قيمة العقود النشطة' : 'Active Contract Value'}</div>
                      <div className="stat-tile__value">{totalContractsSAR.toLocaleString()} {currency}</div>
                      <div className="stat-tile__hint">{isAr ? 'كما هو مسجّل في السجلات' : 'As recorded in the registry'}</div>
                    </div>
                    <div className="stat-tile">
                      <div className="stat-tile__label">{isAr ? 'فحوص مقارنة مكتملة' : 'Benchmark Audits Done'}</div>
                      <div className="stat-tile__value">{auditedCount}</div>
                      <div className="stat-tile__hint">{isAr ? 'تم تنفيذها فعلياً' : 'Actually performed'}</div>
                    </div>
                  </div>

                  {suppliers.length === 0 ? (
                    <EmptyState
                      icon={<IconSupplier size={30} />}
                      title={isAr ? 'لا يوجد موردون مسجلون حالياً' : 'No suppliers registered right now'}
                      description={
                        isAr
                          ? 'تُسجَّل علاقات التوريد في هذه المساحة عبر ربط أنظمة المشتريات أو استيراد أوامر الشراء؛ فور التسجيل تظهر هنا مع بطاقات الأداء.'
                          : 'Supply relationships are registered in this workspace by connecting procurement systems or importing purchase orders; once registered they appear here with scorecards.'
                      }
                    />
                  ) : (
                    <>
                      {statusOptions.length > 0 && (
                        <div className="page-filter-bar">
                          <div className="filter-group">
                            <IconFilter size={14} />
                            <span className="filter-label">{isAr ? 'تصنيف المخاطر:' : 'Risk class:'}</span>
                            <button
                              onClick={() => setStatusFilter('all')}
                              className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`}
                            >
                              {isAr ? 'الكل' : 'All'} ({suppliers.length})
                            </button>
                            {statusOptions.map((status) => {
                              const count = suppliers.filter((s) => s.risk_status === status).length;
                              return (
                                <button
                                  key={status}
                                  onClick={() => setStatusFilter(status)}
                                  className={`filter-chip ${statusFilter === status ? 'active' : ''}`}
                                >
                                  {statusLabel(status)} ({count})
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {filteredSuppliers.length === 0 ? (
                        <EmptyState
                          icon={<IconFilter size={30} />}
                          title={isAr ? 'لا يوجد موردون بهذا التصنيف' : 'No suppliers in this class'}
                          description={
                            isAr
                              ? 'اختر تصنيفاً آخر لعرض بقية سجل الموردين.'
                              : 'Select a different class to view the rest of the supplier registry.'
                          }
                          action={
                            <button onClick={() => setStatusFilter('all')} className="ml-btn ml-btn--ghost">
                              {isAr ? 'عرض الكل' : 'Show All'}
                            </button>
                          }
                        />
                      ) : (
                        <div className="record-list">
                          {filteredSuppliers.map((supplier) => {
                            const name = isAr
                              ? (supplier.name_ar || supplier.name_en || supplier.code)
                              : (supplier.name_en || supplier.name_ar || supplier.code);
                            const score = Number(supplier.rating_score);
                            const creep = priceCreep(supplier);
                            const creepIsRising = creep.startsWith('+') || (supplier.risk_status || '').toLowerCase() === 'critical';

                            return (
                              <div key={supplier.id} className="record-row" style={{ alignItems: 'flex-start' }}>
                                <div className="record-row__main">
                                  <div className="va-row-head">
                                    <div className="va-tags">
                                      <span className={statusBadgeClass(supplier.risk_status, supplier.is_audited)}>
                                        <span className="ml-dot" />
                                        {statusLabel(supplier.risk_status)}
                                      </span>
                                      <span className="va-mono-id">{supplier.code}</span>
                                      {!Number.isNaN(score) && (
                                        <span className="ml-badge">
                                          {isAr ? `التقييم: ${score}/100` : `Score: ${score}/100`}
                                        </span>
                                      )}
                                    </div>
                                    <span className="va-amount">{formatAmount(supplier.active_contracts_val_sar)}</span>
                                  </div>

                                  <div className="record-row__title" style={{ marginTop: 6 }}>{name}</div>

                                  <div className="va-metric-grid">
                                    <div className="va-metric">
                                      <span className="va-metric__k">{isAr ? 'التصاعد السعري' : 'Price creep'}</span>
                                      <span className={`va-metric__v ${creepIsRising ? 'va-metric__v--warning' : ''}`}>
                                        {creep}
                                      </span>
                                    </div>
                                    <div className="va-metric">
                                      <span className="va-metric__k">{isAr ? 'الالتزام بالتوريد' : 'On-time delivery'}</span>
                                      <span className="va-metric__v">{supplier.on_time_delivery_rate || '—'}</span>
                                    </div>
                                    <div className="va-metric">
                                      <span className="va-metric__k">{isAr ? 'فحص المقارنة السعرية' : 'Benchmark audit'}</span>
                                      <span className={`va-metric__v ${supplier.is_audited ? 'va-metric__v--success' : 'va-metric__v--muted'}`}>
                                        {supplier.is_audited
                                          ? (isAr ? 'مكتمل' : 'Completed')
                                          : (isAr ? 'لم يُنفَّذ بعد' : 'Not run yet')}
                                      </span>
                                    </div>
                                  </div>

                                  {supplier.last_audit_notes && (
                                    <div className="va-note">{supplier.last_audit_notes}</div>
                                  )}
                                </div>

                                <div className="record-row__actions">
                                  <button
                                    onClick={() => handleAudit(supplier)}
                                    disabled={busyId === supplier.id}
                                    className={`ml-btn ml-btn--sm ${supplier.is_audited ? 'ml-btn--subtle' : 'ml-btn--primary'}`}
                                  >
                                    <IconTrendingUp size={14} />
                                    <span>
                                      {busyId === supplier.id
                                        ? (isAr ? 'جارِ الفحص…' : 'Auditing…')
                                        : supplier.is_audited
                                          ? (isAr ? 'إعادة الفحص' : 'Re-run Audit')
                                          : (isAr ? 'فحص المقارنة السعرية' : 'Run Benchmark Audit')}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
        </>
      )}
    </div>
  );
};
