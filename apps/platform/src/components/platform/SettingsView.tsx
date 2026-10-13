import React, { useState, useEffect } from 'react';
import { LocaleMode } from '../../types';
import { IconSettings, IconCheck } from '../Icons';
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
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
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
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.updateSettings({
        currency,
        calendar,
        retention,
        dataClassification: classification
      });
      if (res.success) {
        setSaveNotice(isAr ? 'تم حفظ تفضيلات مساحة العمل وتحديث إعدادات التشفير والسيادة بنجاح.' : 'Workspace configuration saved successfully.');
      }
    } catch (err: any) {
      setSaveNotice(err.message || 'Save failed.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveNotice(null), 3500);
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
              ? 'تخصيص العملة المرجعية، تقويم التقارير، مدة حفظ سجلات التدقيق الجنائي، ومفاتيح التشفير.'
              : 'Configure base accounting currency, reporting calendars, immutable audit retention windows, and cryptographic keys.'}
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary"
          style={{ fontSize: '13px', padding: '10px 18px' }}
        >
          <IconCheck size={14} />
          <span>{isSaving ? (isAr ? 'جارِ الحفظ...' : 'Saving...') : (isAr ? 'حفظ التعديلات' : 'Save Changes')}</span>
        </button>
      </div>

      {saveNotice && (
        <div className="alert-feedback-banner success">
          <IconCheck size={16} />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Settings Form Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', maxWidth: '800px' }}>
        <div className="decision-card">
          <h3 style={{ fontSize: '14px', margin: '0 0 12px' }}>
            {isAr ? 'العملة المرجعية للمحاسبة والتقارير' : 'Base Accounting Currency'}
          </h3>
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

        <div className="decision-card">
          <h3 style={{ fontSize: '14px', margin: '0 0 12px' }}>
            {isAr ? 'تقويم عرض الفترات والتقارير' : 'Reporting Calendar'}
          </h3>
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

        <div className="decision-card">
          <h3 style={{ fontSize: '14px', margin: '0 0 12px' }}>
            {isAr ? 'مدة حفظ السجلات والتدقيق الجنائي المحاسبي' : 'Forensic Audit Log Retention'}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            {isAr
              ? 'فترة الاحتفاظ غير القابلة للحذف أو التعديل تماشياً مع متطلبات هيئة الزكاة والضريبة والجمارك.'
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

        <div className="decision-card">
          <h3 style={{ fontSize: '14px', margin: '0 0 12px' }}>
            {isAr ? 'بروتوكول التشفير والسيادة' : 'Cryptographic Security & Sovereignty Standard'}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            {isAr
              ? 'تشفير كافة السجلات والاتصالات في السكون وأثناء النقل.'
              : 'Cryptographic encryption standard enforced for all ledger records at rest and in transit.'}
          </p>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span className="severity-tag optimal" style={{ fontSize: '12px', padding: '6px 12px' }}>
              {encryptionStandard}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {isAr ? 'مفاتيح مدارة محلياً بعزل كامل' : 'Customer-Isolated Sovereign Keys'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
