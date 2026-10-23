// MIKHLAFI LABS — Workspace Settings
// Settings are loaded from and persisted to the authenticated backend only.
// Saving reflects the API response; failures surface the server's real error.

import React, { useCallback, useEffect, useState } from 'react';
import { LocaleMode } from '../../types';
import { IconSettings, IconCheck, IconAlertTriangle, IconLock, IconRefresh, IconAssistant, IconShield } from '../Icons';
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
  const [currency, setCurrency] = useState<string>('YER');
  const [calendar, setCalendar] = useState<string>('gregorian');
  const [retention, setRetention] = useState<string>('7years');
  const [classification, setClassification] = useState<string>('RESTRICTED');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  // AI Copilot Persona & Executive Powers state
  const [aiName, setAiName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('mikhlafi_ai_assistant_settings');
      if (saved) return JSON.parse(saved).name || 'فطين';
    } catch {}
    return 'فطين';
  });

  const [aiTone, setAiTone] = useState<'witty_human' | 'strict_executive' | 'forensic_auditor'>(() => {
    try {
      const saved = localStorage.getItem('mikhlafi_ai_assistant_settings');
      if (saved) return JSON.parse(saved).tone || 'witty_human';
    } catch {}
    return 'witty_human';
  });

  const [aiPermissions, setAiPermissions] = useState<{
    canFreezeDisbursements: boolean;
    canGenerateReports: boolean;
    canDraftDecisions: boolean;
    canSimulateScenarios: boolean;
    canScanLedger: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem('mikhlafi_ai_assistant_settings');
      if (saved && JSON.parse(saved).permissions) return JSON.parse(saved).permissions;
    } catch {}
    return {
      canFreezeDisbursements: true,
      canGenerateReports: true,
      canDraftDecisions: true,
      canSimulateScenarios: true,
      canScanLedger: true
    };
  });

  const [aiCustomDirectives, setAiCustomDirectives] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('mikhlafi_ai_assistant_settings');
      if (saved) return JSON.parse(saved).customDirectives || '';
    } catch {}
    return '';
  });

  const applySettings = (data: SettingsRecord) => {
    setSettings(data);
    setCurrency(data.base_currency || 'YER');
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
      // Persist AI Copilot Persona settings locally
      const aiConfig = {
        name: aiName,
        tone: aiTone,
        permissions: aiPermissions,
        customDirectives: aiCustomDirectives
      };
      localStorage.setItem('mikhlafi_ai_assistant_settings', JSON.stringify(aiConfig));

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
            ? 'تم حفظ إعدادات مساحة العمل وشخصية وصلاحيات المساعد الذكي بنجاح.'
            : 'Workspace settings and AI Copilot persona saved successfully.'
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
                    <option value="YER">YER — ريال يمني (Yemeni Rial)</option>
                    <option value="SAR">SAR — ريال سعودي (Saudi Riyal)</option>
                    <option value="USD">USD — دولار أمريكي (US Dollar)</option>
                    <option value="EUR">EUR — يورو (Euro)</option>
                    <option value="AED">AED — درهم إماراتي (UAE Dirham)</option>
                  </select>
                  <span className="ml-hint">
                    {isAr
                      ? 'العملة التي تُعرض وتُعاير بها قيم هذه المساحة في التقارير (الريال اليمني هو العملة السيادية الأساسية).'
                      : 'The primary sovereign currency in which this workspace’s values are presented.'}
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

            {/* AI Copilot Persona & Executive Powers Panel */}
            <section className="ml-panel" style={{ border: '1px solid rgba(13, 148, 136, 0.3)', background: 'linear-gradient(180deg, rgba(13, 148, 136, 0.04) 0%, transparent 100%)' }}>
              <div className="ml-panel__head">
                <div className="vc-title-group">
                  <div className="vc-title-group__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconAssistant size={18} color="#0d9488" />
                    <span>{isAr ? 'شخصية وصلاحيات المساعد الذكي المؤسسي' : 'Enterprise AI Copilot Persona & Executive Powers'}</span>
                  </div>
                  <div className="vc-title-group__meta">
                    {isAr
                      ? 'تحكم كامل في هوية المساعد، نبرته البشرية، وصلاحياته التنفيذية المباشرة'
                      : 'Full sovereign control over AI assistant identity, tone, and autonomous powers'}
                  </div>
                </div>
                <span className="ml-badge ml-badge--success" style={{ background: 'rgba(13, 148, 136, 0.15)', color: '#0d9488', borderColor: 'rgba(13, 148, 136, 0.3)' }}>
                  <IconShield size={12} />
                  {isAr ? 'صلاحيات تنفيذية' : 'Executive Powers'}
                </span>
              </div>

              <div className="ml-panel__body vc-fields" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* 1. Assistant Identity & Name */}
                <div className="ml-field">
                  <label className="ml-label" htmlFor="vc-setting-ai-name" style={{ fontWeight: 600 }}>
                    {isAr ? 'اسم المساعد الذكي المؤسسي' : 'AI Assistant Name'}
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      id="vc-setting-ai-name"
                      type="text"
                      className="ml-input"
                      style={{ maxWidth: '280px', fontWeight: 600 }}
                      value={aiName}
                      onChange={(e) => setAiName(e.target.value)}
                      placeholder={isAr ? 'مثال: فطين' : 'e.g. Fatin'}
                    />
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {[
                        { label: isAr ? 'فطين (الذكي الحصيف)' : 'Fatin', val: isAr ? 'فطين' : 'Fatin' },
                        { label: isAr ? 'سند (المعين المالي)' : 'Sanad', val: isAr ? 'سند' : 'Sanad' },
                        { label: isAr ? 'المستشار (التنفيذي)' : 'Advisor', val: isAr ? 'المستشار' : 'Advisor' },
                        { label: isAr ? 'عون (المساند الإداري)' : 'Awn', val: isAr ? 'عون' : 'Awn' },
                        { label: isAr ? 'حكيم (الخبير الجنائي)' : 'Hakeem', val: isAr ? 'حكيم' : 'Hakeem' }
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          type="button"
                          className="ml-btn ml-btn--ghost ml-btn--sm"
                          style={{
                            fontSize: '11px',
                            padding: '4px 8px',
                            background: aiName === preset.val ? 'rgba(13, 148, 136, 0.15)' : undefined,
                            borderColor: aiName === preset.val ? '#0d9488' : undefined,
                            color: aiName === preset.val ? '#0d9488' : undefined
                          }}
                          onClick={() => setAiName(preset.val)}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <span className="ml-hint">
                    {isAr
                      ? 'الاسم الذي يخاطبك به المساعد، ويوقع به مذكراته والتقارير التنفيذية الصادرة عنه.'
                      : 'The sovereign name your assistant greets you with and signs onto generated audit reports.'}
                  </span>
                </div>

                {/* 2. Persona Tone Selector */}
                <div className="ml-field">
                  <label className="ml-label" style={{ fontWeight: 600, marginBottom: '8px' }}>
                    {isAr ? 'نبرة وطابع المحادثة (الأسلوب البشري)' : 'Conversational Persona & Tone'}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    {/* Witty & Human */}
                    <div
                      onClick={() => setAiTone('witty_human')}
                      style={{
                        padding: '14px',
                        borderRadius: '8px',
                        border: aiTone === 'witty_human' ? '2px solid #0d9488' : '1px solid var(--border-subtle)',
                        background: aiTone === 'witty_human' ? 'rgba(13, 148, 136, 0.08)' : 'var(--surface-sunken)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px', color: aiTone === 'witty_human' ? '#0d9488' : 'inherit' }}>
                          😊 {isAr ? 'مرح وبشري وذكي (موصى به)' : 'Witty, Warm & Human (Recommended)'}
                        </span>
                        {aiTone === 'witty_human' && <IconCheck size={14} color="#0d9488" />}
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {isAr
                          ? 'يتحدث كشريك أعمال خبير وودود، مرح ومتعاون، يبسط التعقيدات المحاسبية بأمثلة ذكية دون تكلف.'
                          : 'Warm, personable, and witty. Communicates like a trusted human partner with accessible explanations.'}
                      </p>
                    </div>

                    {/* Strict Executive */}
                    <div
                      onClick={() => setAiTone('strict_executive')}
                      style={{
                        padding: '14px',
                        borderRadius: '8px',
                        border: aiTone === 'strict_executive' ? '2px solid #0d9488' : '1px solid var(--border-subtle)',
                        background: aiTone === 'strict_executive' ? 'rgba(13, 148, 136, 0.08)' : 'var(--surface-sunken)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px', color: aiTone === 'strict_executive' ? '#0d9488' : 'inherit' }}>
                          ⚡ {isAr ? 'تنفيذي حاسم وسريع' : 'Strict Executive'}
                        </span>
                        {aiTone === 'strict_executive' && <IconCheck size={14} color="#0d9488" />}
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {isAr
                          ? 'لغة موجزة جداً، يركز على مؤشرات الأداء الحيوية، والأثر المالي الفوري والقرارات الحتمية.'
                          : 'Ultra-concise executive brevity, prioritizing direct KPIs, financial impact, and board directives.'}
                      </p>
                    </div>

                    {/* Forensic Auditor */}
                    <div
                      onClick={() => setAiTone('forensic_auditor')}
                      style={{
                        padding: '14px',
                        borderRadius: '8px',
                        border: aiTone === 'forensic_auditor' ? '2px solid #0d9488' : '1px solid var(--border-subtle)',
                        background: aiTone === 'forensic_auditor' ? 'rgba(13, 148, 136, 0.08)' : 'var(--surface-sunken)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px', color: aiTone === 'forensic_auditor' ? '#0d9488' : 'inherit' }}>
                          🔍 {isAr ? 'مدقق جنائي ورقابي صارم' : 'Forensic Auditor'}
                        </span>
                        {aiTone === 'forensic_auditor' && <IconCheck size={14} color="#0d9488" />}
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {isAr
                          ? 'شك مهني دائم، توثيق دقيق لكل ثغرة وفجوة سيولة، تدقيق صارم وفق المعايير المحاسبية.'
                          : 'Deep professional skepticism, forensic precision, zero tolerance for audit discrepancies.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Executive Powers & Granular Permissions */}
                <div className="ml-field">
                  <label className="ml-label" style={{ fontWeight: 600, marginBottom: '8px' }}>
                    {isAr ? 'الصلاحيات التنفيذية الممنوحة للمساعد' : 'Autonomous Powers & Executive Permissions'}
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      {
                        key: 'canFreezeDisbursements',
                        titleAr: 'تجميد ومطابقة أوامر الصرف المشبوهة',
                        titleEn: 'Freeze & hold suspicious disbursement orders',
                        descAr: 'تمكين المساعد من اقتراح وتطبيق التجميد الفوري للمستحقات ذات المخاطر العالية لمنع تسريب الأموال.',
                        descEn: 'Empowers the AI to freeze high-risk supplier payments and trigger executive holds.'
                      },
                      {
                        key: 'canGenerateReports',
                        titleAr: 'صياغة التقارير الجنائية والتحليلات المتكاملة فوراً',
                        titleEn: 'Autonomous Forensic Audit & Decision Report Generation',
                        descAr: 'توليد تقارير تدقيق وتحليلات شاملة للمؤسسة ومشاركتها مع الإدارة العليا.',
                        descEn: 'Generates comprehensive forensic audit dossiers and decision briefs on demand.'
                      },
                      {
                        key: 'canSimulateScenarios',
                        titleAr: 'المحاكاة المالية واختبار السيناريوهات البديلة (What-If)',
                        titleEn: 'Empirical What-If Scenario Simulations',
                        descAr: 'محاكاة أثر التغير في أسعار المواد، تأخر التحصيل، أو خصم الموردين على السيولة.',
                        descEn: 'Calculates predictive outcomes for revenue shifts, payment delays, or inflation shocks.'
                      },
                      {
                        key: 'canDraftDecisions',
                        titleAr: 'صياغة مسودات القرارات التنفيذية وتوصيات مجلس الإدارة',
                        titleEn: 'Draft Executive Decisions & Board Recommendations',
                        descAr: 'صياغة قرارات تنظيمية فورية جاهزة للتوقيع والاعتماد المؤسسي.',
                        descEn: 'Prepares binding executive resolutions based on ledger insights.'
                      },
                      {
                        key: 'canScanLedger',
                        titleAr: 'المسح التلقائي المستمر لدفتر الأستاذ ورصد الشذوذ اللحظي',
                        titleEn: 'Continuous Autonomous Ledger Scans & Anomaly Detection',
                        descAr: 'تحليل قيود اليومية ومقارنتها بقانون بنفورد والمعايير المحاسبية تلقائياً.',
                        descEn: 'Automated continuous evaluation of journal entries against Benford and dual-entry rules.'
                      }
                    ].map((perm) => (
                      <label
                        key={perm.key}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '10px 14px',
                          borderRadius: '6px',
                          background: 'var(--surface-sunken)',
                          border: '1px solid var(--border-subtle)',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          style={{ marginTop: '3px', accentColor: '#0d9488', width: '16px', height: '16px' }}
                          checked={aiPermissions[perm.key as keyof typeof aiPermissions]}
                          onChange={(e) =>
                            setAiPermissions((prev) => ({
                              ...prev,
                              [perm.key]: e.target.checked
                            }))
                          }
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>
                            {isAr ? perm.titleAr : perm.titleEn}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {isAr ? perm.descAr : perm.descEn}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 4. Custom Directives */}
                <div className="ml-field">
                  <label className="ml-label" htmlFor="vc-setting-ai-directives" style={{ fontWeight: 600 }}>
                    {isAr ? 'توجيهات وتعليمات مؤسسية خاصة (Directives)' : 'Custom Organizational Directives'}
                  </label>
                  <textarea
                    id="vc-setting-ai-directives"
                    className="ml-input"
                    rows={3}
                    style={{ resize: 'vertical', fontSize: '12px', fontFamily: 'inherit' }}
                    value={aiCustomDirectives}
                    onChange={(e) => setAiCustomDirectives(e.target.value)}
                    placeholder={
                      isAr
                        ? 'مثال: ركز دائماً على التدفقات النقدية للمشاريع قيد الإنجاز، ولا تتساهل في فواتير الموردين المتأخرة لأكثر من 45 يوماً...'
                        : 'e.g. Always scrutinize project progress cashflow, prioritize subcontractor retention payments...'
                    }
                  />
                  <span className="ml-hint">
                    {isAr
                      ? 'أي تعليمات أو معايير خاصة بنشاطك التجاري يلتزم بها المساعد أثناء تحليله وإجابته.'
                      : 'Any company-specific context, policies, or heuristics the AI must prioritize in reasoning.'}
                  </span>
                </div>

                {/* 5. Live Persona Preview */}
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    background: 'rgba(13, 148, 136, 0.05)',
                    border: '1px dashed rgba(13, 148, 136, 0.3)'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#0d9488', marginBottom: '6px', textTransform: 'uppercase' }}>
                    {isAr ? `معاينة حية لشخصية (${aiName || 'فطين'}):` : `Live Persona Preview (${aiName || 'Fatin'}):`}
                  </div>
                  <div style={{ fontSize: '12.5px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                    {aiTone === 'witty_human' && (
                      isAr
                        ? `«أهلاً بك يا فندم! أنا ${aiName || 'فطين'}، رفيقك المالي الذكي. اطمئن، عيني على كل قرش وسند في المنشأة، وجاهز أفصل لك أي تقرير أو نكشف أي ثغرة مع فنجان قهوة محترم!»`
                        : `"Hello there! I'm ${aiName || 'Fatin'}, your witty sovereign copilot. Rest easy—I've got an eye on every transaction in your ledger, ready to run deep forensics or draft board decisions in seconds!"`
                    )}
                    {aiTone === 'strict_executive' && (
                      isAr
                        ? `«تحياتي. أنا ${aiName || 'فطين'}. تم مسح السجلات: 0 مخالفات حرجة، السيولة مستقرة. أرسل استفسارك وسأزودك بالمؤشر المالي وقرار التخصيص فوراً.»`
                        : `"Greetings. I am ${aiName || 'Fatin'}. Ledger scanned: 0 critical breaches, cashflow stable. State your query for immediate KPI breakdown and allocation directives."`
                    )}
                    {aiTone === 'forensic_auditor' && (
                      isAr
                        ? `«أنا المدقق الجنائي ${aiName || 'فطين'}. أعمل بمبدأ الشك المهني المطلق. السجلات تحت الرقابة التامة، وأي تباين في قيود الصرف سيُجمد فوراً للفحص الصارم.»`
                        : `"I am forensic auditor ${aiName || 'Fatin'}. Operating under strict professional skepticism. All records are monitored; any deviation triggers immediate disbursement holds."`
                    )}
                  </div>
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
