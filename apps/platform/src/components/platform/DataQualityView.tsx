import React, { useState } from 'react';
import { LocaleMode, DataQualityCheck } from '../../types';
import { MOCK_DATA_QUALITY } from '../../data/mockData';
import { IconDataQuality, IconCheck, IconRefresh } from '../Icons';

interface DataQualityViewProps {
  locale: LocaleMode;
}

export const DataQualityView: React.FC<DataQualityViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const [checks, setChecks] = useState<DataQualityCheck[]>(MOCK_DATA_QUALITY);
  const [isScanning, setIsScanning] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setChecks((prev) =>
        prev.map((c) => ({
          ...c,
          lastChecked: isAr ? 'الآن (محدث)' : 'Just now (Synced)'
        }))
      );
      setNotice(isAr ? 'اكتمل فحص تكامل وسلامة القيود عبر كافة الأنظمة. نسبة الامتثال الكلية: 97.4%.' : 'System-wide ledger integrity scan complete. Overall compliance: 97.4%.');
      setTimeout(() => setNotice(null), 4000);
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
            <span>{isAr ? 'محركات الذكاء' : 'Intelligence Suite'}</span>
            <span>/</span>
            <span className="current">{isAr ? 'جودة وحوكمة البيانات' : 'Data Quality Intelligence'}</span>
          </div>
          <h1 className="page-title">
            <IconDataQuality size={24} />
            <span>{isAr ? 'محرك جودة وحوكمة البيانات وتدقيق السجلات' : 'Data Quality & Governance Intelligence'}</span>
          </h1>
          <p className="page-subtitle">
            {isAr
              ? 'فحص اكتمال القيود المحاسبية، كشف الحقول الشاغرة في أوامر الشراء، وتدقيق تطابق الفواتير مع السجل الضريبي ZATCA.'
              : 'Verifying ledger integrity, missing-field anomalies in POs, and bi-directional reconciliation with tax compliance bridges.'}
          </p>
        </div>

        <button
          onClick={handleRunScan}
          disabled={isScanning}
          className="btn-primary"
          style={{ fontSize: '13px', padding: '10px 18px' }}
        >
          <IconRefresh size={14} className={isScanning ? 'spin' : ''} />
          <span>{isScanning ? (isAr ? 'جارِ فحص القيود...' : 'Scanning Ledgers...') : (isAr ? 'إجراء فحص سلامة القيود' : 'Run Integrity Audit Scan')}</span>
        </button>
      </div>

      {notice && (
        <div className="alert-feedback-banner success">
          <IconCheck size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="decisions-grid">
        {checks.map((check) => (
          <div key={check.id} className="decision-card">
            <div className="decision-card-header">
              <div className="badge-row">
                <span className={`severity-tag ${check.status === 'passed' ? 'optimal' : 'medium'}`}>
                  {check.status.toUpperCase()}
                </span>
                <span className="category-pill">{check.sourceSystem}</span>
              </div>
              <div className="decision-financial">
                <span className="label">{isAr ? 'نسبة الامتثال' : 'Compliance'}</span>
                <span className="amount" style={{ color: check.complianceRate > 95 ? 'var(--status-success)' : 'var(--status-warning)' }}>
                  {check.complianceRate}%
                </span>
              </div>
            </div>

            <h3 className="decision-title">
              {check.ruleName}
            </h3>

            <div className="risk-metric-strip">
              <div className="risk-metric-box">
                <span className="k">{isAr ? 'السجلات غير المعايرة' : 'Unmapped Records'}</span>
                <span className="v" style={{ color: check.unmappedRecords > 5 ? 'var(--status-danger)' : 'var(--text-primary)' }}>
                  {check.unmappedRecords} {isAr ? 'سجل' : 'rows'}
                </span>
              </div>
              <div className="risk-metric-box">
                <span className="k">{isAr ? 'آخر فحص تدقيق' : 'Last Audited'}</span>
                <span className="v">{check.lastChecked}</span>
              </div>
            </div>

            <div className="decision-actions-row">
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {isAr ? 'النظام المصدر: قراءة آمنة فقط (Read-Only Telemetry)' : 'Source: Non-Invasive Read-Only Telemetry'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
