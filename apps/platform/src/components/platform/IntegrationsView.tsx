// MIKHLAFI LABS — Integrations & Data Sources
// Every connector record is loaded exclusively from the authenticated backend.
// No demonstration fixtures, sample rows, or fabricated counters are rendered.

import React, { useCallback, useEffect, useState } from 'react';
import { LocaleMode } from '../../types';
import { IconServer, IconRefresh, IconCheck, IconAlertTriangle, IconDownload, IconX } from '../Icons';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { EmptyState } from '../common/EmptyState';
import { PageHeader } from '../common/PageHeader';

interface IntegrationsViewProps {
  locale: LocaleMode;
}

interface IntegrationRecord {
  id: string;
  code?: string;
  name_en?: string;
  name_ar?: string;
  category?: string;
  auth_type?: string;
  records_synced_count?: string | number;
  last_sync_status?: string;
  last_sync_at?: string;
  status?: string;
}

interface SyncResult {
  success: boolean;
  status?: string;
  error?: string;
  message?: string;
  isDemo?: boolean;
  integration?: IntegrationRecord;
}

interface IngestResult {
  success: boolean;
  batchId: string;
  totalIngested: number;
  flaggedCount: number;
  duplicateCount?: number;
  rejectedCount?: number;
}

interface JournalEntry {
  documentNumber: string;
  vendorName?: string;
  amount: number;
  postingDate?: string;
  text?: string;
}

interface Feedback {
  message: string;
  type: 'success' | 'error' | 'info';
}

// RFC-4180 compliant CSV parser: quoted fields, escaped quotes, embedded newlines.
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
        }
        inQuotes = false;
        i++;
        continue;
      }
      currentField += char;
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (char === ',') {
      currentRow.push(currentField.trim());
      currentField = '';
      i++;
      continue;
    }
    if (char === '\r' || char === '\n') {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentField.trim());
      currentField = '';
      if (currentRow.some((f) => f.length > 0)) rows.push(currentRow);
      currentRow = [];
      i++;
      continue;
    }
    currentField += char;
    i++;
  }

  if (inQuotes) {
    throw new Error('Malformed CSV: unclosed quotation mark detected.');
  }

  currentRow.push(currentField.trim());
  if (currentRow.some((f) => f.length > 0)) rows.push(currentRow);
  return rows;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated, tenant, openAuthModal } = useAuth();

  const [sources, setSources] = useState<IntegrationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'healthy' | 'attention'>('all');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // CSV dataset upload
  const [isIngestOpen, setIsIngestOpen] = useState<boolean>(false);
  const [csvText, setCsvText] = useState<string>('');
  const [ingestBusy, setIngestBusy] = useState<boolean>(false);
  const [ingestError, setIngestError] = useState<string | null>(null);
  const [ingestSuccess, setIngestSuccess] = useState<string | null>(null);

  const fetchIntegrations = useCallback(async () => {
    if (!isAuthenticated) {
      setSources([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.getIntegrations();
      setSources(Array.isArray(res.integrations) ? res.integrations : []);
    } catch (err) {
      setSources([]);
      setError(err instanceof Error ? err.message : (isAr ? 'تعذر جلب مصادر البيانات.' : 'Unable to load data sources.'));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAr]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations, tenant?.organizationId]);

  const statusBadge = (status?: string): string => {
    const s = (status || '').toUpperCase();
    if (s === 'HEALTHY' || s === 'CONNECTED') return 'ml-badge--success';
    if (s === 'NOT_CONFIGURED') return 'ml-badge--warning';
    if (s === 'DEMO_SYNCED') return 'ml-badge--info';
    if (s === 'FAILED' || s === 'ERROR') return 'ml-badge--danger';
    return '';
  };

  const handleSync = async (id: string, name: string) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setSyncingId(id);
    try {
      const res = (await api.syncIntegration(id)) as SyncResult;
      const synced = res.integration;
      await fetchIntegrations();

      const status = (synced?.last_sync_status || res.status || '').toUpperCase();
      if (res.success && status === 'HEALTHY') {
        setFeedback({
          type: 'success',
          message: isAr
            ? `اكتملت المزامنة وتحقق الاتصال لـ (${name}).`
            : `Synchronization completed and connection verified for (${name}).`
        });
      } else if (res.success && status === 'DEMO_SYNCED') {
        setFeedback({
          type: 'info',
          message: isAr
            ? `اكتملت مزامنة (${name}) بالحالة المسجَّلة في الخادم: DEMO_SYNCED — تتطلب المزامنة الحية بيانات اعتماد فعلية.`
            : `Synchronization for (${name}) completed with the status recorded by the server: DEMO_SYNCED. Live production sync requires real credentials.`
        });
      } else {
        setFeedback({
          type: 'error',
          message:
            (isAr
              ? `تعذرت مزامنة (${name}) — الربط غير مهيأ.`
              : `Synchronization did not complete for (${name}) — the connector is not configured.`) +
            (res.error ? ` ${res.error}` : '')
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error && err.message
          ? err.message
          : (isAr ? 'فشلت المزامنة.' : 'Synchronization failed.')
      });
    } finally {
      setSyncingId(null);
      setTimeout(() => setFeedback(null), 6000);
    }
  };

  const handleDownloadTemplate = () => {
    const headerOnly = 'documentNumber,name,amount,postingDate,description\n';
    const blob = new Blob([headerOnly], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'mikhlafi_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const closeIngest = () => {
    setIsIngestOpen(false);
    setIngestError(null);
    setIngestSuccess(null);
    setCsvText('');
  };

  const handleIngestSubmit = async () => {
    setIngestError(null);
    setIngestSuccess(null);

    if (!csvText.trim()) {
      setIngestError(isAr ? 'الصق بيانات CSV صالحة تتضمن ترويسة الأعمدة والصفوف.' : 'Paste valid CSV data including a header row and data rows.');
      return;
    }

    setIngestBusy(true);
    try {
      const rawRows = parseRFC4180(csvText.trim());
      if (rawRows.length === 0) {
        throw new Error(isAr ? 'النص الملصق فارغ.' : 'The pasted text is empty.');
      }
      if (rawRows.length === 1) {
        throw new Error(
          isAr
            ? 'النص يحتوي على ترويسة أعمدة فقط؛ أضف صفاً واحداً من البيانات على الأقل.'
            : 'Only a header row was found — add at least one data row.'
        );
      }

      const headers = rawRows[0].map((h) => h.toLowerCase().replace(/[\s_-]/g, ''));
      const refIdx = headers.findIndex((h) =>
        h.includes('doc') || h.includes('invoice') || h.includes('number') || h.includes('reference') || h.includes('ref')
      );
      const partyIdx = headers.findIndex((h) =>
        h.includes('vendor') || h.includes('supplier') || h.includes('partner') || h.includes('party') || h.includes('name')
      );
      const amountIdx = headers.findIndex((h) => h.includes('amount') || h.includes('total') || h.includes('value'));
      const dateIdx = headers.findIndex((h) => h.includes('date'));
      const textIdx = headers.findIndex((h) =>
        h.includes('description') || h.includes('narrative') || h.includes('text') || h.includes('memo') || h.includes('detail')
      );

      if (refIdx === -1 || amountIdx === -1) {
        throw new Error(
          isAr
            ? 'ترويسة CSV ناقصة: يجب تضمين عمود المرجع (documentNumber) وعمود القيمة (amount).'
            : 'CSV headers are incomplete: include a reference column (documentNumber) and a value column (amount).'
        );
      }

      const entries: JournalEntry[] = [];
      const rowErrors: string[] = [];

      for (let i = 1; i < rawRows.length; i++) {
        const row = rawRows[i];
        const ref = row[refIdx]?.trim();
        const rawAmt = row[amountIdx]?.trim();

        if (!ref) {
          rowErrors.push(isAr ? `السطر ${i + 1}: المرجع مفقود.` : `Row ${i + 1}: missing reference.`);
          continue;
        }

        const amt = Number((rawAmt || '').replace(/[,\s]/g, ''));
        if (isNaN(amt) || !isFinite(amt) || amt <= 0) {
          rowErrors.push(isAr ? `السطر ${i + 1}: قيمة غير صالحة ("${rawAmt}").` : `Row ${i + 1}: invalid value ("${rawAmt}").`);
          continue;
        }

        entries.push({
          documentNumber: ref,
          vendorName: partyIdx !== -1 && row[partyIdx]?.trim() ? row[partyIdx].trim() : undefined,
          amount: amt,
          postingDate: dateIdx !== -1 && row[dateIdx]?.trim() ? row[dateIdx].trim() : undefined,
          text: textIdx !== -1 && row[textIdx]?.trim() ? row[textIdx].trim() : undefined
        });
      }

      if (entries.length === 0) {
        throw new Error(
          isAr
            ? `لا توجد صفوف صالحة للاستيراد. الأخطاء:\n${rowErrors.join('\n')}`
            : `No valid rows found for import. Issues:\n${rowErrors.join('\n')}`
        );
      }

      const res = (await api.ingestJournalEntries(entries)) as IngestResult;
      const duplicateCount = res.duplicateCount || 0;
      const flaggedCount = res.flaggedCount || 0;
      setIngestSuccess(
        isAr
          ? `تم استيراد ${res.totalIngested} صفاً (تم تجاهل ${duplicateCount} مكرر، ورُصد ${flaggedCount} للتحقق).`
          : `Imported ${res.totalIngested} rows (${duplicateCount} duplicates skipped, ${flaggedCount} flagged for review).`
      );
      setCsvText('');
      await fetchIntegrations();
    } catch (err) {
      setIngestError(err instanceof Error && err.message ? err.message : (isAr ? 'خطأ في التحقق من البيانات.' : 'Data validation error.'));
    } finally {
      setIngestBusy(false);
    }
  };

  const healthyCount = sources.filter((s) => (s.last_sync_status || '').toUpperCase() === 'HEALTHY').length;
  const attentionCount = sources.length - healthyCount;
  const totalSynced = sources.reduce((sum, s) => sum + (Number(s.records_synced_count) || 0), 0);

  const filtered = sources.filter((s) => {
    if (filter === 'healthy') return (s.last_sync_status || '').toUpperCase() === 'HEALTHY';
    if (filter === 'attention') return (s.last_sync_status || '').toUpperCase() !== 'HEALTHY';
    return true;
  });

  return (
    <div className="platform-page-container">
      <PageHeader
        locale={locale}
        icon={<IconServer size={22} />}
        breadcrumb={[isAr ? 'المنصة' : 'Platform', isAr ? 'الإدارة والسيادة' : 'Administration']}
        title={isAr ? 'مصادر البيانات والتكاملات' : 'Data Sources & Integrations'}
        subtitle={
          isAr
            ? 'اتصال آمن للقراءة فقط مع أنظمة مؤسستك الحالية وملفات البيانات المرفوعة — دون استبدال أو تعديل أي نظام قائم.'
            : 'Secure, read-only connections to your organization’s existing systems and uploaded datasets — without replacing or modifying them.'
        }
        action={
          <div className="vc-header-actions">
            <button
              onClick={() => fetchIntegrations()}
              disabled={loading}
              className="ml-btn ml-btn--subtle ml-btn--sm"
            >
              <IconRefresh size={14} className={loading ? 'spin' : undefined} />
              <span>{loading ? (isAr ? 'جارِ التحديث…' : 'Updating…') : (isAr ? 'تحديث' : 'Refresh')}</span>
            </button>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthModal();
                  return;
                }
                setIngestError(null);
                setIngestSuccess(null);
                setIsIngestOpen(true);
              }}
              className="ml-btn ml-btn--primary ml-btn--sm"
            >
              <IconDownload size={14} />
              <span>{isAr ? 'رفع ملف CSV' : 'Upload CSV'}</span>
            </button>
          </div>
        }
      />

      {feedback && (
        <div className={`alert-feedback-banner ${feedback.type === 'error' ? 'error' : feedback.type === 'info' ? 'info' : 'success'}`}>
          {feedback.type === 'success' ? <IconCheck size={16} /> : <IconAlertTriangle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {!isAuthenticated ? (
        <EmptyState
          icon={<IconServer size={30} />}
          title={isAr ? 'سجّل الدخول لعرض قنوات الربط' : 'Sign in to view your connected data sources'}
          description={
            isAr
              ? 'تُسترجع قنوات الربط وسجلات المزامنة مباشرة من مساحة عمل مؤسستك بعد تسجيل الدخول.'
              : 'Connector channels and synchronization records are loaded directly from your organization workspace after signing in.'
          }
          action={
            <button onClick={openAuthModal} className="ml-btn ml-btn--primary">
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </button>
          }
        />
      ) : loading ? (
        <>
          <div className="skeleton-grid">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
          <div className="vc-skeleton-list">
            {[0, 1, 2].map((i) => (
              <div key={i} className="vc-skeleton-row" />
            ))}
          </div>
        </>
      ) : error ? (
        <EmptyState
          icon={<IconAlertTriangle size={30} />}
          title={isAr ? 'تعذر جلب مصادر البيانات' : 'Unable to load data sources'}
          description={error}
          action={
            <button onClick={() => fetchIntegrations()} className="ml-btn ml-btn--primary">
              <IconRefresh size={14} />
              <span>{isAr ? 'إعادة المحاولة' : 'Retry'}</span>
            </button>
          }
        />
      ) : sources.length === 0 ? (
        <EmptyState
          icon={<IconServer size={30} />}
          title={isAr ? 'لا توجد مصادر بيانات متصلة بعد' : 'No data sources connected yet'}
          description={
            isAr
              ? 'تظهر قنوات الربط وملفات البيانات المرفوعة هنا بمجرد أن ينشئ مسؤول المؤسسة قناة اتصال لمؤسستك، ثم تُحدَّث بعدد السجلات المزامَنة فعلياً.'
              : 'Connectors and uploaded datasets appear here once an administrator provisions a channel for your organization, and their record counts only reflect what has actually been synchronized.'
          }
          action={
            <button onClick={() => fetchIntegrations()} className="ml-btn ml-btn--ghost">
              <IconRefresh size={14} />
              <span>{isAr ? 'تحديث' : 'Refresh'}</span>
            </button>
          }
        />
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-tile">
              <div className="stat-tile__label">{isAr ? 'مصادر البيانات' : 'Data Sources'}</div>
              <div className="stat-tile__value">{sources.length.toLocaleString()}</div>
              <div className="stat-tile__hint">{isAr ? 'قنوات مسجلة لمؤسستك' : 'Channels registered for your organization'}</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile__label">{isAr ? 'قنوات سليمة' : 'Healthy Channels'}</div>
              <div className="stat-tile__value">{healthyCount.toLocaleString()}</div>
              <div className="stat-tile__hint">{isAr ? 'آخر مزامنة ناجحة' : 'Last synchronization succeeded'}</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile__label">{isAr ? 'تحتاج متابعة' : 'Needs Attention'}</div>
              <div className="stat-tile__value">{attentionCount.toLocaleString()}</div>
              <div className="stat-tile__hint">{isAr ? 'غير مهيأة أو مزامنتها ناقصة' : 'Not configured or sync incomplete'}</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile__label">{isAr ? 'سجلات مزامَنة' : 'Synced Records'}</div>
              <div className="stat-tile__value">{totalSynced.toLocaleString()}</div>
              <div className="stat-tile__hint">{isAr ? 'إجمالي مُرجَع من القنوات' : 'Total reported by your connectors'}</div>
            </div>
          </div>

          <div className="page-filter-bar">
            <div className="filter-group">
              <span className="filter-label">{isAr ? 'الحالة:' : 'Status:'}</span>
              <button onClick={() => setFilter('all')} className={`filter-chip ${filter === 'all' ? 'active' : ''}`}>
                {isAr ? `الكل (${sources.length})` : `All (${sources.length})`}
              </button>
              <button onClick={() => setFilter('healthy')} className={`filter-chip ${filter === 'healthy' ? 'active' : ''}`}>
                <span className="ml-dot" style={{ color: 'var(--status-success)' }} />
                {isAr ? `سليمة (${healthyCount})` : `Healthy (${healthyCount})`}
              </button>
              <button onClick={() => setFilter('attention')} className={`filter-chip ${filter === 'attention' ? 'active' : ''}`}>
                <span className="ml-dot" style={{ color: 'var(--status-warning)' }} />
                {isAr ? `تحتاج متابعة (${attentionCount})` : `Needs attention (${attentionCount})`}
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              compact
              icon={<IconServer size={30} />}
              title={isAr ? 'لا توجد قنوات بهذه الحالة' : 'No channels match this status'}
              description={
                isAr
                  ? 'اختر حالة أخرى لعرض بقية القنوات المسجلة لمؤسستك.'
                  : 'Select another status to view the remaining channels registered for your organization.'
              }
              action={
                <button onClick={() => setFilter('all')} className="ml-btn ml-btn--subtle ml-btn--sm">
                  {isAr ? 'عرض الكل' : 'Show all'}
                </button>
              }
            />
          ) : (
            <div className="record-list">
              {filtered.map((src) => {
                const name = isAr ? src.name_ar || src.name_en || src.id : src.name_en || src.name_ar || src.id;
                const status = (src.last_sync_status || 'NOT_CONFIGURED').toUpperCase();
                const isSyncing = syncingId === src.id;

                return (
                  <article key={src.id} className="record-row vc-row">
                    <div className="record-row__main">
                      <div className="record-row__title">{name}</div>
                      <div className="record-row__meta">
                        {[
                          src.category,
                          src.auth_type ? `${isAr ? 'المصادقة' : 'Auth'}: ${src.auth_type}` : undefined,
                          src.last_sync_at
                            ? `${isAr ? 'آخر مزامنة' : 'Last sync'}: ${new Date(src.last_sync_at).toLocaleString(locale)}`
                            : isAr
                              ? 'لم تُنفَّذ مزامنة بعد'
                              : 'No synchronization yet'
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </div>
                    </div>

                    <div className="vc-side-stat">
                      <span className="vc-side-stat__label">{isAr ? 'سجلات مزامَنة' : 'Synced records'}</span>
                      <span className="vc-side-stat__value">{(Number(src.records_synced_count) || 0).toLocaleString()}</span>
                    </div>

                    <div className="record-row__actions">
                      <span className={`ml-badge ${statusBadge(status)}`}>
                        <span className="ml-dot" />
                        {status}
                      </span>
                      <button
                        onClick={() => handleSync(src.id, name)}
                        disabled={isSyncing}
                        className="ml-btn ml-btn--primary ml-btn--sm"
                        aria-label={isAr ? `مزامنة ${name}` : `Sync ${name}`}
                      >
                        <IconRefresh size={13} className={isSyncing ? 'spin' : undefined} />
                        <span>{isSyncing ? (isAr ? 'جارِ المزامنة…' : 'Syncing…') : (isAr ? 'مزامنة' : 'Sync')}</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {isIngestOpen && (
        <div
          className="ml-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={isAr ? 'رفع بيانات CSV' : 'Upload CSV data'}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeIngest();
          }}
        >
          <div className="ml-modal">
            <div className="ml-modal__head">
              <h2 className="vc-modal-title">{isAr ? 'رفع مجموعة بيانات (CSV)' : 'Upload a dataset (CSV)'}</h2>
              <p className="vc-modal-desc">
                {isAr
                  ? 'الصق صفوف بصيغة CSV متوافقة مع RFC-4180. الأعمدة المطلوبة: مرجع المستند (documentNumber) وقيمة رقمية (amount).'
                  : 'Paste RFC-4180 compliant rows. Required columns: a reference (documentNumber) and a numeric value (amount).'}
              </p>
            </div>

            <div className="ml-modal__body">
              <div className="ml-field">
                <label className="ml-label" htmlFor="vc-csv-input">
                  {isAr ? 'بيانات CSV' : 'CSV data'}
                </label>
                <textarea
                  id="vc-csv-input"
                  className="ml-textarea vc-textarea--mono"
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={'documentNumber,name,amount,postingDate,description'}
                  rows={7}
                  spellCheck={false}
                />
                <span className="ml-hint">
                  {isAr
                    ? 'ترويسة إلزامية ثم صفاً واحداً على الأقل. يتم التحقق من كل صف قبل الإرسال.'
                    : 'A header row plus at least one data row. Every row is validated before submission.'}
                </span>
              </div>

              {ingestError && <div className="ml-error" style={{ whiteSpace: 'pre-wrap' }}>{ingestError}</div>}

              {ingestSuccess && (
                <div className="alert-feedback-banner success">
                  <IconCheck size={16} />
                  <span>{ingestSuccess}</span>
                </div>
              )}
            </div>

            <div className="ml-modal__foot vc-modal-foot">
              <button type="button" onClick={handleDownloadTemplate} className="ml-btn ml-btn--ghost ml-btn--sm">
                <IconDownload size={13} />
                <span>{isAr ? 'تنزيل نموذج' : 'Download template'}</span>
              </button>
              <span className="ml-grow" />
              <button type="button" onClick={closeIngest} className="ml-btn ml-btn--subtle">
                <IconX size={14} />
                <span>{isAr ? 'إغلاق' : 'Close'}</span>
              </button>
              <button
                type="button"
                onClick={handleIngestSubmit}
                disabled={ingestBusy}
                className="ml-btn ml-btn--primary"
              >
                {ingestBusy
                  ? (isAr ? 'جارِ التحقق…' : 'Validating…')
                  : (isAr ? 'استيراد الصفوف' : 'Import rows')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
