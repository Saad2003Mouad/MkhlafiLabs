import React, { useState } from 'react';
import { LocaleMode, IntegrationSource } from '../../types';
import { MOCK_INTEGRATIONS } from '../../data/mockData';
import { IconServer, IconCheck, IconRefresh } from '../Icons';

interface IntegrationsViewProps {
  locale: LocaleMode;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const [sources, setSources] = useState<IntegrationSource[]>(MOCK_INTEGRATIONS);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSync = (id: string, name: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setSyncingId(null);
      setSources((prev) =>
        prev.map((s) => (s.id === id ? { ...s, lastSync: isAr ? 'الآن (مكتمل)' : 'Just now (Synced)' } : s))
      );
      setFeedback(isAr ? `اكتملت المزامنة الآمنة لقناة (${name}) بنجاح عبر بروتوكول القراءة فقط.` : `Non-invasive read-only synchronization completed for (${name}).`);
      setTimeout(() => setFeedback(null), 4000);
    }, 1200);
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
            <span className="current">{isAr ? 'مصادر البيانات وتكامل ERP' : 'Data Sources & ERP'}</span>
          </div>
          <h1 className="page-title">
            <IconServer size={24} />
            <span>{isAr ? 'قنوات الربط المؤسسي وتكامل أنظمة ERP' : 'Enterprise ERP Integrations & Data Ingestion'}</span>
          </h1>
          <p className="page-subtitle">
            {isAr
              ? 'اتصال آمن ومستمر عبر قنوات القراءة فقط (Read-Only) مع أنظمة المؤسسة الحالية دون أي تعديل أو استبدال للبرمجيات القائمة.'
              : 'Non-invasive read-only telemetry pipelines connecting SAP, Oracle, ZATCA and databases without software disruption.'}
          </p>
        </div>

        <div className="kpi-micro-badge">
          <span className="label">{isAr ? 'إجمالي السجلات المزامنة' : 'Total Ingested Records'}</span>
          <span className="value">5.51M Rows</span>
        </div>
      </div>

      {feedback && (
        <div className="alert-feedback-banner success">
          <IconCheck size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Integration Sources Grid */}
      <div className="decisions-grid">
        {sources.map((src) => {
          const isSyncingThis = syncingId === src.id;
          return (
            <div key={src.id} className="decision-card">
              <div className="decision-card-header">
                <div className="badge-row">
                  <span className="severity-tag optimal">
                    {src.status.toUpperCase()}
                  </span>
                  <span className="category-pill">{src.category}</span>
                </div>
                <div className="decision-financial">
                  <span className="label">{isAr ? 'السجلات المزامنة' : 'Synced Records'}</span>
                  <span className="amount">{src.recordsSynced}</span>
                </div>
              </div>

              <h3 className="decision-title">{src.name}</h3>

              <div className="risk-metric-strip">
                <div className="risk-metric-box">
                  <span className="k">{isAr ? 'آخر مزامنة' : 'Last Sync'}</span>
                  <span className="v">{src.lastSync}</span>
                </div>
                <div className="risk-metric-box">
                  <span className="k">{isAr ? 'بروتوكول الأمان' : 'Auth Protocol'}</span>
                  <span className="v">{src.authType}</span>
                </div>
              </div>

              <div className="decision-actions-row">
                <button
                  onClick={() => handleSync(src.id, src.name)}
                  disabled={isSyncingThis}
                  className="btn-primary"
                  style={{ fontSize: '12px', padding: '8px 14px' }}
                >
                  <IconRefresh size={13} className={isSyncingThis ? 'spin' : ''} />
                  <span>
                    {isSyncingThis
                      ? (isAr ? 'جارِ فحص الاتصال...' : 'Syncing...')
                      : (isAr ? 'مزامنة وفحص الاتصال' : 'Sync & Check Health')}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
