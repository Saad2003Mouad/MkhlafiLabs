// MIKHLAFI LABS — Customer Intelligence & Churn Radar
// All records are loaded exclusively from the authenticated backend.
// No simulated or demonstration records are ever rendered.

import React, { useState, useEffect, useCallback } from 'react';
import { LocaleMode } from '../../types';
import { IconCustomer, IconCheck, IconClock, IconFilter, IconRisk, IconTrendingUp } from '../Icons';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../common/EmptyState';
import { PageHeader } from '../common/PageHeader';

interface CustomersViewProps {
  locale: LocaleMode;
}

interface CustomerRecord {
  id: string;
  code: string;
  account_name_en: string;
  account_name_ar: string;
  volume_trend: string;
  renewal_date: string;
  churn_probability: string | number;
  revenue_at_risk_sar: string | number;
  review_scheduled: boolean;
  status: string;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated, tenant, openAuthModal } = useAuth();
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [totalRevenueAtRiskSAR, setTotalRevenueAtRiskSAR] = useState<number>(0);
  const [filterRisk, setFilterRisk] = useState<'all' | 'high' | 'stable'>('all');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCustomers = useCallback(async () => {
    if (!isAuthenticated) {
      setCustomers([]);
      setTotalRevenueAtRiskSAR(0);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCustomers();
      setCustomers(Array.isArray(res.customers) ? res.customers : []);
      setTotalRevenueAtRiskSAR(Number(res.totalRevenueAtRiskSAR) || 0);
    } catch (err: any) {
      setCustomers([]);
      setTotalRevenueAtRiskSAR(0);
      setError(err.message || (isAr ? 'تعذّر تحميل سجلات العملاء.' : 'Unable to load customer records.'));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAr]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers, tenant?.organizationId]);

  const handleReviewAccount = async (customer: CustomerRecord) => {
    const name = isAr ? customer.account_name_ar : customer.account_name_en;
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    try {
      await api.reviewCustomer(customer.id);
      setNotice({
        type: 'success',
        message: isAr
          ? `تمت جدولة مراجعة تنفيذية للحساب (${name}) وتسجيل حدث التدقيق.`
          : `Executive review scheduled for (${name}) and audit event recorded.`
      });
      await fetchCustomers();
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || (isAr ? 'تعذّر جدولة المراجعة.' : 'Unable to schedule the review.') });
    }
    setTimeout(() => setNotice(null), 4000);
  };

  const churnPctOf = (c: CustomerRecord) => (parseFloat(String(c.churn_probability)) || 0) * 100;
  const isHighRisk = (c: CustomerRecord) => churnPctOf(c) > 50;

  const filteredCustomers = customers.filter((c) => {
    if (filterRisk === 'all') return true;
    if (filterRisk === 'high') return isHighRisk(c);
    return !isHighRisk(c);
  });

  const counts = {
    all: customers.length,
    high: customers.filter(isHighRisk).length,
    stable: customers.filter((c) => !isHighRisk(c)).length
  };

  return (
    <div className="platform-page-container">
      <PageHeader
        locale={locale}
        icon={<IconCustomer size={22} />}
        breadcrumb={[isAr ? 'المنصة' : 'Platform', isAr ? 'محركات الذكاء' : 'Intelligence Suite']}
        title={isAr ? 'ذكاء العملاء ورادار مخاطر فقدان التعامل' : 'Customer Intelligence & Churn Radar'}
        subtitle={
          isAr
            ? 'رصد وتيرة تعاملات الحسابات ومواعيد التجديد ومؤشرات فقدان كبار العملاء بصورة استباقية، اعتماداً على السجلات التشغيلية لمؤسستك.'
            : 'Proactively monitoring account transaction velocity, contract renewal dates, and key-customer attrition signals from your organization’s operational records.'
        }
        action={
          <div className="kpi-micro-badge">
            <span className="label">{isAr ? 'إجمالي الإيراد المعرّض للمخاطرة' : 'Total Revenue at Risk'}</span>
            <span className="value">
              {isAuthenticated
                ? `${totalRevenueAtRiskSAR.toLocaleString()} ${tenant?.currency || 'SAR'}`
                : '—'}
            </span>
          </div>
        }
      />

      {notice && (
            <div className={`alert-feedback-banner ${notice.type === 'error' ? 'error' : 'success'}`}>
              {notice.type === 'error' ? <IconRisk size={16} /> : <IconCheck size={16} />}
              <span>{notice.message}</span>
            </div>
          )}

          {!isAuthenticated ? (
            <EmptyState
              icon={<IconCustomer size={30} />}
              title={isAr ? 'سجّل الدخول لعرض عملاء مؤسستك' : 'Sign in to view your organization’s customers'}
              description={
                isAr
                  ? 'تُسترجَع سجلات العملاء ومؤشرات المخاطرة مباشرة من مساحة عمل مؤسستك بعد تسجيل الدخول.'
                  : 'Customer records and risk signals are loaded directly from your organization workspace after signing in.'
              }
              action={
                <button onClick={openAuthModal} className="ml-btn ml-btn--primary">
                  {isAr ? 'تسجيل الدخول' : 'Sign In'}
                </button>
              }
            />
          ) : (
            <>
              <div className="stat-grid">
                <div className="stat-tile">
                  <div className="stat-tile__label">{isAr ? 'الحسابات المراقَبة' : 'Monitored Accounts'}</div>
                  <div className="stat-tile__value">{counts.all}</div>
                  <div className="stat-tile__hint">
                    {isAr ? 'من سجلات العملاء في قاعدة بيانات المؤسسة' : 'From your organization’s customer records'}
                  </div>
                </div>
                <div className="stat-tile">
                  <div className="stat-tile__label">{isAr ? 'إيراد معرّض للمخاطرة' : 'Revenue at Risk'}</div>
                  <div className="stat-tile__value">
                    {totalRevenueAtRiskSAR.toLocaleString()} <span className="ml-muted" style={{ fontSize: 13 }}>{tenant?.currency || 'SAR'}</span>
                  </div>
                  <div className="stat-tile__hint">
                    {isAr ? 'مجموع مبالغ المخاطرة المسجلة' : 'Sum of recorded risk amounts'}
                  </div>
                </div>
                <div className="stat-tile">
                  <div className="stat-tile__label">{isAr ? 'مخاطر فقدان مرتفعة' : 'High Attrition Risk'}</div>
                  <div className="stat-tile__value">{counts.high}</div>
                  <div className="stat-tile__hint">
                    {isAr ? 'احتمالية فقدان تتجاوز 50%' : 'Churn probability above 50%'}
                  </div>
                </div>
              </div>

              {error ? (
                <EmptyState
                  icon={<IconRisk size={30} />}
                  title={isAr ? 'تعذّر تحميل سجلات العملاء' : 'Unable to load customer records'}
                  description={error}
                  action={
                    <button onClick={fetchCustomers} className="ml-btn ml-btn--primary">
                      {isAr ? 'إعادة المحاولة' : 'Retry'}
                    </button>
                  }
                />
              ) : (
                <>
                  <div className="page-filter-bar">
                    <div className="filter-group">
                      <IconFilter size={14} />
                      <span className="filter-label">{isAr ? 'حالة المخاطرة:' : 'Risk Status:'}</span>
                      <button onClick={() => setFilterRisk('all')} className={`filter-chip ${filterRisk === 'all' ? 'active' : ''}`}>
                        {isAr ? `الكل (${counts.all})` : `All (${counts.all})`}
                      </button>
                      <button onClick={() => setFilterRisk('high')} className={`filter-chip ${filterRisk === 'high' ? 'active' : ''}`}>
                        <span className="dot critical" />
                        {isAr ? `فقدان مرتفع (${counts.high})` : `High Attrition (${counts.high})`}
                      </button>
                      <button onClick={() => setFilterRisk('stable')} className={`filter-chip ${filterRisk === 'stable' ? 'active' : ''}`}>
                        <span className="dot high" />
                        {isAr ? `مستقر (${counts.stable})` : `Stable (${counts.stable})`}
                      </button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="skeleton-grid">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="skeleton-card" />
                      ))}
                    </div>
                  ) : filteredCustomers.length === 0 ? (
                    <EmptyState
                      icon={<IconCustomer size={30} />}
                      title={isAr ? 'لا توجد سجلات عملاء مطابقة' : 'No matching customer records'}
                      description={
                        isAr
                          ? 'تظهر سجلات العملاء هنا تلقائياً عند ربط حسابات مؤسستك ومزامنة سجلات التعاملات والعقود عبر مصادر البيانات التشغيلية.'
                          : 'Customer records appear here automatically once your organization’s accounts are connected and transaction and contract records are synced from your operational data sources.'
                      }
                    />
                  ) : (
                    <div className="record-list">
                      {filteredCustomers.map((c) => {
                        const name = isAr ? c.account_name_ar : c.account_name_en;
                        const churnPct = churnPctOf(c);
                        const highRisk = churnPct > 50;
                        const trend = c.volume_trend || '—';

                        return (
                          <div key={c.id} className="record-row">
                            <span className="vb-record-icon" aria-hidden="true">
                              <IconCustomer size={18} />
                            </span>

                            <div className="record-row__main">
                              <div className="vb-record-title-row">
                                <span className="record-row__title">{name}</span>
                                <span className={`vb-sev ${highRisk ? 'vb-sev--critical' : 'vb-sev--success'}`}>
                                  {highRisk
                                    ? (isAr ? 'فقدان مرتفع' : 'High Attrition')
                                    : (isAr ? 'حساب مستقر' : 'Stable')}
                                </span>
                                <span className="ml-badge">{c.code}</span>
                              </div>
                              <div className="record-row__meta">
                                <span className="vb-metric">
                                  <IconTrendingUp size={12} />
                                  {isAr ? 'وتيرة التعاملات:' : 'Volume Trend:'} {trend}
                                </span>
                                <span className="vb-metric">
                                  <IconRisk size={12} />
                                  {isAr ? 'احتمالية الفقدان:' : 'Churn Probability:'} {churnPct.toFixed(0)}%
                                </span>
                                <span className="vb-metric">
                                  <IconClock size={12} />
                                  {isAr ? 'التجديد:' : 'Renewal:'} {c.renewal_date || '—'}
                                </span>
                              </div>
                            </div>

                            <div className="vb-record-stats">
                              <span className="vb-stat">
                                <span className="k">{isAr ? 'إيراد معرّض للمخاطرة' : 'Revenue at Risk'}</span>
                                <span className="v">
                                  {(parseFloat(String(c.revenue_at_risk_sar)) || 0).toLocaleString()} {tenant?.currency || 'SAR'}
                                </span>
                              </span>
                            </div>

                            <div className="record-row__actions">
                              {c.review_scheduled ? (
                                <span className="ml-badge ml-badge--success">
                                  <IconCheck size={12} />
                                  {isAr ? 'مراجعة مجدولة' : 'Review Scheduled'}
                                </span>
                              ) : (
                                <button onClick={() => handleReviewAccount(c)} className="ml-btn ml-btn--subtle ml-btn--sm">
                                  <IconClock size={13} />
                                  {isAr ? 'جدولة مراجعة تنفيذية' : 'Schedule Executive Review'}
                                </button>
                              )}
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
    </div>
  );
};
