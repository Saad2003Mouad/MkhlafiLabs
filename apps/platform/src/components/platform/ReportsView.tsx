// MIKHLAFI LABS — Executive Reports & Audit Trail
// Audit events are loaded exclusively from the authenticated backend.
// No simulated or demonstration records are ever rendered.

import React, { useState, useEffect, useCallback } from 'react';
import { LocaleMode } from '../../types';
import { IconFileText, IconDownload, IconCheck, IconRisk } from '../Icons';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../common/EmptyState';
import { PageHeader } from '../common/PageHeader';

interface ReportsViewProps {
  locale: LocaleMode;
}

interface AuditLogEntry {
  id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated, openAuthModal } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchAuditLogs = useCallback(async () => {
    if (!isAuthenticated) {
      setLogs([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.getTenantAuditLogs();
      setLogs(Array.isArray(res.logs) ? res.logs : []);
    } catch (err: any) {
      setLogs([]);
      setError(err.message || (isAr ? 'تعذّر تحميل سجلات التدقيق.' : 'Unable to load audit logs.'));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAr]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleExportCsv = () => {
    if (logs.length === 0) return;
    const headers = ['ID', 'Action', 'Entity_Type', 'Entity_ID', 'Timestamp', 'IP_Address'];
    const rows = logs.map((l) => [
      l.id,
      `"${(l.action || '').replace(/"/g, '""')}"`,
      `"${(l.entity_type || '').replace(/"/g, '""')}"`,
      `"${(l.entity_id || '').replace(/"/g, '""')}"`,
      `"${l.created_at}"`,
      `"${l.ip_address || ''}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `mikhlafi-labs-audit-trail-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setNotice(isAr ? 'تم تصدير سجلات التدقيق بصيغة CSV.' : 'Audit trail exported as CSV.');
    setTimeout(() => setNotice(null), 4000);
  };

  const handleExportPrint = () => {
    if (logs.length === 0) return;
    window.print();
    setNotice(isAr ? 'فُتحت نافذة الطباعة لتصدير التقرير.' : 'Print dialog opened for report export.');
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="platform-page-container">
      <PageHeader
        locale={locale}
        icon={<IconFileText size={22} />}
        breadcrumb={[isAr ? 'المنصة' : 'Platform', isAr ? 'الإدارة والسيادة' : 'Administration']}
        title={isAr ? 'التقارير وسجلات التدقيق' : 'Reports & Audit Trails'}
        subtitle={
          isAr
            ? 'سجل غير قابل للتعديل يوثّق كل إجراء تنفيذي ومراجعة تمت داخل مساحة عمل مؤسستك، مع إمكانية تصدير السجلات الفعلية.'
            : 'An append-only record of every executive action and review performed inside your organization workspace, with the actual records exportable at any time.'
        }
        action={
          <div className="vb-header-actions">
            <button onClick={handleExportPrint} disabled={logs.length === 0 || loading} className="ml-btn ml-btn--subtle ml-btn--sm">
              <IconDownload size={13} />
              <span>{isAr ? 'تصدير PDF' : 'Export PDF'}</span>
            </button>
            <button onClick={handleExportCsv} disabled={logs.length === 0 || loading} className="ml-btn ml-btn--ghost ml-btn--sm">
              <IconDownload size={13} />
              <span>{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
            </button>
          </div>
        }
      />

      {notice && (
        <div className="alert-feedback-banner success">
          <IconCheck size={16} />
          <span>{notice}</span>
        </div>
      )}

      {!isAuthenticated ? (
        <EmptyState
          icon={<IconFileText size={30} />}
          title={isAr ? 'سجّل الدخول لعرض سجلات التدقيق' : 'Sign in to view your audit trails'}
          description={
            isAr
              ? 'تُسترجَع أحداث التدقيق مباشرة من مساحة عمل مؤسستك بعد تسجيل الدخول. لا تُعرض أي سجلات للزوار.'
              : 'Audit events are loaded directly from your organization workspace after signing in. No records are shown to visitors.'
          }
          action={
            <button onClick={openAuthModal} className="ml-btn ml-btn--primary">
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </button>
          }
        />
      ) : (
        <>
          <div className="page-filter-bar">
            <div className="filter-group">
              <span className="filter-label">{isAr ? 'سلسلة الأحداث المثبتة' : 'Recorded Event Stream'}</span>
            </div>
            <div className="filter-group">
              <span className="ml-badge ml-badge--accent">
                {isAr ? `إجمالي الأحداث: ${logs.length}` : `Total Events: ${logs.length}`}
              </span>
            </div>
          </div>

          {error ? (
            <EmptyState
              icon={<IconRisk size={30} />}
              title={isAr ? 'تعذّر تحميل سجلات التدقيق' : 'Unable to load audit logs'}
              description={error}
              action={
                <button onClick={fetchAuditLogs} className="ml-btn ml-btn--primary">
                  {isAr ? 'إعادة المحاولة' : 'Retry'}
                </button>
              }
            />
          ) : loading ? (
            <div className="vb-table-wrap ml-panel">
              <div className="skeleton-grid" style={{ padding: 'var(--space-6)' }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="skeleton-card" />
                ))}
              </div>
            </div>
          ) : logs.length === 0 ? (
            <EmptyState
              icon={<IconFileText size={30} />}
              title={isAr ? 'لا توجد أحداث تدقيق مسجلة بعد' : 'No audit events recorded yet'}
              description={
                isAr
                  ? 'يُسجَّل كل إجراء تنفيذي — اعتماد قرار، مراجعة عميل، فحص جودة بيانات، أو مزامنة مصدر — تلقائياً في سجل التدقيق الخاص بمؤسستك.'
                  : 'Every executive action — executing a decision, reviewing an account, running a data quality scan, or syncing a source — is logged automatically to your organization’s audit trail.'
              }
            />
          ) : (
            <div className="ml-panel vb-table-wrap">
              <table className="vb-table">
                <thead>
                  <tr>
                    <th>{isAr ? 'رمز الإجراء' : 'Action Code'}</th>
                    <th>{isAr ? 'نوع السجل' : 'Entity Type'}</th>
                    <th>{isAr ? 'معرف السجل' : 'Entity ID'}</th>
                    <th>{isAr ? 'التوقيت' : 'Timestamp'}</th>
                    <th>{isAr ? 'المصدر' : 'Origin'}</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="vb-cell-mono vb-cell-accent">{log.action}</td>
                      <td>{log.entity_type || (isAr ? 'النظام' : 'SYSTEM')}</td>
                      <td className="vb-cell-mono">
                        {log.entity_id ? `${log.entity_id.substring(0, 8)}…` : '—'}
                      </td>
                      <td className="vb-cell-muted">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                      </td>
                      <td className="vb-cell-mono vb-cell-muted">{log.ip_address || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
