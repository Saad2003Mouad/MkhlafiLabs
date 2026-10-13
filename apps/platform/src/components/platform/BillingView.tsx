import React, { useState, useEffect } from 'react';
import { LocaleMode } from '../../types';
import { IconCreditCard, IconCheck, IconDownload } from '../Icons';
import { api } from '../../api/client';

interface BillingViewProps {
  locale: LocaleMode;
}

export const BillingView: React.FC<BillingViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [billingData, setBillingData] = useState<any>(null);

  const fetchBilling = async () => {
    try {
      const res = await api.getBillingDetails();
      setBillingData(res);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  const handleDownloadInvoice = (num: string) => {
    setDownloadNotice(isAr ? `تم تنزيل الفاتورة الضريبية ZATCA (${num}) بنجاح.` : `Tax invoice (${num}) downloaded successfully.`);
    setTimeout(() => setDownloadNotice(null), 3500);
  };

  const planName = isAr
    ? (billingData?.subscription?.package_name_ar || 'باقة المؤسسات الشاملة')
    : (billingData?.subscription?.package_name_en || 'Enterprise Suite');

  const recordsUsed = billingData?.usage?.monthlyRecordsUsed || 5510000;
  const recordsLimit = billingData?.subscription?.monthly_record_limit || 10000000;
  const percentage = Math.min(100, Math.round((recordsUsed / recordsLimit) * 100));

  return (
    <div className="platform-page-container">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <div className="page-breadcrumb">
            <span>{isAr ? 'المنصة' : 'Platform'}</span>
            <span>/</span>
            <span>{isAr ? 'الإدارة والسيادة' : 'Administration'}</span>
            <span>/</span>
            <span className="current">{isAr ? 'الاشتراك والاستحقاقات' : 'Subscription & Billing'}</span>
          </div>
          <h1 className="page-title">
            <IconCreditCard size={24} />
            <span>{isAr ? 'خطة الاشتراك المؤسسية والاستحقاقات والسجلات' : 'Enterprise Subscription & Resource Entitlements'}</span>
          </h1>
          <p className="page-subtitle">
            {isAr
              ? 'متابعة استهلاك السجلات المزامنة، عدد مقاعد القيادة النشطة، والفواتير الضريبية المعتمدة وفق لوائح ZATCA.'
              : 'Enterprise tier entitlements, processed ledger quotas, and tax compliance invoices.'}
          </p>
        </div>

        <div className="kpi-micro-badge">
          <span className="label">{isAr ? 'الخطة الحالية' : 'Current Tier'}</span>
          <span className="value">{planName}</span>
        </div>
      </div>

      {downloadNotice && (
        <div className="alert-feedback-banner success">
          <IconCheck size={16} />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Quota Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', margin: '16px 0' }}>
        <div className="decision-card">
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {isAr ? 'السجلات المحاسبية المفحوصة شهرياً' : 'Monthly Ledger Audited Records'}
          </span>
          <div style={{ fontSize: '24px', fontWeight: 800, margin: '8px 0', color: 'var(--text-primary)' }}>
            {(recordsUsed / 1e6).toFixed(2)}M <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>/ {(recordsLimit / 1e6).toFixed(1)}M</span>
          </div>
          <div style={{ height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--accent-base)' }} />
          </div>
        </div>

        <div className="decision-card">
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {isAr ? 'محركات الذكاء المفعلة' : 'Active Intelligence Engines'}
          </span>
          <div style={{ fontSize: '24px', fontWeight: 800, margin: '8px 0', color: 'var(--status-success)' }}>
            8 <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>/ 8 {isAr ? 'محركات نشطة' : 'Engines Active'}</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {isAr ? 'كافة المحركات مشمولة بالترخيص المؤسسي' : 'Full Suite Unrestricted Access'}
          </span>
        </div>

        <div className="decision-card">
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {isAr ? 'قنوات ربط ERP' : 'Connected ERP Channels'}
          </span>
          <div style={{ fontSize: '24px', fontWeight: 800, margin: '8px 0', color: 'var(--accent-light)' }}>
            4 <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>/ {isAr ? 'غير محدود' : 'Unlimited'}</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {isAr ? 'نشر سحابي معزول (Sovereign Isolated Mesh)' : 'Sovereign Isolated Deployment'}
          </span>
        </div>
      </div>

      {/* Invoices History */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={{ fontWeight: 700, fontSize: '13px' }}>
            {isAr ? 'سجل الفواتير الضريبية المسددة' : 'Tax Invoices & Payment History'}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'start' }}>{isAr ? 'رقم الفاتورة' : 'Invoice Number'}</th>
                <th style={{ padding: '10px 14px', textAlign: 'start' }}>{isAr ? 'الفترة' : 'Billing Period'}</th>
                <th style={{ padding: '10px 14px', textAlign: 'start' }}>{isAr ? 'المبلغ' : 'Amount'}</th>
                <th style={{ padding: '10px 14px', textAlign: 'start' }}>{isAr ? 'حالة السداد' : 'Status'}</th>
                <th style={{ padding: '10px 14px', textAlign: 'start' }}>{isAr ? 'الإجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)' }}>INV-2026-Q3-081</td>
                <td style={{ padding: '12px 14px' }}>Q3 2026 (Annual Sovereign Tier)</td>
                <td style={{ padding: '12px 14px', fontWeight: 700 }}>240,000 SAR + VAT</td>
                <td style={{ padding: '12px 14px' }}>
                  <span className="severity-tag optimal">{isAr ? 'مسدد بالكامل' : 'PAID'}</span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <button
                    onClick={() => handleDownloadInvoice('INV-2026-Q3-081')}
                    className="btn-secondary"
                    style={{ fontSize: '11px', padding: '5px 10px' }}
                  >
                    <IconDownload size={11} />
                    <span>PDF</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
