// MIKHLAFI LABS — Enterprise Forensic Audit Workbench Component
// Interactive end-to-end ledger auditing, scenario selection, custom CSV scanning,
// evidence inspection dossier, and board-ready exportable reports.

import React, { useState, useMemo } from 'react';
import { LocaleMode } from '../../types';
import {
  LedgerTransaction,
  ForensicAnomalyCase,
  AuditScanResult,
  PRESET_SCENARIOS,
  runForensicAudit,
  parseLedgerCsv
} from '../../services/forensics/financialLeakEngine';
import {
  IconCheckCircle,
  IconDownload,
  IconX
} from '../Icons';

interface ForensicAuditWorkbenchProps {
  locale: LocaleMode;
  initialScenario?: string;
  isEmbeddedInPublicPage?: boolean;
  onRequestAssistance?: (caseDetails: string) => void;
}

export const ForensicAuditWorkbench: React.FC<ForensicAuditWorkbenchProps> = ({
  locale,
  initialScenario = 'contracting',
  isEmbeddedInPublicPage = false,
  onRequestAssistance
}) => {
  const isAr = locale === 'ar';

  const [activeScenarioKey, setActiveScenarioKey] = useState<string>(initialScenario);
  const [activeTab, setActiveTab] = useState<'anomalies' | 'vouchers' | 'rules' | 'dossier'>('anomalies');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(100);
  const [scanTerminalLogs, setScanTerminalLogs] = useState<string[]>([]);

  // Scan Results State
  const [scanResult, setScanResult] = useState<AuditScanResult>(() => {
    return runForensicAudit(PRESET_SCENARIOS['contracting'].vouchers, 'Initial Contracting');
  });

  // Modal State for Evidence Dossier
  const [activeModalCase, setActiveModalCase] = useState<ForensicAnomalyCase | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Custom File Upload State
  const [customFileName, setCustomFileName] = useState<string | null>(null);

  // Switch scenario
  const handleSelectScenario = (key: string) => {
    setActiveScenarioKey(key);
    setCustomFileName(null);
    executeAudit(PRESET_SCENARIOS[key].vouchers, PRESET_SCENARIOS[key].nameAr);
  };

  // Execute audit simulation
  const executeAudit = (data: LedgerTransaction[], scenarioName: string) => {
    setIsScanning(true);
    setScanProgress(10);
    setScanTerminalLogs([
      isAr ? `بدء الاتصال بمصدر البيانات: ${scenarioName}...` : `Connecting to datasource: ${scenarioName}...`,
      isAr ? `تشفير وحساب البصمة الرقمية للقيود...` : `Computing cryptographic voucher hashes...`
    ]);

    setTimeout(() => {
      setScanProgress(45);
      setScanTerminalLogs((prev) => [
        ...prev,
        isAr ? `تشغيل خوارزمية الفواتير المكررة ومطابقة IBAN...` : `Running DUPLICATE_INVOICE_HASH & IBAN matching...`,
        isAr ? `فحص تجزئة أوامر الشراء تحت سقف 100,000 ريال...` : `Evaluating PO split threshold evasion rules...`
      ]);
    }, 400);

    setTimeout(() => {
      setScanProgress(80);
      setScanTerminalLogs((prev) => [
        ...prev,
        isAr ? `مقارنة أسعار العقود الإطارية وتفاوت الأسعار بين الفروع...` : `Benchmarking cross-branch unit prices & rate cards...`,
        isAr ? `مطابقة المعالم المنجزة وتدقيق الفوترة المتأخرة...` : `Cross-referencing unbilled milestones & ZATCA timestamps...`
      ]);
    }, 800);

    setTimeout(() => {
      const result = runForensicAudit(data, scenarioName);
      setScanResult(result);
      setScanProgress(100);
      setIsScanning(false);
      setScanTerminalLogs((prev) => [
        ...prev,
        isAr ? `✅ اكتمل الفحص: تم رصد ${result.totalAnomaliesDetected} حالات انحراف مالي بقيمة ${result.activeLeakageSAR.toLocaleString('ar-SA')} ر.س.` : `✅ Audit complete: ${result.totalAnomaliesDetected} verified leaks flagged (${result.activeLeakageSAR.toLocaleString('en-US')} SAR).`
      ]);
    }, 1200);
  };

  // Custom CSV upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseLedgerCsv(text);
      if (parsed.length > 0) {
        setActiveScenarioKey('custom');
        executeAudit(parsed, file.name);
      } else {
        alert(isAr ? 'لم نتمكن من قراءة أسطر المعاملات. يرجى التأكد من احتواء الملف على أعمدة (المورد، المبلغ، الفاتورة).' : 'Could not parse ledger rows. Ensure CSV contains Vendor, Amount, Invoice columns.');
      }
    };
    reader.readAsText(file);
  };

  // Sample CSV generator for download
  const handleDownloadSampleCsv = () => {
    const csvContent =
      'InvoiceNumber,PostingDate,VendorName,AmountSAR,ItemDescription,Branch,CostCenter\n' +
      'INV-90412,2026-03-12,شركة التوريدات المتحدة,48500,حديد تسليح 16 ملم,الرياض,CC-SITE-MALQA\n' +
      'INV-90388,2026-03-01,شركة التوريدات المتحدة,48500,حديد تسليح 16 ملم,الرياض,CC-SITE-MALQA\n' +
      'PO-SPLIT-A,2026-03-18,مؤسسة المسار للكهروميكانيك,98000,كابلات نحاسية ضغط منخفض,الرياض,CC-METRO-P4\n' +
      'PO-SPLIT-B,2026-03-19,مؤسسة المسار للكهروميكانيك,95000,كابلات نحاسية ضغط منخفض,الرياض,CC-METRO-P4\n' +
      'RATE-01,2026-03-22,شركة الشرق للخرسانة,82500,خرسانة مقاومة C35,الخبر,CC-SITE-KHOBAR\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_saudi_ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Case resolution handlers
  const handleResolveCase = (caseId: string, newStatus: 'FROZEN' | 'LEGITIMATE') => {
    setScanResult((prev) => {
      const updatedAnomalies = prev.anomalies.map((a) => {
        if (a.id === caseId) {
          return { ...a, status: newStatus };
        }
        return a;
      });

      const activeLeak = updatedAnomalies
        .filter((a) => a.status === 'DETECTED')
        .reduce((sum, a) => sum + a.flaggedAmountSAR, 0);

      const protectedAmt = updatedAnomalies
        .filter((a) => a.status === 'FROZEN')
        .reduce((sum, a) => sum + a.flaggedAmountSAR, 0);

      return {
        ...prev,
        activeLeakageSAR: activeLeak,
        protectedCapitalSAR: protectedAmt,
        anomalies: updatedAnomalies
      };
    });

    if (activeModalCase && activeModalCase.id === caseId) {
      setActiveModalCase((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    const msg =
      newStatus === 'FROZEN'
        ? isAr
          ? 'تم تجميد أمر الصرف رسمياً وحماية المبلغ في حساب المنشأة.'
          : 'Payout frozen officially. Capital protected in company ledger.'
        : isAr
        ? 'تم استبعاد الحالة واعتمادها كمطالبة مشروعة.'
        : 'Case marked as legitimate and dismissed.';

    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Export full audit report as CSV
  const handleExportAuditCsv = () => {
    let csv = 'CaseNumber,RuleCode,Severity,ConfidencePct,TargetVendor,FlaggedAmountSAR,Status,VoucherNumber,Branch,RegulatoryStandard\n';
    scanResult.anomalies.forEach((a) => {
      csv += `"${a.caseNumber}","${a.ruleCode}","${a.severity}",${a.confidencePct},"${a.targetVendor}",${a.flaggedAmountSAR},"${a.status}","${a.primaryVoucher}","${a.branch}","${a.regulatoryStandard}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Forensic_Audit_Report_${scanResult.scanId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered anomalies list
  const filteredAnomalies = useMemo(() => {
    return scanResult.anomalies.filter((a) => {
      const matchSeverity = selectedSeverity === 'all' || a.severity.toLowerCase() === selectedSeverity.toLowerCase();
      const matchSearch =
        searchQuery.trim() === '' ||
        a.targetVendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.ruleTitleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.ruleTitleEn.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSeverity && matchSearch;
    });
  }, [scanResult.anomalies, selectedSeverity, searchQuery]);

  return (
    <div
      className="forensic-workbench-card"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-elevated)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0'
      }}
    >
      {/* Public Page Sandbox Header */}
      {isEmbeddedInPublicPage && (
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(14, 165, 233, 0.12), rgba(16, 185, 129, 0.08))',
            padding: '10px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '14px' }}>⚡</span>
            <span>
              {isAr
                ? 'محطة تدقيق جنائي حية وتفاعلية — يمكنك اختبار سيناريوهات الشركات الكبرى أو رفع ملفك المالي الفعلي (CSV).'
                : 'Interactive Forensic Audit Workbench — Test real enterprise scenarios or upload your custom ledger CSV.'}
            </span>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-light)' }}>
            SANDBOX_INTERACTIVE
          </span>
        </div>
      )}

      {/* Workbench Header & Scenario Bar */}
      <div
        style={{
          background: 'var(--bg-surface-elevated)',
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--status-success)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
              AUTONOMOUS FORENSIC LAB // V2.4_PROD
            </span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px' }}>
            {isAr ? 'مختبر الفحص الجنائي المستمر للدفاتر المحاسبية' : 'Autonomous Ledger Forensic & Leakage Scanner'}
          </h2>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Custom File Upload Button */}
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span>📁 {isAr ? (customFileName ? customFileName : 'رفع ملف قيود CSV مخصص') : (customFileName ? customFileName : 'Upload Custom CSV')}</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          <button
            onClick={handleDownloadSampleCsv}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-xs)',
              background: 'transparent',
              border: '1px dashed var(--border-subtle)',
              color: 'var(--text-tertiary)',
              fontSize: '11.5px',
              cursor: 'pointer'
            }}
            title={isAr ? 'تحميل نموذج ملف إكسل تجريبي' : 'Download Sample CSV'}
          >
            <IconDownload size={13} />
            <span>{isAr ? 'نموذج CSV' : 'Sample CSV'}</span>
          </button>
        </div>
      </div>

      {/* Preset Scenario Selector Strip */}
      <div
        style={{
          background: 'var(--bg-surface-subtle)',
          padding: '12px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          overflowX: 'auto'
        }}
      >
        <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-tertiary)', flexShrink: 0 }}>
          {isAr ? 'السيناريوهات الجاهزة:' : 'Live Enterprise Scenarios:'}
        </span>

        {Object.entries(PRESET_SCENARIOS).map(([key, scn]) => {
          const isSelected = activeScenarioKey === key && !customFileName;
          return (
            <button
              key={key}
              onClick={() => handleSelectScenario(key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '999px',
                border: isSelected ? '1px solid var(--status-success)' : '1px solid var(--border-subtle)',
                background: isSelected ? 'rgba(16, 185, 129, 0.14)' : 'var(--bg-surface)',
                color: isSelected ? 'var(--status-success)' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: isSelected ? 800 : 600,
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
            >
              <span>{isAr ? scn.nameAr : scn.nameEn}</span>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', padding: '1px 5px', borderRadius: '4px', background: 'rgba(0,0,0,0.25)' }}>
                {scn.annualSpendSAR}
              </span>
            </button>
          );
        })}
      </div>

      {/* Scanning Live Telemetry Banner (If Scanning) */}
      {isScanning && (
        <div style={{ background: '#000', padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--status-success)', fontWeight: 700 }}>
              {isAr ? 'جاري الفحص الجنائي المستقل...' : 'Executing forensic scan algorithms...'}
            </span>
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              {scanProgress}%
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{ width: `${scanProgress}%`, height: '100%', background: 'var(--status-success)', transition: 'width 0.3s ease' }} />
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.5, maxHeight: '60px', overflowY: 'hidden' }}>
            {scanTerminalLogs.slice(-2).map((log, lIdx) => (
              <div key={lIdx}>&gt; {log}</div>
            ))}
          </div>
        </div>
      )}

      {/* Success Notification Alert */}
      {actionSuccessMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', borderBottom: '1px solid var(--status-success)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--status-success)', fontSize: '13px', fontWeight: 700 }}>
          <IconCheckCircle size={16} />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* KPI Metrics Dashboard Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          padding: '20px 24px',
          background: 'var(--bg-surface-elevated)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>
            {isAr ? 'الإنفاق الإجمالي المفحوص' : 'Total Audited Spend'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '4px' }}>
            {scanResult.totalSpendSAR.toLocaleString(isAr ? 'ar-SA' : 'en-US')} <span style={{ fontSize: '12px' }}>SAR</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            {scanResult.totalVouchersAudited} {isAr ? 'سند وقيد محاسبي' : 'Vouchers Audited'}
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
          <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 800, textTransform: 'uppercase' }}>
            {isAr ? 'الهدر المالي المرصود (نشط)' : 'Flagged Active Leakage'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#ef4444', marginTop: '4px' }}>
            {scanResult.activeLeakageSAR.toLocaleString(isAr ? 'ar-SA' : 'en-US')} <span style={{ fontSize: '12px' }}>SAR</span>
          </div>
          <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '2px', fontWeight: 600 }}>
            {scanResult.totalAnomaliesDetected} {isAr ? 'حالات تستدعي وقف الصرف' : 'Actionable Discrepancies'}
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
          <div style={{ fontSize: '11px', color: 'var(--status-success)', fontWeight: 800, textTransform: 'uppercase' }}>
            {isAr ? 'المبالغ المجمدة والمحمية' : 'Capital Frozen / Protected'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--status-success)', marginTop: '4px' }}>
            {scanResult.protectedCapitalSAR.toLocaleString(isAr ? 'ar-SA' : 'en-US')} <span style={{ fontSize: '12px' }}>SAR</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--status-success)', marginTop: '2px', fontWeight: 600 }}>
            {isAr ? 'تم استردادها بحساب الشركة' : 'Clawed back to balance'}
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--accent-light)', fontWeight: 800, textTransform: 'uppercase' }}>
            {isAr ? 'أعلى تسرب منفرد' : 'Highest Single Leak'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--accent-light)', marginTop: '4px' }}>
            {scanResult.highestSingleLeakSAR.toLocaleString(isAr ? 'ar-SA' : 'en-US')} <span style={{ fontSize: '12px' }}>SAR</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            {isAr ? 'ثقة جنائية 100% مثبتة' : '100% Deterministic Proof'}
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div
        style={{
          padding: '0 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '20px',
          background: 'var(--bg-surface)'
        }}
      >
        {[
          { id: 'anomalies', labelAr: `طابور الحالات المكتشفة (${scanResult.anomalies.length})`, labelEn: `Flagged Anomalies (${scanResult.anomalies.length})` },
          { id: 'vouchers', labelAr: `سجل القيود المفحوصة (${scanResult.vouchers.length})`, labelEn: `Audited Vouchers (${scanResult.vouchers.length})` },
          { id: 'rules', labelAr: 'مصفوفة القواعد الجنائية (6)', labelEn: 'Forensic Rules Matrix (6)' },
          { id: 'dossier', labelAr: 'التقرير والوثائق الرسمية (Dossier)', labelEn: 'Board Dossier & Export' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--status-success)' : '2px solid transparent',
                padding: '14px 4px',
                color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                fontWeight: isActive ? 800 : 600,
                fontSize: '13.5px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: Flagged Anomalies Queue ───────────────────────────────────── */}
      {activeTab === 'anomalies' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filters Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'all', labelAr: 'الكل', labelEn: 'All' },
                { id: 'critical', labelAr: 'حرج (Critical)', labelEn: 'Critical' },
                { id: 'high', labelAr: 'عالي (High)', labelEn: 'High' },
                { id: 'warning', labelAr: 'تحذير (Warning)', labelEn: 'Warning' }
              ].map((sev) => (
                <button
                  key={sev.id}
                  onClick={() => setSelectedSeverity(sev.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: selectedSeverity === sev.id ? 800 : 600,
                    border: selectedSeverity === sev.id ? '1px solid var(--border-strong)' : '1px solid var(--border-subtle)',
                    background: selectedSeverity === sev.id ? 'var(--bg-surface-elevated)' : 'transparent',
                    color: selectedSeverity === sev.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    cursor: 'pointer'
                  }}
                >
                  {isAr ? sev.labelAr : sev.labelEn}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث برقم السند أو المورد أو القاعدة...' : 'Search by voucher, vendor, or rule...'}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                width: '260px'
              }}
            />
          </div>

          {/* Anomalies Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredAnomalies.map((anom) => {
              const isFrozen = anom.status === 'FROZEN';
              const isLegitimate = anom.status === 'LEGITIMATE';

              return (
                <div
                  key={anom.id}
                  style={{
                    background: isFrozen ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-surface-elevated)',
                    border: isFrozen ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: anom.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: anom.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'
                        }}
                      >
                        {anom.severity}
                      </span>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
                        {anom.caseNumber}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        • {anom.branch} ({anom.costCenter})
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: isFrozen ? 'var(--status-success)' : '#ef4444' }}>
                        {anom.flaggedAmountSAR.toLocaleString(isAr ? 'ar-SA' : 'en-US')} SAR
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: isFrozen ? 'rgba(16, 185, 129, 0.2)' : isLegitimate ? 'rgba(255,255,255,0.1)' : 'rgba(239, 68, 68, 0.2)',
                          color: isFrozen ? 'var(--status-success)' : isLegitimate ? 'var(--text-secondary)' : '#ef4444'
                        }}
                      >
                        {anom.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {isAr ? anom.ruleTitleAr : anom.ruleTitleEn} - {anom.targetVendor}
                    </h4>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                      {isAr ? anom.narrativeAr : anom.narrativeEn}
                    </p>
                  </div>

                  {/* Cryptographic Proof Chip */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', background: 'var(--bg-surface)', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                    <span>PROOF:</span>
                    <span style={{ color: 'var(--accent-light)' }}>{anom.cryptographicHash}</span>
                    <span style={{ marginInlineStart: 'auto', color: 'var(--status-success)', fontWeight: 700 }}>
                      ✓ {anom.confidencePct}% {isAr ? 'تطابق قطعي' : 'Confidence'}
                    </span>
                  </div>

                  {/* Action Buttons Strip */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    <button
                      onClick={() => setActiveModalCase(anom)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-light)',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>{isAr ? '🔍 فتح ملف الأدلة الجنائية والإثبات' : '🔍 Inspect Forensic Evidence Dossier'}</span>
                    </button>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!isFrozen && (
                        <button
                          onClick={() => handleResolveCase(anom.id, 'FROZEN')}
                          className="btn-primary"
                          style={{
                            fontSize: '11.5px',
                            padding: '6px 14px',
                            background: '#ef4444',
                            border: '1px solid #dc2626'
                          }}
                        >
                          <span>🛡️ {isAr ? 'تجميد أمر الصرف فورا' : 'Freeze Payout'}</span>
                        </button>
                      )}

                      {!isLegitimate && !isFrozen && (
                        <button
                          onClick={() => handleResolveCase(anom.id, 'LEGITIMATE')}
                          style={{
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-tertiary)',
                            fontSize: '11.5px',
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-xs)',
                            cursor: 'pointer'
                          }}
                        >
                          <span>{isAr ? 'اعتماد كمشروع' : 'Dismiss'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredAnomalies.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                {isAr ? 'لا توجد حالات تطابق شروط التصفية الحالية.' : 'No anomalies match the current filter.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: Audited Vouchers Table ────────────────────────────────────── */}
      {activeTab === 'vouchers' && (
        <div style={{ padding: '24px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-default)' }}>
                <th style={{ padding: '10px 14px', color: 'var(--text-tertiary)', fontWeight: 800 }}>#</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-tertiary)', fontWeight: 800 }}>{isAr ? 'رقم السند/الفاتورة' : 'Voucher No'}</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-tertiary)', fontWeight: 800 }}>{isAr ? 'التاريخ' : 'Date'}</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-tertiary)', fontWeight: 800 }}>{isAr ? 'المورد/الجهة' : 'Vendor'}</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-tertiary)', fontWeight: 800 }}>{isAr ? 'البيان' : 'Description'}</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-tertiary)', fontWeight: 800 }}>{isAr ? 'الفرع' : 'Branch'}</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-tertiary)', fontWeight: 800 }}>{isAr ? 'المبلغ' : 'Amount SAR'}</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-tertiary)', fontWeight: 800 }}>{isAr ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              {scanResult.vouchers.map((v, idx) => (
                <tr
                  key={v.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: v.status === 'FLAGGED' ? 'rgba(239, 68, 68, 0.04)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{idx + 1}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>{v.voucherNumber}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{v.postingDate}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>{v.vendorName}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {v.itemDescription}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{v.branch}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: v.status === 'FLAGGED' ? '#ef4444' : 'var(--text-primary)' }}>
                    {v.amountSAR.toLocaleString(isAr ? 'ar-SA' : 'en-US')}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '3px',
                        background: v.status === 'FLAGGED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: v.status === 'FLAGGED' ? '#ef4444' : 'var(--status-success)'
                      }}
                    >
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB 3: Forensic Rules Matrix ─────────────────────────────────────── */}
      {activeTab === 'rules' && (
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {[
            {
              code: 'DUPLICATE_INVOICE_HASH',
              titleAr: 'كشف الفواتير وسندات الصرف المكررة',
              titleEn: 'Duplicate Invoice Hash Matching',
              mathAr: 'تطابق المورد + القيمة + نافذة زمنية ≤ 35 يوماً',
              triggers: scanResult.anomalies.filter((a) => a.ruleCode === 'DUPLICATE_INVOICE_HASH').length,
              law: 'SOCPA GAAP Standard on Internal Disbursement Controls'
            },
            {
              code: 'PO_SPLIT_THRESHOLD_EVASION',
              titleAr: 'تجزئة طلبات الشراء للالتفاف على الصلاحيات',
              titleEn: 'Split PO Approval Evasion Filter',
              mathAr: 'أكثر من أمرين شراء لنفس المورد خلال 72 ساعة بقيمة 80k - 99k ر.س',
              triggers: scanResult.anomalies.filter((a) => a.ruleCode === 'PO_SPLIT_THRESHOLD_EVASION').length,
              law: 'Saudi CMA Corporate Governance Regulations Article 42'
            },
            {
              code: 'CROSS_BRANCH_PRICE_DIVERGENCE',
              titleAr: 'تباين أسعار الشراء لنفس الصنف بين الفروع',
              titleEn: 'Cross-Branch SKU Rate Benchmark',
              mathAr: 'انحراف تسعيرة المورد لنفس الصنف بين الفروع > 15%',
              triggers: scanResult.anomalies.filter((a) => a.ruleCode === 'CROSS_BRANCH_PRICE_DIVERGENCE').length,
              law: 'Group Procurement Standard Uniform Master Pricing'
            },
            {
              code: 'CONTRACT_RATE_CARD_BREACH',
              titleAr: 'تجاوز تسعيرة العقد الإطاري السنوي',
              titleEn: 'Master Framework Rate Card Breach',
              mathAr: 'سعر الفاتورة الفعلي > السعر المعتمد بالعقد الموثق',
              triggers: scanResult.anomalies.filter((a) => a.ruleCode === 'CONTRACT_RATE_CARD_BREACH').length,
              law: 'Commercial Master Supply Agreement Clause 4.2'
            },
            {
              code: 'UNBILLED_MILESTONE_SLIPPAGE',
              titleAr: 'معالم منجزة في الموقع غير مفوترة',
              titleEn: 'Unbilled Milestone & DSO Lock',
              mathAr: 'إنجاز موقع موثق هندسياً دون فوترة > 45 يوماً',
              triggers: scanResult.anomalies.filter((a) => a.ruleCode === 'UNBILLED_MILESTONE_SLIPPAGE').length,
              law: 'ZATCA E-Invoicing Phase 2 Timely Issuance Mandate'
            },
            {
              code: 'BENFORD_DIGIT_ANOMALY',
              titleAr: 'فحص التوزيع الرقمي لكشف التلاعب اليدوي',
              titleEn: 'Benford Law First-Digit Variance',
              mathAr: 'انحراف التكرار الرقمي عن معادلة Log10(1 + 1/d)',
              triggers: 0,
              law: 'Forensic Accounting Association Fraud Detection Standard'
            }
          ].map((r, rIdx) => (
            <div key={rIdx} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--status-success)', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)' }}>
                  {r.code}
                </span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: r.triggers > 0 ? '#ef4444' : 'var(--text-tertiary)' }}>
                  {r.triggers} {isAr ? 'حالات' : 'Triggers'}
                </span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {isAr ? r.titleAr : r.titleEn}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '8px', borderRadius: '4px', border: '1px dashed var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '10px' }}>{isAr ? 'الشرط الحسابي:' : 'Formula:'}</span> {r.mathAr}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: 'auto' }}>
                ⚖️ {r.law}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 4: Board Audit Dossier & Export ──────────────────────────────── */}
      {activeTab === 'dossier' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Printable Formal Audit Report Card */}
          <div
            id="printable-audit-dossier"
            style={{
              background: '#0a0f14',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              color: '#F8FAFC'
            }}
          >
            {/* Report Official Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid rgba(255,255,255,0.15)', paddingBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-light)', letterSpacing: '0.1em' }}>
                  MIKHLAFI LABS // EXECUTIVE FORENSIC DOSSIER
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 900, marginTop: '4px' }}>
                  {isAr ? 'تقرير التدقيق الجنائي المالي وحماية السيولة' : 'Forensic Financial Audit & Capital Protection Report'}
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  {isAr ? 'رقم التقرير المرجعي:' : 'Dossier Ref:'} <span style={{ fontFamily: 'var(--font-mono)' }}>{scanResult.scanId}</span> • {new Date(scanResult.timestamp).toLocaleString(isAr ? 'ar-SA' : 'en-US')}
                </div>
              </div>

              <div style={{ textAlign: 'end' }}>
                <div style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--status-success)', border: '1px solid var(--status-success)', fontWeight: 800, display: 'inline-block' }}>
                  {isAr ? 'معتمد وموثق تدقيقياً' : 'AUDIT VERIFIED'}
                </div>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  CRYPTOGRAPHIC PROOF SHA-256
                </div>
              </div>
            </div>

            {/* Executive Summary Narrative */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-light)', marginBottom: '8px' }}>
                {isAr ? '1. ملخص نتائج الفحص الجنائي:' : '1. Executive Audit Summary:'}
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {isAr
                  ? `أجرى محرك التدقيق الجنائي فحصاً شاملاً لـ (${scanResult.totalVouchersAudited}) سندات وقيد محاسبي بإجمالي إنفاق بلغ (${scanResult.totalSpendSAR.toLocaleString('ar-SA')} ر.س). كشف الفحص عن وجود (${scanResult.totalAnomaliesDetected}) حالات انحراف مالي مؤكدة تمثل خطراً على السيولة بقيمة إجمالية (${scanResult.activeLeakageSAR.toLocaleString('ar-SA')} ر.س). تم تجميد مبالغ بقيمة (${scanResult.protectedCapitalSAR.toLocaleString('ar-SA')} ر.س) لحين استكمال التحقيق واسترداد المستحقات.`
                  : `Forensic audit conducted across ${scanResult.totalVouchersAudited} vouchers totaling ${scanResult.totalSpendSAR.toLocaleString('en-US')} SAR in operating spend. The engine uncovered ${scanResult.totalAnomaliesDetected} verified discrepancy cases representing ${scanResult.activeLeakageSAR.toLocaleString('en-US')} SAR in immediate capital leakage.`}
              </p>
            </div>

            {/* Findings Table */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-light)', marginBottom: '8px' }}>
                {isAr ? '2. تفصيل الحالات المكتشفة ومبالغ الاسترداد:' : '2. Verified Itemized Findings:'}
              </h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '8px', textAlign: 'start' }}>{isAr ? 'رقم الحالة' : 'Case'}</th>
                    <th style={{ padding: '8px', textAlign: 'start' }}>{isAr ? 'القاعدة الجنائية' : 'Rule'}</th>
                    <th style={{ padding: '8px', textAlign: 'start' }}>{isAr ? 'المورد المستفيد' : 'Target Vendor'}</th>
                    <th style={{ padding: '8px', textAlign: 'start' }}>{isAr ? 'المبلغ المرصود' : 'Amount SAR'}</th>
                    <th style={{ padding: '8px', textAlign: 'start' }}>{isAr ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {scanResult.anomalies.map((a, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>{a.caseNumber}</td>
                      <td style={{ padding: '8px' }}>{isAr ? a.ruleTitleAr : a.ruleTitleEn}</td>
                      <td style={{ padding: '8px' }}>{a.targetVendor}</td>
                      <td style={{ padding: '8px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: a.status === 'FROZEN' ? 'var(--status-success)' : '#ef4444' }}>
                        {a.flaggedAmountSAR.toLocaleString(isAr ? 'ar-SA' : 'en-US')}
                      </td>
                      <td style={{ padding: '8px', fontWeight: 700 }}>{a.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signature Block for Audit & CFO */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{isAr ? 'اعتماد رئيس لجنة المراجعة الداخلية:' : 'Head of Internal Audit Sign-off:'}</div>
                <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '8px' }}>__________________________</div>
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Date: ____________________</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{isAr ? 'اعتماد المدير المالي التنفيذي (CFO):' : 'Chief Financial Officer Approval:'}</div>
                <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '8px' }}>__________________________</div>
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Date: ____________________</div>
              </div>
            </div>
          </div>

          {/* Export Actions Bar */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button
              onClick={handleExportAuditCsv}
              className="btn-secondary"
              style={{ fontSize: '13px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <IconDownload size={15} />
              <span>{isAr ? 'تصدير جدول البيانات (CSV)' : 'Export Raw CSV'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="btn-primary"
              style={{ fontSize: '13px', padding: '10px 22px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>🖨️ {isAr ? 'طباعة التقرير الجنائي المعتمد (PDF/Print)' : 'Print Official Dossier'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: Forensic Evidence Dossier Inspector ───────────────────────── */}
      {activeModalCase && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setActiveModalCase(null)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), var(--shadow-glow)',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: activeModalCase.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: activeModalCase.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'
                  }}
                >
                  {activeModalCase.severity}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                  {activeModalCase.caseNumber}
                </span>
              </div>

              <button
                onClick={() => setActiveModalCase(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {isAr ? activeModalCase.ruleTitleAr : activeModalCase.ruleTitleEn}
                </h3>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {isAr ? 'المورد المستفيد:' : 'Beneficiary Vendor:'} <strong style={{ color: 'var(--text-primary)' }}>{activeModalCase.targetVendor}</strong>
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', padding: '16px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {isAr ? activeModalCase.narrativeAr : activeModalCase.narrativeEn}
                </div>
              </div>

              {/* Side-by-Side Comparison Box */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: 'var(--bg-surface-subtle)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 800 }}>PRIMARY VOUCHER</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '2px' }}>
                    #{activeModalCase.primaryVoucher}
                  </div>
                  <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 800, marginTop: '2px' }}>
                    {activeModalCase.flaggedAmountSAR.toLocaleString(isAr ? 'ar-SA' : 'en-US')} SAR
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-subtle)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 800 }}>COMPARISON REFERENCE</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {activeModalCase.secondaryVoucher ? `#${activeModalCase.secondaryVoucher}` : 'MASTER CONTRACT'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--status-success)', fontWeight: 800, marginTop: '2px' }}>
                    {isAr ? 'مستند المقارنة المرجعي' : 'Baseline Verified'}
                  </div>
                </div>
              </div>

              {/* Cryptographic Audit Proof */}
              <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--status-success)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {isAr ? 'الدليل الحسابي والإسناد النظامي:' : 'Cryptographic Proof & Statutory Standard:'}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '6px' }}>
                  {isAr ? activeModalCase.auditEvidenceAr : activeModalCase.auditEvidenceEn}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  REGULATION: {activeModalCase.regulatoryStandard}
                </div>
              </div>

              {/* Resolution Action Buttons inside Modal */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                {activeModalCase.status !== 'FROZEN' && (
                  <button
                    onClick={() => handleResolveCase(activeModalCase.id, 'FROZEN')}
                    className="btn-primary"
                    style={{ flex: 1, padding: '10px', fontSize: '13px', background: '#ef4444', border: '1px solid #dc2626', justifyContent: 'center' }}
                  >
                    <span>🛡️ {isAr ? 'تجميد أمر الصرف رسمياً' : 'Freeze Disbursement'}</span>
                  </button>
                )}

                {activeModalCase.status !== 'LEGITIMATE' && (
                  <button
                    onClick={() => handleResolveCase(activeModalCase.id, 'LEGITIMATE')}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '10px', fontSize: '13px', justifyContent: 'center' }}
                  >
                    <span>{isAr ? 'اعتماد المطالبة كمشروعة' : 'Mark as Legitimate'}</span>
                  </button>
                )}

                {onRequestAssistance && (
                  <button
                    onClick={() => {
                      onRequestAssistance(`${activeModalCase.caseNumber} (${activeModalCase.targetVendor})`);
                      setActiveModalCase(null);
                    }}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '10px', fontSize: '13px', justifyContent: 'center', borderColor: 'var(--accent-base)', color: 'var(--accent-light)' }}
                    title={isAr ? 'طلب استشارة ومساندة من فريق مخلافي لابز' : 'Request Specialist Assistance'}
                  >
                    <span>{isAr ? 'طلب دعم تحقيقي' : 'Request Specialist'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
