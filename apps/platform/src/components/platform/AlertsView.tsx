import React, { useState, useEffect } from 'react';
import { LocaleMode } from '../../types';
import { IconBell, IconCheck, IconClock, IconRefresh } from '../Icons';
import { api } from '../../api/client';

interface AlertsViewProps {
  locale: LocaleMode;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.getAlerts();
      setAlerts(res.alerts || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const toggleAcknowledge = async (id: string) => {
    setTogglingId(id);
    try {
      const res = await api.toggleAlert(id);
      if (res.success) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === id ? { ...a, acknowledged: res.alert.acknowledged, acknowledged_at: res.alert.acknowledged_at } : a))
        );
        const msg = res.alert.acknowledged
          ? (isAr ? 'تم تأكيد استلام التنبيه وتحديث سجل الإشعارات.' : 'Alert acknowledged.')
          : (isAr ? 'تمت إعادة فتح التنبيه في طابور المتابعة.' : 'Alert reopened.');
        setFeedback(msg);
      }
    } catch (err: any) {
      setFeedback(err.message || 'Action failed.');
    } finally {
      setTogglingId(null);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const unackCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="platform-page-container">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <div className="page-breadcrumb">
            <span>{isAr ? 'المنصة' : 'Platform'}</span>
            <span>/</span>
            <span>{isAr ? 'مركز القيادة' : 'Command'}</span>
            <span>/</span>
            <span className="current">{isAr ? 'مركز التنبيهات والإنذارات' : 'Alerts Center'}</span>
          </div>
          <h1 className="page-title">
            <IconBell size={24} />
            <span>{isAr ? 'مركز التنبيهات الفورية وإشارات الاستشعار' : 'Real-Time Alerts & Notification Center'}</span>
          </h1>
          <p className="page-subtitle">
            {isAr
              ? 'إشعارات حية حول الانحرافات المحاسبية والمخاطر التشغيلية الطارئة لضمان سرعة الاستجابة الإدارية.'
              : 'Live telemetry and critical notifications regarding accounting anomalies, contract variances, and operational thresholds.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={fetchAlerts}
            disabled={loading}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '7px 12px' }}
          >
            <IconRefresh size={14} className={loading ? 'spinning' : ''} />
            <span>{loading ? (isAr ? 'جارِ التحديث...' : 'Updating...') : (isAr ? 'تحديث' : 'Refresh')}</span>
          </button>
          <div className={`kpi-micro-badge ${unackCount > 0 ? 'warning' : 'optimal'}`}>
            <span className="label">{isAr ? 'التنبيهات غير المؤكدة' : 'Unacknowledged Alerts'}</span>
            <span className="value">
              {unackCount} {isAr ? 'تنبيهات' : 'alerts'}
            </span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="alert-feedback-banner success">
          <IconCheck size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
        {alerts.map((alt) => {
          const isToggling = togglingId === alt.id;
          const title = isAr ? alt.title_ar : alt.title_en;
          const isAck = alt.acknowledged;

          return (
            <div
              key={alt.id}
              className="decision-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                opacity: isAck ? 0.65 : 1,
                borderLeft: !isAr && alt.severity === 'critical' ? '4px solid var(--status-critical)' : undefined,
                borderRight: isAr && alt.severity === 'critical' ? '4px solid var(--status-critical)' : undefined
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span
                  className={`severity-tag ${
                    alt.severity === 'critical' ? 'critical' : alt.severity === 'warning' ? 'high' : 'optimal'
                  }`}
                >
                  {alt.severity.toUpperCase()}
                </span>

                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {title}
                  </h4>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <IconClock size={12} />
                      {alt.created_at ? new Date(alt.created_at).toLocaleString() : 'Recent'}
                    </span>
                    <span>•</span>
                    <span>{isAck ? (isAr ? 'مؤكد الاستلام' : 'Acknowledged') : (isAr ? 'بانتظار المراجعة' : 'Pending Review')}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleAcknowledge(alt.id)}
                disabled={isToggling}
                className={isAck ? 'btn-secondary' : 'btn-primary'}
                style={{ fontSize: '12px', padding: '7px 14px' }}
              >
                <IconCheck size={13} />
                <span>
                  {isToggling
                    ? (isAr ? 'جارِ التحديث...' : 'Updating...')
                    : (isAck ? (isAr ? 'إعادة فتح التنبيه' : 'Reopen') : (isAr ? 'تأكيد الاستلام' : 'Acknowledge'))}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
