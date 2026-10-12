import React, { useState } from 'react';
import { LocaleMode } from '../../types';
import { IconBell, IconCheck, IconClock } from '../Icons';

interface AlertsViewProps {
  locale: LocaleMode;
}

interface AlertItem {
  id: string;
  titleAr: string;
  titleEn: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  acknowledged: boolean;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'alt-1',
      titleAr: 'تكرار صرف مدفوعات لنفس المورد خلال 48 ساعة (#INV-9041)',
      titleEn: 'Duplicate payment disbursement match detected within 48h (#INV-9041)',
      severity: 'critical',
      timestamp: '2026-10-12 02:15',
      acknowledged: false
    },
    {
      id: 'alt-2',
      titleAr: 'تصاعد سعر حديد التسليح بنسبة +16.5% عن العقد الأساسي CTR-04',
      titleEn: 'Supplier price creep exceeding contractual baseline (+16.5%) on CTR-04',
      severity: 'warning',
      timestamp: '2026-10-11 18:30',
      acknowledged: false
    },
    {
      id: 'alt-3',
      titleAr: 'تأخر تسليم مستخلصات مشروع أتمتة خطوط الإمداد بجدة 14 يوماً',
      titleEn: 'Jeddah Logistics project claims delayed by 14 days',
      severity: 'warning',
      timestamp: '2026-10-11 11:20',
      acknowledged: true
    },
    {
      id: 'alt-4',
      titleAr: 'اكتمال المزامنة الحية مع بوابة الفوترة ZATCA بنجاح',
      titleEn: 'Live synchronization cycle with ZATCA Tax Bridge completed successfully',
      severity: 'info',
      timestamp: '2026-10-11 08:00',
      acknowledged: true
    }
  ]);

  const [feedback, setFeedback] = useState<string | null>(null);

  const toggleAcknowledge = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const newState = !a.acknowledged;
          const msg = newState
            ? (isAr ? 'تم تأكيد استلام التنبيه وتحديث سجل الإشعارات.' : 'Alert acknowledged.')
            : (isAr ? 'تمت إعادة فتح التنبيه في طابور المتابعة.' : 'Alert reopened.');
          setFeedback(msg);
          setTimeout(() => setFeedback(null), 3000);
          return { ...a, acknowledged: newState };
        }
        return a;
      })
    );
  };

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

        <div className="kpi-micro-badge warning">
          <span className="label">{isAr ? 'التنبيهات غير المؤكدة' : 'Unacknowledged Alerts'}</span>
          <span className="value">
            {alerts.filter((a) => !a.acknowledged).length} {isAr ? 'تنبيهات' : 'alerts'}
          </span>
        </div>
      </div>

      {feedback && (
        <div className="alert-feedback-banner success">
          <IconCheck size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
        {alerts.map((alert) => (
          <div
            key={alert.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              background: alert.acknowledged ? 'var(--bg-surface)' : 'var(--bg-surface-elevated)',
              border: `1px solid ${alert.acknowledged ? 'var(--border-subtle)' : 'var(--border-strong)'}`,
              borderRadius: 'var(--radius-sm)',
              opacity: alert.acknowledged ? 0.75 : 1
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className={`severity-tag ${alert.severity}`}>
                {alert.severity.toUpperCase()}
              </span>
              <div>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>
                  {isAr ? alert.titleAr : alert.titleEn}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  <IconClock size={11} />
                  <span>{alert.timestamp}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => toggleAcknowledge(alert.id)}
              className={alert.acknowledged ? 'btn-secondary' : 'btn-primary'}
              style={{ fontSize: '11px', padding: '6px 12px' }}
            >
              <IconCheck size={12} />
              <span>
                {alert.acknowledged
                  ? (isAr ? 'تم الاستلام ✓' : 'Acknowledged ✓')
                  : (isAr ? 'تأكيد الاستلام' : 'Acknowledge')}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
