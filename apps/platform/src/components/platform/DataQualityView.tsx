import React, { useState, useEffect } from 'react';
import { LocaleMode } from '../../types';
import { IconDataQuality, IconCheck, IconRefresh } from '../Icons';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { DataQualityWorkbench } from '../governance/DataQualityWorkbench';

interface DataQualityViewProps {
  locale: LocaleMode;
}

export const DataQualityView: React.FC<DataQualityViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated } = useAuth();
  const [viewMode, setViewMode] = useState<'workbench' | 'database'>('workbench');
  const [checks, setChecks] = useState<any[]>([]);
  const [overallScore, setOverallScore] = useState<number>(0);
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

      {/* View Switcher Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', margin: '14px 0 20px 0', overflowX: 'auto' }}>
        <button
          onClick={() => setViewMode('workbench')}
          className={`ctrl-btn ${viewMode === 'workbench' ? 'active' : ''}`}
          style={{
            fontWeight: viewMode === 'workbench' ? 800 : 500,
            background: viewMode === 'workbench' ? 'linear-gradient(135deg, rgba(20, 184, 166, 0.25), rgba(13, 148, 136, 0.15))' : undefined,
            borderColor: viewMode === 'workbench' ? '#14B8A6' : undefined,
            color: viewMode === 'workbench' ? '#2DD4BF' : undefined
          }}
        >
          {isAr ? '🔬 منصة حوكمة وجودة الدفاتر (Workbench)' : '🔬 Data Governance & Quality Workbench'}
        </button>
        <button
          onClick={() => setViewMode('database')}
          className={`ctrl-btn ${viewMode === 'database' ? 'active' : ''}`}
          style={{ fontWeight: viewMode === 'database' ? 700 : 500 }}
        >
          {isAr ? '📊 جدول الفحوصات والامتثال المباشر (Direct Ledger Audits)' : '📊 Direct Ledger Audits'}
        </button>
      </div>

      {viewMode === 'workbench' ? (
        <DataQualityWorkbench
          locale={locale}
          initialScenario="retail_distribution"
        />
      ) : (
        <>
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
        {checks.length === 0 ? (
          <div
            className="content-panel"
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '48px 20px',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🔍</span>
            <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '6px' }}>
              {isAr ? 'لم يتم تشغيل فحص جودة البيانات حتى الآن' : 'No Data Quality Audits Run Yet'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
              {isAr
                ? 'انقر على "تشغيل فحص شامل وتدقيق النزاهة" أعلاه للتحقق من سلامة القيود والامتثال لمعايير ZATCA و IFRS.'
                : 'Click "Run Quality Audit Scan" above to verify ledger integrity against ZATCA & IFRS rules.'}
            </p>
          </div>
        ) : (
          checks.map((check) => {
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
                  <span className="k">{isAr ? 'آخر تدقيق' : 'Last Check'}</span>
                  <span className="v">{lastChecked}</span>
                </div>
              </div>
            </div>
          );
        })
      )}
      </div>
      </>
      )}
    </div>
  );
};
