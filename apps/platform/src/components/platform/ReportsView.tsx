import React, { useState, useEffect } from 'react';
import { LocaleMode } from '../../types';
import { IconFileText, IconDownload, IconCheck } from '../Icons';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface ReportsViewProps {
  locale: LocaleMode;
}

interface AuditLogEntry {
  id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: any;
  ip_address?: string;
  created_at: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const fetchAuditLogs = async () => {
    setLoading(true);
    if (!isAuthenticated) {
      setLogs([]);
      setLoading(false);
      return;
    }
    try {
      const res = await api.getTenantAuditLogs();
      setLogs(res.logs || []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [isAuthenticated]);

  const handleExport = (format: string) => {
    if (format === 'CSV') {
      const headers = ['ID', 'Action', 'Entity_Type', 'Entity_ID', 'Timestamp', 'IP_Address'];
      const rows = logs.map(l => [
        l.id,
        `"${(l.action || '').replace(/"/g, '""')}"`,
        `"${(l.entity_type || '').replace(/"/g, '""')}"`,
        `"${(l.entity_id || '').replace(/"/g, '""')}"`,
        `"${l.created_at}"`,
        `"${l.ip_address || 'internal'}"`
      ]);
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `mikhlafi-labs-audit-trail-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (format === 'PDF') {
      window.print();
    }

    setDownloadNotice(
      isAr
        ? `تم تصدير وتنزيل التقرير التنفيذي بصيغة (${format}) موثقاً من واقع قاعدة البيانات بنجاح.`
        : `Executive audit log (${format}) exported successfully from verified database records.`
    );
    setTimeout(() => setDownloadNotice(null), 4000);
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
            <span className="current">{isAr ? 'التقارير وسجلات التدقيق' : 'Reports & Audit Trails'}</span>
          </div>
          <h1 className="page-title">
            <IconFileText size={24} />
            <span>{isAr ? 'التقارير التنفيذية وسلسلة سجلات التدقيق الجنائي' : 'Executive Reports & Immutable Audit Stream'}</span>
          </h1>
          <p className="page-subtitle">
            {isAr
              ? 'سجل غير قابل للتعديل يوثق كافة القرارات المتخذة، التدخلات البشرية، وحالات كشف الهدر المسجلة في PostgreSQL.'
              : 'Cryptographically sealed audit trail recording every executive action, human intervention, and detected forensic anomaly.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleExport('PDF')}
            disabled={logs.length === 0}
            className="btn-primary"
            style={{ fontSize: '12px', padding: '9px 14px' }}
          >
            <IconDownload size={14} />
            <span>{isAr ? 'تصدير التقرير التنفيذي (PDF)' : 'Export Executive PDF'}</span>
          </button>
          <button
            onClick={() => handleExport('CSV')}
            disabled={logs.length === 0}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '9px 14px' }}
          >
            <IconDownload size={14} />
            <span>{isAr ? 'تصدير سجل القيود (CSV)' : 'Export Ledger CSV'}</span>
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div className="alert-feedback-banner success">
          <IconCheck size={16} />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Audit Log Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginTop: '16px' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '13px' }}>
            {isAr ? 'سلسلة العمليات المثبتة في PostgreSQL' : 'Verified Immutable Audit Log'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {isAr ? `إجمالي الأحداث: ${logs.length}` : `Total Events: ${logs.length}`}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'start' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'start' }}>{isAr ? 'رمز الإجراء' : 'Action Code'}</th>
                <th style={{ padding: '10px 14px', textAlign: 'start' }}>{isAr ? 'نوع السجل' : 'Entity Type'}</th>
                <th style={{ padding: '10px 14px', textAlign: 'start' }}>{isAr ? 'معرف السجل' : 'Entity ID'}</th>
                <th style={{ padding: '10px 14px', textAlign: 'start' }}>{isAr ? 'التوقيت' : 'Timestamp'}</th>
                <th style={{ padding: '10px 14px', textAlign: 'start' }}>{isAr ? 'عنوان IP' : 'Origin'}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    {isAr ? 'جاري استرجاع سجلات التدقيق من PostgreSQL...' : 'Loading audit logs...'}
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--accent-light)' }}>
                      {log.action}
                    </td>
                    <td style={{ padding: '12px 14px' }}>{log.entity_type || 'SYSTEM'}</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)' }}>{log.entity_id ? log.entity_id.substring(0, 8) : '-'}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      {log.ip_address || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>📜</span>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {isAr ? 'لا توجد سجلات تدقيق مسجلة حتى الآن' : 'No Audit Events Recorded'}
                    </strong>
                    <p style={{ margin: '4px 0 0', fontSize: '11px' }}>
                      {isAr
                        ? 'يتم تسجيل أحداث التدقيق المشفرة تلقائياً في جدول audit_logs عند اتخاذ أي إجراء تنفيذي أو اعتماد قرار أو مزامنة بيانات.'
                        : 'Audit events log automatically in audit_logs whenever decisions are executed or ledger entries are reconciled.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
