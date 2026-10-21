// MIKHLAFI LABS — Predictive Risk Intelligence (protected workspace view)
// Records are loaded exclusively from api.getRisks; mitigation toggles call
// api.toggleRiskMitigation and reflect the real backend response. No demo
// fallbacks and no simulated records are ever rendered.

import React, { useState, useEffect, useCallback } from 'react';
import { LocaleMode } from '../../types';
import { IconRisk, IconShield, IconCheck, IconAlert, IconFilter, IconLock } from '../Icons';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../common/EmptyState';
import { PageHeader } from '../common/PageHeader';

interface RiskViewProps {
  locale: LocaleMode;
}

type RiskRecord = {
  id: string;
  code: string;
  title_en?: string;
  title_ar?: string;
  category_en?: string;
  category_ar?: string;
  probability?: string;
  severity?: string;
  financial_exposure_sar?: string | number;
  exposure_formatted?: string;
  status?: string;
  is_mitigated?: boolean;
  mitigation_plan_en?: string;
  mitigation_plan_ar?: string;
  owner_name?: string;
  created_at?: string;
};

interface NoticeState {
  type: 'success' | 'error';
  message: string;
}

export const RiskView: React.FC<RiskViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated, tenant, openAuthModal } = useAuth();

  const [risks, setRisks] = useState<RiskRecord[]>([]);
  const [totalExposureSAR, setTotalExposureSAR] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const currency = tenant?.currency || 'SAR';

  const fetchRisks = useCallback(async () => {
    if (!isAuthenticated) {
      setRisks([]);
      setTotalExposureSAR(0);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.getRisks();
      setRisks(Array.isArray(res.risks) ? (res.risks as RiskRecord[]) : []);
      setTotalExposureSAR(res.totalMonitoredExposureSAR || 0);
    } catch (err) {
      setRisks([]);
      setTotalExposureSAR(0);
      setError(
        err instanceof Error
          ? err.message
          : (isAr ? 'تعذر تحميل سجلات المخاطر.' : 'Failed to fetch risk records.')
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAr]);

  useEffect(() => {
    fetchRisks();
  }, [fetchRisks, tenant?.organizationId]);

  const showNotice = (state: NoticeState) => {
    setNotice(state);
    setTimeout(() => setNotice(null), 5000);
  };

  const toggleMitigation = async (risk: RiskRecord) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setBusyId(risk.id);
    try {
      const res = await api.toggleRiskMitigation(risk.id);
      const nextMitigated = !!res.risk?.is_mitigated;
      const code = res.risk?.code || risk.code;
      showNotice({
        type: 'success',
        message: nextMitigated
          ? (isAr
              ? `تم تفعيل خطة التحوط للمخاطرة (${code}).`
              : `Mitigation plan activated for risk ${code}.`)
          : (isAr
              ? `تمت إعادة المخاطرة (${code}) إلى وضع المتابعة النشط.`
              : `Risk ${code} returned to active monitoring.`)
      });
      await fetchRisks();
    } catch (err) {
      showNotice({
        type: 'error',
        message: err instanceof Error
          ? err.message
          : (isAr ? 'تعذر تحديث حالة التحوط.' : 'Failed to update the mitigation status.')
      });
    } finally {
      setBusyId(null);
    }
  };

  const severityBadgeClass = (severity?: string, mitigated?: boolean) => {
    if (mitigated) return 'ml-badge ml-badge--success';
    const s = (severity || '').toLowerCase();
    if (s === 'critical') return 'ml-badge ml-badge--danger';
    if (s === 'high') return 'ml-badge ml-badge--warning';
    if (s === 'medium') return 'ml-badge ml-badge--info';
    return 'ml-badge';
  };

  // Category filter options are derived from the records the API actually returned
  const categories = Array.from(
    new Set(
      risks
        .map((r) => (isAr ? (r.category_ar || r.category_en) : (r.category_en || r.category_ar)))
        .filter((c): c is string => !!c)
    )
  ).slice(0, 6);

  const filteredRisks = risks.filter((r) => {
    if (selectedCategory === 'all') return true;
    const cat = isAr ? (r.category_ar || r.category_en) : (r.category_en || r.category_ar);
    return cat === selectedCategory;
  });

  const mitigatedCount = risks.filter((r) => !!r.is_mitigated).length;

  return (
    <div className="platform-page-container">
      <PageHeader
        locale={locale}
        icon={<IconRisk size={22} />}
        breadcrumb={[isAr ? 'المنصة' : 'Platform', isAr ? 'محركات الذكاء' : 'Intelligence Engines']}
        title={isAr ? 'محرك التنبؤ بالمخاطر والإنذار المبكر' : 'Predictive Risk Intelligence Engine'}
        subtitle={
          isAr
            ? 'مراقبة استباقية لنقاط الاختناق في سلاسل التوريد والتدفقات التشغيلية وتآكل العقود قبل تفاقمها إلى أزمات، مع خطط تحوط قابلة للقياس والتتبّع.'
            : 'Proactive monitoring of supply bottlenecks, operational flows, and contract attrition before they escalate into crises, with measurable and trackable mitigation plans.'
        }
        action={
          isAuthenticated ? (
            <div className="kpi-micro-badge">
              <span className="label">{isAr ? 'إجمالي التعرض المفتوح' : 'Open Exposure'}</span>
              <span className="value">{totalExposureSAR.toLocaleString()} {currency}</span>
            </div>
          ) : undefined
        }
      />

      {!isAuthenticated ? (
        <EmptyState
          icon={<IconLock size={30} />}
          title={isAr ? 'سجّل الدخول لعرض سجل المخاطر لمؤسستك' : 'Sign in to view your organization’s risk registry'}
          description={
            isAr
              ? 'تُسترجع مؤشرات المخاطر والتعرض المالي وخطط التحوط مباشرة من مساحة عمل مؤسستك بعد تسجيل الدخول.'
              : 'Risk indicators, financial exposure, and mitigation plans are loaded directly from your organization workspace after signing in.'
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
                  title={isAr ? 'تعذر تحميل سجل المخاطر' : 'Unable to load the risk registry'}
                  description={error}
                  action={
                    <button onClick={fetchRisks} className="ml-btn ml-btn--primary">
                      {isAr ? 'إعادة المحاولة' : 'Retry'}
                    </button>
                  }
                />
              ) : (
                <>
                  <div className="stat-grid">
                    <div className="stat-tile">
                      <div className="stat-tile__label">{isAr ? 'إجمالي المخاطر المسجلة' : 'Registered Risks'}</div>
                      <div className="stat-tile__value">{risks.length}</div>
                      <div className="stat-tile__hint">{isAr ? 'في نطاق المراقبة' : 'Within monitoring scope'}</div>
                    </div>
                    <div className="stat-tile">
                      <div className="stat-tile__label">{isAr ? 'التعرض المفتوح' : 'Open Exposure'}</div>
                      <div className="stat-tile__value">{totalExposureSAR.toLocaleString()} {currency}</div>
                      <div className="stat-tile__hint">{isAr ? 'بدون احتساب المخاطر المحتوَّرة' : 'Mitigated risks excluded'}</div>
                    </div>
                    <div className="stat-tile">
                      <div className="stat-tile__label">{isAr ? 'خطط تحوط مفعّلة' : 'Mitigations Active'}</div>
                      <div className="stat-tile__value">{mitigatedCount}</div>
                      <div className="stat-tile__hint">{isAr ? 'خطط قيد التنفيذ فعلياً' : 'Plans actually in effect'}</div>
                    </div>
                  </div>

                  {risks.length === 0 ? (
                    <EmptyState
                      icon={<IconShield size={30} />}
                      title={isAr ? 'لا توجد مخاطر مسجلة حالياً' : 'No risks registered right now'}
                      description={
                        isAr
                          ? 'تُسجَّل مؤشرات المخاطر في هذه المساحة عبر محركات المنصة من بيانات مؤسستك المرتبطة؛ فور رصد أي مؤشر تشغيلي يظهر هنا.'
                          : 'Risk indicators are registered in this workspace by the platform engines from your connected organizational data; anything detected appears here.'
                      }
                    />
                  ) : (
                    <>
                      {categories.length > 0 && (
                        <div className="page-filter-bar">
                          <div className="filter-group">
                            <IconFilter size={14} />
                            <span className="filter-label">{isAr ? 'التصنيف:' : 'Category:'}</span>
                            <button
                              onClick={() => setSelectedCategory('all')}
                              className={`filter-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                            >
                              {isAr ? 'الكل' : 'All'} ({risks.length})
                            </button>
                            {categories.map((cat) => {
                              const count = risks.filter((r) => {
                                const c = isAr ? (r.category_ar || r.category_en) : (r.category_en || r.category_ar);
                                return c === cat;
                              }).length;
                              return (
                                <button
                                  key={cat}
                                  onClick={() => setSelectedCategory(cat)}
                                  className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                                >
                                  {cat} ({count})
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {filteredRisks.length === 0 ? (
                        <EmptyState
                          icon={<IconFilter size={30} />}
                          title={isAr ? 'لا توجد مخاطر ضمن هذا التصنيف' : 'No risks in this category'}
                          description={
                            isAr
                              ? 'اختر تصنيفاً آخر لعرض بقية سجل المخاطر.'
                              : 'Select a different category to view the rest of the risk registry.'
                          }
                          action={
                            <button onClick={() => setSelectedCategory('all')} className="ml-btn ml-btn--ghost">
                              {isAr ? 'عرض الكل' : 'Show All'}
                            </button>
                          }
                        />
                      ) : (
                        <div className="record-list">
                          {filteredRisks.map((risk) => {
                            const mitigated = !!risk.is_mitigated;
                            const title = isAr ? (risk.title_ar || risk.title_en || risk.code) : (risk.title_en || risk.title_ar || risk.code);
                            const category = isAr ? (risk.category_ar || risk.category_en) : (risk.category_en || risk.category_ar);
                            const exposure = risk.exposure_formatted ||
                              `${(Number(risk.financial_exposure_sar) || 0).toLocaleString()} ${currency}`;
                            const mitigationPlan = isAr
                              ? (risk.mitigation_plan_ar || risk.mitigation_plan_en)
                              : (risk.mitigation_plan_en || risk.mitigation_plan_ar);

                            return (
                              <div key={risk.id} className="record-row" style={{ alignItems: 'flex-start' }}>
                                <div className="record-row__main">
                                  <div className="va-row-head">
                                    <div className="va-tags">
                                      <span className={severityBadgeClass(risk.severity, mitigated)}>
                                        <span className="ml-dot" />
                                        {mitigated
                                          ? (isAr ? 'محتوَّرة' : 'MITIGATED')
                                          : (risk.severity || '').toUpperCase()}
                                      </span>
                                      <span className="va-mono-id">{risk.code}</span>
                                      {category && <span className="ml-badge">{category}</span>}
                                    </div>
                                    <span className="va-amount" style={mitigated ? { textDecoration: 'line-through', opacity: 0.6 } : undefined}>
                                      {exposure}
                                    </span>
                                  </div>

                                  <div className="record-row__title" style={{ marginTop: 6 }}>{title}</div>

                                  <div className="va-metric-grid">
                                    <div className="va-metric">
                                      <span className="va-metric__k">{isAr ? 'الاحتمالية' : 'Probability'}</span>
                                      <span className="va-metric__v">{(risk.probability || '—').toUpperCase()}</span>
                                    </div>
                                    <div className="va-metric">
                                      <span className="va-metric__k">{isAr ? 'مستوى الخطورة' : 'Severity'}</span>
                                      <span className="va-metric__v">{(risk.severity || '—').toUpperCase()}</span>
                                    </div>
                                    {risk.owner_name && (
                                      <div className="va-metric">
                                        <span className="va-metric__k">{isAr ? 'المسؤول' : 'Owner'}</span>
                                        <span className="va-metric__v va-metric__v--muted">{risk.owner_name}</span>
                                      </div>
                                    )}
                                  </div>

                                  {mitigationPlan && (
                                    <div className="va-plan">
                                      <strong style={{ color: 'var(--text-primary)' }}>
                                        {isAr ? 'خطة التحوط:' : 'Mitigation plan:'}
                                      </strong>{' '}
                                      {mitigationPlan}
                                    </div>
                                  )}
                                </div>

                                <div className="record-row__actions">
                                  <button
                                    onClick={() => toggleMitigation(risk)}
                                    disabled={busyId === risk.id}
                                    className={`ml-btn ml-btn--sm ${mitigated ? 'ml-btn--subtle' : 'ml-btn--primary'}`}
                                  >
                                    <IconShield size={14} />
                                    <span>
                                      {busyId === risk.id
                                        ? (isAr ? 'جارِ التحديث…' : 'Updating…')
                                        : mitigated
                                          ? (isAr ? 'إلغاء التحوط' : 'Reset Mitigation')
                                          : (isAr ? 'تفعيل التحوط' : 'Activate Mitigation')}
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
