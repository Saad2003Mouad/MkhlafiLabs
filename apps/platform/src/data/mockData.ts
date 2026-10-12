// MIKHLAFI LABS — Enterprise Deterministic Mock & Brand Data
import {
  SolutionItem,
  ChallengeItem,
  PricingPackage,
  WorkflowStep,
  KpiItem,
  AnomalyRecord,
  FaqItem,
  DecisionItem,
  RiskItem,
  ProjectItem,
  SupplierItem,
  CustomerRiskItem,
  DataQualityCheck,
  IntegrationSource,
  AuditLogItem
} from '../types';

export const SOLUTIONS: SolutionItem[] = [
  {
    id: 'financial-intelligence',
    num: '01',
    titleAr: 'كشف الهدر المالي والاختلالات',
    titleEn: 'Financial Leak Detection',
    outcomeAr: 'كشف الفواتير المكررة، تباين أسعار الموردين، وخروقات بنود الميزانية قبل اعتماد الصرف مع توثيق أدلة التدقيق.',
    outcomeEn: 'Identify duplicate invoices, supplier pricing anomalies, and budget deviations prior to payout.',
    badgeAr: 'المحرك الأساسي',
    badgeEn: 'Core Engine',
    icon: 'file-text',
    routeKey: 'platform-finance'
  },
  {
    id: 'executive-decisions',
    num: '02',
    titleAr: 'مركز القرارات التنفيذية',
    titleEn: 'Executive Decision Center',
    outcomeAr: 'شاشة قيادة موحدة لترتيب أولويات الانتباه اليومية وربط كل إشارة بمسؤول وإجراء ونتيجة قابلة للقياس.',
    outcomeEn: 'Unified executive work queue transforming signals into assigned actions with measurable impact.',
    badgeAr: 'طبقة القرارات',
    badgeEn: 'Decision Layer',
    icon: 'check-circle',
    routeKey: 'platform-decisions'
  },
  {
    id: 'risk-prediction',
    num: '03',
    titleAr: 'التنبؤ بالمخاطر والإنذار المبكر',
    titleEn: 'Predictive Risk Intelligence',
    outcomeAr: 'رصد احتمالات نفاد المخزون، تعثر مراحل المشاريع، وضغوط السيولة قبل تحولها إلى أزمات تشغيلية.',
    outcomeEn: 'Early warning signals for inventory stockouts, project slippages, and cash-flow bottlenecks.',
    badgeAr: 'إنذار استباقي',
    badgeEn: 'Early Warning',
    icon: 'alert-triangle',
    routeKey: 'platform-risk'
  },
  {
    id: 'project-intelligence',
    num: '04',
    titleAr: 'ذكاء أداء المشاريع والعقود',
    titleEn: 'Project Performance Intelligence',
    outcomeAr: 'مقارنة المخطط بالمنفذ الفعلي، كشف انحراف التكاليف والمستخلصات، وحماية هوامش الربحية التعاقدية.',
    outcomeEn: 'Planned vs actual progress tracking, budget burn velocity, and contractor claim verification.',
    badgeAr: 'عمليات ومشاريع',
    badgeEn: 'Operations',
    icon: 'trending-up',
    routeKey: 'platform-projects'
  },
  {
    id: 'supplier-intelligence',
    num: '05',
    titleAr: 'ذكاء الموردين والمشتريات',
    titleEn: 'Supplier Intelligence',
    outcomeAr: 'بناء بطاقة أداء موحدة لكل مورد، كشف التبعية المفرطة، ومراقبة موثوقية التسليم وجودة الأصناف المستلمة.',
    outcomeEn: 'Supplier scorecarding, unexplainable price creep detection, and delivery fulfillment monitoring.',
    badgeAr: 'سلاسل الإمداد',
    badgeEn: 'Procurement',
    icon: 'truck',
    routeKey: 'platform-suppliers'
  },
  {
    id: 'customer-intelligence',
    num: '06',
    titleAr: 'مراقبة العملاء ومخاطر الفقدان',
    titleEn: 'Customer Intelligence',
    outcomeAr: 'رصد تراجع حجم التعاملات وتأخر التجديدات ومؤشرات فقدان كبار العملاء بدقة قائمة على السجلات المالية.',
    outcomeEn: 'Detection of uncharacteristic purchasing volume declines and contract renewal hazards.',
    badgeAr: 'الاحتفاظ بالعقود',
    badgeEn: 'Retention',
    icon: 'users',
    routeKey: 'platform-customers'
  },
  {
    id: 'ai-assistant',
    num: '07',
    titleAr: 'المساعد التنفيذي المؤسسي',
    titleEn: 'AI Executive Assistant',
    outcomeAr: 'إجابات فورية باللغة الطبيعية مستندة حصراً إلى بيانات المؤسسة المؤكدة مع روابط السجلات المصدرية وبلا افتراضات.',
    outcomeEn: 'Evidence-grounded natural language business queries referencing verifiable ledger entries.',
    badgeAr: 'ذكاء مدعوم بالأدلة',
    badgeEn: 'Evidence-Based',
    icon: 'bot',
    routeKey: 'platform-assistant'
  },
  {
    id: 'data-quality',
    num: '08',
    titleAr: 'ذكاء جودة وحوكمة البيانات',
    titleEn: 'Data Quality Intelligence',
    outcomeAr: 'فحص اكتمال القيود المحاسبية، كشف الحقول الشاغرة، وتدقيق تطابق المعاملات بين الأنظمة المتعددة.',
    outcomeEn: 'Comprehensive transaction ledger auditing, missing-field detection, and multi-system integrity scoring.',
    badgeAr: 'حوكمة وامتثال',
    badgeEn: 'Data Governance',
    icon: 'database',
    routeKey: 'platform-data-quality'
  }
];

export const CHALLENGES: ChallengeItem[] = [
  {
    num: '01',
    titleAr: 'الهدر المالي والفواتير المشبوهة',
    titleEn: 'Financial Leakage & Duplicate Expenses',
    descAr: 'تمرير فواتير مكررة، تباين أسعار مشتريات للمواد المتطابقة، ومصروفات تتجاوز حدود الصلاحيات دون تدقيق استباقي.',
    descEn: 'Repeated invoices slipping past AP review, price discrepancies for identical SKU items, and budget caps exceeded unnoticed.'
  },
  {
    num: '02',
    titleAr: 'المخاطر التشغيلية غير المتوقعة',
    titleEn: 'Emerging Operational Risks',
    descAr: 'تحول الاختناقات في سلاسل الإمداد ومستويات المخزون إلى توقفات مفاجئة لغياب مؤشرات الإنذار المبكر الحسابية.',
    descEn: 'Supply chain disruptions and critical material stockouts turning into production emergencies due to lack of early signals.'
  },
  {
    num: '03',
    titleAr: 'تعثر المشاريع وتآكل هوامش الربح',
    titleEn: 'Project Slippages & Cost Overruns',
    descAr: 'تأخر الإنجاز الفعلي للمشاريع عن الجدول الزمني، وتراكم المستخلصات غير المحصلة مع صعوبة تفسير أسباب الانحراف.',
    descEn: 'Projects drifting past contractual deadlines, margin erosion from undetected change orders, and stalled collections.'
  },
  {
    num: '04',
    titleAr: 'تذبذب أداء الموردين وغلاء الأسعار',
    titleEn: 'Supplier Pricing & Fulfillment Variance',
    descAr: 'ارتفاع تدريجي لأسعار بعض الموردين دون مبرر سوقي واضح، مع تأخر مواعيد التسليم وارتفاع نسب الإرجاع والتلف.',
    descEn: 'Gradual supplier price creep without market justification, delivery schedule failures, and recurring receiving rejections.'
  },
  {
    num: '05',
    titleAr: 'إشارات فقدان العملاء الصامتة',
    titleEn: 'Silent Customer Churn Signals',
    descAr: 'تراجع وتيرة طلبات كبار العملاء أو تراكم شكاوى الخدمة دون تنبيه مبكر لفريق إدارة الحسابات قبل فوات الأوان.',
    descEn: 'Subtle declines in major client order volumes and service frictions remaining invisible until contract non-renewal.'
  },
  {
    num: '06',
    titleAr: 'تشتت البيانات بين أنظمة متعددة',
    titleEn: 'Fragmented & Siloed Business Data',
    descAr: 'توزع المعاملات بين ERP والمشتريات وجداول Excel والبريد دون طبقة مركزية تجمع الصورة وتوثق الأدلة القاطعة.',
    descEn: 'Corporate data locked in disconnected ERP modules, spreadsheets, and sub-ledgers with zero single-source evidence layer.'
  }
];

export const WORKFLOW: WorkflowStep[] = [
  {
    index: '01',
    titleAr: 'الاتصال بالأنظمة القائمة (Non-Invasive)',
    titleEn: 'Non-Invasive System Ingestion',
    descAr: 'الربط المباشر والآمن مع أنظمة ERP، قواعد البيانات، أو ملفات Excel دون الحاجة لتغيير أو استبدال برمجياتك الحالية.',
    descEn: 'Seamless, secure read-only integration with existing ERPs, databases, or ledger files without software disruption.',
    tags: ['SAP S/4HANA', 'Oracle Cloud', 'Dynamics 365', 'Odoo Enterprise', 'PostgreSQL / SQL']
  },
  {
    index: '02',
    titleAr: 'المعايرة وتوحيد الكيانات (Normalization)',
    titleEn: 'Entity Resolution & Normalization',
    descAr: 'تنظيف الحقول، مطابقة مسميات الموردين المتشابهة، توحيد العملات، وتدقيق اكتمال القيود المحاسبية.',
    descEn: 'Fuzzy entity matching, duplicate merchant deduplication, multi-currency alignment, and integrity verification.',
    tags: ['Entity Matching', 'ZATCA Compliance', 'Audit Logging', 'Currency Align']
  },
  {
    index: '03',
    titleAr: 'محركات التحليل الحتمي (Deterministic Analysis)',
    titleEn: 'Deterministic Intelligence Engines',
    descAr: 'تطبيق خوارزميات التدقيق الجنائي لكشف الهدر والتنبؤ بالمخاطر مع عزل الحقائق المؤكدة عن الفرضيات التقديرية.',
    descEn: 'Forensic algorithmic audit routines isolating verified accounting facts from statistical probabilities.',
    tags: ['Forensic Auditing', 'Price Variance', 'Margin Velocity', 'Confidence Scoring']
  },
  {
    index: '04',
    titleAr: 'مركز القرارات التنفيذية (Executive Action)',
    titleEn: 'Executive Decisions & Action Queue',
    descAr: 'ترتيب أولويات الانتباه، استعراض الأدلة القاطعة، وتعيين المسؤوليات مع قياس الأثر المالي المتحقق فعلياً.',
    descEn: 'Prioritized leadership queue with verifiable source evidence, assigned owners, and tracked financial impact.',
    tags: ['Action Assignment', 'Tracked Savings', 'Evidence Drilldown', 'Sovereign Records']
  }
];

export const PACKAGES: PricingPackage[] = [
  {
    id: 'starter',
    nameAr: 'الباقة الأساسية',
    nameEn: 'Starter Package',
    subtitleAr: 'حماية السيولة وكشف الهدر الفوري للمؤسسات الناشئة والمتوسطة',
    subtitleEn: 'Immediate cash flow protection and leakage detection for growing businesses',
    badgeAr: '3 محركات ذكاء',
    badgeEn: '3 Intelligence Engines',
    popular: false,
    servicesCount: 3,
    featuresAr: [
      '3 محركات ذكاء أساسية (كشف الهدر، مركز القرارات، التنبؤ بالمخاطر)',
      'ربط حتى نظامين من مصادر البيانات (ERP / المحاسبة)',
      'فحص دوري تلقائي للفواتير المكررة والمصروفات المشبوهة',
      'مركز تنبيهات تنفيذية لـ 3 قياديين',
      'تقارير دورية للأثر المالي والمخاطر المرصودة',
      'دعم فني استشاري عبر البريد المباشر'
    ],
    featuresEn: [
      '3 Core Intelligence Engines (Leakage, Decisions, Risk)',
      'Connect up to 2 data sources (ERP / Accounting)',
      'Automated scans for duplicate invoices & expense anomalies',
      'Executive attention center for up to 3 leaders',
      'Periodic savings & risk audit reports',
      'Direct technical & advisory email support'
    ]
  },
  {
    id: 'professional',
    nameAr: 'الباقة المتقدمة',
    nameEn: 'Professional Package',
    subtitleAr: 'تحكم شامل بالمالية والمشاريع والموردين للشركات سريعة النمو',
    subtitleEn: 'Comprehensive financial, project & procurement intelligence for scaling firms',
    badgeAr: 'الأكثر طلباً · 5 محركات',
    badgeEn: 'Most Popular · 5 Engines',
    popular: true,
    servicesCount: 5,
    featuresAr: [
      '5 محركات ذكاء تشمل المالية والمشاريع والموردين',
      'ربط غير محدود بأنظمة ERP وقواعد البيانات المؤسسية',
      'تدقيق وتحليل حسابي مستمر ومباشر (Daily Audits)',
      'كشف تفاوت أسعار الموردين وانحراف العقود التوريدية',
      'مراقبة هوامش ربحية المشاريع وسرعة صرف المستخلصات',
      '10 حسابات تنفيذية مع صلاحيات وصول متدرجة (RBAC)',
      'تنبيهات فورية للمخاطر الحرجة عبر البريد و SMS',
      'دعم فني ذو أولوية وجلسة مراجعة استشارية شهرية'
    ],
    featuresEn: [
      '5 Intelligence Engines covering finance, projects & procurement',
      'Unlimited connections to ERPs & data repositories',
      'Daily continuous automated forensic audit routines',
      'Supplier price creep & contract variance tracking',
      'Project margin velocity & contractor claim verification',
      '10 executive accounts with granular permissions (RBAC)',
      'Instant critical alerts via email & SMS notifications',
      'Priority technical support & monthly strategic review session'
    ]
  },
  {
    id: 'enterprise',
    nameAr: 'باقة المؤسسات الشاملة',
    nameEn: 'Enterprise Suite',
    subtitleAr: 'المنظومة الاستخباراتية المتكاملة للمجموعات القابضة والكيانات الكبرى',
    subtitleEn: 'The complete sovereign intelligence mesh for holding groups and enterprises',
    badgeAr: 'المنظومة الكاملة · كافة الـ 8 محركات',
    badgeEn: 'Complete Suite · All 8 Engines',
    popular: false,
    servicesCount: 8,
    featuresAr: [
      'كافة محركات MIKHLAFI LABS الثمانية بلا أي قيود',
      'المساعد التنفيذي الذكي المدعوم بالأدلة (AI Executive Assistant)',
      'مراقبة جودة البيانات الشاملة وحماية حوكمة السجلات',
      'رصد مخاطر تسرب العملاء وتآكل العقود الكبرى',
      'مرونة النشر: سحابة خاصة معزولة أو نشر محلي سيادي (On-Premise)',
      'حسابات قيادية غير محدودة وهيكل صلاحيات مخصص بالكامل',
      'اتفاقية مستوى خدمة مؤسسية 99.9% (Enterprise SLA)',
      'مدير حساب ومهندس ذكاء أعمال مخصص للمؤسسة',
      'تكامل مخصص مع أنظمة ERP والفوترة ZATCA المرحلة 2'
    ],
    featuresEn: [
      'All 8 MIKHLAFI LABS engines with zero limitations',
      'Evidence-grounded AI Executive Assistant engine',
      'Comprehensive Data Quality Intelligence & governance audit',
      'Customer retention & large contract churn monitoring',
      'Deployment flexibility: Sovereign Cloud or full On-Premise',
      'Unlimited leadership accounts & custom role hierarchies',
      'Enterprise 99.9% SLA & mission-critical support',
      'Dedicated Account Executive & BI Systems Engineer',
      'Custom ERP bridges & ZATCA phase 2 integration'
    ]
  }
];

export const INDUSTRIES = [
  {
    id: 'commerce',
    titleAr: 'التجارة والتجزئة وسلاسل التوريد',
    titleEn: 'Commerce, Retail & Logistics',
    descAr: 'ضبط تكلفة الشراء، كشف تسرب الهوامش في فواتير الموردين، وتحليل فترات دوران المخزون.',
    descEn: 'Purchase cost discipline, supplier price creep auditing, and stock rotation efficiency.'
  },
  {
    id: 'contracting',
    titleAr: 'المقاولات والمشاريع الكبرى',
    titleEn: 'Contracting & Infrastructure',
    descAr: 'مراقبة أوامر التغيير غير المعتمدة، مقارنة الإنجاز الفعلي بالمستخلصات، وتفادي غرامات التأخير.',
    descEn: 'Unapproved change order control, milestone claim verification, and liquidated damage avoidance.'
  },
  {
    id: 'manufacturing',
    titleAr: 'الصناعة والإنتاج',
    titleEn: 'Manufacturing & Processing',
    descAr: 'تحليل تكلفة المواد الخام المباشرة، كشف الهدر في خطوط التوريد، ومطابقة أوامر الشراء بالأوزان الفعلية.',
    descEn: 'Direct material variance tracking, supply friction elimination, and weighted PO verification.'
  },
  {
    id: 'healthcare',
    titleAr: 'الرعاية الصحية والخدمات',
    titleEn: 'Healthcare & Specialized Services',
    descAr: 'تدقيق مطالبات التأمين، حماية سلاسل إمداد الأدوية والأجهزة، وضبط عقود الصيانة طويلة الأجل.',
    descEn: 'Insurance claim audit integrity, medical asset supply control, and SLA contract oversight.'
  }
];

export const FAQS: FaqItem[] = [
  {
    qAr: 'هل تتطلب المنصة استبدال نظام ERP الحالي أو قواعد البيانات القائمة؟',
    qEn: 'Does MIKHLAFI LABS require replacing existing ERP systems or databases?',
    aAr: 'على الإطلاق. صُممت MIKHLAFI LABS كطبقة ذكاء غير تطفلية (Non-Invasive) تعمل فوق أنظمة ERP و CRM القائمة عبر مسارات قراءة آمنة (Read-Only) مع الاحتفاظ بكامل بنيتك التحتية السابقة.',
    aEn: 'Not at all. MIKHLAFI LABS functions as a non-invasive intelligence layer reading existing ERP, CRM, and ledger feeds via secure, read-only telemetry pipelines with zero system disruption.'
  },
  {
    qAr: 'ما الفرق بين الذكاء الحتمي (Deterministic) والذكاء التوليدي العادي؟',
    qEn: 'What is the difference between deterministic intelligence and generic AI?',
    aAr: 'تعتمد قرارات الأعمال على الحقائق المحاسبية الدقيقة وليس التخمين. محركاتنا تفحص مطابقة القيود وتكشف التباين عبر قواعد حسابية قطعية لا تقبل الهلوسة، مع توثيق السجل المحاسبي لكل نتيجة.',
    aEn: 'Enterprise decisions require verifiable accounting facts, not probabilistic guesses. Our engines detect variance and leakage using deterministic forensic arithmetic linked to original ledger entries.'
  },
  {
    qAr: 'هل يمكن تشغيل المنصة داخل مراكز بيانات الشركة المحلية (On-Premise)؟',
    qEn: 'Can the platform be deployed locally on corporate servers (On-Premise)?',
    aAr: 'نعم بالكامل. ندعم النشر السيادي داخل خوادمك الخاصة (On-Premise Bare-Metal أو Private Kubernetes) لضمان بقاء البيانات محصورة ضمن حدودك الجغرافية دون أي اتصال خارجي.',
    aEn: 'Yes, fully. We support sovereign On-Premise deployments inside your private data centers ensuring total data residency compliance with NCA & NDMO frameworks.'
  },
  {
    qAr: 'كم يستغرق ربط البيانات والبدء برصد الانحرافات؟',
    qEn: 'How long does integration take before the first anomaly signals appear?',
    aAr: 'باستخدام الروابط الجاهزة (Connectors)، يمكن إتمام الربط الأولي واستيراد بيانات التدقيق خلال أقل من 48 ساعة لبدء ظهور أولى إشارات الهدر وطابور الأولويات التنفيذية.',
    aEn: 'Using pre-built telemetry connectors, initial ingestion and normalization typically complete within 48 hours to surface active leaks and executive action priorities.'
  }
];

export const MOCK_KPIS: KpiItem[] = [
  {
    id: 'kpi-1',
    titleAr: 'مؤشر الكفاءة التشغيلية المجمعة',
    titleEn: 'Operational Efficiency Index',
    value: '94.2%',
    delta: '+3.8%',
    isPositive: true,
    unitAr: 'معدل قياسي',
    unitEn: 'Benchmark',
    sourceAr: 'تحليل الأنشطة التشغيلية وسلاسل الإمداد',
    sourceEn: 'Operations & Supply Streams',
    qualityStatus: 'fresh'
  },
  {
    id: 'kpi-2',
    titleAr: 'حجم التدفقات النقدية الصافية',
    titleEn: 'Net Cash Flow Velocity',
    value: '2.84M',
    delta: '+12.4%',
    isPositive: true,
    unitAr: 'SAR (استعراضي)',
    unitEn: 'SAR (Demo)',
    sourceAr: 'دفتر الأستاذ العام ومطابقة البنوك',
    sourceEn: 'General Ledger & Bank Feeds',
    qualityStatus: 'fresh'
  },
  {
    id: 'kpi-3',
    titleAr: 'الانحرافات المرصودة النشطة',
    titleEn: 'Active Detected Anomalies',
    value: '7',
    delta: '-2',
    isPositive: true,
    unitAr: 'حالات فحص',
    unitEn: 'Active Cases',
    sourceAr: 'محرك كشف الشذوذ والتدقيق الجنائي',
    sourceEn: 'Forensic Anomaly Engine',
    qualityStatus: 'fresh'
  },
  {
    id: 'kpi-4',
    titleAr: 'معدل مخاطر الموردين الكلي',
    titleEn: 'Aggregate Supplier Risk',
    value: '18.5%',
    delta: '+1.2%',
    isPositive: false,
    unitAr: 'مؤشر مخاطر',
    unitEn: 'Risk Index',
    sourceAr: 'سجلات التوريد ومطابقة الجودة',
    sourceEn: 'Vendor Audits & Delivery Records',
    qualityStatus: 'fresh'
  }
];

export const MOCK_ANOMALIES: AnomalyRecord[] = [
  {
    id: 'an-1',
    code: 'ANOM-2026-081',
    titleAr: 'تكرار صرف مدفوعات لنفس المورد خلال 48 ساعة',
    titleEn: 'Duplicate payment disbursement pattern within 48h',
    categoryAr: 'تسرب مالي مباشر',
    categoryEn: 'Financial Leakage',
    impactValue: '48,500 SAR',
    severity: 'high',
    confidenceScore: 0.942,
    detectedAt: '2026-10-12 02:15',
    statusAr: 'قيد الفحص والتدقيق',
    statusEn: 'Under Executive Review'
  },
  {
    id: 'an-2',
    code: 'ANOM-2026-079',
    titleAr: 'انحراف تسعير عقود توريد مقارنة بمتوسط السوق (+16.5%)',
    titleEn: 'Procurement variance above contractual baseline (+16.5%)',
    categoryAr: 'كفاءة المشتريات',
    categoryEn: 'Procurement Variance',
    impactValue: '124,000 SAR',
    severity: 'medium',
    confidenceScore: 0.884,
    detectedAt: '2026-10-11 18:30',
    statusAr: 'مؤكد جزئياً بالأدلة',
    statusEn: 'Partially Verified'
  },
  {
    id: 'an-3',
    code: 'ANOM-2026-075',
    titleAr: 'تأخر توريد محولات يؤثر على موعد تسليم 3 مشاريع رئيسية',
    titleEn: 'Milestone delay impact on dependent project delivery',
    categoryAr: 'سلاسل الإمداد والتشغيل',
    categoryEn: 'Supply Chain Delay',
    impactValue: '150,000 SAR',
    severity: 'low',
    confidenceScore: 0.791,
    detectedAt: '2026-10-11 11:20',
    statusAr: 'مغلق ومصحح إدارياً',
    statusEn: 'Resolved & Mitigated'
  }
];

export const MOCK_DECISIONS: DecisionItem[] = [
  {
    id: 'dec-1',
    code: 'DEC-2026-041',
    titleAr: 'تجميد الدفعة الثانية لأمر الشراء PO-8921 لحين مطابقة بوليصة الشحن',
    titleEn: 'Freeze second disbursement on PO-8921 pending BOL verification',
    impactAr: 'تفادي تسرب مالي محتمل بقيمة 128,400 ريال ناتج عن اشتباه فوترة مكررة',
    impactEn: 'Avoids 128,400 SAR potential leak from suspected duplicate vendor invoice',
    financialImpact: '128,400 SAR',
    priority: 'critical',
    assignedTo: 'فهد السبيعي (مدير التدقيق المالي)',
    statusAr: 'قيد التنفيذ والمتابعة',
    statusEn: 'In Progress',
    deadline: '2026-10-14'
  },
  {
    id: 'dec-2',
    code: 'DEC-2026-039',
    titleAr: 'إعادة التفاوض على أسعار حديد التسليح بناءً على تباين العقد CTR-04',
    titleEn: 'Initiate vendor price renegotiation based on CTR-04 contractual baseline',
    impactAr: 'استعادة وفر يقدر بـ 84,000 ريال بعد رصد تفاوت سعري غير مبرر (+16.5%)',
    impactEn: 'Recovers estimated 84,000 SAR after detecting unjustified price creep (+16.5%)',
    financialImpact: '84,000 SAR',
    priority: 'high',
    assignedTo: 'عمر القحطاني (مدير سلاسل الإمداد)',
    statusAr: 'مفتوح بانتظار الاعتماد',
    statusEn: 'Pending Approval',
    deadline: '2026-10-18'
  },
  {
    id: 'dec-3',
    code: 'DEC-2026-035',
    titleAr: 'تفعيل المورد الاحتياطي للكابلات الكهربائية لمشروع الواحة',
    titleEn: 'Activate secondary cable supplier for Al-Waha Project',
    impactAr: 'تجنب غرامة تأخير على المسار الحرج للمشروع بقيمة 150,000 ريال',
    impactEn: 'Mitigates 150,000 SAR liquidated delay damages on project critical path',
    financialImpact: '150,000 SAR',
    priority: 'high',
    assignedTo: 'م. خالد الغامدي (مدير العمليات)',
    statusAr: 'مكتمل ومعتمد',
    statusEn: 'Executed',
    deadline: '2026-10-11'
  }
];

export const MOCK_RISKS: RiskItem[] = [
  {
    id: 'r-1',
    code: 'RSK-OPS-109',
    titleAr: 'مخاطر تركز التوريد على مورد وحيد لمواد العزل الكهربائي',
    titleEn: 'Single-source vendor concentration for electrical insulation materials',
    categoryAr: 'سلاسل الإمداد',
    categoryEn: 'Supply Chain',
    probability: 'high',
    severity: 'critical',
    impactSAR: '340,000 SAR',
    mitigationPlanAr: 'تأهيل موردين محليين إضافيين معتمدين من هيئة المواصفات بنهاية الربع الرابع.',
    mitigationPlanEn: 'Qualify secondary domestic certified suppliers before Q4 close.'
  },
  {
    id: 'r-2',
    code: 'RSK-FIN-088',
    titleAr: 'ضغوط سيولة ناتجة عن تأخر اعتماد مستخلصات العقد الحكومي #402',
    titleEn: 'Cash flow tension from delayed certification of Gov Contract #402 progress claims',
    categoryAr: 'السيولة والتدفقات',
    categoryEn: 'Liquidity & Cash',
    probability: 'medium',
    severity: 'high',
    impactSAR: '920,000 SAR',
    mitigationPlanAr: 'تقديم خطاب مطابقة الدفع الإلكتروني عبر منصة اعتماد لتسريع الصرف.',
    mitigationPlanEn: 'Submit electronic reconciliation via Etimad platform to accelerate approval.'
  },
  {
    id: 'r-3',
    code: 'RSK-COM-044',
    titleAr: 'احتمال فقدان عميل استراتيجي بسبب انخفاض وتيرة الطلب بنسبة 35%',
    titleEn: 'Major customer churn hazard following 35% purchasing volume contraction',
    categoryAr: 'إيرادات العملاء',
    categoryEn: 'Customer Retention',
    probability: 'medium',
    severity: 'medium',
    impactSAR: '450,000 SAR',
    mitigationPlanAr: 'جدولة اجتماع مراجعة تنفيذية ربع سنوي مع إدارة الحسابات قبل موعد التجديد.',
    mitigationPlanEn: 'Schedule executive account review session ahead of annual renewal window.'
  }
];

export const MOCK_PROJECTS: ProjectItem[] = [
  {
    id: 'p-1',
    code: 'PRJ-2026-01',
    nameAr: 'تطوير البنية السحابية والمستودع المركزي — الرياض',
    nameEn: 'Central Hub Infrastructure Development — Riyadh',
    plannedProgress: 75,
    actualProgress: 72,
    budgetTotal: '4,200,000 SAR',
    varianceSAR: '+35,000 SAR',
    health: 'on-track',
    changeOrdersCount: 2
  },
  {
    id: 'p-2',
    code: 'PRJ-2026-02',
    nameAr: 'أتمتة خطوط التوزيع وسلاسل الإمداد — جدة',
    nameEn: 'Supply Chain Automation & Logistics Center — Jeddah',
    plannedProgress: 60,
    actualProgress: 48,
    budgetTotal: '6,800,000 SAR',
    varianceSAR: '+240,000 SAR',
    health: 'at-risk',
    changeOrdersCount: 5
  },
  {
    id: 'p-3',
    code: 'PRJ-2026-03',
    nameAr: 'توسعة محطات الطاقة والمحولات — الشرقية',
    nameEn: 'Power Distribution Expansion — Eastern Province',
    plannedProgress: 90,
    actualProgress: 88,
    budgetTotal: '3,100,000 SAR',
    varianceSAR: '-12,000 SAR',
    health: 'on-track',
    changeOrdersCount: 1
  }
];

export const MOCK_SUPPLIERS: SupplierItem[] = [
  {
    id: 'sup-1',
    nameAr: 'شركة التوريدات الهندسية الكبرى',
    nameEn: 'Global Engineering Supplies Co.',
    ratingScore: 68,
    priceCreepRate: '+16.5%',
    onTimeDeliveryRate: '79.2%',
    activeContractsVal: '1,450,000 SAR',
    riskStatus: 'critical'
  },
  {
    id: 'sup-2',
    nameAr: 'مصنع الشرق للأنابيب والمواد',
    nameEn: 'Eastern Pipe & Industrial Mill',
    ratingScore: 92,
    priceCreepRate: '+1.2%',
    onTimeDeliveryRate: '98.5%',
    activeContractsVal: '3,200,000 SAR',
    riskStatus: 'optimal'
  },
  {
    id: 'sup-3',
    nameAr: 'الشركة المتحدة للنقل والخدمات اللوجستية',
    nameEn: 'United Logistics & Transport Services',
    ratingScore: 81,
    priceCreepRate: '+4.5%',
    onTimeDeliveryRate: '88.0%',
    activeContractsVal: '920,000 SAR',
    riskStatus: 'moderate'
  }
];

export const MOCK_CUSTOMERS: CustomerRiskItem[] = [
  {
    id: 'c-1',
    accountNameAr: 'مجموعة الرواد للمقاولات والتطوير',
    accountNameEn: 'Al-Rowad Contracting & Development',
    volumeTrend: '-35.2%',
    renewalDate: '2026-11-30',
    churnProbability: 0.68,
    revenueAtRisk: '840,000 SAR'
  },
  {
    id: 'c-2',
    accountNameAr: 'الشركة السعودية للصناعات الدوائية',
    accountNameEn: 'Saudi Pharma Industrial Group',
    volumeTrend: '+8.4%',
    renewalDate: '2027-02-15',
    churnProbability: 0.12,
    revenueAtRisk: '1,200,000 SAR'
  },
  {
    id: 'c-3',
    accountNameAr: 'سلسلة أسواق التغذية الوطنية',
    accountNameEn: 'National Retail & Food Markets',
    volumeTrend: '-18.0%',
    renewalDate: '2026-12-15',
    churnProbability: 0.44,
    revenueAtRisk: '520,000 SAR'
  }
];

export const MOCK_DATA_QUALITY: DataQualityCheck[] = [
  {
    id: 'dq-1',
    ruleName: 'مطابقة قيود الفواتير مع السجل الضريبي ZATCA',
    sourceSystem: 'Oracle ERP <-> ZATCA Bridge',
    complianceRate: 99.8,
    unmappedRecords: 3,
    status: 'passed',
    lastChecked: '2026-10-12 04:00'
  },
  {
    id: 'dq-2',
    ruleName: 'اكتمال أرقام أوامر الشراء PO في سندات الصرف',
    sourceSystem: 'SAP S/4HANA Accounts Payable',
    complianceRate: 94.1,
    unmappedRecords: 14,
    status: 'warning',
    lastChecked: '2026-10-12 03:30'
  },
  {
    id: 'dq-3',
    ruleName: 'توحيد معرفات الموردين وتفادي الحسابات البنكية المكررة',
    sourceSystem: 'General Vendor Directory',
    complianceRate: 98.5,
    unmappedRecords: 2,
    status: 'passed',
    lastChecked: '2026-10-11 22:00'
  }
];

export const MOCK_INTEGRATIONS: IntegrationSource[] = [
  {
    id: 'int-1',
    name: 'SAP S/4HANA Enterprise',
    category: 'Core ERP',
    status: 'connected',
    recordsSynced: '1,420,500',
    lastSync: 'قبل 4 دقائق',
    authType: 'mTLS / OAuth2'
  },
  {
    id: 'int-2',
    name: 'Oracle Cloud Financials',
    category: 'General Ledger',
    status: 'connected',
    recordsSynced: '840,210',
    lastSync: 'قبل 12 دقيقة',
    authType: 'API Key (Restricted Read-Only)'
  },
  {
    id: 'int-3',
    name: 'منصة الفوترة ZATCA المرحلة 2',
    category: 'Tax & Compliance',
    status: 'connected',
    recordsSynced: '312,900',
    lastSync: 'قبل دقيقة',
    authType: 'X.509 Cryptographic Certificate'
  },
  {
    id: 'int-4',
    name: 'قاعدة بيانات PostgreSQL المستودعية',
    category: 'Operations DB',
    status: 'connected',
    recordsSynced: '2,940,000',
    lastSync: 'مزامنة حية مستمرة',
    authType: 'Encrypted Read Replica'
  }
];

export const MOCK_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'aud-1',
    actor: 'سعد المخلافي (رئيس التدقيق)',
    actionAr: 'اعتماد تسوية المطالبة المالية #INV-8840 كمطابقة صحيحة',
    actionEn: 'Approved invoice #INV-8840 as legitimate verified reconciliation',
    targetRecord: 'CASE-2026-081',
    timestamp: '2026-10-12 02:40:15',
    hash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
  },
  {
    id: 'aud-2',
    actor: 'محرك كشف الشذوذ (النظام التلقائي)',
    actionAr: 'رصد تباين في أسعار توريد CTR-04 بنسبة +16.5% وتوليد إنذار',
    actionEn: 'Automated flag triggered for CTR-04 price creep (+16.5%)',
    targetRecord: 'ANOM-2026-079',
    timestamp: '2026-10-11 18:30:00',
    hash: 'sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
  },
  {
    id: 'aud-3',
    actor: 'م. خالد الغامدي (مدير العمليات)',
    actionAr: 'تحديث نسبة إنجاز مشروع أتمتة خطوط التوريد إلى 48%',
    actionEn: 'Milestone progress update to 48% on Logistics Center project',
    targetRecord: 'PRJ-2026-02',
    timestamp: '2026-10-11 14:15:22',
    hash: 'sha256:5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
  }
];
