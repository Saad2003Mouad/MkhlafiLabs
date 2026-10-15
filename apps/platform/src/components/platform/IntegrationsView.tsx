import React, { useState, useEffect } from 'react';
import { LocaleMode } from '../../types';
import { IconServer, IconCheck, IconRefresh, IconDownload, IconAlertTriangle } from '../Icons';
import { api } from '../../api/client';

interface IntegrationsViewProps {
  locale: LocaleMode;
}

// RFC-4180 Compliant CSV Parser supporting quotes, escaped quotes, and newlines
function parseRFC4180(csv: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;
  const len = csv.length;

  while (i < len) {
    const char = csv[i];
    const nextChar = csv[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        currentField += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
        i++;
        continue;
      } else if (char === '\r') {
        if (nextChar === '\n') i++;
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.some((f) => f.length > 0)) rows.push(currentRow);
        currentRow = [];
        i++;
        continue;
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.some((f) => f.length > 0)) rows.push(currentRow);
        currentRow = [];
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    }
  }

  if (inQuotes) {
    throw new Error('Malformed CSV: Unclosed quotation mark detected in record.');
  }

  currentRow.push(currentField.trim());
  if (currentRow.some((f) => f.length > 0)) rows.push(currentRow);
  return rows;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);
  const [csvText, setCsvText] = useState<string>('');
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);
  const [ingestError, setIngestError] = useState<string | null>(null);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await api.getIntegrations();
      setSources(res.integrations || []);
    } catch {
      // Keep existing sources
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
      const res = (await api.syncIntegration(id)) as any;
      if (res.success) {
        setSources((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  records_synced_count: res.integration?.records_synced_count ?? s.records_synced_count,
                  last_sync_at: res.integration?.last_sync_at ?? s.last_sync_at,
                  last_sync_status: res.integration?.last_sync_status ?? res.status,
                  status: res.integration?.status ?? s.status
                }
              : s
          )
        );

        if (res.isDemo || res.status === 'DEMO_SYNCED') {
          setFeedback({
            type: 'warning',
            message: isAr
              ? `تم تحديث بيانات العرض التوضيحي (${name}). الربط مع بيئة الإنتاج الخارجية يتطلب إعداد الشهادات الرقمية (mTLS / API Keys).`
              : `Demonstration fixture telemetry refreshed for (${name}). Production live sync requires verified mTLS / API credentials.`
          });
        } else {
          setFeedback({
            type: 'success',
            message: isAr
              ? `اكتملت المزامنة الحية وتأكيد سلامة قناة الاتصال (${name}) بنجاح.`
              : `Live telemetry synchronization verified for (${name}).`
          });
        }
      } else {
        // Not configured or failure state
        if (res.integration) {
          setSources((prev) =>
            prev.map((s) =>
              s.id === id
                ? {
                    ...s,
                    last_sync_status: res.integration.last_sync_status,
                    status: res.integration.status
                  }
                : s
            )
          );
        }
        setFeedback({
          type: 'warning',
          message: isAr
            ? `قناة الاتصال (${name}) غير مهيأة بعد (NOT_CONFIGURED). يلزم إدخال شهادات الاعتماد ونقاط الاتصال قبل المزامنة الفعلية.`
            : `Connector (${name}) is not configured. Live credentials or mTLS endpoints must be provided before sync can execute.`
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || (isAr ? 'فشلت المزامنة.' : 'Synchronization failed.')
      });
    } finally {
      setSyncingId(null);
      setTimeout(() => setFeedback(null), 6000);
    }
  };

  const handleDownloadTemplate = () => {
    const templateContent = 'DocNumber,VendorName,Amount,Currency,PostingDate,Narrative\nINV-2026-001,"Al-Buraq Industrial Supplies",45000.00,SAR,2026-09-15,"Q3 Mechanical Spare Parts Batch #1"\nINV-2026-002,"Saudi Red Sea Logistics",118500.00,SAR,2026-09-18,"Cold-chain Freight Transit - Jeddah to Riyadh"\nINV-2026-003,"Rawabi Consulting Group",25000.00,SAR,2026-09-22,"Bi-weekly IT Infrastructure Audit"';
    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'mikhlafi_general_ledger_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadSample = () => {
    setCsvText('DocNumber,VendorName,Amount,Currency,PostingDate,Narrative\nINV-2026-001,"Al-Buraq Industrial Supplies",45000.00,SAR,2026-09-15,"Q3 Mechanical Spare Parts Batch #1"\nINV-2026-002,"Saudi Red Sea Logistics",118500.00,SAR,2026-09-18,"Cold-chain Freight Transit - Jeddah to Riyadh"\nINV-2026-003,"Rawabi Consulting Group",25000.00,SAR,2026-09-22,"Bi-weekly IT Infrastructure Audit"');
  };

  const handleIngestSubmit = async () => {
    setIngestError(null);
    if (!csvText.trim()) {
      setIngestError(isAr ? 'يرجى لصق بيانات CSV صالحة تتضمن ترويسة الأعمدة والقيود.' : 'Please paste valid CSV records including headers.');
      return;
    }

    try {
      setIngestStatus(isAr ? 'جارِ فحص وتدقيق القيود المحاسبية وفق معيار RFC-4180...' : 'Validating ledger rows against RFC-4180 standards...');

      const rawRows = parseRFC4180(csvText.trim());
      if (rawRows.length === 0) {
        throw new Error(isAr ? 'ملف CSV فارغ.' : 'CSV file is empty.');
      }
      if (rawRows.length === 1) {
        throw new Error(isAr ? 'الملف يحتوي على ترويسة الأعمدة فقط؛ لا توجد أي قيود مالية للمعالجة.' : 'CSV contains headers only; no financial transaction rows found.');
      }

      // Map headers
      const headers = rawRows[0].map((h) => h.toLowerCase().replace(/[\s_-]/g, ''));
      const docIdx = headers.findIndex((h) => h.includes('doc') || h.includes('invoice') || h.includes('number'));
      const vendorIdx = headers.findIndex((h) => h.includes('vendor') || h.includes('supplier'));
      const amountIdx = headers.findIndex((h) => h.includes('amount') || h.includes('total') || h.includes('value'));
      const textIdx = headers.findIndex((h) => h.includes('text') || h.includes('narrative') || h.includes('description') || h.includes('memo'));
      const dateIdx = headers.findIndex((h) => h.includes('date'));

      if (docIdx === -1 || amountIdx === -1) {
        throw new Error(
          isAr
            ? 'ترويسة CSV تفتقر إلى الأعمدة الإلزامية: يجب تضمين رقم السند (DocNumber) والمبلغ (Amount).'
            : 'CSV headers missing required fields: must include Document Number and Amount columns.'
        );
      }

      const entries: any[] = [];
      const rowErrors: string[] = [];

      for (let i = 1; i < rawRows.length; i++) {
        const row = rawRows[i];
        const docNum = row[docIdx]?.trim();
        const rawAmt = row[amountIdx]?.trim();

        if (!docNum) {
          rowErrors.push(isAr ? `السطر ${i + 1}: رقم السند مفقود.` : `Row ${i + 1}: Missing document number.`);
          continue;
        }

        const cleanAmtStr = rawAmt ? rawAmt.replace(/[,\s]/g, '') : '';
        const amt = Number(cleanAmtStr);
        if (isNaN(amt) || !isFinite(amt) || amt <= 0) {
          rowErrors.push(isAr ? `السطر ${i + 1}: قيمة المبلغ غير صالحة ("${rawAmt}").` : `Row ${i + 1}: Malformed financial amount ("${rawAmt}").`);
          continue;
        }

        entries.push({
          documentNumber: docNum,
          vendorName: vendorIdx !== -1 && row[vendorIdx]?.trim() ? row[vendorIdx].trim() : 'General Supplier',
          amount: amt,
          postingDate: dateIdx !== -1 && row[dateIdx]?.trim() ? row[dateIdx].trim() : undefined,
          text: textIdx !== -1 && row[textIdx]?.trim() ? row[textIdx].trim() : 'Manual Ledger CSV Import'
        });
      }

      if (entries.length === 0) {
        throw new Error(
          isAr
            ? `لم يتم العثور على أي قيود صالحة للاستيراد. الأخطاء:\n${rowErrors.join('\n')}`
            : `Zero valid records found for ingestion. Errors:\n${rowErrors.join('\n')}`
        );
      }

      const res = (await api.ingestJournalEntries(entries)) as any;
      setIngestStatus(
        isAr
          ? `تم استيراد ${res.totalIngested} قيد محاسبي بنجاح، وتجاهل ${res.duplicateCount || 0} قيود مكررة، ورصد ${res.flaggedCount || 0} حالة تدقيق جنائي.`
          : `Ingested ${res.totalIngested} records (${res.duplicateCount || 0} duplicates skipped, ${res.flaggedCount || 0} forensic anomalies flagged).`
      );

      setTimeout(() => {
        setIsIngestModalOpen(false);
        setIngestStatus(null);
        setIngestError(null);
        setCsvText('');
        fetchIntegrations();
      }, 3500);
    } catch (err: any) {
      setIngestStatus(null);
      setIngestError(err.message || 'Validation error');
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
            onClick={() => {
              setIsIngestModalOpen(true);
              setIngestStatus(null);
              setIngestError(null);
            }}
            className="btn-primary"
            style={{ fontSize: '13px', padding: '9px 16px' }}
          >
            <IconDownload size={14} />
            <span>{isAr ? 'استيراد قيود دفتر الأستاذ (CSV)' : 'Ingest General Ledger (CSV)'}</span>
          </button>

          <div className="kpi-micro-badge">
            <span className="label">{isAr ? 'إجمالي السجلات المزامنة' : 'Total Ingested Records'}</span>
            <span className="value" style={{ fontFamily: 'var(--font-mono)' }}>
              {totalSynced === 0
                ? (isAr ? '0 سجلات (بانتظار استيراد فواتير CSV أو ربط ERP)' : '0 Rows (Awaiting Ingestion)')
                : `${(totalSynced / 1e6).toFixed(2)}M Rows`}
            </span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`alert-feedback-banner ${feedback.type === 'error' ? 'error' : feedback.type === 'warning' ? 'warning' : 'success'}`}>
          {feedback.type === 'error' || feedback.type === 'warning' ? <IconAlertTriangle size={16} /> : <IconCheck size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Integration Readiness Status — Transparent capability disclosure */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{ padding: '14px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(16,185,129,0.08)', border: '1px solid var(--status-success)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '18px' }}>✅</span>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--status-success)', marginBottom: '2px' }}>
              {isAr ? 'متاح الآن — CSV Import' : 'Available Now — CSV Import'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {isAr ? 'رفع الفواتير والقيود يدوياً بصيغة CSV للتدقيق الفوري.' : 'Upload invoices and ledger entries via CSV for instant forensic audit.'}
            </div>
          </div>
        </div>
        <div style={{ padding: '14px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(245,158,11,0.08)', border: '1px solid var(--status-warning)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '18px' }}>⚠️</span>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--status-warning)', marginBottom: '2px' }}>
              {isAr ? 'يتطلب إعداد — ERP Connectors' : 'Requires Setup — ERP Connectors'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {isAr ? 'يتطلب إدخال شهادات API أو mTLS لضمان الاتصال الحي مع SAP/Oracle.' : 'Requires API credentials or mTLS certificates for live SAP/Oracle connection.'}
            </div>
          </div>
        </div>
        <div style={{ padding: '14px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(56,189,248,0.06)', border: '1px solid var(--status-info)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '18px' }}>🚧</span>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--status-info)', marginBottom: '2px' }}>
              {isAr ? 'قادم قريباً — ZATCA و BI-Directional ERP' : 'Coming Soon — ZATCA & Bi-Directional ERP'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {isAr ? 'ربط ZATCA للفواتير الإلكترونية ومزامنة ERP ثنائية الاتجاه في الخارطة لعام 2027.' : 'ZATCA e-invoicing and full bi-directional ERP sync on 2027 roadmap.'}
            </div>
          </div>
        </div>
      </div>

      {/* Integration Sources Grid */}
      <div className="decisions-grid">
        {sources.map((src) => {
          const isSyncingThis = syncingId === src.id;
          const name = isAr ? src.name_ar : src.name_en;
          const syncStatus = src.last_sync_status || 'NOT_CONFIGURED';
          const isHealthy = syncStatus === 'HEALTHY';
          const isDemo = syncStatus === 'DEMO_SYNCED';

          return (
            <div key={src.id} className="decision-card">
              <div className="decision-card-header">
                <div className="badge-row">
                  <span className={`severity-tag ${isHealthy ? 'optimal' : isDemo ? 'warning' : 'critical'}`}>
                    {syncStatus.toUpperCase()}
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
                  <span className="v" style={{ color: isHealthy ? 'var(--status-success)' : isDemo ? 'var(--accent-base)' : 'var(--status-warning)' }}>
                    {syncStatus}
                  </span>
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
                ? 'الصق بيانات الفواتير والقيود بصيغة CSV المتوافقة مع RFC-4180 (رقم السند، اسم المورد، المبلغ، الوصف) لتنفيذ التدقيق الجنائي الفوري.'
                : 'Paste RFC-4180 CSV rows (DocNumber, VendorName, Amount, Narrative) to execute instant forensic anomaly detection.'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {isAr ? 'بيانات CSV (RFC-4180)' : 'CSV Data Payload (RFC-4180)'}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                >
                  <IconDownload size={12} />
                  <span>{isAr ? 'تحميل نموذج CSV' : 'Download Template'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                >
                  <span>{isAr ? 'إدراج عينة تجريبية' : 'Load Sample'}</span>
                </button>
              </div>
            </div>

            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="DocNumber,VendorName,Amount,Narrative&#10;INV-9041,&quot;Aram Logistics Co., Ltd.&quot;,540000,Q3 Insulated Materials Delivery&#10;INV-9042,Saudi Cement Co.,125000,Concrete Supply Order #42"
              rows={7}
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

            {ingestError && (
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--status-critical)', fontSize: '12px', color: 'var(--status-critical)', marginBottom: '14px', whiteSpace: 'pre-wrap' }}>
                {ingestError}
              </div>
            )}

            {ingestStatus && (
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', fontSize: '12px', color: 'var(--accent-base)', marginBottom: '14px' }}>
                {ingestStatus}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  setIsIngestModalOpen(false);
                  setIngestError(null);
                  setIngestStatus(null);
                }}
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
