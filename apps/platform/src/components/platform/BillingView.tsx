// MIKHLAFI LABS — Subscription & Entitlements
// Plan, quota and consumption values are loaded exclusively from the billing
// endpoint. No placeholder plan, quota or invoice figures are ever rendered.

import React, { useCallback, useEffect, useState } from 'react';
import { LocaleMode } from '../../types';
import { IconCreditCard, IconRefresh, IconAlertTriangle } from '../Icons';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { EmptyState } from '../common/EmptyState';
import { PageHeader } from '../common/PageHeader';

interface BillingViewProps {
  locale: LocaleMode;
}

interface SubscriptionRecord {
  subscription_id?: string;
  status?: string;
  billing_interval?: string;
  current_period_start?: string;
  current_period_end?: string;
  package_id?: string;
  package_name_en?: string;
  package_name_ar?: string;
  monthly_price_sar?: string | number;
  annual_price_sar?: string | number;
  max_branches?: string | number;
  max_members?: string | number;
  monthly_record_limit?: string | number;
}

interface BillingData {
  subscription?: SubscriptionRecord;
  usage?: {
    monthlyRecordsUsed?: number;
    activeEnginesCount?: number;
    totalEnginesCount?: number;
  };
}

export const BillingView: React.FC<BillingViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated, tenant, openAuthModal } = useAuth();

  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBilling = useCallback(async () => {
    if (!isAuthenticated) {
      setBilling(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.getBillingDetails();
      setBilling(res);
    } catch (err) {
      setBilling(null);
      setError(err instanceof Error ? err.message : (isAr ? 'تعذر جلب بيانات الاشتراك.' : 'Unable to load subscription details.'));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAr]);

  useEffect(() => {
    fetchBilling();
  }, [fetchBilling, tenant?.organizationId]);

  const subscription = billing?.subscription || null;
  const usage = billing?.usage || null;
  const hasSubscription = Boolean(subscription && (subscription.subscription_id || subscription.package_id));

  const planName = subscription
    ? (isAr
        ? subscription.package_name_ar || subscription.package_name_en
        : subscription.package_name_en || subscription.package_name_ar)
    : undefined;

  const intervalLabel = (value?: string): string => {
    const v = (value || '').toLowerCase();
    if (v.includes('annual') || v.includes('year')) return isAr ? 'فوترة سنوية' : 'Annual billing';
    if (v.includes('quarter')) return isAr ? 'فوترة ربع سنوية' : 'Quarterly billing';
    if (v.includes('month')) return isAr ? 'فوترة شهرية' : 'Monthly billing';
    return value || '—';
  };

  const currency = tenant?.currency || 'SAR';
  const recordsUsed = Number(usage?.monthlyRecordsUsed);
  const recordsLimit = Number(subscription?.monthly_record_limit);
  const hasUsage = typeof usage?.monthlyRecordsUsed === 'number';
  const hasLimit = subscription?.monthly_record_limit !== undefined && subscription?.monthly_record_limit !== null;
  const percentage = hasLimit && recordsLimit > 0 && hasUsage
    ? Math.min(100, Math.round((recordsUsed / recordsLimit) * 100))
    : 0;

  const money = (value?: string | number): string => {
    if (value === undefined || value === null || value === '') return '—';
    const n = Number(value);
    if (isNaN(n)) return String(value);
    return `${n.toLocaleString(locale)} ${currency}`;
  };

  const enginesValue = (part: 'active' | 'total'): string => {
    const v = part === 'active' ? usage?.activeEnginesCount : usage?.totalEnginesCount;
    return typeof v === 'number' ? v.toLocaleString() : '—';
  };

  return (
    <div className="platform-page-container">
      <PageHeader
        locale={locale}
        icon={<IconCreditCard size={22} />}
        breadcrumb={[isAr ? 'المنصة' : 'Platform', isAr ? 'الإدارة والسيادة' : 'Administration']}
        title={isAr ? 'الاشتراك والاستحقاقات' : 'Subscription & Entitlements'}
        subtitle={
          isAr
            ? 'خطة مؤسستك الحالية، والاستهلاك مقابل الحدود المشمولة بها، والإمكانيات المتاحة لهذا العمل.'
            : 'Your organization’s current plan, its consumption against the included allowances, and the capabilities available to this workspace.'
        }
        action={
          hasSubscription && planName ? (
            <span className="ml-badge ml-badge--accent" style={{ fontSize: 13, padding: '7px 14px' }}>
              {planName}
            </span>
          ) : undefined
        }
      />

      {!isAuthenticated ? (
        <EmptyState
          icon={<IconCreditCard size={30} />}
          title={isAr ? 'سجّل الدخول لعرض اشتراك مؤسستك' : 'Sign in to view your organization’s subscription'}
          description={
            isAr
              ? 'تُسترجع خطة الاشتراك والاستحقاقات والاستهلاك مباشرة من مساحة عمل مؤسستك بعد تسجيل الدخول.'
              : 'Subscription plan, entitlements and consumption are loaded directly from your organization workspace after signing in.'
          }
          action={
            <button onClick={openAuthModal} className="ml-btn ml-btn--primary">
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </button>
          }
        />
      ) : loading ? (
        <div className="skeleton-grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={<IconAlertTriangle size={30} />}
          title={isAr ? 'تعذر جلب بيانات الاشتراك' : 'Unable to load subscription details'}
          description={error}
          action={
            <button onClick={() => fetchBilling()} className="ml-btn ml-btn--primary">
              <IconRefresh size={14} />
              <span>{isAr ? 'إعادة المحاولة' : 'Retry'}</span>
            </button>
          }
        />
      ) : !hasSubscription || !subscription ? (
        <EmptyState
          icon={<IconCreditCard size={30} />}
          title={isAr ? 'لا يوجد اشتراك مسجَّل لمؤسستك' : 'No subscription recorded for your organization'}
          description={
            isAr
              ? 'تظهر خطة الاشتراك والاستحقاقات والاستهلاك هنا فور إصدار اشتراك لهذه المساحة من قِبل منصة MIKHLAFI LABS.'
              : 'Your plan, entitlements and consumption appear here as soon as a subscription is issued for this workspace.'
          }
          action={
            <button onClick={() => fetchBilling()} className="ml-btn ml-btn--ghost">
              <IconRefresh size={14} />
              <span>{isAr ? 'تحديث' : 'Refresh'}</span>
            </button>
          }
        />
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-tile">
              <div className="stat-tile__label">{isAr ? 'حالة الاشتراك' : 'Subscription Status'}</div>
              <div className="stat-tile__value">{(subscription.status || '—').toUpperCase()}</div>
              <div className="stat-tile__hint">{intervalLabel(subscription.billing_interval)}</div>
            </div>

            <div className="stat-tile">
              <div className="stat-tile__label">{isAr ? 'سجلات معالَجة' : 'Records Processed'}</div>
              <div className="stat-tile__value">{hasUsage ? recordsUsed.toLocaleString(locale) : '—'}</div>
              <div className="stat-tile__hint">
                {hasLimit && hasUsage
                  ? isAr
                    ? `من ${recordsLimit.toLocaleString(locale)} سجل شهرياً`
                    : `of ${recordsLimit.toLocaleString(locale)} records per month`
                  : isAr
                    ? 'لا يوجد حد شهري مسجَّل'
                    : 'No monthly allowance recorded'}
              </div>
            </div>

            <div className="stat-tile">
              <div className="stat-tile__label">{isAr ? 'محركات الذكاء' : 'Intelligence Engines'}</div>
              <div className="stat-tile__value">
                {enginesValue('active')}
                <span style={{ fontSize: 15, color: 'var(--text-tertiary)' }}> / {enginesValue('total')}</span>
              </div>
              <div className="stat-tile__hint">{isAr ? 'مفعّلة من إجمالي المحركات' : 'active out of the available engines'}</div>
            </div>

            <div className="stat-tile">
              <div className="stat-tile__label">{isAr ? 'نهاية الفترة' : 'Period Ends'}</div>
              <div className="stat-tile__value" style={{ fontSize: 19 }}>
                {subscription.current_period_end
                  ? new Date(subscription.current_period_end).toLocaleDateString(locale)
                  : '—'}
              </div>
              <div className="stat-tile__hint">{isAr ? 'الفترة التعاقدية الحالية' : 'Current billing period'}</div>
            </div>
          </div>

          {hasLimit && (
            <section className="ml-panel">
              <div className="ml-panel__head">
                <div className="vc-title-group">
                  <div className="vc-title-group__title">
                    {isAr ? 'الاستهلاك مقابل حد الخطة' : 'Consumption against the plan allowance'}
                  </div>
                  <div className="vc-title-group__meta">
                    {hasUsage
                      ? isAr
                        ? `${recordsUsed.toLocaleString(locale)} من ${recordsLimit.toLocaleString(locale)} سجل`
                        : `${recordsUsed.toLocaleString(locale)} of ${recordsLimit.toLocaleString(locale)} records`
                      : isAr
                        ? 'لا توجد قراءة استهلاك مسجَّلة'
                        : 'No consumption reading recorded'}
                  </div>
                </div>
                <span className={`ml-badge ${percentage >= 90 ? 'ml-badge--warning' : 'ml-badge--accent'}`}>
                  {hasUsage ? `${percentage}%` : '—'}
                </span>
              </div>
              <div className="ml-panel__body vc-stack">
                <div className="vc-meter">
                  <div className="vc-meter__fill" style={{ width: `${hasUsage ? percentage : 0}%` }} />
                </div>
                <p className="vc-note">
                  {isAr
                    ? 'تُحتسب القراءة من السجلات التي عالجتها فعلياً مساحة عمل هذه المؤسسة وفق سجلات الاستهلاك لدى الخادم.'
                    : 'The reading is computed from the records this workspace has actually processed, according to the usage recorded by the server.'}
                </p>
              </div>
            </section>
          )}

          <section className="ml-panel">
            <div className="ml-panel__head">
              <div className="vc-title-group">
                <div className="vc-title-group__title">{isAr ? 'حدود الخطة والإمكانيات' : 'Plan limits & capabilities'}</div>
                <div className="vc-title-group__meta">{isAr ? 'من بيانات الاشتراك مباشرة' : 'Directly from the subscription record'}</div>
              </div>
            </div>
            <div className="ml-panel__body">
              <div className="vc-kv">
                <div className="vc-kv__item">
                  <span className="vc-kv__label">{isAr ? 'الخطة' : 'Package'}</span>
                  <span className="vc-kv__value">{planName || '—'}</span>
                </div>
                <div className="vc-kv__item">
                  <span className="vc-kv__label">{isAr ? 'الفوترة' : 'Billing interval'}</span>
                  <span className="vc-kv__value">{intervalLabel(subscription.billing_interval)}</span>
                </div>
                <div className="vc-kv__item">
                  <span className="vc-kv__label">{isAr ? 'حد الفروع' : 'Branch allowance'}</span>
                  <span className="vc-kv__value vc-kv__value--mono">
                    {subscription.max_branches !== undefined && subscription.max_branches !== null
                      ? Number(subscription.max_branches).toLocaleString(locale)
                      : '—'}
                  </span>
                </div>
                <div className="vc-kv__item">
                  <span className="vc-kv__label">{isAr ? 'حد الأعضاء' : 'Member allowance'}</span>
                  <span className="vc-kv__value vc-kv__value--mono">
                    {subscription.max_members !== undefined && subscription.max_members !== null
                      ? Number(subscription.max_members).toLocaleString(locale)
                      : '—'}
                  </span>
                </div>
                <div className="vc-kv__item">
                  <span className="vc-kv__label">{isAr ? 'حد السجلات الشهرية' : 'Monthly record allowance'}</span>
                  <span className="vc-kv__value vc-kv__value--mono">
                    {hasLimit ? recordsLimit.toLocaleString(locale) : '—'}
                  </span>
                </div>
                <div className="vc-kv__item">
                  <span className="vc-kv__label">{isAr ? 'السعر الشهري' : 'Monthly price'}</span>
                  <span className="vc-kv__value vc-kv__value--mono">{money(subscription.monthly_price_sar)}</span>
                </div>
                <div className="vc-kv__item">
                  <span className="vc-kv__label">{isAr ? 'السعر السنوي' : 'Annual price'}</span>
                  <span className="vc-kv__value vc-kv__value--mono">{money(subscription.annual_price_sar)}</span>
                </div>
                <div className="vc-kv__item">
                  <span className="vc-kv__label">{isAr ? 'معرف الاشتراك' : 'Subscription ID'}</span>
                  <span className="vc-kv__value vc-kv__value--mono">{subscription.subscription_id || '—'}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="ml-panel">
            <div className="ml-panel__head">
              <div className="vc-title-group">
                <div className="vc-title-group__title">{isAr ? 'الفواتير ووثائق الفوترة' : 'Invoices & billing documents'}</div>
                <div className="vc-title-group__meta">{isAr ? 'سجل الوثائق الصادرة' : 'Issued documents'}</div>
              </div>
            </div>
            <div className="ml-panel__body">
              <EmptyState
                compact
                icon={<IconCreditCard size={30} />}
                title={isAr ? 'لا توجد وثائق فوترة صادرة بعد' : 'No billing documents issued yet'}
                description={
                  isAr
                    ? 'لا تملك هذه المساحة أي فاتورة صادرة حالياً. تظهر الوثائق هنا تلقائياً بمجرد إصدارها لهذه المؤسسة.'
                    : 'This workspace currently has no issued invoices to display. Documents appear here automatically once they are issued for your organization.'
                }
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
};
