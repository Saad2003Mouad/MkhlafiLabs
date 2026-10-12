import React, { useState } from 'react';
import { LocaleMode } from '../../types';
import { IconSettings, IconCheck } from '../Icons';

interface SettingsViewProps {
  locale: LocaleMode;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const [currency, setCurrency] = useState('SAR');
  const [calendar, setCalendar] = useState('gregorian');
  const [retention, setRetention] = useState('7years');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const handleSave = () => {
    setSaveNotice(isAr ? 'تم حفظ تفضيلات مساحة العمل وتحديث إعدادات التشفير بنجاح.' : 'Workspace configuration saved successfully.');
    setTimeout(() => setSaveNotice(null), 3500);
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

        <button onClick={handleSave} className="btn-primary" style={{ fontSize: '13px', padding: '10px 18px' }}>
          <IconCheck size={14} />
          <span>{isAr ? 'حفظ التعديلات' : 'Save Changes'}</span>
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
            <option value="gregorian">{isAr ? 'التقويم الميلادي (Gregorian)' : 'Gregorian'}</option>
            <option value="hijri">{isAr ? 'تقويم أم القرى (Umm Al-Qura Hijri)' : 'Umm Al-Qura Hijri'}</option>
          </select>
        </div>

        <div className="decision-card">
          <h3 style={{ fontSize: '14px', margin: '0 0 12px' }}>
            {isAr ? 'فترة استبقاء سجلات التدقيق الجنائي (Data Retention)' : 'Audit Trail Retention Window'}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            {isAr
              ? 'المدة الزمنية الملزمة نظاماً لحفظ البصمات المشفرة SHA-256 قبل الأرشفة الباردة.'
              : 'Mandated storage window for immutable SHA-256 audit hashes prior to cold storage.'}
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
            <option value="5years">{isAr ? '5 سنوات (امتثال قياسي)' : '5 Years (Standard Compliance)'}</option>
            <option value="7years">{isAr ? '7 سنوات (الشركات الكبرى واللوائح المالية)' : '7 Years (Statutory Corporate)'}</option>
            <option value="10years">{isAr ? '10 سنوات (سيادة كاملة بدون حذف)' : '10 Years (Permanent Sovereign Archive)'}</option>
          </select>
        </div>
      </div>
    </div>
  );
};
