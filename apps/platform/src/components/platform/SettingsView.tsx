// MIKHLAFI LABS — Workspace Settings
// Settings are loaded from and persisted to the authenticated backend only.
// Saving reflects the API response; failures surface the server's real error.

import React, { useCallback, useEffect, useState } from 'react';
import { LocaleMode } from '../../types';
import { IconSettings, IconCheck, IconAlertTriangle, IconLock, IconRefresh } from '../Icons';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { EmptyState } from '../common/EmptyState';
import { PageHeader } from '../common/PageHeader';

interface SettingsViewProps {
  locale: LocaleMode;
}

interface SettingsRecord {
  organization_id?: string;
  base_currency?: string;
  calendar_standard?: string;
  retention_policy?: string;
  data_classification?: string;
  encryption_standard?: string;
  encryption_managed_by?: string;
}

interface Notice {
  message: string;
  type: 'success' | 'error';
}

export const SettingsView: React.FC<SettingsViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated, tenant, openAuthModal } = useAuth();

  const [settings, setSettings] = useState<SettingsRecord | null>(null);
  const [currency, setCurrency] = useState<string>('SAR');
  const [calendar, setCalendar] = useState<string>('gregorian');
  const [retention, setRetention] = useState<string>('7years');
  const [classification, setClassification] = useState<string>('RESTRICTED');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const applySettings = (data: SettingsRecord) => {
    setSettings(data);
    setCurrency(data.base_currency || 'SAR');
    setCalendar(data.calendar_standard || 'gregorian');
    setRetention(data.retention_policy || '7years');
    setClassification(data.data_classification || 'RESTRICTED');
  };

  const loadSettings = useCallback(async () => {
    if (!isAuthenticated) {
      setSettings(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = (await api.getSettings()) as SettingsRecord | null;
      if (!data) {
        throw new Error(isAr ? 'لم يُرجَع أي إعدادات لهذه المساحة.' : 'No settings were returned for this workspace.');
      }
      applySettings(data);
    } catch (err) {
      setSettings(null);
      setError(
        err instanceof Error && err.message
          ? err.message
          : (isAr ? 'تعذر جلب إعدادات مساحة العمل.' : 'Unable to load workspace settings.')
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAr]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings, tenant?.organizationId]);

  const handleSave = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      const res = await api.updateSettings({
        currency,
        calendar,
        retention,
        dataClassification: classification
      });
      if (res && res.success) {
        await loadSettings();
        setNotice({
          type: 'success',
          message: isAr
            ? 'تم حفظ إعدادات مساحة العمل واعتمادها في الخادم.'
            : 'Workspace settings saved and applied on the server.'
        });
      } else {
        setNotice({
          type: 'error',
          message: isAr ? 'لم يؤكد الخادم حفظ الإعدادات.' : 'The server did not confirm the settings change.'
        });
      }
    } catch (err) {
      setNotice({
        type: 'error',
        message: err instanceof Error && err.message
          ? err.message
          : (isAr ? 'تعذر حفظ الإعدادات.' : 'Settings could not be saved.')
      });
    } finally {
      setSaving(false);
      setTimeout(() => setNotice(null), 5000);
    }
  };

  return (
    <div className="platform-page-container">
      <PageHeader
        locale={locale}
        icon={<IconSettings size={22} />}
        breadcrumb={[isAr ? 'المنصة' : 'Platform', isAr ? 'الإدارة والسيادة' : 'Administration']}
        title={isAr ? 'إعدادات مساحة العمل' : 'Workspace Settings'}
        subtitle={
          isAr
            ? 'تفضيلات العرض والتقارير، سياسة حفظ السجلات، والوضع الأمني المطبَّق على هذه المساحة.'
            : 'Reporting preferences, record retention policy, and the security posture applied to this workspace.'
        }
        action={
          isAuthenticated && !loading && !error ? (
            <button onClick={handleSave} disabled={saving} className="ml-btn ml-btn--primary ml-btn--sm">
              {saving ? <IconRefresh size={14} className="spin" /> : <IconCheck size={14} />}
              <span>{saving ? (isAr ? 'جارِ الحفظ…' : 'Saving…') : (isAr ? 'حفظ التعديلات' : 'Save changes')}</span>
            </button>
          ) : undefined
        }
      />

      {notice && (
        <div className={`alert-feedback-banner ${notice.type === 'error' ? 'error' : 'success'}`}>
          {notice.type === 'error' ? <IconAlertTriangle size={16} /> : <IconCheck size={16} />}
          <span>{notice.message}</span>
        </div>
      )}

      {!isAuthenticated ? (
        <EmptyState
          icon={<IconSettings size={30} />}
          title={isAr ? 'سجّل الدخول لعرض إعدادات المساحة' : 'Sign in to view workspace settings'}
          description={
            isAr
              ? 'تُسترجع الإعدادات مباشرة من مساحة عمل مؤسستك بعد تسجيل الدخول، ويمكنك حفظها من هناك.'
              : 'Settings are loaded directly from your organization workspace after signing in, where you can also save changes.'
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
          title={isAr ? 'تعذر جلب إعدادات مساحة العمل' : 'Unable to load workspace settings'}
          description={error}
          action={
            <button onClick={() => loadSettings()} className="ml-btn ml-btn--primary">
              <IconRefresh size={14} />
              <span>{isAr ? 'إعادة المحاولة' : 'Retry'}</span>
            </button>
          }
        />
      ) : (
        <>
          <div className="vc-panel-grid">
            <section className="ml-panel">
              <div className="ml-panel__head">
                <div className="vc-title-group">
                  <div className="vc-title-group__title">{isAr ? 'التقارير والعرض' : 'Reporting & display'}</div>
                  <div className="vc-title-group__meta">{isAr ? 'يُحفظ في الخادم' : 'Persisted on the server'}</div>
                </div>
              </div>
              <div className="ml-panel__body vc-fields">
                <div className="ml-field">
                  <label className="ml-label" htmlFor="vc-setting-currency">
                    {isAr ? 'العملة المرجعية' : 'Base currency'}
                  </label>
                  <select
                    id="vc-setting-currency"
                    className="ml-select"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="SAR">SAR — ريال سعودي (Saudi Riyal)</option>
                    <option value="USD">USD — دولار أمريكي (US Dollar)</option>
                    <option value="EUR">EUR — يورو (Euro)</option>
                    <option value="AED">AED — درهم إماراتي (UAE Dirham)</option>
                  </select>
                  <span className="ml-hint">
                    {isAr
                      ? 'العملة التي تُعرض وتُعاير بها قيم هذه المساحة في التقارير.'
                      : 'The currency in which this workspace’s values are presented and normalized in reports.'}
                  </span>
                </div>

                <div className="ml-field">
                  <label className="ml-label" htmlFor="vc-setting-calendar">
                    {isAr ? 'تقويم التقارير' : 'Reporting calendar'}
                  </label>
                  <select
                    id="vc-setting-calendar"
                    className="ml-select"
                    value={calendar}
                    onChange={(e) => setCalendar(e.target.value)}
                  >
                    <option value="gregorian">{isAr ? 'الميلادي (Gregorian)' : 'Gregorian'}</option>
                    <option value="hijri">{isAr ? 'الهجري — أم القرى (Hijri Umm al-Qura)' : 'Hijri (Umm al-Qura)'}</option>
                  </select>
                  <span className="ml-hint">
                    {isAr
                      ? 'يُستخدم في عرض التواريخ داخل اللوحات والتقارير.'
                      : 'Used when rendering dates across dashboards and reports.'}
                  </span>
                </div>
              </div>
            </section>

            <section className="ml-panel">
              <div className="ml-panel__head">
                <div className="vc-title-group">
                  <div className="vc-title-group__title">{isAr ? 'السجلات والتصنيف' : 'Records & classification'}</div>
                  <div className="vc-title-group__meta">{isAr ? 'يُحفظ في الخادم' : 'Persisted on the server'}</div>
                </div>
              </div>
              <div className="ml-panel__body vc-fields">
                <div className="ml-field">
                  <label className="ml-label" htmlFor="vc-setting-retention">
                    {isAr ? 'مدة حفظ السجلات' : 'Record retention period'}
                  </label>
                  <select
                    id="vc-setting-retention"
                    className="ml-select"
                    value={retention}
                    onChange={(e) => setRetention(e.target.value)}
                  >
                    <option value="7years">{isAr ? '7 سنوات' : '7 years'}</option>
                    <option value="10years">{isAr ? '10 سنوات' : '10 years'}</option>
                    <option value="permanent">{isAr ? 'حفظ دائم' : 'Permanent'}</option>
                  </select>
                  <span className="ml-hint">
                    {isAr
                      ? 'المدة التي تُحتفظ بها سجلات التدقيق لهذه المساحة قبل الأرشفة.'
                      : 'How long this workspace’s audit records are retained before archival.'}
                  </span>
                </div>

                <div className="ml-field">
                  <label className="ml-label" htmlFor="vc-setting-classification">
                    {isAr ? 'تصنيف البيانات' : 'Data classification'}
                  </label>
                  <select
                    id="vc-setting-classification"
                    className="ml-select"
                    value={classification}
                    onChange={(e) => setClassification(e.target.value)}
                  >
                    <option value="RESTRICTED">{isAr ? 'مقيد (Restricted)' : 'Restricted'}</option>
                    <option value="CONFIDENTIAL">{isAr ? 'سري (Confidential)' : 'Confidential'}</option>
                    <option value="INTERNAL">{isAr ? 'داخلي (Internal)' : 'Internal'}</option>
                  </select>
                  <span className="ml-hint">
                    {isAr
                      ? 'يُطبَّق على وصولات الأعضاء وتصدير بيانات هذه المساحة.'
                      : 'Applied to member access and data exports for this workspace.'}
                  </span>
                </div>
              </div>
            </section>

            <section className="ml-panel">
              <div className="ml-panel__head">
                <div className="vc-title-group">
                  <div className="vc-title-group__title">{isAr ? 'الوضع الأمني' : 'Security posture'}</div>
                  <div className="vc-title-group__meta">
                    {isAr ? 'خاصية بنيوية — قراءة فقط' : 'Infrastructure property — read-only'}
                  </div>
                </div>
                <span className="ml-badge ml-badge--success">
                  <IconLock size={12} />
                  {isAr ? 'مُدار' : 'Managed'}
                </span>
              </div>
              <div className="ml-panel__body vc-stack vc-stack--tight">
                <div className="vc-kv">
                  <div className="vc-kv__item">
                    <span className="vc-kv__label">{isAr ? 'معيار التشفير' : 'Encryption standard'}</span>
                    <span className="vc-kv__value vc-kv__value--mono">
                      {settings?.encryption_standard || '—'}
                    </span>
                  </div>
                  <div className="vc-kv__item">
                    <span className="vc-kv__label">{isAr ? 'إدارة المفاتيح' : 'Key management'}</span>
                    <span className="vc-kv__value vc-kv__value--mono">
                      {settings?.encryption_managed_by || '—'}
                    </span>
                  </div>
                  <div className="vc-kv__item">
                    <span className="vc-kv__label">{isAr ? 'مساحة العمل' : 'Workspace'}</span>
                    <span className="vc-kv__value">
                      {tenant ? (isAr ? tenant.orgNameAr || tenant.orgNameEn : tenant.orgNameEn) : '—'}
                    </span>
                  </div>
                  <div className="vc-kv__item">
                    <span className="vc-kv__label">{isAr ? 'دورك' : 'Your role'}</span>
                    <span className="vc-kv__value vc-kv__value--mono">
                      {(tenant?.role || '—').toUpperCase()}
                    </span>
                  </div>
                </div>
                <p className="vc-note">
                  {isAr
                    ? 'تُشفَّر السجلات أثناء التخزين أثناء النقل أيضاً، وتُدار مفاتيح التشفير على مستوى البنية — لا يمكن تغييرها من هذه الواجهة.'
                    : 'Records are encrypted in transit as well as at rest, and cryptographic keys are managed at the infrastructure level — they cannot be changed from this screen.'}
                </p>
              </div>
            </section>
          </div>

          <div className="vc-header-actions">
            <button onClick={() => loadSettings()} disabled={saving} className="ml-btn ml-btn--ghost">
              <IconRefresh size={14} />
              <span>{isAr ? 'إعادة تحميل الإعدادات' : 'Reload settings'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
