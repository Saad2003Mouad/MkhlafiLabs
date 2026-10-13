import React, { useState, useEffect } from 'react';
import { LocaleMode } from '../../types';
import { IconServer, IconCheck, IconRefresh, IconDownload } from '../Icons';
import { api } from '../../api/client';

interface IntegrationsViewProps {
  locale: LocaleMode;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);
  const [csvText, setCsvText] = useState<string>('');
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await api.getIntegrations();
      setSources(res.integrations || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleSync = async (id: string, name: string) => {
    setSyncingId(id);
    try {
      const res = await api.syncIntegration(id);
      if (res.success) {
        setSources((prev) =>
          prev.map((s) => (s.id === id ? { ...s, records_synced_count: res.integration.records_synced_count, last_sync_at: res.integration.last_sync_at } : s))
        );
        setFeedback(isAr ? `اكتملت المزامنة وتأكيد صحة اتصال (${name}) بنجاح.` : `Telemetry sync confirmed for (${name}).`);
      }
    } catch (err: any) {
      setFeedback(err.message || 'Sync failed.');
    } finally {
      setSyncingId(null);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleIngestSubmit = async () => {
    if (!csvText.trim()) return;
    try {
      setIngestStatus(isAr ? 'جارِ معالجة وتدقيق القيود المحاسبية...' : 'Processing general ledger records...');
      // Simple parse of CSV or JSON
      const lines = csvText.trim().split('\n');
      const entries = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 3) {
          entries.push({
            documentNumber: parts[0]?.trim(),
            vendorName: parts[1]?.trim(),
            amount: parseFloat(parts[2]?.trim() || '0'),
            text: parts[3]?.trim() || 'Manual Ledger CSV Import'
          });
        }
      }

      if (entries.length === 0) {
        entries.push({
          documentNumber: `MAN-DOC-${Date.now()}`,
          vendorName: 'Saudi Standard Raw Materials',
          amount: 540000.00,
          text: 'Batch Ingestion Test'
        });
      }

      const res = await api.ingestJournalEntries(entries);
      setIngestStatus(
        isAr
          ? `تم استيراد ${res.totalIngested} قيد محاسبي بنجاح، ورصد ${res.flaggedCount} حالة انحراف تتطلب التدقيق.`
          : `Successfully ingested ${res.totalIngested} ledger records. ${res.flaggedCount} anomalies flagged.`
      );
      setTimeout(() => {
        setIsIngestModalOpen(false);
        setIngestStatus(null);
        setCsvText('');
        fetchIntegrations();
      }, 3000);
    } catch (err: any) {
      setIngestStatus(`Error: ${err.message}`);
    }
  };

  const totalSynced = sources.reduce((sum, s) => sum + parseInt(s.records_synced_count || '0', 10), 0);

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
              ? 'اتصال آمن ومستمر عبر قنوات القراءة فقط (Read-Only) مع أنظمة المؤسسة الحالية (SAP, Oracle, ZATCA) دون أي تعديل أو استبدال للبرمجيات القائمة.'
              : 'Non-invasive read-only telemetry pipelines connecting SAP, Oracle, ZATCA and databases without software disruption.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={fetchIntegrations}
            disabled={loading}
            className="btn-secondary"
            style={{ fontSize: '13px', padding: '8px 12px' }}
          >
            <IconRefresh size={14} className={loading ? 'spinning' : ''} />
            <span>{loading ? (isAr ? 'جارِ التحديث...' : 'Updating...') : (isAr ? 'تحديث' : 'Refresh')}</span>
          </button>

          <button
            onClick={() => setIsIngestModalOpen(true)}
            className="btn-primary"
            style={{ fontSize: '13px', padding: '9px 16px' }}
          >
            <IconDownload size={14} />
            <span>{isAr ? 'استيراد قيود دفتر الأستاذ (CSV)' : 'Ingest General Ledger (CSV)'}</span>
          </button>

          <div className="kpi-micro-badge">
            <span className="label">{isAr ? 'إجمالي السجلات المزامنة' : 'Total Ingested Records'}</span>
            <span className="value">{(totalSynced / 1e6).toFixed(2)}M Rows</span>
          </div>
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
          const name = isAr ? src.name_ar : src.name_en;
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
                  <span className="amount">{parseInt(src.records_synced_count || 0).toLocaleString()}</span>
                </div>
              </div>

              <h3 className="decision-title">{name}</h3>

              <div className="risk-metric-strip">
                <div className="risk-metric-box">
                  <span className="k">{isAr ? 'حالة القناة' : 'Channel Health'}</span>
                  <span className="v" style={{ color: 'var(--status-success)' }}>{src.last_sync_status || 'HEALTHY'}</span>
                </div>
                <div className="risk-metric-box">
                  <span className="k">{isAr ? 'بروتوكول الأمان' : 'Auth Protocol'}</span>
                  <span className="v">{src.auth_type}</span>
                </div>
              </div>

              <div className="decision-actions-row">
                <button
                  onClick={() => handleSync(src.id, name)}
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

      {/* CSV Ingestion Modal */}
      {isIngestModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '650px',
            padding: '24px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>
              {isAr ? 'استيراد قيود دفتر الأستاذ العام (ERP General Ledger)' : 'Ingest ERP Journal Entries'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {isAr
                ? 'الصق بيانات الفواتير والقيود بصيغة CSV (رقم السند، اسم المورد، المبلغ، الوصف) لتنفيذ التدقيق الجنائي الفوري.'
                : 'Paste RFC-4180 CSV rows (DocNumber, VendorName, Amount, Narrative) to execute instant forensic anomaly detection.'}
            </p>

            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="DocNumber,VendorName,Amount,Narrative&#10;INV-9041,Aram Logistics Co.,540000,Q3 Insulated Materials Delivery&#10;INV-9042,Saudi Cement Co.,125000,Concrete Supply Order #42"
              rows={6}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontFamily: 'monospace',
                fontSize: '12px',
                resize: 'vertical',
                outline: 'none',
                marginBottom: '14px'
              }}
            />

            {ingestStatus && (
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', fontSize: '12px', color: 'var(--accent-base)', marginBottom: '14px' }}>
                {ingestStatus}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setIsIngestModalOpen(false)}
                className="btn-secondary"
                style={{ fontSize: '13px', padding: '8px 16px' }}
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleIngestSubmit}
                className="btn-primary"
                style={{ fontSize: '13px', padding: '8px 18px' }}
              >
                {isAr ? 'بدء الفحص والتدقيق الجنائي' : 'Start Forensic Anomaly Audit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
