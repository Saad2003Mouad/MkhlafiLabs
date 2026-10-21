// MIKHLAFI LABS — Public Website Content
// Canonical, human-authored marketing copy for the public corporate website.
// This file contains NO operational business data and NO simulated metrics.
// All operational data is served exclusively by the authenticated backend API.

import { FaqItem, PricingPackage, WorkflowStep } from '../types';

export interface IndustryBrief {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
}

/**
 * Commercial packages offered to customers.
 * These are the published commercial tiers (not tenant subscription records).
 */
export const PACKAGES: PricingPackage[] = [
  {
    id: 'starter',
    nameAr: 'الباقة الأساسية',
    nameEn: 'Foundation',
    subtitleAr: 'طبقة ذكاء تشغيلية للفرق التي تبدأ بتوحيد مصادر بياناتها',
    subtitleEn: 'An operational intelligence layer for teams starting to unify their data',
    badgeAr: '3 محركات',
    badgeEn: '3 Engines',
    popular: false,
    servicesCount: 3,
    featuresAr: [
      '3 محركات ذكاء (كشف الانحراف، مركز القرارات، جودة البيانات)',
      'ربط حتى مصدرين للبيانات (ERP أو نظام محاسبي)',
      'فحص دوري للقيود والفواتير والشذوذ في القيود',
      'طابور أولويات تنفيذي لعدد 3 قياديين',
      'تقارير دورية قابلة للتصدير والتدقيق',
      'دعم فني عبر البريد الإلكتروني'
    ],
    featuresEn: [
      '3 intelligence engines (Anomaly Detection, Decisions, Data Quality)',
      'Connect up to 2 data sources (ERP or accounting system)',
      'Scheduled scans across ledger entries and invoices',
      'Executive priority queue for up to 3 leaders',
      'Periodic, exportable audit reports',
      'Technical support over email'
    ]
  },
  {
    id: 'professional',
    nameAr: 'الباقة الاحترافية',
    nameEn: 'Professional',
    subtitleAr: 'تحكم أوسع بالمخاطر والموردين والمشاريع للشركات المتوسعة',
    subtitleEn: 'Wider control across risk, suppliers, and projects for scaling organizations',
    badgeAr: '5 محركات · الأكثر اختياراً',
    badgeEn: '5 Engines · Most Chosen',
    popular: true,
    servicesCount: 5,
    featuresAr: [
      '5 محركات ذكاء تشمل المخاطر والموردين والمشاريع',
      'ربط غير محدود بمصادر البيانات المؤسسية',
      'فحوصات مستمرة وشذوذ لحظي على مستوى المعاملات',
      'مراقبة تباين أسعار الموردين وانحراف العقود',
      'متابعة هوامش المشاريع وسرعة صرف المستخلصات',
      '10 حسابات قيادية مع صلاحيات متدرجة (RBAC)',
      'تنبيهات فورية للانحرافات الحرجة',
      'دعم ذو أولوية وجلسة مراجعة دورية'
    ],
    featuresEn: [
      '5 intelligence engines including Risk, Suppliers, and Projects',
      'Unlimited connections to enterprise data sources',
      'Continuous scans with transaction-level anomaly detection',
      'Supplier price drift and contract variance monitoring',
      'Project margin tracking and contractor claim verification',
      '10 leadership accounts with granular permissions (RBAC)',
      'Instant alerts for critical deviations',
      'Priority support and periodic review sessions'
    ]
  },
  {
    id: 'enterprise',
    nameAr: 'باقة المؤسسات',
    nameEn: 'Enterprise',
    subtitleAr: 'المنظومة الكاملة للمجموعات القابضة والكيانات متعددة الفروع',
    subtitleEn: 'The complete suite for holding groups and multi-branch organizations',
    badgeAr: 'المنظومة الكاملة · 8 محركات',
    badgeEn: 'Complete Suite · 8 Engines',
    popular: false,
    servicesCount: 8,
    featuresAr: [
      'كافة محركات MIKHLAFI LABS الثمانية بلا قيود',
      'المساعد التنفيذي المدعوم بالأدلة (AI Executive Assistant)',
      'حوكمة وجودة بيانات شاملة عبر كل الفروع',
      'مراقبة مخاطر فقدان العملاء وتآكل العقود الكبرى',
      'خيارات نشر مرنة: سحابة خاصة معزولة أو نشر محلي سيادي',
      'حسابات قيادية غير محدودة وهيكل صلاحيات مخصص',
      'اتفاقية مستوى خدمة مؤسسية 99.9% (Enterprise SLA)',
      'مدير حساب ومهندس حلول مخصص للمؤسسة',
      'تكاملات مخصصة مع أنظمة ERP والفوترة الإلكترونية'
    ],
    featuresEn: [
      'All 8 MIKHLAFI LABS engines with zero limitations',
      'Evidence-grounded AI Executive Assistant',
      'Comprehensive data governance across all branches',
      'Customer churn and large contract erosion monitoring',
      'Flexible deployment: private cloud or sovereign on-premise',
      'Unlimited leadership accounts and custom role hierarchies',
      'Enterprise 99.9% SLA and mission-critical support',
      'Dedicated account executive and solutions engineer',
      'Custom ERP bridges and e-invoicing integration'
    ]
  }
];

/**
 * Industry applicability briefs used on the public home and industries pages.
 */
export const INDUSTRY_BRIEFS: IndustryBrief[] = [
  {
    id: 'commerce',
    titleAr: 'التجارة والتجزئة وسلاسل التوريد',
    titleEn: 'Commerce, Retail & Supply Chain',
    descAr: 'ضبط تكلفة الشراء، كشف انحراف أسعار الموردين، وتحليل كفاءة دوران المخزون.',
    descEn: 'Purchase cost discipline, supplier price-drift auditing, and inventory turnover efficiency.'
  },
  {
    id: 'contracting',
    titleAr: 'المقاولات والمشاريع الكبرى',
    titleEn: 'Contracting & Infrastructure',
    descAr: 'متابعة أوامر التغيير، مطابقة المستخلصات بالمنجز الفعلي، وتفادي غرامات التأخير.',
    descEn: 'Change-order tracking, milestone claim verification, and liquidated-damage avoidance.'
  },
  {
    id: 'manufacturing',
    titleAr: 'الصناعة والإنتاج',
    titleEn: 'Manufacturing & Processing',
    descAr: 'تحليل انحراف تكلفة المواد المباشرة وكشف الهدر في خطوط التوريد.',
    descEn: 'Direct material variance analysis and supply-line waste detection.'
  },
  {
    id: 'services',
    titleAr: 'الخدمات والقطاعات المتخصصة',
    titleEn: 'Services & Specialized Sectors',
    descAr: 'ضبط عقود الخدمات طويلة الأجل، وحماية هامش الربح التشغيلي للمشاريع.',
    descEn: 'Long-term service contract control and operating margin protection.'
  }
];

/**
 * The four-stage operational method shared across the public website.
 */
export const WORKFLOW: WorkflowStep[] = [
  {
    index: '01',
    titleAr: 'الاتصال بالأنظمة القائمة',
    titleEn: 'Connect Existing Systems',
    descAr: 'ربط آمن للقراءة فقط مع أنظمة ERP وقواعد البيانات وملفات الدفاتر، دون تغيير بنيتك الحالية.',
    descEn: 'Secure, read-only integration with existing ERPs, databases, and ledger files.',
    tags: ['SAP S/4HANA', 'Oracle Cloud', 'Microsoft Dynamics 365', 'Odoo', 'PostgreSQL']
  },
  {
    index: '02',
    titleAr: 'المعايرة وتوحيد الكيانات',
    titleEn: 'Normalize & Resolve Entities',
    descAr: 'تنظيف الحقول، توحيد مسميات الجهات، مطابقة العملات، والتحقق من اكتمال القيود.',
    descEn: 'Field cleanup, entity matching, currency alignment, and record completeness checks.',
    tags: ['Entity Matching', 'Multi-Currency', 'Audit Logging']
  },
  {
    index: '03',
    titleAr: 'التحليل الحتمي',
    titleEn: 'Deterministic Analysis',
    descAr: 'تطبيق قواعد حسابية قطعية لكشف الانحراف والمخاطر، مع الفصل بين الحقائق المؤكدة والاحتمالات.',
    descEn: 'Deterministic arithmetic routines that separate verified facts from probabilities.',
    tags: ['Anomaly Detection', 'Variance Analysis', 'Confidence Scoring']
  },
  {
    index: '04',
    titleAr: 'القرار والإجراء',
    titleEn: 'Decide & Act',
    descAr: 'ترتيب الأولويات، مراجعة الأدلة المصدرية، وتعيين المسؤوليات مع تتبّع الأثر المتحقق.',
    descEn: 'Prioritize, review source evidence, and assign owners with tracked realized impact.',
    tags: ['Priority Queue', 'Evidence Drill-down', 'Impact Tracking']
  }
];

/**
 * Frequently asked questions shown on the public website.
 */
export const FAQS: FaqItem[] = [
  {
    qAr: 'هل تتطلب المنصة استبدال نظام ERP أو قواعد البيانات الحالية؟',
    qEn: 'Does the platform require replacing our existing ERP or databases?',
    aAr: 'لا. تعمل MIKHLAFI LABS كطبقة ذكاء غير تطفلية تعتمد مسارات قراءة آمنة (Read-Only) فوق أنظمة ERP و CRM والدفاتر الحالية مع الإبقاء الكامل على بنيتك التحتية.',
    aEn: 'No. MIKHLAFI LABS is a non-invasive intelligence layer that reads from existing ERP, CRM, and ledger systems through secure, read-only pipelines.'
  },
  {
    qAr: 'ما الفرق بين التحليل الحتمي والذكاء التوليدي التقليدي؟',
    qEn: 'What is the difference between deterministic analysis and generic AI?',
    aAr: 'تعتمد قرارات الأعمال على حقائق محاسبية يمكن التحقق منها. محركاتنا تستخدم قواعد حسابية قطعية قابلة للتتبع، وتربط كل نتيجة بسجلها المصدر بدل الاعتماد على التخمين.',
    aEn: 'Business decisions depend on verifiable accounting facts. Our engines use traceable, deterministic arithmetic and link every finding to its source record instead of guessing.'
  },
  {
    qAr: 'هل يمكن تشغيل المنصة داخل مراكز بيانات الشركة؟',
    qEn: 'Can the platform be deployed inside our own data centers?',
    aAr: 'نعم. ندعم النشر السيادي داخل خوادمك (Bare-Metal أو Kubernetes خاص) لضمان بقاء البيانات محصورة ضمن حدودك الجغرافية.',
    aEn: 'Yes. We support sovereign on-premise deployments inside your own data centers to keep data within your geographic boundaries.'
  },
  {
    qAr: 'كم يستغرق ربط البيانات قبل ظهور أولى الإشارات؟',
    qEn: 'How long does integration take before the first signals appear?',
    aAr: 'باستخدام الروابط الجاهزة، يمكن إتمام الربط الأولي واستيراد البيانات خلال وقت قصير لبدء ظهور أولى الإشارات وطابور الأولويات.',
    aEn: 'With pre-built connectors, initial ingestion and normalization complete quickly so the first signals and priority queue can surface.'
  },
  {
    qAr: 'هل تصلح المنصة لقطاعات غير مالية؟',
    qEn: 'Is the platform suitable for non-finance industries?',
    aAr: 'نعم. المنصة محايدة على مستوى القطاعات: تُستخدم في المقاولات والتصنيع واللوجستيات والتجزئة والخدمات، لأن محركاتها تشغيلية وليست محاسبية فقط.',
    aEn: 'Yes. The platform is industry-neutral: it serves contracting, manufacturing, logistics, retail, and services because its engines are operational, not finance-only.'
  }
];
