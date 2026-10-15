import React, { useState, useEffect } from 'react';
import { LocaleMode } from '../../types';
import { IconSettings, IconCheck, IconAlertTriangle } from '../Icons';
import { api } from '../../api/client';

interface SettingsViewProps {
  locale: LocaleMode;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const [currency, setCurrency] = useState('SAR');
  const [calendar, setCalendar] = useState('gregorian');
  const [retention, setRetention] = useState('7years');
  const [classification, setClassification] = useState('RESTRICTED');
  const [encryptionStandard, setEncryptionStandard] = useState('AES-256-GCM');
  const [saveNotice, setSaveNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    api.getSettings()
      .then((data) => {
        if (data) {
          if (data.base_currency) setCurrency(data.base_currency);
          if (data.calendar_standard) setCalendar(data.calendar_standard);
          if (data.retention_policy) setRetention(data.retention_policy);
          if (data.data_classification) setClassification(data.data_classification);
          if (data.encryption_standard) setEncryptionStandard(data.encryption_standard);
        }
      })
      .catch((err) => {
        setSaveNotice({
          type: 'error',
          message: err.message || (isAr ? 'تعذر جلب إعدادات مساحة العمل' : 'Failed to load workspace settings')
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAr]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveNotice(null);
    try {
      const res = (await api.updateSettings({
        currency,
        calendar,
        retention,
        dataClassification: classification
      })) as any;
      if (res.success) {
        setSaveNotice({
          type: 'success',
          message: isAr
            ? 'تم حفظ تفضيلات مساحة العمل (العملة المرجعية، التقويم، وسياسة حفظ السجلات) بنجاح.'
            : 'Workspace preferences (base currency, calendar, retention policy) saved successfully.'
        });
      }
    } catch (err: any) {
      setSaveNotice({
        type: 'error',
        message: err.message || (isAr ? 'فشل حفظ الإعدادات.' : 'Failed to save settings.')
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveNotice(null), 4500);
    }
  };

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
            <span className="current">{isAr ? 'إعدادات المنظومة' : 'Workspace Settings'}</span>
          </div>
          <h1 className="page-title">
            <IconSettings size={24} />
            <span>{isAr ? 'إعدادات المنظومة والسيادة التشغيلية' : 'Platform & Governance Settings'}</span>
          </h1>
          <p className="page-subtitle">
            {isAr
              ? 'تخصيص العملة المرجعية، تقويم التقارير، مدة حفظ سجلات التدقيق الجنائي، ومراجعة خصائص التشفير المدارة بنيوياً.'
              : 'Configure base accounting currency, reporting calendars, immutable audit retention windows, and review infrastructure encryption.'}
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="btn-primary"
          style={{ fontSize: '13px', padding: '10px 18px' }}
        >
          <IconCheck size={14} />
          <span>{isSaving ? (isAr ? 'جارِ الحفظ...' : 'Saving...') : (isAr ? 'حفظ التعديلات' : 'Save Changes')}</span>
        </button>
      </div>

      {saveNotice && (
        <div className={`alert-feedback-banner ${saveNotice.type === 'error' ? 'error' : 'success'}`}>
          {saveNotice.type === 'error' ? <IconAlertTriangle size={16} /> : <IconCheck size={16} />}
          <span>{saveNotice.message}</span>
        </div>
      )}

      {/* Settings Form Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', maxWidth: '800px' }}>
        {/* 1. Base Currency */}
        <div className="decision-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '14px', margin: 0 }}>
              {isAr ? 'العملة المرجعية للمحاسبة والتقارير' : 'Base Accounting Currency'}
            </h3>
            <span className="category-pill" style={{ fontSize: '11px' }}>
              {isAr ? 'قابل للتخصيص' : 'Configurable'}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            {isAr
              ? 'تُعاير كافة الانحرافات المالية والأسعار المسجلة في ERP إلى هذه العملة تلقائياً.'
              : 'All ERP variances, invoices, and detected leakage will normalize to this reporting currency.'}
          </p>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{
              padding: '10px 14px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
              maxWidth: '300px'
            }}
          >
            <option value="SAR">SAR — ريال سعودي (Saudi Riyal)</option>
            <option value="USD">USD — دولار أمريكي (US Dollar)</option>
            <option value="EUR">EUR — يورو أوروبي (Euro)</option>
            <option value="AED">AED — درهم إماراتي (UAE Dirham)</option>
          </select>
        </div>

        {/* 2. Reporting Calendar */}
        <div className="decision-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '14px', margin: 0 }}>
              {isAr ? 'تقويم عرض الفترات والتقارير' : 'Reporting Calendar'}
            </h3>
            <span className="category-pill" style={{ fontSize: '11px' }}>
              {isAr ? 'قابل للتخصيص' : 'Configurable'}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            {isAr
              ? 'تحديد نمط التاريخ الافتراضي في لوحات القيادة والتقارير التنفيذية.'
              : 'Primary calendar standard for executive dashboards and audit logs.'}
          </p>
          <select
            value={calendar}
            onChange={(e) => setCalendar(e.target.value)}
            style={{
              padding: '10px 14px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
              maxWidth: '300px'
            }}
          >
            <option value="gregorian">{isAr ? 'التقويم الميلادي (Gregorian)' : 'Gregorian Calendar'}</option>
            <option value="hijri">{isAr ? 'التقويم الهجري الرسمي (Hijri Umm al-Qura)' : 'Hijri (Umm al-Qura)'}</option>
          </select>
        </div>

        {/* 3. Audit Log Retention */}
        <div className="decision-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '14px', margin: 0 }}>
              {isAr ? 'مدة حفظ السجلات والتدقيق الجنائي المحاسبي' : 'Forensic Audit Log Retention Policy'}
            </h3>
            <span className="category-pill" style={{ fontSize: '11px' }}>
              {isAr ? 'سياسة نظامية' : 'Statutory Policy'}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            {isAr
              ? 'فترة الاحتفاظ غير القابلة للحذف أو التعديل تماشياً مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA).'
              : 'Immutable record retention window adhering to ZATCA and statutory tax compliance.'}
          </p>
          <select
            value={retention}
            onChange={(e) => setRetention(e.target.value)}
            style={{
              padding: '10px 14px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
              maxWidth: '300px'
            }}
          >
            <option value="7years">{isAr ? '7 سنوات (المعيار النظامي في المملكة العربية السعودية)' : '7 Years (Saudi Statutory Standard)'}</option>
            <option value="10years">{isAr ? '10 سنوات (القطاعات الاستراتيجية والمالية)' : '10 Years (Strategic & Banking)'}</option>
            <option value="permanent">{isAr ? 'حفظ دائم مشفر (Permanent Cold Archive)' : 'Permanent Encrypted Cold Storage'}</option>
          </select>
        </div>

        {/* 4. Cryptographic Security & Sovereignty (Read-Only Infrastructure Property) */}
        <div className="decision-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '14px', margin: 0 }}>
              {isAr ? 'بروتوكول التشفير والسيادة' : 'Cryptographic Security & Sovereignty Standard'}
            </h3>
            <span className="severity-tag optimal" style={{ fontSize: '11px' }}>
              {isAr ? 'مدار بنيوياً (قراءة فقط)' : 'Infrastructure Enforced (Read-Only)'}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            {isAr
              ? 'خاصية أمان بنيوية تفرض تشفير كافة السجلات في السكون (At Rest) عبر AES-256-GCM وأثناء النقل عبر TLS 1.3. تدار المفاتيح عبر بنية KMS السحابية المعزولة ولا تخضع للتعديل البرمجي عبر الواجهة.'
              : 'Infrastructure security property: All records are strictly encrypted at rest via AES-256-GCM and in transit via TLS 1.3. Cryptographic keys are managed via isolated KMS infrastructure and cannot be overridden from the client.'}
          </p>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span className="severity-tag optimal" style={{ fontSize: '12px', padding: '6px 12px' }}>
              {encryptionStandard} / TLS 1.3
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {isAr ? 'مفاتيح سيادية معزولة لكل مستأجر' : 'Hardware-Secured Sovereign Tenant Keys'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
