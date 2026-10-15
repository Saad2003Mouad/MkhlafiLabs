// MIKHLAFI LABS — Enterprise Services & Engines Master Knowledge Base
// Comprehensive definitions, deterministic algorithms, telemetry, and case studies for the 8 engines

export interface ServiceMetric {
  val: string;
  labelAr: string;
  labelEn: string;
  noteAr: string;
  noteEn: string;
}

export interface ServicePainPoint {
  num: string;
  titleAr: string;
  titleEn: string;
  currentFailureAr: string;
  currentFailureEn: string;
  mikhlafiSolutionAr: string;
  mikhlafiSolutionEn: string;
  impactAr: string;
  impactEn: string;
}

export interface ServiceStep {
  step: string;
  titleAr: string;
  titleEn: string;
  techDetailAr: string;
  techDetailEn: string;
  outputAr: string;
  outputEn: string;
}

export interface ServiceCaseStudy {
  clientTypeAr: string;
  clientTypeEn: string;
  industryAr: string;
  industryEn: string;
  scenarioAr: string;
  scenarioEn: string;
  verifiedResultAr: string;
  verifiedResultEn: string;
  quoteAr: string;
  quoteEn: string;
  metrics: { labelAr: string; labelEn: string; val: string }[];
}

export interface ServiceFaq {
  qAr: string;
  qEn: string;
  aAr: string;
  aEn: string;
}

export interface ServiceSimulationItem {
  id: string;
  tag: string;
  severity: 'critical' | 'warning' | 'optimal';
  titleAr: string;
  titleEn: string;
  detailAr: string;
  detailEn: string;
  amount?: string;
  sourceSystem: string;
  timestamp: string;
  auditEvidenceAr: string;
  auditEvidenceEn: string;
}

export interface ServiceDetailItem {
  id: string;
  slug: string;
  engineNumber: string;
  iconName: string;
  accentColor: string;
  glowColor: string;
  badgeAr: string;
  badgeEn: string;
  titleAr: string;
  titleEn: string;
  taglineAr: string;
  taglineEn: string;
  heroDescriptionAr: string;
  heroDescriptionEn: string;
  heroMetrics: ServiceMetric[];
  executiveSummaryAr: string;
  executiveSummaryEn: string;
  painPoints: ServicePainPoint[];
  methodologySteps: ServiceStep[];
  integrations: { name: string; type: string; statusAr: string; statusEn: string }[];
  simulationData: {
    tabTitleAr: string;
    tabTitleEn: string;
    items: ServiceSimulationItem[];
  };
  caseStudy: ServiceCaseStudy;
  faqs: ServiceFaq[];
}

export const SERVICES_CATALOG: ServiceDetailItem[] = [
  // ── Engine 01: Financial Leak & Variance Prevention ─────────────────────────
  {
    id: 'financial-leak-detection',
    slug: 'financial-leak-detection',
    engineNumber: '01',
    iconName: 'file-text',
    accentColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    badgeAr: 'المحرك المالي الأساسي',
    badgeEn: 'CORE FINANCIAL FORENSICS',
    titleAr: 'منظومة كشف الهدر والانحراف المالي المستمر',
    titleEn: 'Autonomous Financial Leak & Variance Prevention',
    taglineAr: 'إيقاف نزيف الهوامش الصامت والمدفوعات المكررة قبل صرف السندات المحاسبية',
    taglineEn: 'Halt silent margin erosion and duplicate payouts before ledger settlement',
    heroDescriptionAr:
      'تقوم المنظومة بفحص مستمر وغير جراحي للقيود وسندات الصرف وفواتير الموردين، ومطابقتها حتمياً مع العقود المعتمدة وأوامر الشراء لكشف الفواتير المكررة، التلاعب بالأسعار، وتجاوز الصلاحيات المالية.',
    heroDescriptionEn:
      'Continuous, non-invasive auditing across general ledger postings, vendor invoices, and purchase vouchers, mathematically cross-referenced with executed contracts to eliminate duplicate disbursements and unapproved cost overruns.',
    heroMetrics: [
      {
        val: '2.4% - 5.1%',
        labelAr: 'متوسط استرداد الهدر المالي',
        labelEn: 'Average Recovered Leakage',
        noteAr: 'نسبة من إجمالي الإنفاق التشغيلي السنوي',
        noteEn: 'Percentage of total annual operating spend'
      },
      {
        val: '< 15 دقيقة',
        labelAr: 'زمن فحص السجلات المحاسبية',
        labelEn: 'Ledger Audit Latency',
        noteAr: 'تحليل فوري متزامن مع قيود ERP',
        noteEn: 'Real-time sync against ERP journal entries'
      },
      {
        val: '0.00%',
        labelAr: 'إنذارات زائفة مبنية على التخمين',
        labelEn: 'Speculative False Positives',
        noteAr: 'تدقيق حتمي مبني على أدلة قاطعة مثبتة',
        noteEn: '100% deterministic cryptographic proof'
      }
    ],
    executiveSummaryAr:
      'في المؤسسات الكبرى، يتسرب ما بين 2% إلى 5% من الأرباح الصافية نتيجة أخطاء بشرية متراكمة في فواتير المشتريات، تكرار أوامر الصرف عبر فروع متباعدة، وتجاوزات أسعار بنود العقود. تعمل المنظومة كحارس مالي استباقي يمنع خروج الريال قبل التحقق من استحقاقه النظامي.',
    executiveSummaryEn:
      'Enterprise conglomerates lose 2% to 5% of net operating margins to duplicate invoices, split purchase requisitions, and vendor pricing drift. MIKHLAFI LABS acts as an autonomous pre-disbursement barrier ensuring zero unauthorized capital leakage.',
    painPoints: [
      {
        num: '01',
        titleAr: 'الفواتير المكررة وتجزئة طلبات الشراء',
        titleEn: 'Duplicate Invoices & Split Requisitions',
        currentFailureAr: 'تكرار صرف فواتير لنفس الخدمة بأرقام مرجعية مختلفة أو تجزئة الفاتورة إلى مبالغ أقل من 50,000 ريال لتجاوز لجان الاعتماد.',
        currentFailureEn: 'Duplicate vendor billing under altered reference numbers, or dividing purchase orders below approval thresholds.',
        mikhlafiSolutionAr: 'مطابقة حتمية متعددة المعايير (Fuzzy Hash & Value Matching) للمورد ورقم الحساب والمبلغ وتاريخ الخدمة لمنع الصرف فوراً.',
        mikhlafiSolutionEn: 'Deterministic fuzzy-hash matching across vendor IBAN, timestamp, line-item quantities, and approval matrix.',
        impactAr: 'منع هدر مباشر بمعدل 480,000+ ريال لكل 50 مليون ريال مشتريات',
        impactEn: 'Saves 480K+ SAR per 50M SAR in annual procurement spend'
      },
      {
        num: '02',
        titleAr: 'تباين أسعار الموردين للسلع المتطابقة',
        titleEn: 'Cross-Entity Vendor Price Divergence',
        currentFailureAr: 'شراء نفس المادة أو المعدة بواسطة فرعين تابعين بأسعار متفاوتة تصل إلى 35% لصالح المورد دون وجود مقارنة مركزية.',
        currentFailureEn: 'Subsidiaries purchasing identical items at diverging price points with up to 35% unjustified vendor markups.',
        mikhlafiSolutionAr: 'رادار مركزي لمقارنة أسعار العقود وأسعار التوريد الفعلي عبر كافة الشركات التابعة وتحديد السعر المرجعي الأقل.',
        mikhlafiSolutionEn: 'Centralized catalog rate benchmarking indexing line-item prices across all company entities instantly.',
        impactAr: 'توفير فوري بنسبة 12% إلى 18% على عقود التوريد المتكررة',
        impactEn: 'Immediate 12-18% procurement savings on recurring supply contracts'
      },
      {
        num: '03',
        titleAr: 'المعالم المنجزة غير المفوترة وتأخر التحصيل',
        titleEn: 'Unbilled Milestones & Stalled Collections',
        currentFailureAr: 'اكتمال مراحل تعاقدية لدى العملاء دون إصدار فواتير أو مطالبات مالية سريعة مما يؤدي لتجميد السيولة وتآكل التدفق النقدي.',
        currentFailureEn: 'Completed operational deliverables sitting unbilled for months, choking operational liquidity.',
        mikhlafiSolutionAr: 'ربط مباشر بين إنجاز الموقع/الخدمة ونظام الفوترة الإلكترونية مع تنبيهات فورية للمسؤولين عن إصدار المطالبات.',
        mikhlafiSolutionEn: 'Automated bridge linking operational delivery signs directly with ZATCA billing triggers.',
        impactAr: 'تقليص دورة التحصيل (DSO) بمقدار 28 يوماً في المتوسط',
        impactEn: 'Reduces Days Sales Outstanding (DSO) by an average of 28 days'
      }
    ],
    methodologySteps: [
      {
        step: '01',
        titleAr: 'القراءة غير الجراحية والتجميع المشفر',
        titleEn: 'Non-Invasive Ingestion & In-Memory Indexing',
        techDetailAr: 'الاتصال المباشر بالقراءة فقط (Read-Only) مع قواعد بيانات ERP، وفواتير هيئة الزكاة (ZATCA)، وسجلات البنوك دون التأثير على سرعة النظام.',
        techDetailEn: 'Read-only encrypted connector pulling journal entries, AP ledgers, ZATCA XMLs, and bank statements with zero production footprint.',
        outputAr: 'فهرس مالي موحد ومطابق محاسبياً',
        outputEn: 'Normalized financial audit ledger'
      },
      {
        step: '02',
        titleAr: 'محرك القواعد الجنائية والتحقق الحتمي',
        titleEn: 'Deterministic Forensic Rule Execution',
        techDetailAr: 'تطبيق 140+ خوارزمية تدقيق حتمية تفحص تطابق القيود، سلامة التسلسل الزمني، انحرافات الأسعار، وخرق مصفوفات الصلاحيات.',
        techDetailEn: '140+ mathematical forensics evaluating dual IBAN alterations, retroactive ledger revisions, and contract margin limits.',
        outputAr: 'سجل حتمي بالمخالفات والانحرافات المثبتة',
        outputEn: 'Evidence ledger with zero speculation'
      },
      {
        step: '03',
        titleAr: 'حساب الأثر المالي وتحديد المسؤول',
        titleEn: 'Quantified Financial Impact & Ownership Attribution',
        techDetailAr: 'احتساب القيمة الدقيقة للهدر بالريال السعودي، ربطه بمركز التكلفة، وتحديد المسؤول التنفيذي المنوط به وقف الصرف أو استرداد المبلغ.',
        techDetailEn: 'Exact SAR valuation assigned to cost center and designated operational owner for clawback or hold.',
        outputAr: 'توجيه تنفيذي ملزم ومحدد المهام',
        outputEn: 'Prioritized remediation directive'
      },
      {
        step: '04',
        titleAr: 'سجل التدقيق المشفر والتوثيق القانوني',
        titleEn: 'Cryptographic Audit Trail & Compliance Export',
        techDetailAr: 'توليد ملف تدقيق غير قابل للتعديل يحتوي على أرقام السجلات المصدرية وبنود العقود لتقديمه للإدارة العليا والمراجعين الخارجيين.',
        techDetailEn: 'Immutable verification bundle containing original vouchers, contract excerpts, and timestamped forensic evidence.',
        outputAr: 'تقرير تدقيق جاهز للجان المراجعة والتدقيق الخارجي',
        outputEn: 'Board-ready external audit packet'
      }
    ],
    integrations: [
      { name: 'SAP S/4HANA & ECC', type: 'RFC / OData', statusAr: 'متوافق ومختبر', statusEn: 'Certified Ready' },
      { name: 'Oracle Fusion Cloud & EBS', type: 'REST API / FBDI', statusAr: 'متوافق ومختبر', statusEn: 'Certified Ready' },
      { name: 'Microsoft Dynamics 365 Finance', type: 'Dataverse / OData', statusAr: 'متوافق ومختبر', statusEn: 'Certified Ready' },
      { name: 'ZATCA Phase 2 (FATOORA)', type: 'XML E-Invoice Sync', statusAr: 'مطابق للمتطلبات', statusEn: 'Compliant' },
      { name: 'Odoo & Zoho Books', type: 'Webhook / REST', statusAr: 'متوافق فوري', statusEn: 'Instant Sync' },
      { name: 'Excel / CSV Ledger Upload', type: 'Encrypted Bulk File', statusAr: 'تحليل فوري بدون ربط', statusEn: 'Offline Analysis' }
    ],
    simulationData: {
      tabTitleAr: 'محاكاة حية لفحص القيود وسندات الصرف',
      tabTitleEn: 'Live Ledger Forensic Scanner Demo',
      items: [
        {
          id: 'sim-fin-1',
          tag: 'DUPLICATE_PAYOUT',
          severity: 'critical',
          titleAr: 'اشتباه فاتورة مكررة بمبلغ 48,500 ريال',
          titleEn: 'Duplicate Invoice Detection: 48,500 SAR',
          detailAr: 'تم رصد فاتورة من (شركة التوريدات المتحدة) برقم مرجعي INV-90412 بنفس بنود وقيمة الفاتورة المعتمدة INV-90388 المصروفة قبل 11 يوماً.',
          detailEn: 'Invoice INV-90412 matches line-items, IBAN, and value of INV-90388 settled 11 days ago.',
          amount: '48,500 ر.س',
          sourceSystem: 'SAP S/4HANA // AP_VOUCHER',
          timestamp: 'منذ 14 دقيقة',
          auditEvidenceAr: 'رقم القيد الدائن #4409121 مطابق للسجل #4408990 - تم إيقاف أمر الصرف آلياً',
          auditEvidenceEn: 'Voucher #4409121 identical to #4408990 — Payout held automatically'
        },
        {
          id: 'sim-fin-2',
          tag: 'RATE_CARD_BREACH',
          severity: 'warning',
          titleAr: 'تجاوز تسعيرة العقد الإطاري بنسبة 28%',
          titleEn: 'Rate Card Escalation: +28% Price Divergence',
          detailAr: 'سعر توريد طن الحديد في سند الاستلام #PO-7881 بقيمة 3,420 ريال بينما السعر المتفق عليه في العقد المعتمد هو 2,670 ريال.',
          detailEn: 'Steel rebar invoiced at 3,420 SAR/ton vs contractual master agreement rate of 2,670 SAR/ton.',
          amount: '82,500 ر.س',
          sourceSystem: 'Oracle Cloud // PO_LINE_ITEM',
          timestamp: 'منذ 42 دقيقة',
          auditEvidenceAr: 'عقد التوريد السنوي رقم CON-2026-88 بند 4.2 - فارق التكلفة غير معتمد',
          auditEvidenceEn: 'Framework Agreement CON-2026-88 Clause 4.2 — Variance unapproved'
        },
        {
          id: 'sim-fin-3',
          tag: 'SPLIT_REQUISITION',
          severity: 'warning',
          titleAr: 'تجزئة طلب شراء لتفادي صلاحيات مجلس الإدارة',
          titleEn: 'Split PO Evasion: 3 POs under 100k Threshold',
          detailAr: 'إصدار 3 أوامر شراء متزامنة لنفس المورد (98,000 و 95,000 و 92,000 ريال) خلال 48 ساعة لتفادي شرط موافقة الإدارة التنفيذية لما فوق 200,000 ريال.',
          detailEn: '3 separate POs (98k, 95k, 92k SAR) issued to identical vendor within 48h to circumvent CFO review cap.',
          amount: '285,000 ر.س',
          sourceSystem: 'Dynamics 365 // REQUISITION_LOG',
          timestamp: 'منذ ساعتين',
          auditEvidenceAr: 'تطابق مركز التكلفة والمستودع المستلم - تم دمج البنود وتحويلها لمكتب المدير المالي',
          auditEvidenceEn: 'Identical cost center & warehouse — Merged and escalated to CFO office'
        }
      ]
    },
    caseStudy: {
      clientTypeAr: 'مجموعة تجارية وصناعية قابضة رائدة',
      clientTypeEn: 'Leading Industrial & Commercial Holding Group',
      industryAr: 'التصنيع والتجزئة (الرياض وجدة)',
      industryEn: 'Manufacturing & Distribution (Riyadh & Jeddah)',
      scenarioAr: 'كانت المجموعة تدير عمليات شراء تتجاوز 420 مليون ريال سنوياً عبر 8 شركات تابعة، مع صعوبة في مراجعة آلاف الفواتير الشهرية التي كانت تعتمد يدوياً.',
      scenarioEn: 'Operating 420M SAR in annual procurement across 8 subsidiaries with fragmented manual approval loops.',
      verifiedResultAr: 'كشفت المنظومة خلال أول 30 يوماً عن 3.84 مليون ريال من المدفوعات المكررة وتجاوزات أسعار العقود، وتم استرداد 2.9 مليون ريال نقداً في الربع الأول.',
      verifiedResultEn: 'Uncovered 3.84M SAR in verified duplicate billings and pricing anomalies within 30 days, recovering 2.9M SAR cash in Q1.',
      quoteAr: 'المنظومة لم تكن مجرد أداة مراقبة، بل كانت بمثابة خط دفاع استرد لنا ملايين الريالات التي كانت تضيع بلا أثر في زحمة الفواتير.',
      quoteEn: 'Mikhlafi Labs was not merely a dashboard; it was an autonomous financial shield that directly clawed back millions of SAR.',
      metrics: [
        { labelAr: 'مجموع الهدر المكتشف', labelEn: 'Total Recovered Leak', val: '3.84M ر.س' },
        { labelAr: 'سرعة استرداد التكلفة', labelEn: 'Payback Timeline', val: '18 يوماً' },
        { labelAr: 'انخفاض الفواتير المشبوهة', labelEn: 'Voucher Anomaly Drop', val: '-87%' }
      ]
    },
    faqs: [
      {
        qAr: 'هل يتطلب تشغيل المنظومة تعديل أو استبدال برامجنا المحاسبية الحالية؟',
        qEn: 'Does deploying this require replacing or altering our existing ERP?',
        aAr: 'أبداً. تتصل المنظومة بنظامك عبر واجهات ربط مشفرة بصلاحية قراءة فقط (Read-Only)، دون كتابة أو تعديل على قواعد بياناتك الإنتاجية إطلاقاً.',
        aEn: 'Never. MIKHLAFI LABS connects via encrypted, read-only APIs with zero modifications to your core ERP ledger.'
      },
      {
        qAr: 'كم من الوقت يستغرقه الربط والبدء باكتشاف الهدر المالي؟',
        qEn: 'How long does integration take before we start seeing findings?',
        aAr: 'يمكن البدء فوراً بتحميل ملف القيود (CSV/Excel) لرؤية النتائج خلال ساعات، أو ربط الواجهة السحابية لنظام ERP خلال 3 إلى 5 أيام عمل.',
        aEn: 'You can upload an encrypted ledger export in 15 minutes, or complete direct ERP API integration within 3-5 business days.'
      },
      {
        qAr: 'أين تُحفظ بياناتنا المالية وهل تتوافق مع نظام حماية البيانات الشخصية السعودي (PDPL)؟',
        qEn: 'Where is financial data hosted and is it compliant with Saudi PDPL?',
        aAr: 'تُستضاف كافة البيانات داخل مراكز بيانات سيادية معتمدة داخل المملكة العربية السعودية (Class C)، وتتوافق بنسبة 100% مع أنظمة الأمن السيبراني (NCA) وهيئة البيانات والذكاء الاصطناعي (SDAIA).',
        aEn: 'All data resides strictly in sovereign Tier-4 data centers within Saudi Arabia, fully compliant with NCA and SDAIA PDPL guidelines.'
      },
      {
        qAr: 'ما الفرق بين المنظومة ولوحات معلومات Power BI أو Tableau؟',
        qEn: 'How does this differ from Power BI or Tableau dashboards?',
        aAr: 'لوحات BI تعرض فقط رسوماً بيانية وتتطلب من المحلل البحث اليدوي عن الأخطاء بعد وقوعها. بينما منظومة MIKHLAFI LABS تقوم بالتدقيق الجنائي الاستباقي للقيود وتحدد رقم الفاتورة والريال المهدور والمسؤول قبل اكتمال الصرف.',
        aEn: 'BI tools merely chart past aggregated data. MIKHLAFI LABS performs algorithmic forensics on individual journal vouchers, preventing loss before disbursement.'
      }
    ]
  },

  // ── Engine 02: Executive Decision Mesh ──────────────────────────────────────
  {
    id: 'executive-decisions',
    slug: 'executive-decisions',
    engineNumber: '02',
    iconName: 'check-circle',
    accentColor: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.25)',
    badgeAr: 'طبقة التوجيه الاستراتيجي',
    badgeEn: 'EXECUTIVE DECISION MESH',
    titleAr: 'شبكة القرارات التنفيذية وتوجيه رأس المال',
    titleEn: 'Executive Decision Mesh & Capital Allocation',
    taglineAr: 'تحويل ضجيج التقارير إلى قرارات تشغيلية مرتبة حسب العائد ومحددة المسؤوليات',
    taglineEn: 'Transform report noise into prioritized operational directives with measurable upside',
    heroDescriptionAr:
      'محرك ذكي يجمع الإشارات الحيوية من كافة أقسام المؤسسة، ويقوم بفرزها وترتيبها حسب الأولوية المالية والمخاطر المترتبة، لتزويد الرئيس التنفيذي والإدارة العليا بقرارات واضحة محددة بالتكلفة والمردود والمكلف بالتنفيذ.',
    heroDescriptionEn:
      'Translates sprawling departmental reports into a single, ranked executive queue. Every decision is mathematically evaluated with expected financial impact, execution complexity, and clear accountability assignment.',
    heroMetrics: [
      {
        val: '4.2x',
        labelAr: 'تسريع وتيرة اتخاذ القرارات',
        labelEn: 'Faster Decision Velocity',
        noteAr: 'مقارنة بالاجتماعات واللجان التقليدية',
        noteEn: 'Compared to conventional committee review cycles'
      },
      {
        val: '100%',
        labelAr: 'توثيق المبررات الحسابية',
        labelEn: 'Audit Trail Accountability',
        noteAr: 'سجل كامل لأصل كل قرار ومبرراته',
        noteEn: 'Complete ledger trace for every recommended move'
      },
      {
        val: '+18.4%',
        labelAr: 'تحسين كفاءة رأس المال العامل',
        labelEn: 'Working Capital Efficiency',
        noteAr: 'توجيه السيولة نحو الفرص الأعلى عائداً',
        noteEn: 'Optimal cash allocation based on verified payback'
      }
    ],
    executiveSummaryAr:
      'تغرق القيادات التنفيذية في مئات الصفحات من تقارير PDF وجداول البيانات التي لا تقدم توجيهاً واضحاً. يقوم محرك القرارات التنفيذية بحساب الأولويات والمفاضلات الحرجة بين المشاريع وإدارة السيولة، مع تعيين مسؤول محدد وموعد إنجاز لكل خطوة.',
    executiveSummaryEn:
      'C-suite leaders waste critical hours deciphering disjointed management reports. MIKHLAFI LABS computes deterministic tradeoffs across operational trade-offs, delivering an actionable executive backlog with clear financial upsides.',
    painPoints: [
      {
        num: '01',
        titleAr: 'تضارب الأولويات وشلل اتخاذ القرار',
        titleEn: 'Conflicting Priorities & Decision Paralysis',
        currentFailureAr: 'تزاحم عشرات الطلبات والمقترحات من مدراء الإدارات دون معيار حسابي موحد يحدد أيها يقدم العائد الأكبر والمخاطرة الأقل.',
        currentFailureEn: 'Dozens of competing capex and opex requests debated without mathematical ranking of actual cash-flow impact.',
        mikhlafiSolutionAr: 'مصفوفة أولويات حتمية تصنف كل قرار بناءً على الأثر المالي الصافي وسرعة التنفيذ وفترة استرداد رأس المال.',
        mikhlafiSolutionEn: 'Deterministic ranking matrix scoring actions by net NPV, implementation difficulty, and downside risk exposure.',
        impactAr: 'خفض زمن البت في المبادرات من 3 أسابيع إلى 48 ساعة',
        impactEn: 'Reduces decision deliberation from 3 weeks to 48 hours'
      },
      {
        num: '02',
        titleAr: 'غياب المسؤولية والمتابعة بعد القرار',
        titleEn: 'Execution Drift & Diffused Accountability',
        currentFailureAr: 'اتخاذ قرارات في اجتماعات الإدارة ثم ضياع أثرها أو تأخر تنفيذها دون تنبيهات آلية عند انحراف مؤشرات الأداء المستهدفة.',
        currentFailureEn: 'Decisions agreed in boardrooms evaporating due to unassigned ownership and lack of milestone tracking.',
        mikhlafiSolutionAr: 'تعيين مسؤول مباشر (Single Decision Owner) لكل إجراء مع تتبع آلي لحظي لتنفيذ الالتزامات والأثر المحقق.',
        mikhlafiSolutionEn: 'Single assigned owner per directive with automated milestone telemetry and SLA breach escalations.',
        impactAr: 'رفع نسبة الالتزام بتنفيذ القرارات من 54% إلى 96%',
        impactEn: 'Increases decision execution rate from 54% to 96%'
      },
      {
        num: '03',
        titleAr: 'القرارات المبنية على الحدس لا الأرقام',
        titleEn: 'Intuition-Based Rather Than Evidence-Based Moves',
        currentFailureAr: 'الموافقة على خصومات تجارية أو تمديد فترات ائتمان بناءً على العلاقات والتقدير الشخصي دون قياس أثرها على السيولة.',
        currentFailureEn: 'Offering commercial credit terms or price discounts based on gut feelings rather than empirical liquidity models.',
        mikhlafiSolutionAr: 'محاكاة الأثر المالي الفوري لكل خيار (What-If Simulation) قبل اعتماده لبيان تأثيره على التدفق النقدي وهوامش الربح.',
        mikhlafiSolutionEn: 'Instant What-If cash-flow and runway simulation before approving credit lines or major procurement commitments.',
        impactAr: 'حماية هوامش الربحية التشغيلية بنسبة 3.4%',
        impactEn: 'Protects operating margins by an average of 3.4%'
      }
    ],
    methodologySteps: [
      {
        step: '01',
        titleAr: 'تجميع إشارات الأداء عبر الإدارات',
        titleEn: 'Cross-Functional Signal Aggregation',
        techDetailAr: 'سحب مؤشرات الأداء الحية من أقسام المالية، العمليات، سلاسل الإمداد، والموارد البشرية في تدفق بيانات مركزي موحد.',
        techDetailEn: 'Ingesting operational telemetries from finance, supply chain, site ops, and commercial teams in a single stream.',
        outputAr: 'خريطة شاملة للحالة التشغيلية الآنية',
        outputEn: 'Unified operational state graph'
      },
      {
        step: '02',
        titleAr: 'المفاضلة الحسابية وحساب القيمة المتوقعة',
        titleEn: 'Deterministic Tradeoff & NPV Scoring',
        techDetailAr: 'تقييم كل إجراء محتمل من خلال نموذج رياضي يقيس العائد الاستثماري المتوقع، التكلفة، المخاطر المترتبة، وزمن التطبيق.',
        techDetailEn: 'Mathematical evaluation weighing net capital upside against operational disruption and working capital friction.',
        outputAr: 'قائمة مرتبة حتمياً بأعلى القرارات جدوى',
        outputEn: 'Ranked executive directive backlog'
      },
      {
        step: '03',
        titleAr: 'صياغة التوجيه التنفيذي وتعيين الصلاحيات',
        titleEn: 'Directive Synthesis & Delegation Matrix',
        techDetailAr: 'تحويل القرار إلى بطاقة تنفيذية واضحة تتضمن: الإجراء المطلوب، المسؤول المباشر، السند المصدر، والنتيجة الرقمية المستهدفة.',
        techDetailEn: 'Converting analytical signals into crisp executive directives with owner, deadline, and target KPI delta.',
        outputAr: 'بطاقة قرار جاهزة للاعتماد والمتابعة',
        outputEn: 'Actionable executive directive card'
      },
      {
        step: '04',
        titleAr: 'المتابعة الآلية وقياس العائد الفعلي',
        titleEn: 'Closed-Loop Telemetry & Realized ROI Verification',
        techDetailAr: 'تتبع تأثير القرار بعد اعتماده على السجلات المحاسبية والعمليات، وإظهار ما إذا تحقق العائد المتوقع أم حدث انحراف.',
        techDetailEn: 'Continuous feedback loop tracking whether post-decision ledger numbers achieved the promised efficiency gains.',
        outputAr: 'سجل إنجاز موثق ومثبت بالأرقام',
        outputEn: 'Verified realized-value audit log'
      }
    ],
    integrations: [
      { name: 'Executive Mobile Cockpit', type: 'PWA / Responsive', statusAr: 'متوفر وفوري', statusEn: 'Real-time' },
      { name: 'Microsoft Teams & Slack', type: 'Secure Bot Webhook', statusAr: 'تنبيهات فورية', statusEn: 'Live Alerts' },
      { name: 'Corporate Email & Calendar', type: 'SMTP / OAuth2', statusAr: 'تذكير بالمهام', statusEn: 'Action Sync' },
      { name: 'Board Management Portals', type: 'PDF / Secure Link', statusAr: 'تقارير مجالس الإدارة', statusEn: 'Board Ready' }
    ],
    simulationData: {
      tabTitleAr: 'شاشة قيادة وتوجيه القرارات التنفيذية',
      tabTitleEn: 'Executive Decision Queue Simulation',
      items: [
        {
          id: 'sim-dec-1',
          tag: 'CAPITAL_ALLOCATION',
          severity: 'critical',
          titleAr: 'إعادة تخصيص 1.2M ريال سيولة لمشروع مترو الرياض - محطة 4',
          titleEn: 'Reallocate 1.2M SAR Liquidity to Riyadh Metro P4',
          detailAr: 'تحقيق غرامات تأخير بقيمة 180,000 ريال شهرياً وشيك في حال عدم توريد المولدات خلال 6 أيام. الإجراء: سداد دفعة المورد من مخصص السيولة غير المستغلة.',
          detailEn: 'Late penalty of 180k SAR/mo imminent if generators are not delivered in 6 days. Action: Release supplier tranche.',
          amount: '+360,000 ر.س وفر',
          sourceSystem: 'PROJECT_TELEMETRY // CONTRACT_SLA',
          timestamp: 'أولوية قصوى #01',
          auditEvidenceAr: 'العقد رقم CON-METRO-04 - ميزانية المشروع تضمن استرداد التدفق خلال 45 يوماً',
          auditEvidenceEn: 'Contract CON-METRO-04 — Project cash collections cover tranche within 45 days'
        },
        {
          id: 'sim-dec-2',
          tag: 'SUPPLIER_RENEGOTIATION',
          severity: 'warning',
          titleAr: 'تفعيل خيار الشراء المجمع للإسمنت عبر 3 شركات تابعة',
          titleEn: 'Consolidate Bulk Cement Procurement Across 3 Entities',
          detailAr: 'تحليل المنظومة كشف شراء 85,000 كيس إسمنت شهرياً بعقود منفصلة. توحيد أمر التوريد يوفر 14.5% فورياً على الفاتورة الإجمالية.',
          detailEn: 'Aggregating 85,000 bags/mo across 3 subsidiaries unlocks 14.5% tiered volume discount.',
          amount: '+245,000 ر.س سنوياً',
          sourceSystem: 'PROCUREMENT_RADAR // BULK_INDEX',
          timestamp: 'أولوية تكتيكية #02',
          auditEvidenceAr: 'عروض أسعار معتمدة ومطابقة لشروط الجودة والمواصفات السعودية (SASO)',
          auditEvidenceEn: 'Certified quotes meeting SASO quality standards with 45-day credit'
        },
        {
          id: 'sim-dec-3',
          tag: 'CREDIT_LIMIT_HOLD',
          severity: 'warning',
          titleAr: 'تعليق السحب الائتماني لشركة (الأفق للتجارة) لتجاوز سقف 90 يوماً',
          titleEn: 'Suspend Credit Line for Horizon Trading Due to Aging Debt',
          detailAr: 'تراكم مستحقات غير مسددة بقيمة 890,000 ريال تجاوزت 92 يوماً مع استمرار طلب طلبيات جديدة. الإجراء: اشتراط السداد النقدي بنسبة 40% قبل الشحن.',
          detailEn: 'Outstanding receivables of 890,000 SAR crossed 92 days aging with new orders pending. Action: Require 40% cash.',
          amount: '890,000 ر.س حماية سيولة',
          sourceSystem: 'FINANCE_LEDGER // RECEIVABLES_AGING',
          timestamp: 'أولوية ائتمانية #03',
          auditEvidenceAr: 'سجل السداد التاريخي للعميل يظهر تأخيراً متواصلاً لثلاث فترات متتالية',
          auditEvidenceEn: 'Customer payment delinquency telemetry showing recurring 90+ day aging'
        }
      ]
    },
    caseStudy: {
      clientTypeAr: 'مجموعة استثمارية ومقاولات كبرى',
      clientTypeEn: 'Premier Investment & Contracting Conglomerate',
      industryAr: 'المقاولات والتطوير العقاري (الدمام والرياض)',
      industryEn: 'Infrastructure & Real Estate (Dammam & Riyadh)',
      scenarioAr: 'كانت الإدارة التنفيذية تستغرق اجتماعات أسبوعية تستمر لأكثر من 6 ساعات لمناقشة مطالبات المقاولين وتدبير السيولة دون وضوح بالأولويات.',
      scenarioEn: 'Management was bogged down in weekly 6-hour marathon meetings debating subcontractor claims with zero data clarity.',
      verifiedResultAr: 'انخفض وقت اجتماعات البت في القرارات بنسبة 70%، وتم توجيه 14 مليون ريال سيولة نحو المشاريع الأكثر ربحية متفادين غرامات تأخير بقيمة 2.1 مليون ريال.',
      verifiedResultEn: 'Cut executive decision time by 70% and re-steered 14M SAR liquidity to high-margin milestones, averting 2.1M SAR in penalties.',
      quoteAr: 'المنظومة أصبحت بمثابة العقل الموجه لاجتماعاتنا. كل قرار أصبح واضحاً بالأرقام ومن المسؤول عنه وما هو المردود المتوقع.',
      quoteEn: 'Mikhlafi Labs became the steering intellect of our board. Every debate is replaced by mathematical clarity and assigned ownership.',
      metrics: [
        { labelAr: 'تسريع وقت اتخاذ القرار', labelEn: 'Decision Deliberation', val: '-70%' },
        { labelAr: 'غرامات تم تفاديها', labelEn: 'Penalties Prevented', val: '2.1M ر.س' },
        { labelAr: 'معدل إنجاز المهام بالموعد', labelEn: 'On-Time Directive Completion', val: '94%' }
      ]
    },
    faqs: [
      {
        qAr: 'هل يفرض المحرك قرارات إلزامية على الإدارة أم يقدم توصيات؟',
        qEn: 'Does the system enforce decisions autonomously or recommend them?',
        aAr: 'المحرك يقدم توصيات تنفيذية مدعومة بالأدلة والتحليل المالي الدقيق، والقرار النهائي يبقى دائماً بيد الرئيس التنفيذي وفريق القيادة لاعتماده بنقرة واحدة.',
        aEn: 'The system delivers evidence-grounded directives with full rationale, while final sign-off remains strictly with executive leadership.'
      },
      {
        qAr: 'كيف يعرف المحرك أولويات مؤسستنا المحددة وأهدافنا السنوية؟',
        qEn: 'How does the engine understand our company-specific priorities?',
        aAr: 'يتم ضبط أوزان المحرك (Decision Weights) بناءً على أهدافك الاستراتيجية: هل الأولوية القصوى حالياً لحماية السيولة، أم تسريع نمو الإيرادات، أم حماية هوامش الربح.',
        aEn: 'Configurable strategic weighting tunes the engine to your core corporate mandate: cash liquidity, growth acceleration, or margin defense.'
      },
      {
        qAr: 'هل يمكن للمدراء التنفيذيين استخدام المنظومة عبر الجوال؟',
        qEn: 'Can C-suite executives use the platform on mobile devices?',
        aAr: 'نعم، تم تصميم واجهة القيادة التنفيذية بالكامل لتكون متجاوبة وخفيفة وسريعة على الهواتف والأجهزة اللوحية مع دعم المصادقة البيومترية المشفرة.',
        aEn: 'Yes, fully optimized for executive mobile workflows with biometric authentication and instantaneous directive approvals.'
      },
      {
        qAr: 'هل يمكن ربط القرارات بنظام متابعة المهام لدينا؟',
        qEn: 'Can decisions be linked to our task tracking software?',
        aAr: 'نعم، المنظومة تدعم التكامل الآلي مع Microsoft Teams, Slack, Jira, Asana, أو البريد المؤسسي لإشعار المسؤولين فور اعتماد التوجيه.',
        aEn: 'Yes, native integration connects directly to Teams, Slack, Jira, or corporate email upon directive authorization.'
      }
    ]
  },

  // ── Engine 03: Predictive Risk Radar ────────────────────────────────────────
  {
    id: 'risk-radar',
    slug: 'risk-radar',
    engineNumber: '03',
    iconName: 'alert-triangle',
    accentColor: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    badgeAr: 'رادار الإنذار المبكر',
    badgeEn: 'PREDICTIVE RISK INTELLIGENCE',
    titleAr: 'رادار التنبؤ بالمخاطر والإنذار المبكر',
    titleEn: 'Predictive Risk Intelligence & Early Warning Radar',
    taglineAr: 'رصد اختناقات السيولة ونفاد المخزون وتعثر المشاريع قبل تحولها إلى أزمات',
    taglineEn: 'Detect liquidity bottlenecks, inventory stockouts, and project delays before crisis onset',
    heroDescriptionAr:
      'رادار استباقي متطور يحلل المؤشرات التشغيلية والمالية وسلاسل الإمداد، للتنبؤ المبكر بمخاطر نقص السيولة النقدية، انقطاع المواد الحيوية، واختلال التوازنات التعاقدية بفاصل زمني يصل إلى 60 يوماً قبل وقوعها.',
    heroDescriptionEn:
      'Predictive telemetry monitoring operational, financial, and supply variables to forecast cash crunches, single-source vendor failures, and project margin slippages up to 60 days ahead.',
    heroMetrics: [
      {
        val: '30 - 60 يوماً',
        labelAr: 'نافذة الإنذار الاستباقي المبكر',
        labelEn: 'Early Warning Horizon',
        noteAr: 'مهلة كافية لتصحيح المسار قبل الأزمة',
        noteEn: 'Ample runway to take corrective operational action'
      },
      {
        val: '94.6%',
        labelAr: 'دقة التنبؤ باختناقات التدفق النقدي',
        labelEn: 'Cash Flow Bottleneck Precision',
        noteAr: 'مستندة إلى قيود الفواتير وتواريخ الاستحقاق',
        noteEn: 'Grounded in verifiable payables & receivables aging'
      },
      {
        val: '-72%',
        labelAr: 'انخفاض في حالات التوقف الطارئ',
        labelEn: 'Reduction in Emergency Downtime',
        noteAr: 'تأمين المواد والمخزون الحرج مسبقاً',
        noteEn: 'Proactive buffers against critical material stockouts'
      }
    ],
    executiveSummaryAr:
      'تحدث الأزمات التشغيلية الكبرى نتيجة تجاهل إشارات الإنذار المبكرة التي تكون متناثرة بين كشوفات البنوك، تقارير الشحن، وجداول المستودعات. يقوم رادار المخاطر بربط هذه الإشارات في خريطة مخاطر حية توضح احتمالية الوقوع والأثر المالي المحتمل.',
    executiveSummaryEn:
      'Enterprise crises rarely arrive without warning; early signals are simply buried across isolated silos. MIKHLAFI LABS risk radar continuously correlates weak signals into an actionable threat matrix with quantifiable downside impact.',
    painPoints: [
      {
        num: '01',
        titleAr: 'مفاجآت عجز السيولة عند استحقاق الالتزامات',
        titleEn: 'Sudden Cash-Flow Crunches on Settlement Dates',
        currentFailureAr: 'ظهور عجز مفاجئ في الحساب البنكي عند حلول موعد صرف الرواتب أو أقساط الموردين لغياب رؤية توقعية دقيقة للتدفقات.',
        currentFailureEn: 'Unexpected liquidity shortages when payroll or major supplier notes fall due owing to static cash forecasting.',
        mikhlafiSolutionAr: 'تنبؤ ديناميكي للتدفق النقدي (Rolling 13-Week Cash Forecast) يقيس استحقاقات الصرف مقابل وتيرة التحصيل الحقيقية.',
        mikhlafiSolutionEn: 'Dynamic rolling 13-week cash-flow telemetry modeling realistic customer collection velocity against payables.',
        impactAr: 'تجنب تكاليف التمويل الطارئ وغرامات السحب على المكشوف',
        impactEn: 'Eliminates emergency short-term borrowing costs and penalty fees'
      },
      {
        num: '02',
        titleAr: 'توقف خطوط الإنتاج بسبب نفاد صنف حرج',
        titleEn: 'Production Stoppages Due to Stockouts of Critical SKUs',
        currentFailureAr: 'توقف مشروع أو مصنع كامل نتيجة نفاد مادة خام أو قطعة غيار واحدة بسبب تأخر شحنة دولية دون وجود مورد بديل.',
        currentFailureEn: 'Plant shutdown caused by the stockout of a single sub-component with zero pre-qualified backup suppliers.',
        mikhlafiSolutionAr: 'رصد مستمر لمعدل استهلاك المواد ومستويات الأمان، مع مراقبة أزمنة الشحن والموانئ للتنبيه قبل نفاد المخزون بـ 45 يوماً.',
        mikhlafiSolutionEn: 'Continuous burn rate monitoring cross-referenced with port customs transit delays to trigger 45-day alerts.',
        impactAr: 'حماية استمرارية الأعمال ومنع خسائر التوقف بملايين الريالات',
        impactEn: 'Guarantees uninterrupted operations, preventing millions in downtime losses'
      },
      {
        num: '03',
        titleAr: 'التعرض المالي المفرط لمورد أو عميل متعثر',
        titleEn: 'Extreme Counterparty Exposure & Default Risks',
        currentFailureAr: 'الاعتماد على مورد واحد يمثل 60% من المشتريات دون متابعة مؤشرات ملاءته المالية والتزامه بمواعيد التوريد.',
        currentFailureEn: 'Over-concentrated reliance on a single supplier or customer without monitoring counterparty default risk.',
        mikhlafiSolutionAr: 'مؤشر تركز المخاطر (Concentration Risk Index) لكشف الحسابات التي تشكل خطراً سيادياً على المؤسسة واقتراح تنويع الموردين.',
        mikhlafiSolutionEn: 'Real-time Concentration Index highlighting systemic dependency risks and recommending vetted diversification.',
        impactAr: 'خفض مخاطر تعثر سلاسل الإمداد بنسبة 45%',
        impactEn: 'Reduces supply chain default vulnerability by 45%'
      }
    ],
    methodologySteps: [
      {
        step: '01',
        titleAr: 'استشعار الإشارات الضعيفة والمتعددة',
        titleEn: 'Multi-Stream Weak Signal Ingestion',
        techDetailAr: 'مراقبة حركة الحسابات البنكية، أوامر الشراء المتأخرة، معدلات دوران المخزون، ونسب إرجاع البضائع عبر كافة الفروع.',
        techDetailEn: 'Monitoring bank balances, aged POs, inventory turnover velocity, and return metrics across all business units.',
        outputAr: 'مصفوفة البيانات التشغيلية المتكاملة',
        outputEn: 'Operational telemetry stream'
      },
      {
        step: '02',
        titleAr: 'النمذجة الرياضية لسيناريوهات الخطر',
        titleEn: 'Mathematical Risk & Stress Modeling',
        techDetailAr: 'إجراء اختبارات ضغط مالية وتشغيلية (Stress Testing) لمحاكاة سيناريوهات تأخر التحصيل بنسبة 20% أو ارتفاع أسعار الشحن 30%.',
        techDetailEn: 'Executing probabilistic Monte Carlo and stress simulations across liquidity, lead times, and foreign exchange shifts.',
        outputAr: 'مؤشرات احتمال وقوع الأزمة والأثر المالي',
        outputEn: 'Probabilistic risk exposure curve'
      },
      {
        step: '03',
        titleAr: 'توليد الإنذار المبكر متعدد المستويات',
        titleEn: 'Multi-Tiered Early Warning Generation',
        techDetailAr: 'تصنيف المخاطر إلى 3 مستويات: (حرج / يستدعي الانتباه / مستقر) مع تفصيل الأسباب الجذرية ومهلة التصرف المتبقية.',
        techDetailEn: 'Categorizing threats into Critical, Warning, and Optimal with root causes and remaining time-to-action.',
        outputAr: 'إنذار تنفيذي محدد بمهلة زمنية',
        outputEn: 'Time-bound executive risk alert'
      },
      {
        step: '04',
        titleAr: 'خطة التحوط والإجراء العلاجي الفوري',
        titleEn: 'Automated Mitigation Playbook Trigger',
        techDetailAr: 'اقتراح خطوات محددة للتحوط: تأمين مورد بديل، إعادة جدولة سداد دفعات غير حرجة، أو تفعيل بند الشحن السريع.',
        techDetailEn: 'Prescribing operational hedges: secondary supplier activation, non-critical payment postponements, or buffer adjustments.',
        outputAr: 'خطة علاجية قابلة للتنفيذ الفوري',
        outputEn: 'Actionable mitigation playbook'
      }
    ],
    integrations: [
      { name: 'Core Banking API & MT940', type: 'Bank Statement Feed', statusAr: 'مراقبة السيولة الحية', statusEn: 'Live Cash Feed' },
      { name: 'WMS & Supply Chain ERP', type: 'Inventory Telemetry', statusAr: 'تتبع حركة المخزون', statusEn: 'Stock Telemetry' },
      { name: 'Global Logistics & Shipping Feeds', type: 'Transit APIs', statusAr: 'متابعة الشحن والموانئ', statusEn: 'Freight Tracking' },
      { name: 'Credit Rating & B2B Directories', type: 'Counterparty Scoring', statusAr: 'فحص الملاءة المالية', statusEn: 'Credit Rating' }
    ],
    simulationData: {
      tabTitleAr: 'رادار المخاطر التشغيلية والمالية الحية',
      tabTitleEn: 'Operational & Financial Risk Radar Demo',
      items: [
        {
          id: 'sim-risk-1',
          tag: 'LIQUIDITY_RUNWAY',
          severity: 'critical',
          titleAr: 'احتمال فجوة سيولة بقيمة 1.8M ريال بعد 22 يوماً',
          titleEn: 'Liquidity Deficit Forecast: 1.8M SAR Gap in 22 Days',
          detailAr: 'تزامن موعد صرف رواتب الربع الحالي مع دفعة استيراد ضخمة وتأخر تحصيل مستخلص حكومي متوقع. الإجراء المقترح: تفعيل تحصيل مبكر لثلاث فواتير معتمدة.',
          detailEn: 'Quarterly payroll overlaps with heavy import LC while anticipated public sector collection is delayed by 18 days.',
          amount: '1,800,000 ر.س فجوة متوقعة',
          sourceSystem: 'CASH_RUNWAY_RADAR // AP_VS_AR',
          timestamp: 'مهلة التصرف: 8 أيام',
          auditEvidenceAr: 'حساب التدفق النقدي لـ 60 يوماً يكشف هبوط الرصيد تحت الحد الأدنى البالغ 500,000 ريال',
          auditEvidenceEn: '60-day cash curve forecasts account dropping below safety threshold of 500k SAR on Day 22'
        },
        {
          id: 'sim-risk-2',
          tag: 'SUPPLY_STOCKOUT',
          severity: 'warning',
          titleAr: 'خطر نفاد صمامات الضغط العالي بمصنع ينبع خلال 14 يوماً',
          titleEn: 'Critical Component Stockout: Yanbu Plant in 14 Days',
          detailAr: 'معدل الاستهلاك ارتفع بنسبة 40% بسبب صيانة دورية، بينما الشحنة القادمة من المانيا متأخرة في ميناء جدة الإسلامي.',
          detailEn: 'Consumption velocity jumped 40% while replacement consignment is delayed in customs inspection.',
          amount: 'خسارة توقف: 120,000 ر.س/يوم',
          sourceSystem: 'WMS_LOGISTICS // PORT_TRACKER',
          timestamp: 'مهلة التصرف: 4 أيام',
          auditEvidenceAr: 'رصيد المستودع: 8 وحدات متبقية - معدل السحب اليومي: 0.8 وحدة - المورد البديل متاح بالرياض',
          auditEvidenceEn: 'Remaining stock: 8 units — Daily burn: 0.8 units — Vetted local backup available in Riyadh'
        },
        {
          id: 'sim-risk-3',
          tag: 'CONTRACTOR_DELINQUENCY',
          severity: 'warning',
          titleAr: 'مؤشر تعثر مقاول الأعمال الكهروميكانيكية (MEP) بمشروع الخرج',
          titleEn: 'MEP Subcontractor Default Risk on Al-Kharj Project',
          detailAr: 'تراجع وتيرة العمالة في الموقع بنسبة 55% خلال أسبوعين وتراكم شكاوى عمالية تخص تأخر الرواتب، مما يهدد بتأخر تسليم المشروع.',
          detailEn: 'On-site workforce presence dropped 55% over 14 days with worker wage disputes, risking 4-week milestone penalty.',
          amount: 'غرامة تأخير: 350,000 ر.س',
          sourceSystem: 'SITE_TELEMETRY // SUBCONTRACTOR_INDEX',
          timestamp: 'مهلة التصرف: 5 أيام',
          auditEvidenceAr: 'نسبة الإنجاز المالي 72% مقابل الإنجاز الفعلي 49% - تم تجميد المستخلص القادم لحين تسوية وضع العمالة',
          auditEvidenceEn: 'Disbursement progress 72% vs physical completion 49% — Next progress payment placed on hold'
        }
      ]
    },
    caseStudy: {
      clientTypeAr: 'شركة كبرى في قطاع الخدمات اللوجستية والتبريد',
      clientTypeEn: 'Leading Cold-Chain Logistics & Distribution Enterprise',
      industryAr: 'سلاسل الإمداد والتخزين المبرد (جدة والرياض)',
      industryEn: 'Cold-Chain Supply & Storage (Jeddah & Riyadh)',
      scenarioAr: 'تعرضت الشركة سابقاً لتوقف مفاجئ في أسطول التبريد بسبب نفاد غاز الفريون المعتمد وتأخر الشحنات، مما تسبب بتلف بضائع بقيمة 1.4 مليون ريال.',
      scenarioEn: 'Suffered catastrophic fleet downtime due to refrigerant stockout and customs clearance delays, spoiling 1.4M SAR in perishable goods.',
      verifiedResultAr: 'منذ تفعيل رادار المخاطر، قدمت المنظومة 14 إنذاراً مبكراً قبل 40 يوماً من نفاد المخزون، وحققت الشركة صفر توقفات طارئة خلال 18 شهراً متتالية.',
      verifiedResultEn: 'Generated 14 predictive alerts 40+ days ahead of potential stockouts, delivering 18 consecutive months of zero unscheduled downtime.',
      quoteAr: 'المنظومة غيرت طريقة إدارتنا للمخاطر من ردة فعل بعد وقوع الكارثة إلى استباق محسوب بالأيام والساعات.',
      quoteEn: 'Mikhlafi Labs shifted our entire operational culture from panic post-mortems to deterministic risk immunity.',
      metrics: [
        { labelAr: 'التوقفات التشغيلية الطارئة', labelEn: 'Emergency Stoppages', val: '0 توقف' },
        { labelAr: 'فترة الإنذار قبل الأزمة', labelEn: 'Average Warning Window', val: '42 يوماً' },
        { labelAr: 'خسائر بضائع تم تفاديها', labelEn: 'Inventory Losses Prevented', val: '3.1M ر.س' }
      ]
    },
    faqs: [
      {
        qAr: 'كيف تختلف المنظومة عن مؤشرات إدارة المخاطر التقليدية (Risk Matrices)؟',
        qEn: 'How does this differ from traditional static risk assessment matrices?',
        aAr: 'مصفوفات المخاطر التقليدية تكون مجرد ملفات Excel تُحدّث سنوياً وتبقى نظرية. رادار MIKHLAFI LABS متصل لحظياً ببياناتك الفعلية ويعيد حساب درجات الخطر يومياً بناءً على القيود المحاسبية وحركة المخزون وسجلات المواقع.',
        aEn: 'Traditional risk matrices are static annual spreadsheets. Our radar continuously recalibrates risk scores against daily live ERP and telemetry streams.'
      },
      {
        qAr: 'هل يمكن تخصيص حدود التنبيه (Thresholds) لتناسب حساسية شركتنا؟',
        qEn: 'Can alert thresholds be tailored to our specific organizational tolerances?',
        aAr: 'نعم بالكامل، يمكنك تحديد قيمة الفجوة المالية المقلقة (مثلاً 500,000 ريال) أو نسبة التأخير المسموح بها في سلاسل الإمداد بدقة متناهية.',
        aEn: 'Fully configurable. Set custom materiality limits, minimum liquidity runway days, and supplier SLA deviation triggers.'
      },
      {
        qAr: 'هل يصدر الرادار تنبيهات مزعجة وكثيرة بلا فائدة؟',
        qEn: 'Will the radar flood executives with noisy, low-value notifications?',
        aAr: 'لا، تعتمد المنظومة على فلترة حتمية صارمة تجمع الإشارات وتصنفها، ولا تصعد للإدارة العليا إلا المخاطر ذات الأثر المالي أو التشغيلي الحقيقي.',
        aEn: 'No. Strict deterministic correlation suppresses noise, only escalating verified anomalies that pose genuine capital or operational peril.'
      },
      {
        qAr: 'هل يمكن ربط الرادار بالبنوك المحلية السعودية لمتابعة التدفق النقدي؟',
        qEn: 'Can the radar connect to Saudi commercial banks for cash-flow tracking?',
        aAr: 'نعم، المنظومة تدعم قراءة كشوف الحسابات المصرفية الإلكترونية (MT940/CAMT.053) أو الربط مع واجهات البنوك المحلية المتوافقة مع معايير البنك المركزي السعودي (SAMA).',
        aEn: 'Yes, supporting automated MT940 statement ingestion and modern corporate open banking APIs compliant with SAMA frameworks.'
      }
    ]
  },

  // ── Engine 04: Project Margin & Contract Assurance ──────────────────────────
  {
    id: 'project-margins',
    slug: 'project-margins',
    engineNumber: '04',
    iconName: 'trending-up',
    accentColor: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.25)',
    badgeAr: 'حوكمة المشاريع والعقود',
    badgeEn: 'PROJECT & CONTRACT GOVERNANCE',
    titleAr: 'حوكمة المشاريع وحماية هوامش العقود الاستراتيجية',
    titleEn: 'Contract Margin Assurance & Project Telemetry',
    taglineAr: 'حماية أرباح المشاريع من التآكل الناتج عن انحراف التكاليف والمطالبات غير الموثقة',
    taglineEn: 'Shield project profits from budget creep, change order leaks, and unverified contractor claims',
    heroDescriptionAr:
      'منظومة متكاملة لربط المخطط بالمنفذ الفعلي في المشاريع الكبرى وعقود الخدمات. تقوم بمراقبة وتيرة استنزاف الميزانية (Burn Rate)، مطابقة أوامر التغيير، تدقيق مستخلصات مقاولي الباطن، والتنبؤ المبكر بتاريخ الإنجاز والهامش النهائي.',
    heroDescriptionEn:
      'Integrated governance mesh connecting contractual baseline milestones with actual site disbursements. Monitors burn velocity, verifies change orders, audits subcontractor progress claims, and forecasts project completion margins.',
    heroMetrics: [
      {
        val: '+3.8% - 6.2%',
        labelAr: 'زيادة في حماية هامش الربح النهائي',
        labelEn: 'Final Margin Preservation',
        noteAr: 'مقارنة بالمشاريع المدارة بالطرق اليدوية',
        noteEn: 'Versus unmonitored manual milestone tracking'
      },
      {
        val: '65% أسرع',
        labelAr: 'تسوية مستخلصات مقاولي الباطن',
        labelEn: 'Subcontractor Claim Settlement',
        noteAr: 'تدقيق فوري ومطابقة بالأدلة الهندسية والمالية',
        noteEn: 'Real-time reconciliation of site work vs claims'
      },
      {
        val: '100% تطابق',
        labelAr: 'حوكمة أوامر التغيير والمطالبات',
        labelEn: 'Change Order Audit Traceability',
        noteAr: 'لا يمر أمر تغيير دون اعتماد مالي موثق',
        noteEn: 'Zero unapproved scope creep slipping to margin loss'
      }
    ],
    executiveSummaryAr:
      'تبدأ معظم المشاريع الكبرى بهوامش ربح متوقعة تزيد عن 18%، لكنها تنتهي بهوامش تقل عن 6% بسبب أوامر التغيير غير المفوترة، مطالبات مقاولي الباطن غير المدققة، وتأخر إنجاز المعالم التعاقدية. تحافظ المنظومة على كل هللة من الهامش عبر التدقيق اللحظي المستمر.',
    executiveSummaryEn:
      'Enterprise projects often launch with projected 18%+ margins only to close under 6% due to unbilled variation orders and untracked contractor claims. MIKHLAFI LABS provides ironclad margin assurance across the entire contract lifecycle.',
    painPoints: [
      {
        num: '01',
        titleAr: 'تآكل هوامش الربح بسبب أوامر التغيير غير المعتمدة',
        titleEn: 'Silent Margin Bleed from Unapproved Scope Variations',
        currentFailureAr: 'تنفيذ أعمال إضافية في الموقع بطلب من العميل دون إصدار أمر تغيير تعاقدي معتمد مالياً، مما يحول تكلفتها إلى خسارة محضة.',
        currentFailureEn: 'Site teams performing scope additions without formal contractual variation orders, turning extra work into direct losses.',
        mikhlafiSolutionAr: 'ربط مباشر بين تقارير الموقع ونظام إدارة العقود لمنع صرف أي ريال على بنود خارج نطاق العقد إلا بعد توقيع التكلفة المعتمدة.',
        mikhlafiSolutionEn: 'Mandatory bridge matching daily site logs to executed contracts, barring unauthorized variations from disbursement.',
        impactAr: 'حفظ 100% من مستحقات الأعمال الإضافية وتوثيقها فوراً',
        impactEn: 'Recovers 100% of billable change orders before project close'
      },
      {
        num: '02',
        titleAr: 'صرف مستخلصات مقاولي الباطن دون تحقق ميداني',
        titleEn: 'Inflated Subcontractor Progress Invoices',
        currentFailureAr: 'تقديم مقاولي الباطن لمطالبات بنسبة إنجاز 70% بينما الإنجاز الهندسي الفعلي لا يتجاوز 50%، مما يتسبب بدفعات مسبقة غير مضمونة.',
        currentFailureEn: 'Subcontractors invoicing 70% progress when physical inspection proves only 50% completion, risking overpayment.',
        mikhlafiSolutionAr: 'محرك مطابقة حتمي يقارن كميات المواد المستهلكة وتقارير الإشراف الميداني مع نسب الفوترة لمنع الصرف الزائد.',
        mikhlafiSolutionEn: 'Algorithmic reconciliation cross-referencing delivered materials, supervisor sign-offs, and billed percentages.',
        impactAr: 'منع دفعات زائدة بملايين الريالات واسترداد الخصومات النظامية',
        impactEn: 'Eliminates unearned progress payments and verifies retention holds'
      },
      {
        num: '03',
        titleAr: 'تأخر اكتشاف انحراف الجدول الزمني للمشاريع',
        titleEn: 'Late Discovery of Schedule & Burn Drift',
        currentFailureAr: 'اكتشاف تأخر المشروع عن موعد التسليم النهائي قبل شهر واحد فقط من انتهاء العقد، مما يوقع المؤسسة تحت غرامات التأخير الصارمة.',
        currentFailureEn: 'Discovering project schedule slippages just weeks before contract deadline, incurring severe liquidated damages.',
        mikhlafiSolutionAr: 'نموذج تنبؤ مستمر بمؤشر كفاءة التكلفة (CPI) ومؤشر كفاءة الجدول الزمني (SPI) ينذر بالانحراف قبل وقوعه بـ 90 يوماً.',
        mikhlafiSolutionEn: 'Predictive CPI and SPI index monitoring identifying schedule and cost drift 90 days before milestone deadlines.',
        impactAr: 'تفادي غرامات التأخير التي تصل إلى 10% من قيمة العقد',
        impactEn: 'Prevents contractual liquidated damages often capped at 10% of contract value'
      }
    ],
    methodologySteps: [
      {
        step: '01',
        titleAr: 'تأسيس خط الأساس التعاقدي (Baseline)',
        titleEn: 'Contractual Baseline Digitization',
        techDetailAr: 'رقمنة جدول الكميات (BOQ)، ميزانية البنود المعتمدة، المعالم الرئيسية، وشروط الدفعات والغرامات في هيكل بياني منظم.',
        techDetailEn: 'Digitizing Bills of Quantities (BOQs), approved itemized cost sheets, milestones, and penalty clauses in a queryable graph.',
        outputAr: 'سجل حتمي لشروط وميزانيات العقد المعتمد',
        outputEn: 'Immutable baseline contract profile'
      },
      {
        step: '02',
        titleAr: 'تتبع استنزاف التكاليف والمستخلصات الفعلية',
        titleEn: 'Real-Time Cost Burn & Progress Telemetry',
        techDetailAr: 'تسجيل كافة القيود المالية وسندات استلام المواد وساعات العمل الميدانية ومطابقتها يوماً بيوم مع بنود الميزانية المقررة.',
        techDetailEn: 'Ingesting daily ERP postings, material goods receipts, timesheets, and equipment logs against target line budgets.',
        outputAr: 'مؤشر وتيرة استنزاف الميزانية لحظة بلحظة',
        outputEn: 'Live budget burn velocity curve'
      },
      {
        step: '03',
        titleAr: 'التدقيق الحتمي لمطالبات مقاولي الباطن',
        titleEn: 'Deterministic Subcontractor Claim Audit',
        techDetailAr: 'مقارنة كميات المطالبات المرفوعة بنسب الاستلام الميدانية المسجلة، واحتساب الخصومات وغرامات التأخير والدفعات المقدمة آلياً.',
        techDetailEn: 'Mathematical audit comparing claimed quantities against engineering field telemetry and automated retention deductions.',
        outputAr: 'شهادة دفع مدققة وموثقة هندسياً ومحاسبياً',
        outputEn: 'Verified engineering payment certificate'
      },
      {
        step: '04',
        titleAr: 'التنبؤ بالهامش النهائي وإجراءات الحماية',
        titleEn: 'Final Margin Forecasting & Corrective Actions',
        techDetailAr: 'حساب التكلفة المتوقعة عند الاكتمال (EAC) وتحديد البنود التي تهدد الهامش الربحي لاقتراح إعادة هندسة التكاليف فوراً.',
        techDetailEn: 'Continuous calculation of Estimate At Completion (EAC) with pinpoint alerts on leaking margin lines for immediate renegotiation.',
        outputAr: 'توقعات دقيقة للأرباح النهائية مع خطة حماية الهامش',
        outputEn: 'Forecasted final margin with protection directive'
      }
    ],
    integrations: [
      { name: 'Oracle Primavera P6 & Unifier', type: 'Schedule & Cost Sync', statusAr: 'متوافق بالكامل', statusEn: 'Native Integration' },
      { name: 'Microsoft Project & Planner', type: 'XML / REST Feed', statusAr: 'ربط الجداول الزمنية', statusEn: 'Schedule Sync' },
      { name: 'SAP S/4HANA Project System (PS)', type: 'WBS & Cost Center', statusAr: 'مطابقة قيود التكلفة', statusEn: 'Cost Center Ready' },
      { name: 'Procore & Construction Software', type: 'Site Telemetry Webhook', statusAr: 'تقارير الإنجاز الميداني', statusEn: 'Field Reports' }
    ],
    simulationData: {
      tabTitleAr: 'مراقبة هوامش المشاريع والمستخلصات التعاقدية',
      tabTitleEn: 'Project Margin & Contract Telemetry Demo',
      items: [
        {
          id: 'sim-prj-1',
          tag: 'UNBILLED_VARIATION',
          severity: 'critical',
          titleAr: 'أعمال موقع غير مفوترة بقيمة 340,000 ريال بمشروع مجمع الملقا',
          titleEn: 'Unbilled Site Variation: 340,000 SAR at Al-Malqa Hub',
          detailAr: 'تم تنفيذ تعديلات إنشائية بطلب الاستشاري منذ 45 يوماً دون إصدار أمر تغيير معتمد. الإجراء: إيقاف الصرف وإصدار مطالبة تعاقدية فورية.',
          detailEn: 'Structural alterations completed 45 days ago per consultant request with zero VO issued. Action: Halt expense & invoice VO.',
          amount: '340,000 ر.س مطالبة معلقة',
          sourceSystem: 'PROCORE // FIELD_INSPECTION',
          timestamp: 'منذ ساعتين',
          auditEvidenceAr: 'محضر الاستلام الميداني رقم IR-2201 يثبت إنجاز العمل دون تغطية من الميزانية المعتمدة',
          auditEvidenceEn: 'Inspection report IR-2201 confirms completed work with zero unapproved budget coverage'
        },
        {
          id: 'sim-prj-2',
          tag: 'CLAIM_OVERPAYMENT',
          severity: 'warning',
          titleAr: 'مستخلص مقاول حفريات متجاوز بنسبة 18% عن الواقع الميداني',
          titleEn: 'Excavation Claim Exceeds Field Survey by 18%',
          detailAr: 'المقاول يطالب بسداد 180,000 ريال مقابل 12,000 م³ حفر، بينما المسح المساحي الميداني يثبت حفر 9,800 م³ فقط.',
          detailEn: 'Contractor invoices 180,000 SAR for 12,000 m³ excavation vs survey confirmation of 9,800 m³.',
          amount: '33,000 ر.س وفر فوري',
          sourceSystem: 'SURVEY_GPS // BOQ_MATCHER',
          timestamp: 'منذ 5 ساعات',
          auditEvidenceAr: 'المسح الطبوغرافي ثلاثي الأبعاد المعتمد رقم SRV-891 - تم تعديل المستخلص إلى 147,000 ريال',
          auditEvidenceEn: 'Topographical survey SRV-891 confirms actual volume — Invoiced reduced to 147,000 SAR'
        },
        {
          id: 'sim-prj-3',
          tag: 'BURN_ACCELERATION',
          severity: 'warning',
          titleAr: 'تسارع غير مبرر في وتيرة استنزاف بند الخرسانة الجاهزة بمشروع تبوك',
          titleEn: 'Accelerated Burn Velocity on Ready-Mix Concrete',
          detailAr: 'تم استهلاك 68% من ميزانية الخرسانة بينما نسبة الإنجاز الإنشائي الموثقة 44% فقط، مما ينذر بعجز مالي قدره 450,000 ريال عند الإتمام.',
          detailEn: '68% of concrete budget consumed while physical progress is only 44%, projecting a 450k SAR overrun at completion.',
          amount: '450,000 ر.س عجز متوقع',
          sourceSystem: 'SAP_PS // WBS_BURNDOWN',
          timestamp: 'منذ يوم',
          auditEvidenceAr: 'انحراف مؤشر التكلفة CPI = 0.74 - تم توجيه فريق المراجعة للتحقق من نسب الهدر ومطابقة سندات الشاحنات',
          auditEvidenceEn: 'Cost Performance Index CPI = 0.74 — Site audit team deployed to verify wastage and delivery slips'
        }
      ]
    },
    caseStudy: {
      clientTypeAr: 'شركة تطوير عقاري وإنشاءات بنية تحتية',
      clientTypeEn: 'Major Infrastructure & Real Estate General Contractor',
      industryAr: 'المقاولات والمشاريع الكبرى (الرياض والشرقية)',
      industryEn: 'Civil Infrastructure & Commercial Towers (Riyadh & Eastern Province)',
      scenarioAr: 'كانت الشركة تدير 11 مشروعاً متزامناً بقيمة إجمالية تفوق 850 مليون ريال، وكانت هوامش العقود تتناقص باستمرار مع اقتراب التسليم دون معرفة الأسباب المحددة.',
      scenarioEn: 'Managing 11 concurrent projects valued at 850M SAR with persistent margin leakage near project handovers.',
      verifiedResultAr: 'حققت المنظومة حماية مباشرة للهوامش بمقدار 18.2 مليون ريال، مع توثيق أوامر تغيير كانت مهملة بقيمة 9.4 مليون ريال وتسريع تحصيل المستخلصات بـ 24 يوماً.',
      verifiedResultEn: 'Protected 18.2M SAR in contract margins, captured 9.4M SAR in unbilled scope additions, and accelerated collection cycles by 24 days.',
      quoteAr: 'المنظومة وفرت لنا الرؤية الحسابية التي كنا نفتقدها دائماً. لم يعد هناك مستخلص يمر أو عمل إضافي يضيع دون إثبات رسمي.',
      quoteEn: 'Mikhlafi Labs gave us the exact financial audit control we always lacked. No change order is lost and no inflated claim passes.',
      metrics: [
        { labelAr: 'إجمالي الهوامش المحمية', labelEn: 'Total Protected Margin', val: '18.2M ر.س' },
        { labelAr: 'أعمال إضافية تم تحصيلها', labelEn: 'Change Orders Billed', val: '9.4M ر.س' },
        { labelAr: 'تسريع دورة المستخلصات', labelEn: 'Claim Settlement Acceleration', val: '24 يوماً' }
      ]
    },
    faqs: [
      {
        qAr: 'هل تتكامل المنظومة مع برنامج Primavera P6 المستخدم لدى مهندسينا؟',
        qEn: 'Does the system integrate with Primavera P6 used by our planners?',
        aAr: 'نعم، تدعم المنظومة استيراد وتزامن ملفات P6 (XER/XML) وقراءة الجداول الزمنية والمعالم وربطها مباشرة بالقيود المحاسبية لنظام ERP.',
        aEn: 'Yes, full compatibility with Primavera P6 (XER/XML) linking project schedules and milestones directly to ERP actual costs.'
      },
      {
        qAr: 'كيف تكتشف المنظومة الخلافات في مطالبات مقاولي الباطن؟',
        qEn: 'How does the platform detect discrepancies in subcontractor invoices?',
        aAr: 'من خلال مطابقة ثلاثية الأبعاد: كميات جدول الكميات (BOQ)، سندات توريد المواد الفعلية في المستودع، ومحاضر الاستلام المعتمدة من الاستشاري، لكشف أي تضخيم فوري.',
        aEn: 'Via 3-way reconciliation: contractual BOQ rates, warehouse delivery notes, and consultant-approved field inspection logs.'
      },
      {
        qAr: 'هل تناسب المنظومة المشاريع الصغيرة والمتوسطة أم الكبرى فقط؟',
        qEn: 'Is this suited for small-to-medium contracts or only mega projects?',
        aAr: 'المنظومة مصممة للمشاريع التي تبدأ قيمتها من 5 ملايين ريال فأكثر، حيث تكون هوامش الربح معقدة وتتطلب تدقيقاً لمنع الانحرافات المكلفة.',
        aEn: 'Optimized for projects starting from 5M SAR and up, where complex subcontractor networks and scope changes create significant margin hazards.'
      },
      {
        qAr: 'هل يمكن إصدار تقارير للملاك والمستثمرين باللغتين العربية والإنجليزية؟',
        qEn: 'Can we generate stakeholder reports in both Arabic and English?',
        aAr: 'نعم، يمكن تصدير تقارير تنفيذية عالية الجودة بنقرة واحدة بصيغتي PDF و Excel معتمدة للمجالس الإدارية والجهات التمويلية.',
        aEn: 'Yes, one-click export of executive-ready bilingual PDF and Excel dossiers formatted for boards, banks, and sovereign auditors.'
      }
    ]
  },

  // ── Engine 05: Supplier Intelligence ────────────────────────────────────────
  {
    id: 'supplier-intelligence',
    slug: 'supplier-intelligence',
    engineNumber: '05',
    iconName: 'truck',
    accentColor: '#06B6D4',
    glowColor: 'rgba(6, 182, 212, 0.25)',
    badgeAr: 'سلاسل الإمداد والمشتريات',
    badgeEn: 'SUPPLIER INTELLIGENCE RADAR',
    titleAr: 'ذكاء الموردين وموثوقية سلاسل الإمداد',
    titleEn: 'Supplier Intelligence & Procurement Risk Radar',
    taglineAr: 'كشف التبعية المفرطة وتذبذب الأسعار غير المبرر وبناء بطاقة أداء موحدة لكل مورد',
    taglineEn: 'Detect unjustified price creep, single-vendor dependency, and automate supplier scorecards',
    heroDescriptionAr:
      'محرك ذكي لتحليل أداء وموثوقية شبكة الموردين عبر فروع المؤسسة. يكشف تباين الأسعار بين الفروع لنفس السلع، يقيس دقة مواعيد التسليم، ويقيم الملاءة التشغيلية للموردين لحماية استمرارية الإنتاج وتحسين شروط التفاوض.',
    heroDescriptionEn:
      'Continuous telemetry profiling vendor performance, fulfillment reliability, and pricing consistency across holding subsidiaries. Uncovers cross-branch price variance, predicts delivery slippages, and strengthens commercial negotiation leverage.',
    heroMetrics: [
      {
        val: '12% - 19%',
        labelAr: 'وفر سنوي في ميزانيات الشراء المتكررة',
        labelEn: 'Procurement Cost Optimization',
        noteAr: 'من خلال الشراء الموحد وتوحيد الأسعار',
        noteEn: 'Via consolidated buying and contract rate alignment'
      },
      {
        val: '96.2%',
        labelAr: 'دقة رصد تأخر مواعيد التوريد',
        labelEn: 'Lead-Time Prediction Accuracy',
        noteAr: 'استناداً إلى سجلات التخليص والاستلام السابقة',
        noteEn: 'Based on historical transit and customs clearance lags'
      },
      {
        val: '100% شفافية',
        labelAr: 'بطاقة أداء مركزية شاملة',
        labelEn: 'Unified 360° Supplier Scorecard',
        noteAr: 'تقييم موحد للأسعار والجودة والالتزام',
        noteEn: 'Cross-entity metric of price, quality, and SLA'
      }
    ],
    executiveSummaryAr:
      'تشتري معظم الشركات القابضة المواد والخدمات من نفس الموردين عبر فروع مختلفة وبأسعار وشروط سداد متفاوتة دون وجود رؤية موحدة. يقوم محرك ذكاء الموردين بتجميع كافة المعاملات وبناء قوة تفاوضية توفر ملايين الريالات وتحمي سلاسل الإمداد من الانقطاع.',
    executiveSummaryEn:
      'Conglomerates frequently buy from identical vendors across separate subsidiaries under fragmented pricing agreements. MIKHLAFI LABS unifies procurement intelligence, unlocking enterprise volume leverage and securing supply continuity.',
    painPoints: [
      {
        num: '01',
        titleAr: 'تفاوت أسعار الشراء لنفس البنود بين الفروع',
        titleEn: 'Price Discrepancies for Identical SKUs Across Entities',
        currentFailureAr: 'شراء فرع الرياض لنفس مادة التغليف بسعر 45 ريال، بينما يشتريها فرع جدة بـ 62 ريال من نفس المورد لعدم وجود ربط مركزي.',
        currentFailureEn: 'Riyadh branch paying 45 SAR for packaging material while Jeddah pays 62 SAR to identical vendor due to siloed purchasing.',
        mikhlafiSolutionAr: 'فهرسة آلية لكافة بنود المشتريات وتنبيه مدراء المشتريات فوراً بالسعر المرجعي الأقل المطبق في أي من فروع المؤسسة.',
        mikhlafiSolutionEn: 'Automated line-item catalog indexing alerting procurement officers to the lowest prevailing rate across the group.',
        impactAr: 'وفر فوري بنسبة 15% على عقود الشراء المتكررة',
        impactEn: 'Delivers immediate 15% spend savings on recurring consumables'
      },
      {
        num: '02',
        titleAr: 'تأخر الشحنات دون إشعار مسبق وتعطيل العمليات',
        titleEn: 'Unannounced Shipping Slippages & Operational Halts',
        currentFailureAr: 'وعود الموردين بالتسليم خلال 10 أيام وتأخرها الفعلي إلى 28 يوماً، مما يربك خطط الإنتاج ويؤخر تسليم العقود للعملاء.',
        currentFailureEn: 'Suppliers promising 10-day fulfillment while consistently delivering in 28 days, causing site standstills.',
        mikhlafiSolutionAr: 'حساب زمن التوريد الفعلي (Real Lead Time) لكل مورد وتعديل خطط الشراء آلياً مع تنبيهات عند اقتراب مواعيد التأخير.',
        mikhlafiSolutionEn: 'Empirical lead-time telemetry scoring each vendor, factoring real transit drift into automated reorder points.',
        impactAr: 'تحسين الالتزام بمواعيد تسليم المشاريع بنسبة 35%',
        impactEn: 'Improves project on-time handovers by 35%'
      },
      {
        num: '03',
        titleAr: 'الاعتماد المفرط على مورد أحادي (Single Source)',
        titleEn: 'Dangerous Concentration on Single-Source Vendors',
        currentFailureAr: 'اعتماد المؤسسة بنسبة 85% على مورد واحد في صنف استراتيجي، مما يمنحه قوة احتكارية لفرض زيادات سنوية في الأسعار.',
        currentFailureEn: 'Over-relying on a single vendor for 85% of strategic materials, granting them monopolistic leverage for price increases.',
        mikhlafiSolutionAr: 'رادار التركز يقيس حصة كل مورد ويقترح خطة تأهيل موردين بديلين معتمدين قبل الوصول لدرجات الخطر.',
        mikhlafiSolutionEn: 'Concentration Radar quantifying vendor dependency and generating automated secondary supplier qualification lists.',
        impactAr: 'حماية المنظومة من مخاطر التوقف واحتكار الأسعار',
        impactEn: 'Prevents operational paralysis and supplier price gouging'
      }
    ],
    methodologySteps: [
      {
        step: '01',
        titleAr: 'استخلاص وتوحيد سجلات المشتريات والموردين',
        titleEn: 'Vendor Ingestion & Master Data Deduplication',
        techDetailAr: 'دمج سجلات الموردين من كافة أنظمة الفروع، وإزالة التكرارات، وتوحيد السجلات الضريبية (VAT) وأرقام الحسابات البنكية (IBAN).',
        techDetailEn: 'Aggregating supplier databases across ERP instances, resolving naming variations, and matching unique VAT and IBAN numbers.',
        outputAr: 'سجل موحد ونظيف لكافة موردي المجموعة',
        outputEn: 'Golden master vendor registry'
      },
      {
        step: '02',
        titleAr: 'المقارنة المعيارية للأسعار (Benchmarking)',
        titleEn: 'Cross-Entity Line-Item Price Benchmarking',
        techDetailAr: 'مقارنة أسعار توريد كل صنف (SKU) تاريخياً بين مختلف الفروع، ومقارنتها بالأسعار المرجعية المعتمدة في العقود السنوية.',
        techDetailEn: 'Mathematical matrix benchmarking line-item pricing across entities against contractual rate cards and fair market indices.',
        outputAr: 'خريطة فوارق الأسعار وفرص التوفير المتاحة',
        outputEn: 'Procurement price variance heatmap'
      },
      {
        step: '03',
        titleAr: 'احتساب مؤشر الموثوقية وبطاقة الأداء (Scorecard)',
        titleEn: 'Fulfillment Reliability & Quality Scorecarding',
        techDetailAr: 'تقييم كل مورد بناءً على: الالتزام بمواعيد التسليم (OTIF)، نسبة البضائع التالفة أو المرفوضة، وسرعة حل الشكاوى.',
        techDetailEn: 'Dynamic scoring across On-Time In-Full (OTIF) fulfillment, receiving rejection ratios, and commercial responsiveness.',
        outputAr: 'بطاقة أداء رقمية معتمدة لكل مورد',
        outputEn: 'Automated 360° supplier scorecard'
      },
      {
        step: '04',
        titleAr: 'استراتيجية التفاوض والتجميع الشرائي',
        titleEn: 'Consolidated Sourcing Directives & Negotiations',
        techDetailAr: 'توليد توصيات تنفيذية للشراء المجمع، دمج أوامر الشراء للاستفادة من خصومات الكميات، وإعادة التفاوض على شروط السداد.',
        techDetailEn: 'Algorithmic recommendations identifying bulk aggregation opportunities and payment term extension targets.',
        outputAr: 'أدلة تفاوض مدعومة بالأرقام وحجم الشراء السنوي',
        outputEn: 'Evidence-backed procurement bargaining packet'
      }
    ],
    integrations: [
      { name: 'SAP Ariba & Materials Management (MM)', type: 'Procurement API', statusAr: 'متوافق بالكامل', statusEn: 'Native Connector' },
      { name: 'Oracle Procurement Cloud', type: 'Sourcing API', statusAr: 'ربط مباشر', statusEn: 'REST OData' },
      { name: 'Customs & Port Logistics (FASAH)', type: 'Customs Feeds', statusAr: 'متابعة التخليص الجمركي', statusEn: 'Clearance Sync' },
      { name: 'Ministry of Commerce (Wathq API)', type: 'Commercial Verification', statusAr: 'تحقق من السجلات التجارية', statusEn: 'CR Verification' }
    ],
    simulationData: {
      tabTitleAr: 'بطاقة أداء الموردين ورادار الأسعار',
      tabTitleEn: 'Supplier Scorecard & Price Variance Demo',
      items: [
        {
          id: 'sim-sup-1',
          tag: 'CROSS_BRANCH_DISPARITY',
          severity: 'critical',
          titleAr: 'تفاوت في سعر توريد كابلات الجهد العالي بين فرعي الرياض وجدة',
          titleEn: 'Price Variance on High-Voltage Cables: +32% in Jeddah',
          detailAr: 'المورد (شركة الشرق للكابلات) يبيع نفس الصنف لفرع الرياض بـ 120 ريال للمتر، ولفرع جدة بـ 158 ريال للمتر.',
          detailEn: 'Orient Cables charges 120 SAR/meter in Riyadh vs 158 SAR/meter in Jeddah for identical SKU #CBL-990.',
          amount: 'وفر متاح: 190,000 ر.س',
          sourceSystem: 'SAP_MM // CROSS_PO_BENCHMARK',
          timestamp: 'منذ 3 ساعات',
          auditEvidenceAr: 'تحليل مقارن لأمرين شراء معتمدين #PO-9021 و #PO-8412 صادرين خلال نفس الشهر',
          auditEvidenceEn: 'Comparative audit of issued POs #PO-9021 and #PO-8412 in same billing cycle'
        },
        {
          id: 'sim-sup-2',
          tag: 'RELIABILITY_DROP',
          severity: 'warning',
          titleAr: 'تراجع مؤشر التزام شركة (المسار لنقل البتروكيماويات) إلى 64%',
          titleEn: 'Fulfillment Compliance Dropped to 64% for Al-Masar Transport',
          detailAr: 'سجل المورد تأخر 7 شحنات متتالية عن الموعد المحدد بمتوسط 6 أيام، مع ارتفاع نسبة الإرجاع إلى 4.2% بسبب تلف الصمامات.',
          detailEn: 'Vendor recorded 7 consecutive delayed consignments (avg 6 days late) with 4.2% damage rejection rate.',
          amount: 'مخاطر تأخير تشغيلي',
          sourceSystem: 'WMS_RECEIVING // OTIF_ENGINE',
          timestamp: 'منذ يوم',
          auditEvidenceAr: 'سندات الاستلام في مستودعات الدمام تشير إلى خرق البند 6 من اتفاقية مستوى الخدمة SLA',
          auditEvidenceEn: 'Warehouse receiving dockets prove SLA Clause 6 breach — Alerted procurement head'
        },
        {
          id: 'sim-sup-3',
          tag: 'SINGLE_SOURCE_RISK',
          severity: 'warning',
          titleAr: 'تركز مشتريات المواد العازلة بنسبة 91% لدى مورد وحيد',
          titleEn: 'Insulation Procurement Concentration: 91% on Single Vendor',
          detailAr: 'إجمالي المشتريات من هذا المورد تجاوز 4.2 مليون ريال هذا العام دون وجود مورد بديل مؤهل في حال تعثره.',
          detailEn: 'Annual spend crossed 4.2M SAR with zero pre-qualified backup suppliers if production is disrupted.',
          amount: 'مخاطر استمرارية أعمال',
          sourceSystem: 'VENDOR_ANALYZER // DEPENDENCY_GRAPH',
          timestamp: 'منذ يومين',
          auditEvidenceAr: 'مؤشر هيرفندال للتركز HHI = 0.83 - توصية بتأهيل موردين محليين إضافيين معتمدين من هيئة المواصفات',
          auditEvidenceEn: 'HHI Concentration Index = 0.83 — Recommending secondary vendor qualification'
        }
      ]
    },
    caseStudy: {
      clientTypeAr: 'مجموعة تجارية وصناعية كبرى في قطاع البناء',
      clientTypeEn: 'Major Building Materials & Manufacturing Conglomerate',
      industryAr: 'التصنيع وتجارة الجملة (الرياض، جدة، الخبر)',
      industryEn: 'Heavy Manufacturing & Wholesale (Riyadh, Jeddah, Khobar)',
      scenarioAr: 'كانت 6 شركات تابعة تشتري ما يفوق 180 مليون ريال سنوياً من المواد الأولية عبر فرق مشتريات منفصلة دون أي تنسيق أو مقارنة أسعار.',
      scenarioEn: '6 subsidiary companies procuring over 180M SAR in raw materials through separate teams with zero cross-pricing visibility.',
      verifiedResultAr: 'كشفت المنظومة عن تباينات أسعار وفرت 11.4 مليون ريال عند توحيد العقود، مع خفض زمن تأخر الشحنات بنسبة 45%.',
      verifiedResultEn: 'Identified cross-entity variances saving 11.4M SAR upon master contract renegotiation, while reducing transit delay by 45%.',
      quoteAr: 'كنا نشتري نفس البضاعة بفوارق شاسعة تصب في صالح الموردين. منظومة مخلافي لابس أعادت لنا قوة التفاوض بالكامل.',
      quoteEn: 'We were purchasing identical supplies at arbitrary price differences. Mikhlafi Labs completely restored our procurement negotiation muscle.',
      metrics: [
        { labelAr: 'إجمالي الوفر المحقق', labelEn: 'Procurement Savings', val: '11.4M ر.س' },
        { labelAr: 'انخفاض تباين الأسعار', labelEn: 'Price Variance Reduction', val: '-92%' },
        { labelAr: 'تحسن الالتزام بالمواعيد', labelEn: 'On-Time Fulfillment Rate', val: '+38%' }
      ]
    },
    faqs: [
      {
        qAr: 'كيف تقارن المنظومة أسعار السلع إذا كانت أسماء الأصناف مختلفة في الفواتير؟',
        qEn: 'How does the platform compare SKU prices if invoice descriptions differ?',
        aAr: 'تستخدم المنظومة خوارزميات توحيد متقدمة ومطابقة دلالية (Semantic Normalization) تربط السلع بناءً على المواصفات الفنية، والباركود، والأرقام التسلسلية حتى لو اختلفت صياغة الاسم.',
        aEn: 'Using deterministic semantic normalization that maps items by technical specifications, units of measure, and part codes regardless of naming discrepancies.'
      },
      {
        qAr: 'هل يمكن للمنظومة التنبؤ بتأخر الشحنات القادمة من خارج المملكة؟',
        qEn: 'Can the platform forecast delays on international imports?',
        aAr: 'نعم، من خلال دمج سجلات الموانئ السعودية وأزمنة التخليص الجمركي التاريخية، وتنبيه فرق الشراء بأي اختناقات محتملة مسبقاً.',
        aEn: 'Yes, factoring port dwell times and historical customs clearance velocity to adjust reorder points proactively.'
      },
      {
        qAr: 'هل تتدخل المنظومة في اختيار الموردين أم تقدم توصيات للجنة المشتريات؟',
        qEn: 'Does the system dictate vendor selection or advise the procurement board?',
        aAr: 'المنظومة تقدم تحليلاً رقمياً وبطاقة أداء محايدة ومثبتة بالأدلة، وتترك القرار النهائي والتفاوض للجان المشتريات المختصة.',
        aEn: 'It provides an objective, evidence-based scorecard to empower your procurement committee during negotiations.'
      },
      {
        qAr: 'هل تدعم المنظومة التحقق من السجلات التجارية والرقم الضريبي للموردين؟',
        qEn: 'Does it verify supplier commercial registrations and VAT validity in KSA?',
        aAr: 'نعم، تتكامل المنظومة للتحقق التلقائي من نظامية السجل التجاري، والحالة الضريبية لهيئة الزكاة والضريبة والجمارك (ZATCA) لمنع التعامل مع منشآت غير نظامية.',
        aEn: 'Yes, automatically verifying active Commercial Registration status and ZATCA VAT compliance to prevent dealing with unverified entities.'
      }
    ]
  },

  // ── Engine 06: Customer Retention ───────────────────────────────────────────
  {
    id: 'customer-retention',
    slug: 'customer-retention',
    engineNumber: '06',
    iconName: 'users',
    accentColor: '#EC4899',
    glowColor: 'rgba(236, 72, 153, 0.25)',
    badgeAr: 'حماية الإيرادات والاحتفاظ',
    badgeEn: 'CUSTOMER RETENTION RADAR',
    titleAr: 'مراقبة العملاء ومكافحة الفقدان الصامت',
    titleEn: 'Customer Health & Silent Churn Prevention',
    taglineAr: 'رصد تراجع حجم التعاملات وتأخر التجديدات قبل فوات الأوان على أساس البيانات المالية',
    taglineEn: 'Detect declining purchase frequency and renewal hazards from verified transaction telemetry',
    heroDescriptionAr:
      'رادار متطور لمراقبة صحة العلاقات مع كبار العملاء في قطاع الأعمال (B2B). لا يعتمد على استطلاعات الرأي النظرية، بل يحلل السجلات المالية الحقيقية: وتيرة الطلبات، حجم الفواتير، سرعة السداد، وتراكم الشكاوى لرصد إشارات الانسحاب الصامت قبل أن يخسر العميل.',
    heroDescriptionEn:
      'Enterprise B2B customer health telemetry grounded in empirical transaction data rather than subjective surveys. Analyzes order frequency decay, invoice contraction, and payment frictions to intercept silent churn before contract non-renewal.',
    heroMetrics: [
      {
        val: '-42%',
        labelAr: 'انخفاض في نسبة فقدان كبار العملاء',
        labelEn: 'Reduction in Major Client Churn',
        noteAr: 'بفضل التدخل الاستباقي قبل انتهاء العقد',
        noteEn: 'Via proactive intervention months prior to expiry'
      },
      {
        val: '60 - 90 يوماً',
        labelAr: 'مهلة التنبيه قبل فقدان العميل',
        labelEn: 'Early Churn Warning Window',
        noteAr: 'فترة كافية لإعادة تنشيط الحساب',
        noteEn: 'Ample runway for executive account remediation'
      },
      {
        val: '+22.4%',
        labelAr: 'زيادة في معدل تجديد العقود السنوية',
        labelEn: 'Contract Renewal Growth Rate',
        noteAr: 'معالجة مبكرة لنقاط الاحتكاك التشغيلية',
        noteEn: 'Resolving delivery frictions before contract talks'
      }
    ],
    executiveSummaryAr:
      'في معظم الشركات الكبرى، لا يغادر العميل فجأة بل ينسحب تدريجياً وبصمت: يقلل حجم طلبياته الشهرية، يوزع طلباته على منافسين، وتتأخر فترات سداده. يكشف هذا المحرك تلك الإشارات الصامتة في بدايتها ويمكن فريق المبيعات والإدارة من استعادة ثقة العميل قبل فوات الأوان.',
    executiveSummaryEn:
      'Major enterprise clients rarely churn overnight; they decay silently by paring back order sizes and splitting volume with competitors. MIKHLAFI LABS surfaces these subtle purchasing decelerations early, enabling retention plays that protect top-line revenue.',
    painPoints: [
      {
        num: '01',
        titleAr: 'الانسحاب الصامت وتراجع حجم الطلبات تدريجياً',
        titleEn: 'Silent Order Contraction & Competitor Volume Leak',
        currentFailureAr: 'تراجع قيمة مشتريات عميل رئيسي من 500,000 ريال شهرياً إلى 180,000 ريال دون أن ينتبه فريق المبيعات إلا عند نهاية السنة.',
        currentFailureEn: 'Key client ordering volume shrinking from 500k to 180k SAR/mo unnoticed by commercial teams until year-end review.',
        mikhlafiSolutionAr: 'مراقبة حتمية لوتيرة الطلبات (Order Velocity) تنبه فور انخفاض مشتريات العميل بنسبة 15% مقارنة بمتوسطه التاريخي.',
        mikhlafiSolutionEn: 'Deterministic order velocity tracking alerting account leads the moment spend dips 15% below historical baseline.',
        impactAr: 'حماية ملايين الريالات من الإيرادات السنوية المتكررة',
        impactEn: 'Protects millions in recurring enterprise contract revenue'
      },
      {
        num: '02',
        titleAr: 'مفاجآت عدم تجديد العقود السنوية',
        titleEn: 'Contract Non-Renewal Shocks at Expiry Dates',
        currentFailureAr: 'توقع تجديد عقد العميل السنوي تلقائياً، ليتفاجأ الفريق باختيار العميل لمنافس آخر بسبب مشاكل تشغيلية لم تصعد للإدارة.',
        currentFailureEn: 'Expecting auto-renewal only to receive non-renewal termination letters due to unescalated operational frustrations.',
        mikhlafiSolutionAr: 'بطاقة صحة العميل (Customer Health Index) التي تجمع بيانات الفواتير ومشاكل التوصيل والتأخير لتحديد الحسابات المعرضة للخطر قبل 90 يوماً.',
        mikhlafiSolutionEn: 'Customer Health Index synthesizing delivery frictions, billing disputes, and aging debt to flag at-risk renewals 90 days early.',
        impactAr: 'رفع نسبة التجديد والاحتفاظ بالعقود إلى 94%',
        impactEn: 'Elevates annual contract retention rates to 94%'
      },
      {
        num: '03',
        titleAr: 'تراكم النزاعات حول الفواتير وتأخر السداد',
        titleEn: 'Billing Friction & Protracted Payment Disputes',
        currentFailureAr: 'اعتراض العميل على بنود الفواتير أو تأخره في السداد، وهو ما يكون غالباً مؤشراً على عدم رضاه عن جودة الخدمة.',
        currentFailureEn: 'Clients withholding payment over minor invoice disputes, signaling deeper dissatisfaction with service levels.',
        mikhlafiSolutionAr: 'ربط مباشر بين كشوف التحصيل وتذاكر الدعم والعمليات لمعالجة أسباب النزاع الفنية قبل أن تتطور إلى خسارة العميل.',
        mikhlafiSolutionEn: 'Unified bridge connecting receivables aging with support SLAs to address technical friction before relationship collapse.',
        impactAr: 'تسريع التحصيل وحماية العلاقة التجارية الاستراتيجية',
        impactEn: 'Accelerates cash collections while preserving client goodwill'
      }
    ],
    methodologySteps: [
      {
        step: '01',
        titleAr: 'تتبع السجلات المالية والتكرارية',
        titleEn: 'Financial Transaction & Velocity Ingestion',
        techDetailAr: 'قراءة دورية لبيانات الفواتير، أوامر الشراء الصادرة من العميل، تواريخ التسليم، وسجلات السداد البنكي.',
        techDetailEn: 'Continuous ingestion of issued invoices, customer purchase orders, delivery sign-offs, and bank payment receipts.',
        outputAr: 'خط زمني حقيقي لمعاملات العميل المالية',
        outputEn: 'Empirical customer commercial timeline'
      },
      {
        step: '02',
        titleAr: 'حساب مؤشر صحة العميل (Health Index)',
        titleEn: 'Multivariate Customer Health Scoring',
        techDetailAr: 'نموذج رياضي يحسب درجة صحة العميل (من 0 إلى 100) بناءً على: وتيرة الطلب، نمو الإيراد، سرعة السداد، وخلو المعاملات من النزاعات.',
        techDetailEn: 'Deterministic model computing composite score across order frequency, revenue trajectory, DSO aging, and ticket escalations.',
        outputAr: 'تصنيف حتمي للعملاء المعرضين لخطر الفقدان',
        outputEn: 'Ranked at-risk account watch-list'
      },
      {
        step: '03',
        titleAr: 'توليد إنذار الانسحاب الصامت وتحديد السبب',
        titleEn: 'Silent Decay Alert & Root Cause Mapping',
        techDetailAr: 'إصدار تنبيه مسبق يوضح للقيادة التجارية: تراجع الطلب في أي فرع أو صنف، والمبرر المالي المحتمل، والأثر السنوي المتوقع.',
        techDetailEn: 'Generating alerts specifying exact line-item volume drops, branch locations, and estimated annual ARR at risk.',
        outputAr: 'بطاقة إنذار موجهة لمدير الحسابات والإدارة',
        outputEn: 'Account executive intervention brief'
      },
      {
        step: '04',
        titleAr: 'توجيهات الاستبقاء وإعادة التنشيط',
        titleEn: 'Prescriptive Retention Playbook Execution',
        techDetailAr: 'اقتراح إجراءات ملموسة: زيارة تنفيذية من الإدارة العليا، تقديم تسعيرة خاصة للبنود المتراجعة، أو حل عائق لوجستي محدد.',
        techDetailEn: 'Recommending targeted intervention plays: executive sponsor check-in, tiered volume incentive, or resolving specific delivery SLAs.',
        outputAr: 'خطة استبقاء ناجحة مدعومة بالبيانات',
        outputEn: 'Actionable account recovery plan'
      }
    ],
    integrations: [
      { name: 'Salesforce & Microsoft Dynamics CRM', type: 'CRM Integration', statusAr: 'متوافق بالكامل', statusEn: 'Certified Sync' },
      { name: 'SAP SD (Sales & Distribution)', type: 'Order Telemetry', statusAr: 'سحب بيانات الفواتير', statusEn: 'Invoice Feed' },
      { name: 'Zendesk / Jira Service Desk', type: 'Customer Support SLA', statusAr: 'متابعة الشكاوى والنزاعات', statusEn: 'Ticket Sync' },
      { name: 'Corporate Billing / ZATCA Feed', type: 'Revenue Ingestion', statusAr: 'تتبع حركة الإيرادات', statusEn: 'Revenue Stream' }
    ],
    simulationData: {
      tabTitleAr: 'رادار صحة العملاء ومؤشرات الانسحاب الصامت',
      tabTitleEn: 'Customer Health & Silent Churn Telemetry Demo',
      items: [
        {
          id: 'sim-cus-1',
          tag: 'CHURN_SIGNAL',
          severity: 'critical',
          titleAr: 'تراجع وتيرة مشتريات شركة (المباني المتحدة) بنسبة 46%',
          titleEn: 'Al-Mabani United Order Velocity Dropped by 46%',
          detailAr: 'انخفضت طلبيات العميل من 420,000 ريال شهرياً إلى 225,000 ريال في آخر 60 يوماً مع تحويل طلبيات صنف الخرسانة إلى مورد منافس.',
          detailEn: 'Monthly spend dropped from 420k to 225k SAR over last 60 days, with concrete orders shifting to local competitor.',
          amount: 'إيراد معرض للخطر: 2.8M ر.س/سنة',
          sourceSystem: 'SAP_SD // ORDER_VELOCITY_DECAY',
          timestamp: 'مهلة التدخل: 15 يوماً',
          auditEvidenceAr: 'تحليل مقارن للفواتير الربع سنوية يثبت تراجع تكرار الطلب من 8 طلبيات شهرياً إلى طلبين فقط',
          auditEvidenceEn: 'Quarterly billing telemetry proves order frequency collapsed from 8 orders/mo to 2 orders/mo'
        },
        {
          id: 'sim-cus-2',
          tag: 'RENEWAL_HAZARD',
          severity: 'warning',
          titleAr: 'خطر عدم تجديد عقد توريد سنوي بقيمة 1.4M ريال مع مستشفى السلام',
          titleEn: '1.4M SAR Al-Salam Hospital Contract Renewal at Risk',
          detailAr: 'ينتهي العقد بعد 75 يوماً، وتم رصد 3 نزاعات فواتير معلقة لدى المالية وتأخر تسليم شحنتين الشهر الماضي.',
          detailEn: 'Contract expires in 75 days. Radar identified 3 unresolved invoice disputes and 2 delayed shipments last month.',
          amount: 'قيمة العقد: 1,400,000 ر.س',
          sourceSystem: 'CRM_DYNAMICS // CONTRACT_EXPIRY',
          timestamp: 'منذ يوم',
          auditEvidenceAr: 'مؤشر رضا العميل التشغيلي هبط إلى 58/100 - التوصية: زيارة تنفيذية لتسوية الفواتير المعلقة فوراً',
          auditEvidenceEn: 'Operational health score dropped to 58/100 — Recommended executive sponsor meeting to resolve credit dispute'
        },
        {
          id: 'sim-cus-3',
          tag: 'PAYMENT_FRICTION',
          severity: 'warning',
          titleAr: 'ارتفاع فترة سداد شركة (الرؤية للصناعة) من 35 إلى 82 يوماً',
          titleEn: 'Al-Roya Industrial DSO Stretched from 35 to 82 Days',
          detailAr: 'تأخر العميل في سداد مستحقات بقيمة 610,000 ريال، مع تراجع في التواصل مع فريق التحصيل.',
          detailEn: 'Client stretching 610,000 SAR payables to 82 days while reducing communications with account reps.',
          amount: '610,000 ر.س مستحقات متأخرة',
          sourceSystem: 'FINANCE_AR // AGING_DRIFT',
          timestamp: 'منذ يومين',
          auditEvidenceAr: 'نمط السداد التاريخي كان ممتازاً (أقل من 30 يوماً) - التغير المفاجئ يستدعي مراجعة الملاءة المالية',
          auditEvidenceEn: 'Historical settlement was pristine (< 30 days) — Sudden degradation warrants credit review'
        }
      ]
    },
    caseStudy: {
      clientTypeAr: 'شركة كبرى لخدمات تكنولوجيا المعلومات والتوريدات المؤسسية',
      clientTypeEn: 'Enterprise IT Solutions & Technology Distribution Provider',
      industryAr: 'خدمات الشركات والاتصالات (الرياض)',
      industryEn: 'B2B Enterprise Technology & Telecommunications (Riyadh)',
      scenarioAr: 'كانت الشركة تخسر سنوياً ما بين 8% إلى 12% من عملائها الكبار دون معرفة الأسباب إلا بعد توقيعهم مع شركات منافسة.',
      scenarioEn: 'Losing 8% to 12% of high-value enterprise accounts annually with zero visibility until accounts were already lost.',
      verifiedResultAr: 'كشفت المنظومة 18 عميلاً يمرون بمرحلة الانسحاب الصامت، ونجح التدخل المبكر في استبقاء 15 منهم وتأمين 22 مليون ريال من الإيرادات السنوية.',
      verifiedResultEn: 'Flagged 18 major accounts in early decay stage; proactive executive remediation retained 15, protecting 22M SAR in ARR.',
      quoteAr: 'المنظومة نبهتنا لعملاء كنا نظن أنهم راضون تماماً، لنكتشف أنهم كانوا يقللون طلبياتهم تدريجياً. هذا التنبيه أنقذ إيراداتنا.',
      quoteEn: 'Mikhlafi Labs alerted us to accounts we assumed were thriving, only to discover declining volumes. It literally saved our top-line revenue.',
      metrics: [
        { labelAr: 'إيرادات تم حمايتها', labelEn: 'Retained ARR', val: '22M ر.س' },
        { labelAr: 'معدل نجاح الاستبقاء', labelEn: 'Retention Success Rate', val: '83.3%' },
        { labelAr: 'متوسط مهلة الإنذار', labelEn: 'Warning Window', val: '72 يوماً' }
      ]
    },
    faqs: [
      {
        qAr: 'كيف يختلف هذا المحرك عن برامج CRM المعتادة مثل Salesforce؟',
        qEn: 'How does this differ from traditional CRM systems like Salesforce?',
        aAr: 'برامج CRM تعتمد على ما يدخله موظف المبيعات يدوياً (والذي غالباً ما يكون غير مكتمل أو متفائلاً بشكل مفرط). محركنا يحلل البيانات المالية والبنكية الحقيقية وحجم الفواتير الفعلي ليكشف الحقائق المجردة.',
        aEn: 'CRMs depend on subjective sales rep input. MIKHLAFI LABS derives health scores strictly from empirical bank receipts, invoice velocity, and ledger transactions.'
      },
      {
        qAr: 'هل يمكن تطبيق هذا المحرك على شركات B2B و B2G (القطاع الحكومي والشركات)؟',
        qEn: 'Is this effective for both B2B and B2G enterprise relationships?',
        aAr: 'نعم، تم تصميمه خصيصاً للتعامل مع عقود الشركات والجهات الحكومية الكبرى التي تمتاز بدورات دفع طويلة وعقود سنوية متجددة.',
        aEn: 'Tailor-engineered for B2B and B2G conglomerates where contract sizes are substantial and renewal cycles require months of preparation.'
      },
      {
        qAr: 'هل يحتاج المحرك استطلاعات رأي أو تقييمات من العملاء؟',
        qEn: 'Does the engine require customer satisfaction surveys or questionnaires?',
        aAr: 'إطلاقاً. نرى أن استطلاعات الرأي غالباً ما تكون مضللة. المحرك يعتمد على السلوك المالي الحقيقي: هل العميل يدفع ويطلب كالمعتاد أم بدأ ينسحب؟',
        aEn: 'Zero surveys required. We measure pure behavioral economics: transactional frequency, line item volumes, and settlement velocity.'
      },
      {
        qAr: 'كم يستغرق ربط المحرك مع أنظمتنا؟',
        qEn: 'How long does integration take?',
        aAr: 'يمكن البدء فوراً بتحميل سجل المبيعات والفواتير (Excel/CSV)، أو الربط المباشر مع نظام ERP خلال 3 إلى 4 أيام عمل.',
        aEn: 'Get started instantly via encrypted invoice export uploads, or complete live ERP API integration within 3-4 business days.'
      }
    ]
  },

  // ── Engine 07: Evidence-Grounded AI Assistant ───────────────────────────────
  {
    id: 'executive-assistant',
    slug: 'executive-assistant',
    engineNumber: '07',
    iconName: 'bot',
    accentColor: '#6366F1',
    glowColor: 'rgba(99, 102, 241, 0.25)',
    badgeAr: 'ذكاء مدعوم بالأدلة',
    badgeEn: 'EVIDENCE-GROUNDED AI',
    titleAr: 'المساعد التنفيذي المؤسسي المستند للأدلة',
    titleEn: 'Evidence-Grounded AI Executive Assistant',
    taglineAr: 'إجابات فورية واستفسارات مالية وتشغيلية باللغة الطبيعية مستندة حصراً إلى دفاتر المؤسسة وبلا هلوسة',
    taglineEn: 'Natural-language queries over enterprise ledgers with cryptographic source citations and zero hallucination',
    heroDescriptionAr:
      'مساعد ذكاء اصطناعي سيادي مصمم خصيصاً للرؤساء التنفيذيين والمدراء الماليين. يجيب فورياً على أدق الأسئلة المالية والتشغيلية باللغة العربية والإنجليزية، مع ربط كل إجابة بالسجل المحاسبي ورقم الفاتورة واسم المورد دون أي افتراضات أو تخمينات.',
    heroDescriptionEn:
      'Sovereign executive intelligence assistant built strictly for C-level leadership. Answers complex operational and financial queries in Arabic and English, anchoring every metric to verifiable ledger IDs, invoice vouchers, and contract clauses.',
    heroMetrics: [
      {
        val: '100%',
        labelAr: 'إسناد للأدلة والسجلات المحاسبية',
        labelEn: 'Evidence-Grounded Source Citations',
        noteAr: 'كل رقم مصحوب برقم السجل والقيد المحاسبي',
        noteEn: 'Every metric linked directly to original voucher ID'
      },
      {
        val: '0.00%',
        labelAr: 'نسبة الهلوسة أو الإجابات التخمينية',
        labelEn: 'Zero Hallucination / Zero Speculation',
        noteAr: 'يعترف المساعد بعدم توفر البيان ولا يخترع أرقاماً',
        noteEn: 'Strict refusal fallback if ledger evidence is missing'
      },
      {
        val: '< 3 ثوانٍ',
        labelAr: 'سرعة الإجابة على الاستفسارات المعقدة',
        labelEn: 'Executive Query Response Latency',
        noteAr: 'تحليل فوري لملايين المعاملات والقيود',
        noteEn: 'Instant synthesis across millions of ledger entries'
      }
    ],
    executiveSummaryAr:
      'تحتاج الإدارة العليا في كثير من الأحيان لمعرفة أرقام دقيقة وفورية قبل الاجتماعات: كم دفعنا للمورد الفلاني؟ ما هو أكثر مشروع استنزف السيولة هذا الشهر؟ ولماذا ارتفعت مصاريف الصيانة؟ يمنحك المساعد إجابة فورية ودقيقة وموثقة بالسجلات خلال ثوانٍ بدلاً من انتظار أيام.',
    executiveSummaryEn:
      'Executives need instantaneous, dependable data before high-stakes meetings. The Executive Assistant parses natural language questions and interrogates millions of ledger records, providing audit-traceable summaries with direct links to source documents.',
    painPoints: [
      {
        num: '01',
        titleAr: 'انتظار أيام للحصول على تقارير مالية مخصصة',
        titleEn: 'Waiting Days for Ad-Hoc Management Reports',
        currentFailureAr: 'طلب الرئيس التنفيذي لمعلومة محددة من الإدارة المالية وانتظار 3 إلى 5 أيام لقيام المحللين بتجميعها يدوياً من عدة أنظمة.',
        currentFailureEn: 'C-suite requesting specific spend breakdowns and waiting 3 to 5 days while financial analysts manually assemble data.',
        mikhlafiSolutionAr: 'كتابة السؤال باللغة العربية الطبيعية والحصول على إجابة تحليلية فورية مع جداول ورسوم بيانية موثقة بروابط السجلات.',
        mikhlafiSolutionEn: 'Ask in plain Arabic or English; receive an instant executive dossier with charts and source record IDs in seconds.',
        impactAr: 'توفير مئات الساعات شهرياً من وقت المحللين والإدارة',
        impactEn: 'Saves hundreds of analyst hours while accelerating executive speed'
      },
      {
        num: '02',
        titleAr: 'مخاطر الهلوسة في نماذج الذكاء الاصطناعي العامة',
        titleEn: 'Hallucination Risks in Generic Commercial LLMs',
        currentFailureAr: 'استخدام نماذج عامة مثل ChatGPT قد يقدم أرقاماً تبدو مقنعة لكنها مختلقة تماماً ولا تستند إلى الحسابات الحقيقية للشركة.',
        currentFailureEn: 'Generic public LLMs hallucinating plausible-sounding but completely fabricated financial totals and dates.',
        mikhlafiSolutionAr: 'هندسة استرجاع حتمية صارمة (Deterministic RAG) تمنع النموذج من الإجابة إلا استناداً إلى سجلات ERP الموثقة.',
        mikhlafiSolutionEn: 'Deterministic RAG architecture strictly bounding model outputs to verified enterprise ledger records and vouchers.',
        impactAr: 'موثوقية مطلقة بنسبة 100% صالحة لاتخاذ قرارات حاسمة',
        impactEn: '100% audit-proof reliability suitable for high-stakes capital decisions'
      },
      {
        num: '03',
        titleAr: 'مخاوف تسريب البيانات المالية الحساسة',
        titleEn: 'Data Privacy & Security Leakage on Public Clouds',
        currentFailureAr: 'إرسال بيانات الشركة المالية إلى خوادم ذكاء اصطناعي خارجية في دول أخرى يخرق لوائح حماية البيانات والأمن السيبراني.',
        currentFailureEn: 'Transmitting proprietary corporate ledgers to offshore third-party AI models violates PDPL and NCA sovereign compliance.',
        mikhlafiSolutionAr: 'معالجة واستضافة سيادية محلية 100% داخل المملكة العربية السعودية مع عزل كامل لكل مؤسسة وتشفير متقدم.',
        mikhlafiSolutionEn: '100% in-kingdom sovereign hosting on certified Saudi infrastructure with air-gapped tenant isolation.',
        impactAr: 'امتثال تام لمعايير الأمن السيبراني الوطني (NCA) و (SDAIA)',
        impactEn: 'Full compliance with Saudi SDAIA and NCA cyber-security regulations'
      }
    ],
    methodologySteps: [
      {
        step: '01',
        titleAr: 'فهم وتفكيك السؤال التنفيذي باللغة الطبيعية',
        titleEn: 'Natural Language Semantic Parsing',
        techDetailAr: 'تحليل دلالي متقدم للمصطلحات المالية والإدارية الشائعة في بيئة الأعمال السعودية والخليجية (المستخلصات، أوامر الصرف، الضريبة).',
        techDetailEn: 'Advanced semantic parsing tuned for Arabic/English corporate finance terminology (retentions, LCs, ZATCA, POs).',
        outputAr: 'استعلام حسابي منظم ومحدد الشروط',
        outputEn: 'Structured deterministic query parameters'
      },
      {
        step: '02',
        titleAr: 'الاستعلام الحتمي المباشر في السجلات',
        titleEn: 'Direct Ledger & Evidence Retrieval',
        techDetailAr: 'تنفيذ استعلام دقيق وسريع في قواعد البيانات المفهرسة وسحب القيود وسندات الصرف وفواتير الموردين المطابقة للسؤال.',
        techDetailEn: 'Executing optimized vector and relational queries directly against normalized ERP ledger and contract databases.',
        outputAr: 'حزمة السجلات والأدلة المحاسبية المطابقة',
        outputEn: 'Cryptographic ledger evidence packet'
      },
      {
        step: '03',
        titleAr: 'الصياغة التحليلية والإسناد التوثيقي (Citations)',
        titleEn: 'Executive Synthesis with Clickable Ledger Citations',
        techDetailAr: 'صياغة إجابة تنفيذية موجزة ودقيقة مع إدراج روابط مرجعية قابلة للنقر لكل رقم مذكور (رقم الفاتورة، تاريخ القيد، المورد).',
        techDetailEn: 'Generating a concise executive summary embedding clickable citations pointing to original journal entries and vouchers.',
        outputAr: 'إجابة وافية وموثقة تدقيقياً بنسبة 100%',
        outputEn: 'Audit-traceable executive response'
      },
      {
        step: '04',
        titleAr: 'اقتراح الخطوة التنفيذية اللاحقة',
        titleEn: 'Prescriptive Action Recommendation',
        techDetailAr: 'ربط الإجابة بالإجراء المناسب: هل ترغب في إيقاف صرف الفاتورة؟ هل ترغب في تصدير التقرير؟ هل ترغب في إشعار المدير المالي؟',
        techDetailEn: 'Pairing the factual answer with instant operational actions: hold voucher, export audit PDF, or assign task to CFO.',
        outputAr: 'إجراء فوري بنقرة واحدة داخل المنظومة',
        outputEn: 'One-click executable directive trigger'
      }
    ],
    integrations: [
      { name: 'Sovereign Arabic LLM Engine', type: 'Local KSA Deployment', statusAr: 'استضافة سيادية داخل المملكة', statusEn: 'Sovereign KSA AI' },
      { name: 'Enterprise ERP Connectors (SAP/Oracle)', type: 'Read-Only Ledger Sync', statusAr: 'استعلام مباشر ومحدث', statusEn: 'Live Ledger Index' },
      { name: 'Executive WhatsApp & Teams Bot', type: 'Secure Corporate Channel', statusAr: 'استفسارات فورية عبر الجوال', statusEn: 'Secure Mobile Bot' },
      { name: 'Role-Based Access Control (RBAC)', type: 'Strict Data Partitioning', statusAr: 'حماية سرية البيانات حسب الصلاحيات', statusEn: 'Permission-Gated' }
    ],
    simulationData: {
      tabTitleAr: 'تجربة حية للمساعد التنفيذي المؤسسي',
      tabTitleEn: 'Interactive AI Assistant Query Demo',
      items: [
        {
          id: 'sim-ai-1',
          tag: 'EXECUTIVE_QUERY',
          severity: 'optimal',
          titleAr: 'سؤال: ما هي أعلى 3 بنود مصاريف ارتفعت هذا الربع مقارنة بالربع السابق؟',
          titleEn: 'Query: What are our top 3 expense increases this quarter vs last?',
          detailAr: 'الإجابة: بناءً على قيود دفتر الأستاذ العام، تركز الارتفاع في: 1) شحن وتخليص ميناء جدة (+34% - قيد #8812) 2) محروقات الآليات الثقيلة (+22% - قيد #7991) 3) استشارات قانونية خارجية (+19% - قيد #8410).',
          detailEn: 'Answer: General ledger reveals: 1) Jeddah port freight (+34% // JRN-8812) 2) Heavy plant diesel (+22% // JRN-7991) 3) External legal fees (+19% // JRN-8410).',
          amount: 'إجمالي الزيادة: 890,000 ر.س',
          sourceSystem: 'GENERAL_LEDGER // EXPENSE_VARIANCE',
          timestamp: 'زمن المعالجة: 1.4 ثانية',
          auditEvidenceAr: 'تم فحص 14,280 قيد محاسبي معتمد للفترة من 1 يناير إلى 31 مارس 2026',
          auditEvidenceEn: 'Computed across 14,280 verified journal entries between Jan 1 and Mar 31, 2026'
        },
        {
          id: 'sim-ai-2',
          tag: 'CONTRACT_QUERY',
          severity: 'optimal',
          titleAr: 'سؤال: كم يتبقى لنا من ميزانية مشروع تطوير الواجهة البحرية بالخبر؟',
          titleEn: 'Query: What is the remaining budget on the Khobar Waterfront project?',
          detailAr: 'الإجابة: الميزانية المعتمدة 45,000,000 ريال. المنصرف الفعلي حتى اليوم 31,240,000 ريال (69.4%). المتبقي: 13,760,000 ريال. توجد مطالبات معلقة بقيمة 1,850,000 ريال قيد التدقيق الهندسي.',
          detailEn: 'Answer: Approved budget: 45M SAR. Disbursed actuals: 31.24M SAR (69.4%). Remaining: 13.76M SAR with 1.85M pending claims.',
          amount: 'المتبقي: 13,760,000 ر.س',
          sourceSystem: 'SAP_PS // CONTRACT_BUDGET',
          timestamp: 'زمن المعالجة: 1.1 ثانية',
          auditEvidenceAr: 'العقد رقم CON-KHB-2025 وشهادة الدفع رقم #IPC-09 المعتمدة بتاريخ 4 أبريل',
          auditEvidenceEn: 'Contract CON-KHB-2025 and Interim Payment Certificate IPC-09 approved April 4'
        },
        {
          id: 'sim-ai-3',
          tag: 'SUPPLIER_AUDIT_QUERY',
          severity: 'warning',
          titleAr: 'سؤال: هل لدينا أي فواتير معلقة لموردين تجاوزت فترة سدادها 60 يوماً؟',
          titleEn: 'Query: Do we have pending supplier invoices aged over 60 days?',
          detailAr: 'الإجابة: نعم، توجد 4 فواتير بإجمالي 385,000 ريال تجاوزت 60 يوماً. أكبر فاتورة بقيمة 210,000 ريال لصالح (شركة الشرق للخرسانة) وموقوفة بسبب خلاف على محضر الاستلام.',
          detailEn: 'Answer: Yes, 4 invoices totaling 385k SAR exceed 60 days. Largest is 210k SAR to Eastern Concrete, held due to site inspection dispute.',
          amount: 'المعلق: 385,000 ر.س',
          sourceSystem: 'AP_LEDGER // AGING_ANALYSIS',
          timestamp: 'زمن المعالجة: 0.9 ثانية',
          auditEvidenceAr: 'الفاتورة رقم INV-40912 - تم إيقاف أمر الصرف بطلب من مدير المشروع بموجب المذكرة MEM-22',
          auditEvidenceEn: 'Invoice INV-40912 — Disbursement hold requested by project manager via memo MEM-22'
        }
      ]
    },
    caseStudy: {
      clientTypeAr: 'مكتب إدارة استثمارات عائلية وشركة قابضة',
      clientTypeEn: 'Family Investment Office & Multi-Asset Holding Group',
      industryAr: 'الاستثمار المالي والعقاري (الرياض وجدة)',
      industryEn: 'Asset Management & Private Equity (Riyadh & Jeddah)',
      scenarioAr: 'كان رئيس مجلس الإدارة يعاني من بطء الحصول على الأرقام الحقيقية أثناء اجتماعات الاستثمار ومفاوضات الشراء، مما يسبب تفويت فرص أو تأخر القرارات.',
      scenarioEn: 'Chairman faced recurring bottlenecks accessing verified financial metrics during fast-paced acquisition negotiations.',
      verifiedResultAr: 'أصبح رئيس مجلس الإدارة والمدراء التنفيذيون يحصلون على إجابات موثقة خلال ثوانٍ عبر الجوال، مع تقليص وقت إعداد التقارير بنسبة 85%.',
      verifiedResultEn: 'Leadership now accesses audit-verified answers in seconds via secure mobile channels, slashing report preparation overhead by 85%.',
      quoteAr: 'المساعد التنفيذي وفر عليّ ساعات من التخمين والمكالمات. أسأل بالعامية أو الفصحى وأحصل على الرقم الدقيق مع رقم السجل المحاسبي.',
      quoteEn: 'The Executive Assistant removed all friction between my questions and the exact accounting books. Pure clarity with zero waiting.',
      metrics: [
        { labelAr: 'سرعة الحصول على المعلومة', labelEn: 'Information Access Speed', val: 'فوري (< 3s)' },
        { labelAr: 'تقليص وقت إعداد التقارير', labelEn: 'Report Prep Reduction', val: '-85%' },
        { labelAr: 'دقة الاستشهاد بالسجلات', labelEn: 'Ledger Citation Precision', val: '100%' }
      ]
    },
    faqs: [
      {
        qAr: 'كيف نضمن أن المساعد لا يهلوس أو يخترع أرقاماً غير صحيحة؟',
        qEn: 'How do you guarantee the assistant will not hallucinate false figures?',
        aAr: 'تم بناء المساعد بمعمارية صارمة (Strict Evidence Retrieval): لا يقوم بتخمين الأرقام إطلاقاً، بل يستخرجها حسابياً من قاعدة البيانات، وإذا لم تكن المعلومة موجودة في السجلات، يذكر ذلك صراحة دون أي تزييف.',
        aEn: 'Our deterministic architecture strictly binds the LLM to verified database records. If evidence does not exist in the ledger, it explicitly states so.'
      },
      {
        qAr: 'هل يمكن للمساعد قراءة المستندات الممسوحة ضوئياً وفواتير PDF؟',
        qEn: 'Can the assistant process scanned paper vouchers and PDF invoices?',
        aAr: 'نعم، تدعم المنظومة تقنيات التعرف البصري المتقدم على الحروف (OCR) للفواتير العربية والإنجليزية واستخراج أرقام القيود والضرائب والبنود بدقة متناهية.',
        aEn: 'Yes, enterprise OCR extracts Arabic and English text from scanned invoices, vouchers, and contracts with high fidelity.'
      },
      {
        qAr: 'هل يستطيع أي موظف الاطلاع على كافة البيانات المالية؟',
        qEn: 'Can any employee view confidential executive financial numbers?',
        aAr: 'كلا، المنظومة تطبق نظام صلاحيات صارم (Role-Based Access Control). كل مستخدم يحصل فقط على إجابات في نطاق صلاحياته المعتمدة (مثلاً مدير المشروع يرى مشروعه فقط، بينما المدير المالي يرى الكل).',
        aEn: 'Strict RBAC partitioning ensures users can only query data within their authorized organizational scope.'
      },
      {
        qAr: 'هل تخرج بياناتنا إلى خوادم أجنبية مثل OpenAI أو خوادم خارج المملكة؟',
        qEn: 'Does our data ever leave Saudi Arabia to foreign servers or OpenAI?',
        aAr: 'أبداً. نماذج الذكاء الاصطناعي تعمل بالكامل داخل السحابة السيادية المعتمدة في المملكة العربية السعودية، متوافقة 100% مع أنظمة الأمن السيبراني (NCA).',
        aEn: 'Never. Models and vector indices execute strictly on sovereign infrastructure inside Saudi Arabia, meeting all national data sovereignty requirements.'
      }
    ]
  },

  // ── Engine 08: Data Quality & Governance ────────────────────────────────────
  {
    id: 'data-quality-governance',
    slug: 'data-quality-governance',
    engineNumber: '08',
    iconName: 'database',
    accentColor: '#14B8A6',
    glowColor: 'rgba(20, 184, 166, 0.25)',
    badgeAr: 'حوكمة وامتثال البيانات',
    badgeEn: 'DATA GOVERNANCE & INTEGRITY',
    titleAr: 'ذكاء جودة وحوكمة البيانات المتعددة',
    titleEn: 'Data Quality & Multi-System Governance',
    taglineAr: 'تدقيق اكتمال القيود المحاسبية وكشف الحقول الشاغرة وضمان تطابق السجلات بين الأنظمة',
    taglineEn: 'Automated ledger completeness auditing, null field reconciliation, and multi-ERP consistency scoring',
    heroDescriptionAr:
      'محرك تدقيق وحوكمة يضمن سلامة وصحة البيانات في كافة أنظمة المؤسسة (ERP, CRM, WMS, ZATCA). يكشف القيود غير المتوازنة، الحقول الإلزامية الناقصة، والتباينات بين السجلات الفرعية ودفتر الأستاذ العام لضمان تقارير مالية خالية من الأخطاء وجاهزة للمراجعة القانونية.',
    heroDescriptionEn:
      'Automated data integrity guardian auditing transactions across disparate enterprise systems. Identifies unposted journal vouchers, missing tax identifiers, duplicate entity records, and reconciles sub-ledgers against the general ledger for seamless audit readiness.',
    heroMetrics: [
      {
        val: '99.9%',
        labelAr: 'دقة تطابق القيود المحاسبية',
        labelEn: 'Ledger Reconciliation Precision',
        noteAr: 'بين دفتر الأستاذ العام والأنظمة الفرعية',
        noteEn: 'Between General Ledger and operational sub-ledgers'
      },
      {
        val: '100% امتثال',
        labelAr: 'لمتطلبات هيئة الزكاة (ZATCA)',
        labelEn: 'ZATCA Phase 2 E-Invoice Compliance',
        noteAr: 'فحص الحقول الإلزامية والأرقام الضريبية',
        noteEn: 'Automated validation of mandatory tax attributes'
      },
      {
        val: '-90%',
        labelAr: 'تقليص وقت إقفال الحسابات الشهرية',
        labelEn: 'Monthly Ledger Close Time Reduction',
        noteAr: 'كشف الأخطاء لحظة إدخالها بدلاً من نهاية الشهر',
        noteEn: 'Real-time entry auditing instead of month-end scrambles'
      }
    ],
    executiveSummaryAr:
      'القرارات الذكية تتطلب بيانات نظيفة وموثوقة. تعاني معظم المؤسسات من قيود محاسبية ناقصة، أرقام ضريبية خاطئة، وسجلات موردين مكررة تؤدي لتعطيل الفوترة وإفساد التقارير التنفيذية. يقوم هذا المحرك بالحراسة المستمرة لجودة البيانات وتصحيح الاختلالات قبل تراكمها.',
    executiveSummaryEn:
      'Executive decisions are only as good as the underlying data. Missing fields, orphaned invoice headers, and mismatched VAT numbers disrupt operational flows and distort management reporting. MIKHLAFI LABS enforces strict multi-system data governance.',
    painPoints: [
      {
        num: '01',
        titleAr: 'تأخر الإقفال المالي الشهري بسبب القيود غير المتطابقة',
        titleEn: 'Month-End Close Delays from Reconciling Discrepancies',
        currentFailureAr: 'استغراق فريق المحاسبة أسبوعين كاملين في نهاية كل شهر للبحث عن أسباب عدم تطابق كشوف البنوك مع دفتر الأستاذ العام.',
        currentFailureEn: 'Accounting teams burning two weeks at every close hunting down discrepancies between sub-ledgers and bank statements.',
        mikhlafiSolutionAr: 'تسوية آلية يومية (Continuous Daily Reconciliation) تكتشف القيود المعلقة وغير المتطابقة فور وقوعها.',
        mikhlafiSolutionEn: 'Continuous daily reconciliation catching unposted vouchers and orphaned journal batches the moment they occur.',
        impactAr: 'إقفال الحسابات الشهرية في يومين فقط بدلاً من 14 يوماً',
        impactEn: 'Shrinks month-end close cycle from 14 days down to 2 days'
      },
      {
        num: '02',
        titleAr: 'غرامات ومخالفات هيئة الزكاة بسبب بيانات الفواتير الناقصة',
        titleEn: 'ZATCA Compliance Fines Due to Missing Invoice Attributes',
        currentFailureAr: 'إصدار فواتير ضريبية تفتقر للرقم الضريبي الصحيح أو الرمز التعريفي المشفر (UUID) مما يعرض الشركة لغرامات نظامية.',
        currentFailureEn: 'Issuing e-invoices with invalid buyer tax IDs or broken cryptographic stamps, exposing firms to regulatory penalties.',
        mikhlafiSolutionAr: 'فحص استباقي لقواعد الفوترة الإلكترونية والتحقق من صحة السجلات والبيانات قبل إرسالها أو تسجيلها.',
        mikhlafiSolutionEn: 'Pre-flight validation engine auditing all e-invoice XML attributes against ZATCA Phase 2 specifications.',
        impactAr: 'صفر مخالفات زكوية وضريبية على الفواتير المعتمدة',
        impactEn: 'Zero tax fines or compliance rejections on validated invoices'
      },
      {
        num: '03',
        titleAr: 'تكرار سجلات العملاء والموردين وتشتت البيانات',
        titleEn: 'Duplicate Master Data Records & Entity Fragmentation',
        currentFailureAr: 'وجود نفس المورد مسجلاً بـ 5 أسماء مختلفة في أنظمة الفروع، مما يعطل تتبع إجمالي المشتريات ومطابقة السجلات.',
        currentFailureEn: 'Same vendor registered under 5 variations across branch ERPs, shattering procurement tracking and auditability.',
        mikhlafiSolutionAr: 'محرك مطابقة ذكي يدمج السجلات المكررة آلياً استناداً إلى السجل التجاري ورقم الآيبان (IBAN) والرقم الضريبي.',
        mikhlafiSolutionEn: 'Intelligent entity resolution consolidating duplicate master records via unique Commercial Registration and IBAN keys.',
        impactAr: 'سجل موحد ونظيف وموثوق بنسبة 100% عبر كافة الأنظمة',
        impactEn: '100% clean, unified master data across all enterprise modules'
      }
    ],
    methodologySteps: [
      {
        step: '01',
        titleAr: 'المسح الدوري لسلامة وهيكل البيانات',
        titleEn: 'Comprehensive Data Health & Schema Scanning',
        techDetailAr: 'فحص مستمر لقواعد بيانات المؤسسة للتحقق من اكتمال الجداول، مطابقة الأنواع، وعدم وجود حقول إلزامية شاغرة (Null Fields).',
        techDetailEn: 'Continuous schema inspection verifying completeness of required attributes, referential integrity, and unlinked keys.',
        outputAr: 'تقرير شامل بصحة وهيكل البيانات',
        outputEn: 'System-wide data health diagnostic report'
      },
      {
        step: '02',
        titleAr: 'التدقيق المحاسبي ومطابقة الدفاتر (Reconciliation)',
        titleEn: 'Sub-Ledger vs General Ledger Reconciliation',
        techDetailAr: 'مطابقة حتمية بين حسابات الموردين (AP) والعملاء (AR) والمخزون وحركة البنوك مع حسابات دفتر الأستاذ العام.',
        techDetailEn: 'Deterministic reconciliation verifying that sub-ledger debits and credits equal general ledger control account totals.',
        outputAr: 'سجل الفوارق والتسويات المعلقة فورياً',
        outputEn: 'Real-time reconciliation imbalance log'
      },
      {
        step: '03',
        titleAr: 'التحقق من الامتثال واللوائح النظامية',
        titleEn: 'Regulatory & ZATCA Compliance Verification',
        techDetailAr: 'مطابقة البيانات مع المتطلبات النظامية السعودية: الفوترة الإلكترونية، سلامة الرقم الضريبي، ومتطلبات الحفظ والأرشفة.',
        techDetailEn: 'Validating invoice transactions against ZATCA Phase 2 schemas, cryptostamps, and tax withholding guidelines.',
        outputAr: 'شهادة امتثال رقمية للعمليات المحاسبية',
        outputEn: 'Regulatory compliance validation certificate'
      },
      {
        step: '04',
        titleAr: 'التصحيح الآلي وتنبيه مسؤولي النظام',
        titleEn: 'Automated Remediation & Master Data Cleansing',
        techDetailAr: 'إصلاح التكرارات البسيطة وتوليد توجيهات فورية لمدخلي البيانات لتصحيح الحقول الشاغرة قبل اعتماد القيد النهائي.',
        techDetailEn: 'Automated entity deduplication and immediate input-barrier alerts preventing incomplete vouchers from committing.',
        outputAr: 'قواعد بيانات نظيفة وجاهزة للمراجعة والتدقيق',
        outputEn: 'Audited, clean, and governance-ready data mesh'
      }
    ],
    integrations: [
      { name: 'SAP S/4HANA Master Data Governance (MDG)', type: 'Master Data API', statusAr: 'متوافق بالكامل', statusEn: 'Native Sync' },
      { name: 'Oracle Enterprise Data Management (EDM)', type: 'Data Quality API', statusAr: 'ربط مباشر', statusEn: 'REST Connector' },
      { name: 'ZATCA Phase 2 Schema Validator', type: 'E-Invoicing XML', statusAr: 'فحص فوري للفواتير', statusEn: 'Live Validation' },
      { name: 'SQL Databases (PostgreSQL / SQL Server / Oracle)', type: 'Read-Only JDBC', statusAr: 'تدقيق مباشر للجداول', statusEn: 'Direct DB Audit' }
    ],
    simulationData: {
      tabTitleAr: 'فحص جودة وحوكمة البيانات المحاسبية',
      tabTitleEn: 'Data Governance & Ledger Quality Demo',
      items: [
        {
          id: 'sim-dq-1',
          tag: 'UNBALANCED_ENTRY',
          severity: 'critical',
          titleAr: 'قيد محاسبي غير متوازن بمبلغ 12,400 ريال بفرع الدمام',
          titleEn: 'Unbalanced Journal Voucher: 12,400 SAR Imbalance',
          detailAr: 'القيد رقم #JV-40912 يحتوي على مدين 145,000 ريال ودائن 132,600 ريال مع حقل حساب ضريبة شاغر (Null Tax Account).',
          detailEn: 'Voucher JV-40912 has debit 145,000 SAR vs credit 132,600 SAR with unmapped tax code.',
          amount: 'فارق القيد: 12,400 ر.س',
          sourceSystem: 'GENERAL_LEDGER // INTEGRITY_CHECK',
          timestamp: 'منذ 25 دقيقة',
          auditEvidenceAr: 'تم تعليق القيد آلياً قبل الترحيل وإرسال تنبيه لمحاسب الفرع لتصحيح التوجيه المحاسبي',
          auditEvidenceEn: 'Voucher held pre-posting; automated alert sent to branch accountant for correction'
        },
        {
          id: 'sim-dq-2',
          tag: 'ZATCA_FIELD_MISSING',
          severity: 'warning',
          titleAr: 'فاتورة مبيعات تفتقر للعنوان الوطني المعتمد للمشتري',
          titleEn: 'ZATCA Warning: Missing National Address on B2B Invoice',
          detailAr: 'الفاتورة الضريبية رقم INV-8912 الصادرة لشركة (الأفق) تحتوي على رقم ضريبي صحيح لكن حقل الرمز البريدي غير مكتمل.',
          detailEn: 'Tax invoice INV-8912 to Al-Ufuq carries valid VAT ID but incomplete National Address postal code.',
          amount: 'قيمة الفاتورة: 84,000 ر.س',
          sourceSystem: 'ZATCA_VALIDATOR // E_INVOICE_SCHEMA',
          timestamp: 'منذ ساعتين',
          auditEvidenceAr: 'تم استكمال العنوان آلياً من السجل التجاري الموحد للمشتري وتمرير الفاتورة للاعتماد',
          auditEvidenceEn: 'National address auto-enriched from master customer registry; invoice cleared for submission'
        },
        {
          id: 'sim-dq-3',
          tag: 'DUPLICATE_ENTITY',
          severity: 'warning',
          titleAr: 'رصد تكرار حساب المورد (مؤسسة البناء الحديث) في 3 أنظمة فرعية',
          titleEn: 'Duplicate Supplier Account Detected Across 3 Entities',
          detailAr: 'مسجل بكود VEND-104 في الرياض و VEND-890 في جدة بنفس السجل التجاري ورقم الآيبان البنكي.',
          detailEn: 'Registered as VEND-104 in Riyadh and VEND-890 in Jeddah sharing identical CR and bank IBAN.',
          amount: 'توحيد البيانات الحسابية',
          sourceSystem: 'MASTER_DATA // ENTITY_RESOLVER',
          timestamp: 'منذ يوم',
          auditEvidenceAr: 'تم دمج السجلين في كود موحد للحساب التجاري دون فقدان تاريخ المعاملات السابقة',
          auditEvidenceEn: 'Consolidated into single golden master record with complete historical transaction link'
        }
      ]
    },
    caseStudy: {
      clientTypeAr: 'مجموعة طبية وصيدلانية كبرى تدير سلسلة مستشفيات ومراكز',
      clientTypeEn: 'Healthcare & Pharmaceutical Hospital Network',
      industryAr: 'الرعاية الصحية والتوريد الطبي (الرياض، مكة، المدينة)',
      industryEn: 'Healthcare Networks & Medical Supplies (Riyadh, Makkah, Madinah)',
      scenarioAr: 'كانت شبكة المستشفيات تواجه صعوبة بالغة في إقفال الحسابات الشهرية وتأخر مطالبات شركات التأمين بسبب أخطاء الإدخال في آلاف الفواتير اليومية.',
      scenarioEn: 'Facing persistent month-end close delays and rejected insurance claims owing to data input errors across hospital branches.',
      verifiedResultAr: 'انخفض وقت الإقفال المالي الشهري من 18 يوماً إلى يومين ونصف فقط، مع انخفاض الفواتير المرفوضة من شركات التأمين بنسبة 91%.',
      verifiedResultEn: 'Slashed monthly close cycle from 18 days to 2.5 days, while decreasing insurance claim rejection rate by 91%.',
      quoteAr: 'المنظومة وفرت لنا حارساً رقمياً على مدار الساعة يمنع أي قيد خاطئ من تلويث بياناتنا، وأصبح الإقفال الشهري يمر بسلاسة تامة.',
      quoteEn: 'Mikhlafi Labs gave us a 24/7 digital auditor preventing faulty entries from contaminating our books. Month-end is now effortless.',
      metrics: [
        { labelAr: 'تسريع الإقفال المالي', labelEn: 'Close Cycle Acceleration', val: '-86%' },
        { labelAr: 'انخفاض رفض المطالبات', labelEn: 'Claim Rejection Drop', val: '-91%' },
        { labelAr: 'دقة المطابقة المحاسبية', labelEn: 'Reconciliation Precision', val: '99.98%' }
      ]
    },
    faqs: [
      {
        qAr: 'كيف تكتشف المنظومة الأخطاء دون التدخل اليدوي من موظفينا؟',
        qEn: 'How does the platform detect errors without manual staff intervention?',
        aAr: 'تقوم المنظومة بتشغيل خوارزميات تدقيق حتمية تفحص التوازن المحاسبي، اكتمال الحقول، مطابقة التسلسل، والربط بين الحسابات آلياً على مدار الساعة.',
        aEn: 'Runs continuous background deterministic audits checking ledger balance, missing required fields, and sub-ledger linkages 24/7.'
      },
      {
        qAr: 'هل يساعد هذا المحرك في تجهيز الشركة لعمليات التدقيق الخارجي (External Audit)؟',
        qEn: 'Does this prepare our organization for external financial audits (Big 4)?',
        aAr: 'نعم تماماً، يوفر المحرك سجلاً تدقيقياً مشفراً ومطابقاً للمعايير الدولية (IFRS) وهيئة المحاسبين والمراجعين السعوديين (SOCPA)، مما يسهل ويسرع عمل المراجعين الخارجيين.',
        aEn: 'Yes, providing an immutable audit trail compliant with IFRS and SOCPA standards, drastically reducing external auditor testing cycles.'
      },
      {
        qAr: 'هل تدعم المنظومة التحقق من معايير هيئة الزكاة والضريبة والجمارك (ZATCA Phase 2)؟',
        qEn: 'Is ZATCA Phase 2 e-invoicing validation natively supported?',
        aAr: 'نعم، المنظومة مزودة بمحرك فحص مباشر يطابق كافة حقول الفاتورة الإلكترونية مع مواصفات الهيئة قبل الترحيل النهائي.',
        aEn: 'Yes, native validation audits every e-invoice XML against ZATCA Phase 2 specifications before transmission.'
      },
      {
        qAr: 'هل يمكن إصلاح البيانات تلقائياً أم تتطلب إذناً من الإدارة المالية؟',
        qEn: 'Does the system automatically fix errors or require accountant approval?',
        aAr: 'المنظومة تعرض التناقضات وتقترح الحل المحاسبي الدقيق مع إمكانية الإصلاح المعتمد بنقرة واحدة لضمان أعلى درجات الحوكمة والأمان.',
        aEn: 'Highlights discrepancies with recommended adjustments, enabling one-click approved fixes to preserve rigorous governance.'
      }
    ]
  }
];

export function getServiceById(id: string): ServiceDetailItem | undefined {
  const normalized = id.toLowerCase().replace(/^\/+/, '').replace(/^services\//, '').replace(/^solutions\//, '');
  
  const aliasMap: Record<string, string> = {
    'financial-intelligence': 'financial-leak-detection',
    'leak-detection': 'financial-leak-detection',
    'finance': 'financial-leak-detection',
    'financial': 'financial-leak-detection',
    'decisions': 'executive-decisions',
    'decision-mesh': 'executive-decisions',
    'risk-prediction': 'risk-radar',
    'risk': 'risk-radar',
    'project-intelligence': 'project-margins',
    'projects': 'project-margins',
    'project-margin-protection': 'project-margins',
    'suppliers': 'supplier-intelligence',
    'procurement': 'supplier-intelligence',
    'customer-intelligence': 'customer-retention',
    'customers': 'customer-retention',
    'churn': 'customer-retention',
    'ai-assistant': 'executive-assistant',
    'assistant': 'executive-assistant',
    'copilot': 'executive-assistant',
    'data-quality': 'data-quality-governance',
    'governance': 'data-quality-governance'
  };

  const targetId = aliasMap[normalized] || normalized;
  return SERVICES_CATALOG.find((s) => s.id === targetId || s.slug === targetId) || SERVICES_CATALOG[0];
}
