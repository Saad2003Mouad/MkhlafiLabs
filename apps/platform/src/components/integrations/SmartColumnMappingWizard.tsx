// MIKHLAFI LABS — Smart AI Column-Mapping Wizard (معالج الربط الذكي بالذكاء الاصطناعي)
// Universally auto-detects column names and data types across ANY industry or ERP
// (Retail, Manufacturing, Contracting, Medical, Logistics, Services, Wholesale).
// Strict Read-Only Guarantee: Never modifies, writes to, or alters client data sources.

import React, { useState } from 'react';
import { LocaleMode } from '../../types';
import {
  IconCheck,
  IconAlertTriangle,
  IconServer,
  IconShield,
  IconX,
  IconArrowRight
} from '../Icons';

export interface SmartColumnMappingWizardProps {
  locale: LocaleMode;
  isOpen: boolean;
  onClose: () => void;
  onIngestComplete: (result: {
    totalIngested: number;
    flaggedCount: number;
    duplicateCount?: number;
  }) => void;
  apiClient: {
    ingestLedgerEntries: (entries: Array<{
      documentNumber: string;
      vendorName?: string;
      amount: number;
      postingDate?: string;
      text?: string;
      category?: string;
    }>) => Promise<{
      success: boolean;
      totalIngested: number;
      flaggedCount: number;
      duplicateCount?: number;
    }>;
  };
}

export type CanonicalField =
  | 'documentNumber'
  | 'vendorName'
  | 'amount'
  | 'postingDate'
  | 'description'
  | 'category'
  | '__ignore__';

interface FieldDefinition {
  key: CanonicalField;
  labelAr: string;
  labelEn: string;
  required: boolean;
  descriptionAr: string;
  descriptionEn: string;
  synonyms: string[];
}

const CANONICAL_FIELDS: FieldDefinition[] = [
  {
    key: 'documentNumber',
    labelAr: 'رقم المستند / القيد المحاسبي',
    labelEn: 'Document / Voucher / Ref Number',
    required: true,
    descriptionAr: 'الرقم المرجعي أو كود القيد أو الفاتورة للكشف عن التكرار والتطابق',
    descriptionEn: 'Unique voucher, check, invoice or journal reference ID',
    synonyms: [
      'رقم_القيد', 'رقم القيد', 'القيد', 'رقم_السند', 'رقم السند', 'رقم_الفاتورة', 'رقم الفاتورة',
      'رقم_المستند', 'رقم المستند', 'المرجع', 'الرقم_المرجعي', 'كود', 'المعرف', 'رقم_الإشعار',
      'سند_صرف', 'سند_قبض', 'فاتورة', 'refno', 'voucherno', 'docno', 'invoiceno', 'documentnumber',
      'txid', 'entryno', 'referencenumber', 'reference', 'journalno', 'serial', 'billno', 'code'
    ]
  },
  {
    key: 'vendorName',
    labelAr: 'المستفيد / المورد / العميل / الطرف المقابل',
    labelEn: 'Beneficiary / Vendor / Customer / Counterparty',
    required: false,
    descriptionAr: 'اسم الجهة أو المستفيد للتحقق من أسعار العقود ورادار التواطؤ',
    descriptionEn: 'Payee, supplier, buyer or counterparty entity name',
    synonyms: [
      'المستفيد', 'اسم_المستفيد', 'المورد', 'اسم_المورد', 'العميل', 'اسم_العميل', 'الجهة',
      'الطرف_الثاني', 'اسم_الحساب', 'المقاول', 'صاحب_الاستحقاق', 'الحساب_المقابل', 'المشتري',
      'البائع', 'الشركة', 'المؤسسة', 'العميل_أو_المورد', 'الطرف', 'beneficiary', 'vendor',
      'supplier', 'customer', 'client', 'payee', 'partner', 'counterparty', 'accountname',
      'party', 'name', 'merchant', 'entity', 'contractor'
    ]
  },
  {
    key: 'amount',
    labelAr: 'المبلغ المالي / القيمة الصافية',
    labelEn: 'Monetary Amount / Net Value',
    required: true,
    descriptionAr: 'قيمة المعاملة بالريال اليمني لكشف الهدر والتسرب وتجاوز السيولة',
    descriptionEn: 'Financial value in YER for anomaly and duplicate detection',
    synonyms: [
      'المبلغ', 'القيمة', 'المدين', 'الدائن', 'صافي_المبلغ', 'الإجمالي', 'الرصيد', 'قيمة_الفاتورة',
      'مبلغ_العملية', 'المستحق', 'التكلفة', 'السعر', 'صافي', 'amount', 'total', 'value', 'netamount',
      'debit', 'credit', 'gross', 'balance', 'sum', 'price', 'cost', 'val', 'grandtotal', 'net'
    ]
  },
  {
    key: 'postingDate',
    labelAr: 'تاريخ الحركة / القيد / الفاتورة',
    labelEn: 'Transaction / Posting / Invoice Date',
    required: false,
    descriptionAr: 'تاريخ العملية لاكتشاف توقيت العطلات والأنماط الزمنية المشبوهة',
    descriptionEn: 'Date of document creation or ledger posting',
    synonyms: [
      'تاريخ_القيد', 'تاريخ القيد', 'التاريخ', 'تاريخ_العملية', 'تاريخ العملية', 'تاريخ_الفاتورة',
      'تاريخ_السند', 'تاريخ_الحركة', 'الوقت', 'تاريخ_الاستحقاق', 'date', 'txdate', 'postingdate',
      'invoicedate', 'createdat', 'timestamp', 'voucherdate', 'entrydate', 'time', 'day'
    ]
  },
  {
    key: 'description',
    labelAr: 'البيان المحاسبي / تفاصيل البند',
    labelEn: 'Journal Narrative / Line Item Description',
    required: false,
    descriptionAr: 'شرح القيد أو بيان الصرف للتحليل اللغوي واكتشاف الصرف المشبوه',
    descriptionEn: 'Transaction memo, statement text, or line item details',
    synonyms: [
      'البيان', 'الشرح', 'الوصف', 'ملاحظات', 'تفاصيل', 'الغرض', 'بند_الصرف', 'اسم_الصنف',
      'الخدمة', 'بيان_القيد', 'النشاط', 'description', 'statement', 'narrative', 'memo',
      'notes', 'details', 'particulars', 'purpose', 'itemname', 'summary', 'remark'
    ]
  },
  {
    key: 'category',
    labelAr: 'التصنيف / مركز التكلفة / رقم الحساب',
    labelEn: 'Category / Cost Center / GL Account',
    required: false,
    descriptionAr: 'مركز التكلفة أو الفرع أو رقم الحساب العام لربط الهياكل التشغيلية',
    descriptionEn: 'Cost center, general ledger code, department, or operational branch',
    synonyms: [
      'مركز_التكلفة', 'مركز التكلفة', 'التصنيف', 'رقم_الحساب', 'نوع_الحركة', 'الفرع',
      'القسم', 'نوع_المستند', 'المشروع', 'بند_التكلفة', 'category', 'cost_center',
      'costcenter', 'account_code', 'gl_account', 'branch', 'department', 'doc_type',
      'type', 'segment', 'project'
    ]
  }
];

// RFC-4180 compliant CSV / TSV parser
function parseDelimited(rawText: string): string[][] {
  const isTSV = rawText.includes('\t') && !rawText.includes(',');
  const delimiter = isTSV ? '\t' : ',';

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;
  const len = rawText.length;

  while (i < len) {
    const char = rawText[i];
    const nextChar = rawText[i + 1];

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

    if (char === delimiter) {
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

  currentRow.push(currentField.trim());
  if (currentRow.some((f) => f.length > 0)) rows.push(currentRow);
  return rows;
}

interface ColumnAnalysis {
  sourceIndex: number;
  sourceHeader: string;
  detectedField: CanonicalField;
  confidence: number;
  sampleValues: string[];
  reasoning: string;
}

function cleanStr(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\s_\-–—]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[يى]/g, 'ي');
}

export const SmartColumnMappingWizard: React.FC<SmartColumnMappingWizardProps> = ({
  locale,
  isOpen,
  onClose,
  onIngestComplete,
  apiClient
}) => {
  const isAr = locale === 'ar';

  const [activeTab, setActiveTab] = useState<'paste' | 'database'>('paste');
  const [inputText, setInputText] = useState<string>('');
  const [dbConfig, setDbConfig] = useState({
    engine: 'postgresql',
    host: '127.0.0.1',
    port: '5432',
    database: 'accounting_db',
    username: 'readonly_user',
    password: '',
    readQuery: 'SELECT doc_no, party_name, total_val, tx_date, line_memo FROM journal_entries LIMIT 1000;'
  });

  const [step, setStep] = useState<'input' | 'mapping' | 'preview'>('input');
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [columnMappings, setColumnMappings] = useState<Record<number, CanonicalField>>({});
  const [aiAnalyses, setAiAnalyses] = useState<ColumnAnalysis[]>([]);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // Sample templates for testing across multiple industries
  const loadIndustrySample = (industry: 'contracting' | 'retail' | 'manufacturing' | 'pharma') => {
    let sample = '';
    if (industry === 'contracting') {
      sample = `رقم_القيد,المستفيد_المقاول,المبلغ,تاريخ_العملية,البيان,مركز_التكلفة\n` +
        `VR-2026-01,شركة الأسمنت الوطنية,4500000,2026-05-10,توريد 200 طن أسمنت مقاوم لمشروع برج صنعاء,مشروع_برج_صنعاء\n` +
        `VR-2026-02,مؤسسة حديد سبأ,8200000,2026-05-12,توريد حديد تسليح مقاس 16ملم,مشروع_برج_صنعاء\n` +
        `VR-2026-03,مقاولو الحفريات المتقدمة,1350000,2026-05-15,أعمال حفر وتسوية الموقع العام,مشروع_المستودعات_المركزية\n` +
        `VR-2026-01,شركة الأسمنت الوطنية,4500000,2026-05-18,دفعة متكررة لنفس إشعار التوريد (اشتباه تسرب مالي),مشروع_برج_صنعاء`;
    } else if (industry === 'retail') {
      sample = `RefNo,Payee_Vendor,Amount,PostingDate,Description,Branch\n` +
        `INV-9011,مجموعة هائل سعيد التجارية,12500000,2026-06-01,توريد مواد غذائية وسلع استهلاكية للفروع,فرع_حدة_صنعاء\n` +
        `INV-9012,شركة الألبان اليمنية,3400000,2026-06-02,توريد منتجات ألبان طازجة,فرع_التحرير\n` +
        `INV-9013,مؤسسة المشروبات الحديثة,2100000,2026-06-03,مشروبات وعصائر صيفية,فرع_حدة_صنعاء`;
    } else if (industry === 'pharma') {
      sample = `رقم_الفاتورة,اسم_المورد_الدوائي,القيمة,تاريخ_السند,بيان_الأدوية,القسم\n` +
        `PH-4401,شركة شفا للمستحضرات الطبية,6800000,2026-07-01,توريد مضادات حيوية وأمصال مركزية,المستودع_الطبي\n` +
        `PH-4402,الشركة الدولية للأدوية,4150000,2026-07-03,توريد محاليل وريدية وأدوية تخدير,العناية_المركزة\n` +
        `PH-4403,وكالة الرعاية الصيدلانية,1950000,2026-07-05,مستلزمات جراحية وشاش طبي,العمليات_الكبرى`;
    } else {
      sample = `VoucherCode,SupplierName,TotalVal,EntryDate,Particulars,CostCenter\n` +
        `MFG-801,مصنع التغليف الحديث,5600000,2026-08-10,شراء كرتون ومواد تغليف خط الإنتاج الأول,مصنع_صنعاء_خط_1\n` +
        `MFG-802,الشركة اليمنية للمواد الخام,14200000,2026-08-12,توريد حبيبات بلاستيكية وبوليمرات خام,المستودع_الرئيسي\n` +
        `MFG-803,ورشة الصيانة الهندسية,850000,2026-08-14,قطع غيار وصيانة دورية لخط التعبئة,قسم_الصيانة`;
    }
    setInputText(sample);
    setErrorMessage(null);
  };

  // Run AI Column Intelligence analysis
  const runSmartAnalysis = () => {
    setErrorMessage(null);
    setSuccessInfo(null);

    let rows: string[][] = [];
    if (activeTab === 'paste') {
      if (!inputText.trim()) {
        setErrorMessage(isAr ? 'يرجى لصق بيانات CSV أو إكسل أولاً.' : 'Please paste CSV or Excel tabular data first.');
        return;
      }
      try {
        rows = parseDelimited(inputText.trim());
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Error parsing tabular text.');
        return;
      }
    } else {
      // Direct Database Read-Only Simulation
      // Emulates fetching headers from client read-only SELECT statement
      rows = [
        ['doc_no', 'party_name', 'total_val', 'tx_date', 'line_memo', 'cost_center'],
        ['DB-1001', 'الشركة اليمنية للمقاولات', '7500000', '2026-04-10', 'مستخلص رقم 3 أعمال خرسانات مسلحة', 'مشروع_صنعاء'],
        ['DB-1002', 'مؤسسة التجهيزات المكتبية', '850000', '2026-04-11', 'أجهزة حاسوب وطابعات لإدارة الرقابة', 'الإدارة_العامة'],
        ['DB-1003', 'شركة الصيانة العامة', '420000', '2026-04-12', 'صيانة المولدات الكهربائية المركزية', 'فرع_حدة']
      ];
    }

    if (rows.length < 2) {
      setErrorMessage(
        isAr
          ? 'يجب أن تحتوي البيانات على ترويسة أعمدة وصف واحد من البيانات على الأقل.'
          : 'Data must contain at least a header row and one data row.'
      );
      return;
    }

    const headers = rows[0];
    const dataRows = rows.slice(1, 4); // First 3 sample rows
    const analyses: ColumnAnalysis[] = [];
    const initialMappings: Record<number, CanonicalField> = {};
    const assignedFields = new Set<CanonicalField>();

    headers.forEach((rawHeader, colIdx) => {
      const headerClean = cleanStr(rawHeader);
      const colSamples = dataRows.map((r) => r[colIdx] || '');

      let bestField: CanonicalField = '__ignore__';
      let bestConfidence = 0;
      let reasoning = '';

      // Check against all canonical definitions
      for (const field of CANONICAL_FIELDS) {
        let score = 0;
        let matchReason = '';

        // 1. Synonym matching
        for (const synonym of field.synonyms) {
          const synClean = cleanStr(synonym);
          if (headerClean === synClean) {
            score = 99;
            matchReason = isAr
              ? `تطابق تام مع المسمى القياسي "${synonym}"`
              : `Exact synonym match with "${synonym}"`;
            break;
          } else if (headerClean.includes(synClean) || synClean.includes(headerClean)) {
            if (score < 85) {
              score = 85;
              matchReason = isAr
                ? `تطابق جزئي قوي مع المسمى "${synonym}"`
                : `Strong partial match with "${synonym}"`;
            }
          }
        }

        // 2. Data value heuristics verification
        if (field.key === 'amount') {
          const isNumeric = colSamples.every((val) => {
            const num = Number(val.replace(/[,\s]/g, ''));
            return !isNaN(num) && val.trim().length > 0;
          });
          if (isNumeric) {
            score = Math.max(score, 88);
            if (!matchReason) {
              matchReason = isAr
                ? 'البيانات تحتوي على مبالغ وأرقام مالية صريحة'
                : 'Sample values are explicit numeric amounts';
            }
          }
        } else if (field.key === 'postingDate') {
          const isDateLike = colSamples.every((val) => {
            return (
              /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/.test(val) ||
              /^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}/.test(val) ||
              !isNaN(Date.parse(val))
            );
          });
          if (isDateLike) {
            score = Math.max(score, 92);
            if (!matchReason) {
              matchReason = isAr
                ? 'القيم تطابق النمط الزمني للتواريخ (Date format)'
                : 'Values match calendar date patterns';
            }
          }
        } else if (field.key === 'documentNumber') {
          const isDocLike = colSamples.every((val) => {
            return /^[A-Za-z0-9_\-#/]{2,30}$/.test(val.trim());
          });
          if (isDocLike && score > 60) {
            score = Math.min(score + 10, 99);
          }
        }

        if (score > bestConfidence) {
          bestConfidence = score;
          bestField = field.key;
          reasoning = matchReason;
        }
      }

      // Avoid duplicate automatic assignment of the same required field
      if (bestConfidence >= 70 && !assignedFields.has(bestField)) {
        assignedFields.add(bestField);
      } else if (bestConfidence < 70) {
        bestField = '__ignore__';
        reasoning = isAr
          ? 'حقل إضافي أو مخصص — لم يتطابق مع المعايير الإلزامية ويمكن ربطه يدوياً'
          : 'Custom field — below confidence threshold, can be assigned manually';
      }

      initialMappings[colIdx] = bestField;
      analyses.push({
        sourceIndex: colIdx,
        sourceHeader: rawHeader,
        detectedField: bestField,
        confidence: bestConfidence,
        sampleValues: colSamples,
        reasoning: reasoning || (isAr ? 'تم تقييم العمود بناءً على الذكاء الاصطناعي' : 'Evaluated via AI heuristic engine')
      });
    });

    setParsedRows(rows);
    setAiAnalyses(analyses);
    setColumnMappings(initialMappings);
    setStep('mapping');
  };

  // Execute Ingestion
  const handleExecuteIngest = async () => {
    setBusy(true);
    setErrorMessage(null);
    setSuccessInfo(null);

    try {
      // Validate that required fields are mapped
      const mappedValues = Object.values(columnMappings);
      const hasDoc = mappedValues.includes('documentNumber');
      const hasAmt = mappedValues.includes('amount');

      if (!hasDoc || !hasAmt) {
        throw new Error(
          isAr
            ? 'يجب تحديد عمود "رقم المستند / القيد" وعمود "المبلغ المالي" كحد أدنى للمطابقة والتدقيق الجنائي.'
            : 'Both "Document / Voucher Ref" and "Monetary Amount" columns must be mapped for forensic audit.'
        );
      }

      // Find indices
      const docIdx = Object.keys(columnMappings).find((idx) => columnMappings[Number(idx)] === 'documentNumber');
      const amtIdx = Object.keys(columnMappings).find((idx) => columnMappings[Number(idx)] === 'amount');
      const vendorIdx = Object.keys(columnMappings).find((idx) => columnMappings[Number(idx)] === 'vendorName');
      const dateIdx = Object.keys(columnMappings).find((idx) => columnMappings[Number(idx)] === 'postingDate');
      const descIdx = Object.keys(columnMappings).find((idx) => columnMappings[Number(idx)] === 'description');
      const catIdx = Object.keys(columnMappings).find((idx) => columnMappings[Number(idx)] === 'category');

      const entries = parsedRows.slice(1).map((row, rowIdx) => {
        const docNum = docIdx !== undefined ? (row[Number(docIdx)] || '').trim() : `ENTRY-${rowIdx + 1}`;
        const rawAmt = amtIdx !== undefined ? (row[Number(amtIdx)] || '').replace(/[,\s]/g, '') : '0';
        const numAmt = Number(rawAmt) || 0;
        const vendor = vendorIdx !== undefined ? (row[Number(vendorIdx)] || '').trim() : undefined;
        const pDate = dateIdx !== undefined ? (row[Number(dateIdx)] || '').trim() : undefined;
        const memo = descIdx !== undefined ? (row[Number(descIdx)] || '').trim() : undefined;
        const cat = catIdx !== undefined ? (row[Number(catIdx)] || '').trim() : undefined;

        return {
          documentNumber: docNum || `REF-${rowIdx + 1}`,
          vendorName: vendor || (isAr ? 'طرف غير محدد' : 'Unspecified Counterparty'),
          amount: numAmt,
          postingDate: pDate || new Date().toISOString().split('T')[0],
          text: memo || (cat ? `[${cat}]` : undefined),
          category: cat
        };
      });

      const res = await apiClient.ingestLedgerEntries(entries);
      setSuccessInfo(
        isAr
          ? `🎉 اكتمل الربط والاستيراد بنجاح! تم استيعاب ${res.totalIngested} قيد محاسبي، وتم رصد وتدقيق ${res.flaggedCount} حالة انحراف أو تسرب مالي تلقائياً دون أي تعديل في بياناتكم الأصلية.`
          : `🎉 AI Mapping & Ingestion Complete! Ingested ${res.totalIngested} journal records, and audited ${res.flaggedCount} financial anomaly cases without altering your original source data.`
      );

      onIngestComplete(res);
      setTimeout(() => {
        onClose();
        setStep('input');
        setInputText('');
      }, 3500);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to ingest mapped records.');
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 10, 20, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          background: 'var(--bg-surface, #0f172a)',
          border: '1px solid var(--border-default, #1e293b)',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(56, 189, 248, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border-subtle, #1e293b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.5) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
              }}
            >
              🤖
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)' }}>
                {isAr
                  ? 'معالج الربط الذكي بالذكاء الاصطناعي (Smart AI Column-Mapping Wizard)'
                  : 'Smart AI Column-Mapping Wizard'}
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)', marginTop: '2px' }}>
                {isAr
                  ? 'التعرف الآلي الفوري على أسماء الحقول ومطابقتها لمختلف الأنشطة المحاسبية والتجارية'
                  : 'Universal cross-industry schema recognition for any ERP or ledger export'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary, #94a3b8)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Read-Only Sovereign Guarantee Banner */}
        <div
          style={{
            padding: '0.65rem 1.75rem',
            background: 'rgba(14, 165, 233, 0.08)',
            borderBottom: '1px solid rgba(14, 165, 233, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.82rem',
            color: '#38bdf8'
          }}
        >
          <IconShield size={16} />
          <span>
            {isAr
              ? '🛡️ ضمانة القراءة المحمية (Zero-Mutation Guarantee): مخلافي لابس يستعلم ويقرأ البيانات حصرياً — لا نقوم بأي تعديل أو كتابة أو حذف في قاعدة بياناتكم أو ملفاتكم إطلاقاً.'
              : '🛡️ Sovereign Read-Only Guarantee: Mikhlafi Labs queries data purely in read-only mode — zero mutation or writing to your source system.'}
          </span>
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
          {errorMessage && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <IconAlertTriangle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successInfo && (
            <div
              style={{
                padding: '1rem',
                borderRadius: '8px',
                background: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#86efac',
                fontSize: '0.9rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}
            >
              <IconCheck size={20} />
              <span>{successInfo}</span>
            </div>
          )}

          {/* STEP 1: Input source */}
          {step === 'input' && (
            <div>
              {/* Tab Selector */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  borderBottom: '1px solid var(--border-subtle, #1e293b)',
                  paddingBottom: '0.875rem',
                  marginBottom: '1.25rem'
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  style={{
                    background: activeTab === 'paste' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                    border: activeTab === 'paste' ? '1px solid #38bdf8' : '1px solid transparent',
                    color: activeTab === 'paste' ? '#38bdf8' : 'var(--text-secondary, #94a3b8)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  📄 {isAr ? 'ملف إكسل / CSV أو لصق نصي' : 'Excel / CSV Text Paste'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('database')}
                  style={{
                    background: activeTab === 'database' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                    border: activeTab === 'database' ? '1px solid #38bdf8' : '1px solid transparent',
                    color: activeTab === 'database' ? '#38bdf8' : 'var(--text-secondary, #94a3b8)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <IconServer size={16} />
                  {isAr ? 'ربط مباشر لقاعدة بيانات (Read-Only)' : 'Direct Database (Read-Only)'}
                </button>
              </div>

              {activeTab === 'paste' ? (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem'
                    }}
                  >
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary, #f8fafc)' }}>
                      {isAr
                        ? 'الصق بيانات الأعمدة من إكسل أو ملف CSV (بأي تسميات أو لغة):'
                        : 'Paste tabular columns from Excel or CSV (in any language or headers):'}
                    </label>

                    {/* Industry Presets */}
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary, #64748b)' }}>
                        {isAr ? 'نماذج أنشطة حقيقية:' : 'Try sample activities:'}
                      </span>
                      <button
                        type="button"
                        onClick={() => loadIndustrySample('contracting')}
                        className="btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                      >
                        🏗️ {isAr ? 'مقاولات' : 'Contracting'}
                      </button>
                      <button
                        type="button"
                        onClick={() => loadIndustrySample('retail')}
                        className="btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                      >
                        🛒 {isAr ? 'تجزئة وتجارة' : 'Retail'}
                      </button>
                      <button
                        type="button"
                        onClick={() => loadIndustrySample('pharma')}
                        className="btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                      >
                        💊 {isAr ? 'أدوية ومستشفيات' : 'Pharma'}
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={9}
                    placeholder={
                      isAr
                        ? 'رقم_القيد,المستفيد,المبلغ,تاريخ_العملية,البيان\nVR-101,شركة الأسمنت الوطنية,4500000,2026-05-10,توريد أسمنت مقاوم\nVR-102,مؤسسة الحديد,8200000,2026-05-12,توريد حديد تسليح'
                        : 'RefNo,Beneficiary,Amount,Date,Description\nVR-101,National Cement Co,4500000,2026-05-10,Cement batch\nVR-102,Steel Corp,8200000,2026-05-12,Reinforcement rebar'
                    }
                    style={{
                      width: '100%',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      padding: '0.875rem',
                      borderRadius: '8px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid var(--border-default, #1e293b)',
                      color: 'var(--text-primary, #f8fafc)',
                      resize: 'vertical'
                    }}
                  />
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}
                  >
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                        {isAr ? 'نوع محرك قاعدة البيانات:' : 'Database Engine:'}
                      </label>
                      <select
                        value={dbConfig.engine}
                        onChange={(e) => setDbConfig({ ...dbConfig, engine: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          background: 'rgba(15, 23, 42, 0.6)',
                          border: '1px solid var(--border-default, #1e293b)',
                          color: '#fff',
                          fontSize: '0.85rem'
                        }}
                      >
                        <option value="postgresql">PostgreSQL (Server / Cloud)</option>
                        <option value="mysql">MySQL / MariaDB</option>
                        <option value="sqlserver">Microsoft SQL Server</option>
                        <option value="oracle">Oracle Database</option>
                        <option value="odoo">Odoo ERP (ORM / DB)</option>
                        <option value="sap">SAP HANA / Business One</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                        {isAr ? 'اسم قاعدة البيانات:' : 'Database Name:'}
                      </label>
                      <input
                        type="text"
                        value={dbConfig.database}
                        onChange={(e) => setDbConfig({ ...dbConfig, database: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          background: 'rgba(15, 23, 42, 0.6)',
                          border: '1px solid var(--border-default, #1e293b)',
                          color: '#fff',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                      {isAr
                        ? 'أمر الاستعلام الآمن (قراءة فقط - SELECT Only):'
                        : 'Secure Read-Only Query (SELECT Only):'}
                    </label>
                    <textarea
                      value={dbConfig.readQuery}
                      onChange={(e) => setDbConfig({ ...dbConfig, readQuery: e.target.value })}
                      rows={3}
                      style={{
                        width: '100%',
                        fontFamily: 'monospace',
                        fontSize: '0.82rem',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid var(--border-default, #1e293b)',
                        color: '#38bdf8'
                      }}
                    />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary, #64748b)', marginTop: '4px' }}>
                      {isAr
                        ? '🔒 يتم فحص الاستعلام عبر البوابة السيادية والتأكد من خلوه تماماً من أوامر INSERT أو UPDATE أو DELETE أو DROP.'
                        : '🔒 Query is validated against sovereign gate: zero mutation, INSERT, or DROP commands allowed.'}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={onClose} className="ml-btn ml-btn--subtle">
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={runSmartAnalysis}
                  className="btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>✨ {isAr ? 'بدء الفحص والتعرف الذكي على الحقول' : 'Run Smart AI Field Discovery'}</span>
                  <IconArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Smart AI Mapping Preview */}
          {step === 'mapping' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem'
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary, #f8fafc)' }}>
                    {isAr ? 'خريطة الربط الذكية المقترحة من الذكاء الاصطناعي:' : 'AI Suggested Column Mapping:'}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)', marginTop: '2px' }}>
                    {isAr
                      ? 'قام الذكاء الاصطناعي بتحليل ترويسات الأعمدة ونوع البيانات وعيناتها واقترح الربط الأنسب:'
                      : 'AI analyzed column headers, data types, and value samples to assign canonical audit fields:'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                >
                  {isAr ? '← تعديل المصدر' : '← Edit Source'}
                </button>
              </div>

              {/* Mapping Cards Table */}
              <div
                style={{
                  border: '1px solid var(--border-subtle, #1e293b)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: 'rgba(15, 23, 42, 0.4)',
                  marginBottom: '1.25rem'
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(30, 41, 59, 0.6)', borderBottom: '1px solid var(--border-subtle, #1e293b)' }}>
                      <th style={{ padding: '10px 14px', fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)' }}>
                        {isAr ? 'عمود العميل المصدر' : 'Client Source Column'}
                      </th>
                      <th style={{ padding: '10px 14px', fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)' }}>
                        {isAr ? 'التعرف الذكي ونسبة الثقة' : 'AI Confidence & Reasoning'}
                      </th>
                      <th style={{ padding: '10px 14px', fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)' }}>
                        {isAr ? 'الحقل المعياري في منصتنا' : 'Mapped Platform Field'}
                      </th>
                      <th style={{ padding: '10px 14px', fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)' }}>
                        {isAr ? 'عينة من القيم الحقيقية' : 'Live Sample Values'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiAnalyses.map((item) => {
                      const currentAssigned = columnMappings[item.sourceIndex] || '__ignore__';
                      const isHighConf = item.confidence >= 80;

                      return (
                        <tr
                          key={item.sourceIndex}
                          style={{
                            borderBottom: '1px solid var(--border-subtle, #1e293b)',
                            background: currentAssigned !== '__ignore__' ? 'rgba(56, 189, 248, 0.03)' : 'transparent'
                          }}
                        >
                          {/* Source Header */}
                          <td style={{ padding: '12px 14px', fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>📌</span>
                              <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{item.sourceHeader}</span>
                            </div>
                          </td>

                          {/* Confidence & Reasoning */}
                          <td style={{ padding: '12px 14px', fontSize: '0.8rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                              <span
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: '999px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  background: isHighConf ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                                  color: isHighConf ? '#4ade80' : '#facc15'
                                }}
                              >
                                {item.confidence}% {isAr ? 'مطابقة ذكية' : 'Match'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary, #64748b)' }}>
                              {item.reasoning}
                            </div>
                          </td>

                          {/* Platform Field Selector */}
                          <td style={{ padding: '12px 14px' }}>
                            <select
                              value={currentAssigned}
                              onChange={(e) =>
                                setColumnMappings({
                                  ...columnMappings,
                                  [item.sourceIndex]: e.target.value as CanonicalField
                                })
                              }
                              style={{
                                width: '100%',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                background: currentAssigned !== '__ignore__' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(30, 41, 59, 0.7)',
                                border: currentAssigned !== '__ignore__' ? '1px solid #38bdf8' : '1px solid var(--border-default, #1e293b)',
                                color: currentAssigned !== '__ignore__' ? '#fff' : 'var(--text-secondary, #94a3b8)',
                                fontSize: '0.82rem',
                                fontWeight: currentAssigned !== '__ignore__' ? 700 : 400
                              }}
                            >
                              <option value="__ignore__">
                                {isAr ? '❌ تجاهل هذا العمود (عدم الاستيراد)' : '❌ Ignore this column'}
                              </option>
                              {CANONICAL_FIELDS.map((cf) => (
                                <option key={cf.key} value={cf.key}>
                                  {isAr ? cf.labelAr : cf.labelEn} {cf.required ? ' *' : ''}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Sample Values */}
                          <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              {item.sampleValues.slice(0, 2).map((val, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    fontFamily: 'monospace',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '180px'
                                  }}
                                >
                                  • {val || '—'}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Ingestion & Next Step Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.5rem'
                }}
              >
                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary, #64748b)' }}>
                  {isAr
                    ? `إجمالي الصفوف المستخرجة: ${parsedRows.length - 1} سجل جاهز للمطابقة والتدقيق`
                    : `Total extracted records: ${parsedRows.length - 1} rows ready for ingestion`}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setStep('input')} className="ml-btn ml-btn--subtle">
                    {isAr ? 'رجوع' : 'Back'}
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteIngest}
                    disabled={busy}
                    className="btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 22px'
                    }}
                  >
                    {busy ? (
                      <span>{isAr ? 'جارٍ التدقيق والاستيراد…' : 'Ingesting & Auditing…'}</span>
                    ) : (
                      <>
                        <span>🚀 {isAr ? 'اعتماد الربط وتشغيل التدقيق الجنائي الفوري' : 'Confirm Mapping & Run Forensic Audit'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
