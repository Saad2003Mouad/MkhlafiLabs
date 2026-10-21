// MIKHLAFI LABS — Real-Time Alerts Center
// All alerts are loaded exclusively from the authenticated backend.
// No simulated or demonstration records are ever rendered.

import React, { useState, useEffect, useCallback } from 'react';
import { LocaleMode } from '../../types';
import { IconBell, IconCheck, IconClock, IconRefresh, IconRisk } from '../Icons';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../common/EmptyState';
import { PageHeader } from '../common/PageHeader';

interface AlertsViewProps {
  locale: LocaleMode;
}

interface AlertRecord {
  id: string;
  title_ar: string;
  title_en: string;
  severity: string;
  source_domain: string;
  acknowledged: boolean;
  acknowledged_at?: string | null;
  created_at: string;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated, openAuthModal } = useAuth();
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [filterState, setFilterState] = useState<'all' | 'pending' | 'acknowledged'>('all');

  const fetchAlerts = useCallback(async () => {
    if (!isAuthenticated) {
      setAlerts([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAlerts();
      setAlerts(Array.isArray(res.alerts) ? res.alerts : []);
    } catch (err: any) {
      setAlerts([]);
      setError(err.message || (isAr ? 'تعذّر تحميل التنبيهات.' : 'Unable to load alerts.'));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAr]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const toggleAcknowledge = async (alert: AlertRecord) => {
    if (togglingId) return;
    setTogglingId(alert.id);
    try {
      const res = await api.toggleAlert(alert.id);
      const updated = res.alert;
      await fetchAlerts();
      setFeedback(
        updated.acknowledged
          ? (isAr ? 'تم تأكيد استلام التنبيه.' : 'Alert acknowledged.')
          : (isAr ? 'أُعيد فتح التنبيه في طابور المتابعة.' : 'Alert reopened.')
      );
    } catch (err: any) {
      setFeedback(err.message || (isAr ? 'تعذّر تحديث حالة التنبيه.' : 'Unable to update the alert.'));
    } finally {
      setTogglingId(null);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterState === 'all') return true;
    if (filterState === 'pending') return !a.acknowledged;
    return a.acknowledged;
  });

  const counts = {
    all: alerts.length,
    pending: alerts.filter((a) => !a.acknowledged).length,
    acknowledged: alerts.filter((a) => a.acknowledged).length
  };

  const severityClass = (severity: string) => {
    const s = (severity || '').toLowerCase();
    if (s === 'critical') return 'vb-sev--critical';
    if (s === 'warning') return 'vb-sev--warning';
    return 'vb-sev--info';
  };

  return (
    <div className="platform-page-container">
      <PageHeader
        locale={locale}
        icon={<IconBell size={22} />}
        breadcrumb={[isAr ? 'المنصة' : 'Platform', isAr ? 'مركز القيادة' : 'Command']}
        title={isAr ? 'مركز التنبيهات' : 'Alerts Center'}
        subtitle={
          isAr
            ? 'إشعارات حية حول الانحرافات والمخاطر التشغيلية المرصودة عبر محركات المنصة، لضمان سرعة استجابة القيادة.'
            : 'Live notifications on deviations and operational risks surfaced by the platform engines, so leadership can respond quickly.'
        }
        action={
          <button onClick={fetchAlerts} disabled={loading || !isAuthenticated} className="ml-btn ml-btn--subtle ml-btn--sm">
            <IconRefresh size={13} className={loading ? 'vb-spin' : undefined} />
            <span>{loading ? (isAr ? 'جارِ التحديث...' : 'Refreshing...') : (isAr ? 'تحديث' : 'Refresh')}</span>
          </button>
        }
      />

      {feedback && (
        <div className="alert-feedback-banner success">
          <IconCheck size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {!isAuthenticated ? (
        <EmptyState
          icon={<IconBell size={30} />}
          title={isAr ? 'سجّل الدخول لعرض تنبيهات مؤسستك' : 'Sign in to view your organization’s alerts'}
          description={
            isAr
              ? 'تُسترجَع التنبيهات مباشرة من مساحة عمل مؤسستك بعد تسجيل الدخول. لا تُعرض أي تنبيهات للزوار.'
              : 'Alerts are loaded directly from your organization workspace after signing in. No alerts are shown to visitors.'
          }
          action={
            <button onClick={openAuthModal} className="ml-btn ml-btn--primary">
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </button>
          }
        />
      ) : error ? (
        <EmptyState
          icon={<IconRisk size={30} />}
          title={isAr ? 'تعذّر تحميل التنبيهات' : 'Unable to load alerts'}
          description={error}
          action={
            <button onClick={fetchAlerts} className="ml-btn ml-btn--primary">
              {isAr ? 'إعادة المحاولة' : 'Retry'}
            </button>
          }
        />
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-tile">
              <div className="stat-tile__label">{isAr ? 'إجمالي التنبيهات' : 'Total Alerts'}</div>
              <div className="stat-tile__value">{counts.all}</div>
              <div className="stat-tile__hint">
                {isAr ? 'من سجلات التنبيهات الفعلية' : 'From your actual alert records'}
              </div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile__label">{isAr ? 'بانتظار المراجعة' : 'Pending Review'}</div>
              <div className="stat-tile__value">{counts.pending}</div>
              <div className="stat-tile__hint">
                {isAr ? 'تنبيهات غير مؤكدة الاستلام' : 'Alerts not yet acknowledged'}
              </div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile__label">{isAr ? 'مؤكدة الاستلام' : 'Acknowledged'}</div>
              <div className="stat-tile__value">{counts.acknowledged}</div>
              <div className="stat-tile__hint">
                {isAr ? 'تنبيهات تمت معالجتها' : 'Alerts already actioned'}
              </div>
            </div>
          </div>

          <div className="page-filter-bar">
            <div className="filter-group">
              <span className="filter-label">{isAr ? 'الحالة:' : 'State:'}</span>
              <button onClick={() => setFilterState('all')} className={`filter-chip ${filterState === 'all' ? 'active' : ''}`}>
                {isAr ? `الكل (${counts.all})` : `All (${counts.all})`}
              </button>
              <button onClick={() => setFilterState('pending')} className={`filter-chip ${filterState === 'pending' ? 'active' : ''}`}>
                <span className="dot critical" />
                {isAr ? `بانتظار المراجعة (${counts.pending})` : `Pending (${counts.pending})`}
              </button>
              <button onClick={() => setFilterState('acknowledged')} className={`filter-chip ${filterState === 'acknowledged' ? 'active' : ''}`}>
                <span className="dot high" style={{ background: 'var(--status-success)' }} />
                {isAr ? `مؤكدة (${counts.acknowledged})` : `Acknowledged (${counts.acknowledged})`}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="skeleton-grid">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          ) : filteredAlerts.length === 0 ? (
            <EmptyState
              icon={<IconBell size={30} />}
              title={isAr ? 'لا توجد تنبيهات مطابقة' : 'No matching alerts'}
              description={
                isAr
                  ? 'تظهر التنبيهات هنا تلقائياً عندما ترصد محركات المنصة انحرافاً تشغيلياً أو تجاوزاً لحدٍّ معتمد في بيانات مؤسستك.'
                  : 'Alerts appear here automatically when the platform engines detect an operational deviation or a threshold breach in your organization’s data.'
              }
            />
          ) : (
            <div className="record-list">
              {filteredAlerts.map((alert) => {
                const isToggling = togglingId === alert.id;
                const title = isAr ? alert.title_ar : alert.title_en;

                return (
                  <div key={alert.id} className={`record-row ${alert.acknowledged ? 'is-acknowledged' : ''}`}>
                    <span className={`vb-sev ${severityClass(alert.severity)}`}>
                      {(alert.severity || 'info').toUpperCase()}
                    </span>

                    <div className="record-row__main">
                      <div className="record-row__title">{title}</div>
                      <div className="record-row__meta">
                        <span className="vb-metric">
                          <IconClock size={12} />
                          {alert.created_at ? new Date(alert.created_at).toLocaleString() : '—'}
                        </span>
                        {alert.source_domain && (
                          <span className="vb-metric">
                            {isAr ? 'المصدر:' : 'Domain:'} {alert.source_domain}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="record-row__actions">
                      <span className={`ml-badge ${alert.acknowledged ? 'ml-badge--success' : 'ml-badge--warning'}`}>
                        {alert.acknowledged
                          ? (isAr ? 'مؤكد الاستلام' : 'Acknowledged')
                          : (isAr ? 'بانتظار المراجعة' : 'Pending')}
                      </span>
                      <button
                        onClick={() => toggleAcknowledge(alert)}
                        disabled={isToggling}
                        className={`ml-btn ml-btn--sm ${alert.acknowledged ? 'ml-btn--subtle' : 'ml-btn--primary'}`}
                      >
                        <IconCheck size={13} />
                        <span>
                          {isToggling
                            ? (isAr ? 'جارِ التحديث...' : 'Updating...')
                            : alert.acknowledged
                              ? (isAr ? 'إعادة فتح' : 'Reopen')
                              : (isAr ? 'تأكيد الاستلام' : 'Acknowledge')}
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
    </div>
  );
};
