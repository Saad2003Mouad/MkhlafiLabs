import React, { useState, useEffect } from 'react';
import { LocaleMode } from '../../types';
import { MOCK_DATA_QUALITY } from '../../data/mockData';
import { IconDataQuality, IconCheck, IconRefresh } from '../Icons';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface DataQualityViewProps {
  locale: LocaleMode;
}

export const DataQualityView: React.FC<DataQualityViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated } = useAuth();
  const [checks, setChecks] = useState<any[]>(MOCK_DATA_QUALITY);
  const [overallScore, setOverallScore] = useState<number>(97.4);
  const [isScanning, setIsScanning] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchAudits = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.getDataQualityAudits();
      if (res.audits && res.audits.length > 0) {
        setChecks(res.audits);
        setOverallScore(res.overallComplianceScore);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchAudits();
  }, [isAuthenticated]);

  const handleRunScan = async () => {
    setIsScanning(true);
    if (isAuthenticated) {
      try {
        const res = await api.runDataQualityScan();
        if (res.audits) {
          setChecks(res.audits);
          setOverallScore(res.overallComplianceScore);
        }
        setNotice(
          isAr
            ? `اكتمل فحص تكامل وسلامة القيود عبر كافة الأنظمة في PostgreSQL. نسبة الامتثال الكلية: ${res.overallComplianceScore}%.`
            : `System-wide ledger integrity scan complete in PostgreSQL. Overall compliance: ${res.overallComplianceScore}%.`
        );
        setTimeout(() => setNotice(null), 4000);
      } catch (err: any) {
        setNotice(err.message || 'Error running scan');
        setTimeout(() => setNotice(null), 4000);
      } finally {
        setIsScanning(false);
      }
      return;
    }

    // Demo fallback
    setTimeout(() => {
      setIsScanning(false);
      setChecks((prev) =>
        prev.map((c) => ({
          ...c,
          lastChecked: isAr ? 'الآن (محدث)' : 'Just now (Synced)'
        }))
      );
      setNotice(isAr ? 'اكتمل فحص تكامل وسلامة القيود (عرض تجريبي). نسبة الامتثال الكلية: 97.4%.' : 'System-wide scan complete (demo).');
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

      {/* Compliance Overview Badge */}
      <div className="page-filter-bar">
        <div className="filter-group">
          <span className="filter-label">{isAr ? 'معدل الامتثال الكلي:' : 'Overall Compliance:'}</span>
          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--status-success)' }}>
            {overallScore}%
          </span>
        </div>
        <div className="meta-stats">
          <span>{isAr ? 'فحص حتمي مطابق لمعايير ZATCA & IFRS' : 'Deterministic ZATCA & IFRS Validation'}</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="decisions-grid">
        {checks.map((check) => {
          const ruleName = check.rule_name || check.ruleName;
          const source = check.source_system || check.sourceSystem;
          const compliance = check.compliance_rate ?? check.complianceRate ?? 99;
          const unmapped = check.unmapped_records ?? check.unmappedRecords ?? 0;
          const lastChecked = check.last_checked || check.lastChecked || 'الآن';
          const isPassed = check.status === 'passed' || check.status === 'PASS';

          return (
            <div key={check.id} className="decision-card">
              <div className="decision-card-header">
                <div className="badge-row">
                  <span className={`severity-tag ${isPassed ? 'optimal' : 'medium'}`}>
                    {isPassed ? (isAr ? 'سليم ومطابق' : 'PASSED') : (isAr ? 'تنبيه تدقيق' : 'WARNING')}
                  </span>
                  <span className="category-pill">{source}</span>
                </div>
                <div className="decision-financial">
                  <span className="label">{isAr ? 'معدل الامتثال' : 'Compliance Rate'}</span>
                  <span className="amount" style={{ color: isPassed ? 'var(--status-success)' : 'var(--status-warning)' }}>
                    {compliance}%
                  </span>
                </div>
              </div>

              <h3 className="decision-title">
                {ruleName}
              </h3>

              <div className="risk-metric-strip">
                <div className="risk-metric-box">
                  <span className="k">{isAr ? 'القيود غير المتطابقة' : 'Unmapped Records'}</span>
                  <span className="v" style={{ color: unmapped > 0 ? 'var(--status-warning)' : 'var(--status-success)' }}>
                    {unmapped} {isAr ? 'قيود' : 'records'}
                  </span>
                </div>
                <div className="risk-metric-box">
                  <span className="k">{isAr ? 'آخر تدقيق' : 'Last Checked'}</span>
                  <span className="v">{lastChecked}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
