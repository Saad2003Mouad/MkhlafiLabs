// MIKHLAFI LABS — Enterprise Deterministic Mock & Brand Data
import { SolutionItem, ChallengeItem, PricingPackage, WorkflowStep, KpiItem, AnomalyRecord } from '../types';

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
    icon: 'file-text'
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
    icon: 'check-circle'
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
    icon: 'alert-triangle'
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
    icon: 'trending-up'
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
    icon: 'truck'
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
    icon: 'users'
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
    icon: 'bot'
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
    icon: 'database'
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

export const MOCK_KPIS: KpiItem[] = [
  {
    id: 'kpi-1',
    titleAr: 'مؤشر الكفاءة التشغيلية',
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
