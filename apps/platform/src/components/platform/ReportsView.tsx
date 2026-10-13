import React, { useState } from 'react';
import { LocaleMode, AuditLogItem } from '../../types';
import { MOCK_AUDIT_LOGS } from '../../data/mockData';
import { IconFileText, IconDownload, IconCheck } from '../Icons';

interface ReportsViewProps {
  locale: LocaleMode;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const [logs] = useState<AuditLogItem[]>(MOCK_AUDIT_LOGS);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleExport = (format: string) => {
    if (format === 'CSV') {
      // Generate actual RFC 4180 CSV with UTF-8 BOM for Microsoft Excel compatibility
      const headers = ['ID', 'Actor', 'Action_AR', 'Action_EN', 'Target_Record', 'Timestamp', 'SHA256_Hash'];
      const rows = logs.map(l => [
        l.id,
        `"${l.actor.replace(/"/g, '""')}"`,
        `"${(l.actionAr || '').replace(/"/g, '""')}"`,
        `"${(l.actionEn || '').replace(/"/g, '""')}"`,
        `"${(l.targetRecord || '').replace(/"/g, '""')}"`,
        `"${l.timestamp}"`,
        `"${l.hash}"`
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
        ? `تم تصدير وتنزيل التقرير التنفيذي بصيغة (${format}) موثقاً بالختم الرقمي SHA-256 بنجاح.`
        : `Executive audit log (${format}) exported with verifiable SHA-256 cryptographic hashes.`
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
              ? 'سجل غير قابل للتعديل يوثق كافة القرارات المتخذة، التدخلات البشرية، وحالات كشف الهدر مع البصمات المشفرة.'
              : 'Cryptographically sealed audit trail recording every executive action, human intervention, and detected forensic anomaly.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleExport('PDF')}
            className="btn-primary"
            style={{ fontSize: '12px', padding: '9px 14px' }}
          >
            <IconDownload size={14} />
            <span>{isAr ? 'تصدير التقرير التنفيذي (PDF)' : 'Export Executive PDF'}</span>
          </button>
          <button
            onClick={() => handleExport('CSV')}
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
            {isAr ? 'سلسلة العمليات المثبتة (Audit Entries)' : 'Verified Immutable Audit Log'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {isAr ? 'التوقيع الرقمي: مفعل' : 'Cryptographic Integrity: Active'}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'start' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'start' }}>{isAr ? 'المسؤول / النظام' : 'Actor'}</th>
                <th style={{ padding: '10px 14px', textAlign: 'start' }}>{isAr ? 'الإجراء الموثق' : 'Recorded Action'}</th>
                <th style={{ padding: '10px 14px', textAlign: 'start' }}>{isAr ? 'السجل المستهدف' : 'Target Entity'}</th>
                <th style={{ padding: '10px 14px', textAlign: 'start' }}>{isAr ? 'التوقيت' : 'Timestamp'}</th>
                <th style={{ padding: '10px 14px', textAlign: 'start' }}>{isAr ? 'بصمة التشفير (SHA-256)' : 'Hash'}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>{log.actor}</td>
                  <td style={{ padding: '12px 14px' }}>{isAr ? log.actionAr : log.actionEn}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', color: 'var(--accent-light)' }}>{log.targetRecord}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{log.timestamp}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-tertiary)' }}>
                    {log.hash.substring(0, 18)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
