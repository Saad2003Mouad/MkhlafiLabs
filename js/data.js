// MIKHLAFI LABS — Enterprise Decision Intelligence Data Layer
// Follows Master Architecture & Vision Document standards:
// Deterministic data models, explicit evidence references, no fabricated certainty.

export const DATA = {
  brand: {
    name: "MIKHLAFI LABS",
    descriptorAr: "أنظمة · ذكاء · ابتكار",
    descriptorEn: "INTELLIGENCE · SYSTEMS · INNOVATION",
    statementAr: "نبني تقنيات تساعد المؤسسات على اتخاذ قرارات أفضل.",
    statementEn: "Building technology that helps businesses make better decisions.",
    founderAr: "سعد المخلافي (Saad Al-Mikhlafi)",
    founderEn: "Saad Al-Mikhlafi",
    year: "2026"
  },

  organizations: [
    {
      id: "org-01",
      nameAr: "مجموعة الأفق القابضة",
      nameEn: "Al-Ufuq Holding Group",
      branchAr: "المركز الرئيسي — الرياض",
      branchEn: "Headquarters — Riyadh",
      currency: "SAR",
      activeServices: 8
    },
    {
      id: "org-02",
      nameAr: "شركة الإنشاءات الخليجية الكبرى",
      nameEn: "Gulf Construction Co.",
      branchAr: "قطاع المشاريع الكبرى — جدة",
      branchEn: "Mega Projects Division — Jeddah",
      currency: "SAR",
      activeServices: 5
    },
    {
      id: "org-03",
      nameAr: "الشركة الوطنية للتوزيع وسلاسل الإمداد",
      nameEn: "National Supply & Logistics",
      branchAr: "المنطقة الشرقية — الخبر",
      branchEn: "Eastern Province — Khobar",
      currency: "SAR",
      activeServices: 6
    }
  ],

  // The 8 Core Solutions Catalog as specified in Master Architecture
  solutions: [
    {
      id: "financial-intelligence",
      num: "01",
      titleAr: "كشف الهدر المالي والاختلالات",
      titleEn: "Financial Leak Detection",
      outcomeAr: "كشف الفواتير المكررة، تباين الأسعار، وخروقات الميزانية قبل سدادها مع توثيق أدلة التدقيق.",
      outcomeEn: "Identify duplicate invoices, supplier pricing anomalies, and budget deviations prior to payout.",
      badge: "Core Engine",
      status: "active",
      icon: "file-text"
    },
    {
      id: "executive-decisions",
      num: "02",
      titleAr: "مركز القرارات التنفيذية",
      titleEn: "Executive Decision Center",
      outcomeAr: "شاشة موحدة لترتيب أولويات الانتباه اليومية وربط كل مشكلة بمسؤول وإجراء ونتيجة قابلة للقياس.",
      outcomeEn: "Unified executive work queue transforming signals into assigned actions with measurable impact.",
      badge: "Decision Layer",
      status: "active",
      icon: "check-circle"
    },
    {
      id: "risk-prediction",
      num: "03",
      titleAr: "التنبؤ بالمخاطر والإنذار المبكر",
      titleEn: "Predictive Risk Intelligence",
      outcomeAr: "رصد احتمالات نفاد المخزون، تعثر المشاريع، وضغوط السيولة قبل تحولها إلى أزمات تشغيلية.",
      outcomeEn: "Early warning signals for inventory stockouts, project slippages, and cash-flow bottlenecks.",
      badge: "Predictive",
      status: "active",
      icon: "alert-triangle"
    },
    {
      id: "project-intelligence",
      num: "04",
      titleAr: "ذكاء أداء المشاريع والإنشاءات",
      titleEn: "Project Performance Intelligence",
      outcomeAr: "مقارنة المخطط بالمنفذ الفعلي، كشف انحراف التكاليف والمستخلصات، وحماية هوامش الربحية.",
      outcomeEn: "Planned vs actual progress tracking, budget burn velocity, and contractor claim verification.",
      badge: "Operations",
      status: "active",
      icon: "trending-up"
    },
    {
      id: "supplier-intelligence",
      num: "05",
      titleAr: "ذكاء الموردين والمشتريات",
      titleEn: "Supplier Intelligence",
      outcomeAr: "بناء صورة موحدة لأداء المورد، كشف التبعية المفرطة، وتحليل موثوقية التسليم وجودة الأصناف.",
      outcomeEn: "Supplier scorecarding, unexplainable price creep detection, and delivery fulfillment monitoring.",
      badge: "Procurement",
      status: "active",
      icon: "truck"
    },
    {
      id: "customer-intelligence",
      num: "06",
      titleAr: "مراقبة العملاء ومخاطر الفقدان",
      titleEn: "Customer Intelligence",
      outcomeAr: "رصد تراجع حجم التعاملات وتأخر التجديدات ومؤشرات فقدان كبار العملاء بدقة قائمة على السجلات.",
      outcomeEn: "Detection of uncharacteristic purchasing volume declines and contract renewal hazards.",
      badge: "Retention",
      status: "active",
      icon: "users"
    },
    {
      id: "ai-assistant",
      num: "07",
      titleAr: "المساعد التنفيذي المؤسسي",
      titleEn: "AI Executive Assistant",
      outcomeAr: "إجابات فورية باللغة الطبيعية مستندة حصراً إلى بيانات المؤسسة المؤكدة مع روابط السجلات المصدرية.",
      outcomeEn: "Natural language query engine grounded strictly in verified corporate records with evidence citations.",
      badge: "Grounded AI",
      status: "active",
      icon: "message-square"
    },
    {
      id: "data-quality",
      num: "08",
      titleAr: "مراقبة جودة البيانات",
      titleEn: "Data Quality Intelligence",
      outcomeAr: "فحص تكامل الحقول الإلزامية وتكرار أسماء الموردين وتضارب العملات لحماية دقة القرارات.",
      outcomeEn: "Continuous audit for missing records, duplicate entities, currency mismatches, and data drift.",
      badge: "Data Governance",
      status: "active",
      icon: "shield"
    }
  ],

  // The 3 Subscription Packages Catalog (Free Trial / Limited Period with monthly billing)
  packages: [
    {
      id: "starter",
      nameAr: "الباقة الأساسية",
      nameEn: "Starter Package",
      subtitleAr: "حماية السيولة وكشف الهدر الفوري للمؤسسات الناشئة والمتوسطة",
      subtitleEn: "Immediate cash flow protection and leakage detection for growing enterprises",
      badgeAr: "3 محركات ذكاء",
      badgeEn: "3 Intelligence Engines",
      popular: false,
      trialLabelAr: "فترة تجريبية مجانية · محدودة",
      trialLabelEn: "Free Trial · Limited Time",
      billingNoteAr: "اشتراك شهري بعد انتهاء الفترة التجريبية",
      billingNoteEn: "Monthly subscription after trial period",
      servicesCount: 3,
      includedServices: [
        "financial-intelligence",
        "executive-decisions",
        "risk-prediction"
      ],
      featuresAr: [
        "3 محركات ذكاء أساسية مفعلة بالكامل",
        "ربط حتى نظامين من مصادر البيانات (ERP / Accounting)",
        "فحص أسبوعي تلقائي للفواتير المكررة والمصروفات",
        "مركز تنبيهات تنفيذية لـ 3 قياديين",
        "تقارير دورية للوفر المالي والمخاطر",
        "دعم فني استشاري عبر البريد المباشر"
      ],
      featuresEn: [
        "3 Core Intelligence Engines fully activated",
        "Connect up to 2 data sources (ERP / Accounting)",
        "Weekly automated scan for duplicate invoices & leaks",
        "Executive attention center for up to 3 leaders",
        "Periodic financial savings & risk reports",
        "Direct email technical & advisory support"
      ]
    },
    {
      id: "professional",
      nameAr: "الباقة المتقدمة",
      nameEn: "Professional Package",
      subtitleAr: "تحكم شامل بالمالية والمشاريع والموردين للشركات سريعة النمو",
      subtitleEn: "Comprehensive financial, project & procurement intelligence for scaling firms",
      badgeAr: "الأكثر طلباً · 5 محركات",
      badgeEn: "Most Popular · 5 Engines",
      popular: true,
      trialLabelAr: "فترة تجريبية مجانية · محدودة",
      trialLabelEn: "Free Trial · Limited Time",
      billingNoteAr: "اشتراك شهري بعد انتهاء الفترة التجريبية",
      billingNoteEn: "Monthly subscription after trial period",
      servicesCount: 5,
      includedServices: [
        "financial-intelligence",
        "executive-decisions",
        "risk-prediction",
        "project-intelligence",
        "supplier-intelligence"
      ],
      featuresAr: [
        "5 محركات ذكاء تشمل المالية والمشاريع والموردين",
        "ربط غير محدود بأنظمة ERP وقواعد البيانات",
        "تدقيق وتحليل حسابي مستمر ومباشر (Daily Audits)",
        "كشف تفاوت أسعار الموردين وانحراف العقود",
        "مراقبة هوامش ربحية المشاريع والمستخلصات",
        "10 حسابات تنفيذية مع صلاحيات متدرجة",
        "تنبيهات فورية للمخاطر الحرجة عبر البريد و SMS",
        "دعم فني ذو أولوية وجلسة مراجعة شهرية"
      ],
      featuresEn: [
        "5 Intelligence Engines covering finance, projects & procurement",
        "Unlimited connections to ERPs & data repositories",
        "Daily continuous automated audit routines",
        "Supplier price creep & contract variance tracking",
        "Project margin velocity & contractor claim verification",
        "10 executive accounts with granular permissions",
        "Instant critical alerts via email & SMS",
        "Priority technical support & monthly advisory session"
      ]
    },
    {
      id: "enterprise",
      nameAr: "باقة المؤسسات الشاملة",
      nameEn: "Enterprise Suite",
      subtitleAr: "المنظومة الاستخباراتية المتكاملة للمجموعات القابضة والكيانات الكبرى",
      subtitleEn: "The complete sovereign intelligence mesh for holding groups and enterprises",
      badgeAr: "المنظومة الكاملة · كافة الـ 8 محركات",
      badgeEn: "Complete Suite · All 8 Engines",
      popular: false,
      trialLabelAr: "فترة تجريبية مجانية · محدودة",
      trialLabelEn: "Free Trial · Limited Time",
      billingNoteAr: "اشتراك شهري بعد انتهاء الفترة التجريبية",
      billingNoteEn: "Monthly subscription after trial period",
      servicesCount: 8,
      includedServices: [
        "financial-intelligence",
        "executive-decisions",
        "risk-prediction",
        "project-intelligence",
        "supplier-intelligence",
        "customer-intelligence",
        "ai-assistant",
        "data-quality"
      ],
      featuresAr: [
        "كافة محركات MIKHLAFI LABS الثمانية بلا استثناء",
        "المساعد التنفيذي الذكي المدعوم بالأدلة (AI Assistant)",
        "مراقبة جودة البيانات الشاملة وحماية حوكمة السجلات",
        "رصد مخاطر تسرب العملاء والعقود الكبرى",
        "مرونة النشر: سحابة وطنية خاصة أو نشر محلي سيادي (On-Premise)",
        "حسابات قيادية غير محدودة وصلاحيات مخصصة بالكامل",
        "اتفاقية مستوى خدمة مؤسسية 99.9% (SLA)",
        "مدير حساب ومهندس ذكاء أعمال مخصص للمؤسسة",
        "تكامل مخصص مع أنظمة ERP والفوترة ZATCA"
      ],
      featuresEn: [
        "All 8 MIKHLAFI LABS engines with zero limitations",
        "Evidence-grounded AI Executive Assistant engine",
        "Comprehensive Data Quality Intelligence & governance audit",
        "Customer retention & large contract churn monitoring",
        "Deployment flexibility: Sovereign Cloud or full On-Premise",
        "Unlimited leadership accounts & custom role hierarchies",
        "Enterprise 99.9% SLA & mission-critical support",
        "Dedicated Account Executive & BI Systems Engineer",
        "Custom ERP bridges & ZATCA phase 2 integration"
      ]
    }
  ],

  // Business Challenges (Section 4.C in Prompt)
  challenges: [
    {
      num: "01",
      titleAr: "الهدر المالي والفواتير المشبوهة",
      titleEn: "Financial Leakage & Duplicate Expenses",
      descAr: "تمرير فواتير مكررة، تباين أسعار مشتريات للمواد المتطابقة، ومصروفات تتجاوز حدود الصلاحيات دون فحص دقيق.",
      descEn: "Repeated invoices slipping past AP review, price discrepancies for identical SKU items, and budget caps exceeded unnoticed."
    },
    {
      num: "02",
      titleAr: "المخاطر التشغيلية غير المتوقعة",
      titleEn: "Emerging Operational Risks",
      descAr: "تحول المشكلات البسيطة في سلاسل الإمداد ومستويات المخزون إلى أزمات توقف مفاجئة لغياب الإنذار المبكر.",
      descEn: "Supply chain disruptions and critical material stockouts turning into production emergencies due to lack of early signals."
    },
    {
      num: "03",
      titleAr: "تعثر المشاريع وتآكل هوامش الربح",
      titleEn: "Project Slippages & Cost Overruns",
      descAr: "تأخر الإنجاز الفعلي للمشاريع عن الجدول الزمني، وتراكم المستخلصات غير المحصلة مع صعوبة تفسير أسباب الانحراف.",
      descEn: "Projects drifting past contractual deadlines, margin erosion from undetected change orders, and stalled collections."
    },
    {
      num: "04",
      titleAr: "تذبذب أداء الموردين وغلاء الأسعار",
      titleEn: "Supplier Pricing & Fulfillment Variance",
      descAr: "ارتفاع تدريجي لأسعار بعض الموردين دون مبرر واضح، مع تأخر مواعيد التسليم وارتفاع نسب الإرجاع والتلف.",
      descEn: "Gradual supplier price creep without market justification, delivery schedule failures, and recurring receiving rejections."
    },
    {
      num: "05",
      titleAr: "إشارات فقدان العملاء الصامتة",
      titleEn: "Silent Customer Churn Signals",
      descAr: "تراجع وتيرة طلبات كبار العملاء أو تراكم شكاوى الخدمة دون تنبيه مبكر لفريق إدارة الحسابات قبل فوات الأوان.",
      descEn: "Subtle declines in major client order volumes and service frictions remaining invisible until contract non-renewal."
    },
    {
      num: "06",
      titleAr: "تشتت البيانات بين أنظمة متعددة",
      titleEn: "Fragmented & Siloed Business Data",
      descAr: "توزع المعاملات بين ERP والمشتريات وجداول Excel والبريد دون طبقة استخباراتية مركزية تجمع الصورة وتثبت الأدلة.",
      descEn: "Corporate data locked in disconnected ERP modules, spreadsheets, and sub-ledgers with zero single-source evidence layer."
    }
  ],

  // Platform Flow Steps (Section 4.D in Prompt)
  architectureFlow: [
    {
      index: "01",
      titleAr: "الأنظمة المؤسسية القائمة",
      titleEn: "Existing Business Systems",
      descAr: "الربط الآمن مع ERP، قواعد البيانات، أو استيراد ملفات Excel/CSV المعتمدة دون الحاجة لاستبدال برمجياتك.",
      chips: ["SAP", "Oracle ERP", "Odoo", "Microsoft Dynamics", "Excel / CSV"]
    },
    {
      index: "02",
      titleAr: "طبقة المعايرة وجودة البيانات",
      titleEn: "Data Normalization Layer",
      descAr: "توحيد مسميات الموردين، تنظيف الحقول، مطابقة العملات، وفحص سلامة السجلات الحسابية.",
      chips: ["Entity Resolution", "Currency Normalization", "Rule Validation", "Audit Trails"]
    },
    {
      index: "03",
      titleAr: "محركات الذكاء والتحليل الحتمي",
      titleEn: "Deterministic Intelligence Engines",
      descAr: "تطبيق الخوارزميات الحسابية لكشف الهدر والتنبؤ بالمخاطر، مع تمييز الحقائق المؤكدة عن الفرضيات الإحصائية.",
      chips: ["Anomaly Detection", "Risk Probability", "Benchmark Analysis", "Variance Engines"]
    },
    {
      index: "04",
      titleAr: "القرارات التنفيذية والإجراءات",
      titleEn: "Executive Decisions & Actions",
      descAr: "عرض الأولويات في مركز القرارات، مراجعة الأدلة المصدرية، وتكليف المسؤولين ومتابعة الأثر المالي الفعلي.",
      chips: ["Executive Decisions", "Assigned Owners", "Audit Logging", "Verified Savings"]
    }
  ],

  // Universal Business Sectors (Engineered to adapt to ANY business model or industry)
  industries: [
    {
      id: "universal-commerce",
      titleAr: "التجارة والتجزئة وسلاسل التوريد",
      titleEn: "Retail, Wholesale & Supply Chains",
      descAr: "مراقبة فورية لفروقات أسعار التوريد، وهوامش الربح لكل خط منتجات، وتجنب الهدر في المخزون أو الفواتير.",
      descEn: "Real-time auditing of vendor unit price variations, product gross margins, and inventory carrying leaks.",
      pointsAr: ["كشف تفاوت أسعار الموردين", "مراقبة هوامش البيع والشراء", "ضبط فواتير النقل والتخزين"],
      pointsEn: ["Supplier price discrepancy detection", "Gross & net margin leak tracking", "Logistics & freight invoice auditing"]
    },
    {
      id: "universal-services",
      titleAr: "الخدمات والاستشارات والتقنية",
      titleEn: "Services, Advisory & Technology",
      descAr: "ضبط تكاليف العقود الاستشارية والبرمجيات والمصروفات الإدارية، ومتابعة ربحية المشاريع وساعات التنفيذ.",
      descEn: "Cost governance over consultancies, SaaS subscriptions, discretionary OPEX, and engagement-level profitability.",
      pointsAr: ["كشف تكرار الاشتراكات والبرمجيات", "مراقبة المصروفات خارج الصلاحيات", "ضبط تكلفة العقود والمستشارين"],
      pointsEn: ["Recurring SaaS & software redundancy audit", "Unauthorized out-of-policy OPEX detection", "External advisory contract compliance"]
    },
    {
      id: "universal-construction",
      titleAr: "المقاولات، الإنشاءات والتطوير",
      titleEn: "Contracting, Projects & EPC",
      descAr: "حماية هوامش المشاريع من تعثر الجداول الزمنية، وتتبع المستخلصات وأوامر التغيير وغرامات التأخير.",
      descEn: "Protecting project margins from critical path slips, unbilled progress certificates, change orders, and delay penalties.",
      pointsAr: ["ربط تأخر الموردين بتكلفة المشروع", "تتبع المستخلصات غير المحصلة", "مراقبة تجاوزات ميزانية المواد"],
      pointsEn: ["Connecting vendor delays to project cost impact", "Uncollected progress certificate tracking", "Material budget overrun alerts"]
    },
    {
      id: "universal-manufacturing",
      titleAr: "التصنيع والإنتاج والتشغيل",
      titleEn: "Manufacturing & Industrial Operations",
      descAr: "تحليل كفاءة الإنفاق على المواد الخام ومعدلات الهدر في التشغيل، وموثوقية عقود الصيانة والتوريد.",
      descEn: "Analyzing raw material procurement variances, operational scrap rates, and maintenance contract SLAs.",
      pointsAr: ["مقارنة أسعار المواد الخام بملحق العقد", "مراقبة عقود الصيانة وقطع الغيار", "الإنذار المبكر لنقص المدخلات"],
      pointsEn: ["Raw material contract price indexing", "Spare parts & maintenance SLA control", "Input stockout & supply chain early warnings"]
    },
    {
      id: "universal-institutional",
      titleAr: "الرعاية الصحية، التعليم والمؤسسات",
      titleEn: "Healthcare, Education & Institutions",
      descAr: "إدارة العقود التوريدية الطبية والتعليمية عالية القيمة، والامتثال الصارم للوائح المالية والصلاحيات.",
      descEn: "Managing high-value institutional vendor contracts, procurement compliance, and multi-tier delegation of authority.",
      pointsAr: ["تدقيق أوامر الشراء المجمعة", "مطابقة فواتير الأجهزة والأدوية", "سجل تدقيق كامل للامتثال المالي"],
      pointsEn: ["Consolidated purchase order reconciliation", "Equipment & consumables billing verification", "Full immutable financial audit trail"]
    },
    {
      id: "universal-holding",
      titleAr: "المجموعات القابضة ومتعددة الأنشطة",
      titleEn: "Conglomerates & Diversified Groups",
      descAr: "لوحة تحكم تنفيذية موحدة للرئيس التنفيذي ومجلس الإدارة تجمع بيانات كافة الشركات الشقيقة والفروع التابعة.",
      descEn: "Unified executive cockpit for Group CEOs and Boards, consolidating performance across diverse subsidiaries.",
      pointsAr: ["مقارنة أداء الفروع والشركات التابعة", "عزل تام لصلاحيات وبيانات كل كيان", "رصد الهدر المالي المتقاطع بين الكيانات"],
      pointsEn: ["Cross-subsidiary efficiency benchmarking", "Strict tenant data & permission isolation", "Cross-entity leak & intercompany flow monitoring"]
    }
  ],

  // Deployment Options (Section 4.H & 10 in Docs)
  deploymentOptions: [
    {
      id: "cloud",
      titleAr: "السحابة المؤسسية المدارة",
      titleEn: "Managed Enterprise Cloud",
      descAr: "نشر سحابي سريع وعالي الأمان مع عزل كامل لبيانات المؤسسة، وتحديثات دورية متواصلة ودعم فني متقدم.",
      descEn: "Rapid, highly secure cloud deployment with dedicated tenant isolation, continuous updates, and SLA support.",
      featuresAr: [
        "عزل كامل للمستأجرين وتشفير متقدم",
        "نسخ احتياطي فوري واستعادة سريعة",
        "تحديثات مستمرة لمحركات الذكاء",
        "تكامل مباشر مع واجهات API المعتمدة"
      ],
      featuresEn: [
        "Complete multi-tenant isolation & encryption at rest/transit",
        "Automated continuous backup and disaster recovery",
        "Continuous zero-downtime intelligence engine updates",
        "Standardized REST API connectors for modern ERPs"
      ],
      tagAr: "النشر الأسرع",
      tagEn: "Fastest Rollout",
      featured: false
    },
    {
      id: "on-premise",
      titleAr: "النشر المحلي السيادي (On-Premise)",
      titleEn: "Sovereign On-Premise",
      descAr: "تثبيت المنصة بالكامل داخل بيئة خوادم العميل أو السحابة الخاصة، لضمان السيطرة التامة على البيانات الحساسة.",
      descEn: "Full deployment inside your private datacenter or private cloud, providing complete sovereignty over sensitive records.",
      featuresAr: [
        "بقاء البيانات بنسبة 100% داخل شبكة العميل",
        "دعم نماذج الذكاء الاصطناعي المحلية أو BYOK",
        "صلاحيات دقيقة وتوافق مع المتطلبات التنظيمية",
        "حزمة ترقية وتثبيت دورية معتمدة"
      ],
      featuresEn: [
        "100% data residency within customer network perimeter",
        "Local LLM inference or Bring-Your-Own-Key (BYOK) support",
        "Granular RBAC aligned with enterprise compliance standards",
        "Air-gapped upgrade packages and certified patch cycles"
      ],
      tagAr: "أقصى درجات الخصوصية",
      tagEn: "Maximum Sovereignty",
      featured: true
    },
    {
      id: "hybrid",
      titleAr: "النموذج الهجين (Hybrid Architecture)",
      titleEn: "Hybrid Deployment",
      descAr: "معالجة البيانات الحساسة وتطبيق القواعد محلياً مع الاستفادة من السحابة للتقارير والنسخ الموسعة وفق سياسة واضحة.",
      descEn: "Sensitive records and rule execution remain on-premise, while reporting and elastic compute burst to private cloud.",
      featuresAr: [
        "معالجة قواعد التحقق محلياً",
        "توثيق واضح لما يغادر الشبكة ولماذا",
        "مرونة عالية للتوسع الإقليمي",
        "متوافق مع المنظمات ذات الفروع المتفرقة"
      ],
      featuresEn: [
        "Deterministic audit engines run inside perimeter",
        "Full transparent disclosure of outbound payloads",
        "High elasticity for multi-region business units",
        "Engineered for distributed holdings & branch networks"
      ],
      tagAr: "مرونة متوازنة",
      tagEn: "Balanced Architecture",
      featured: false
    }
  ],

  // Executive Overview KPIs (Section 5 in Prompt)
  kpis: [
    {
      id: "anomalies",
      titleAr: "الهدر المالي المرصود",
      titleEn: "Flagged Financial Leaks",
      valAr: "482,500 ر.س",
      valEn: "SAR 482,500",
      countAr: "14 حالة قيد التحقق",
      countEn: "14 cases pending audit",
      trend: "warning",
      trendTextAr: "+3 حالات هذا الأسبوع",
      trendTextEn: "+3 cases this week"
    },
    {
      id: "variance",
      titleAr: "انحراف الميزانية التشغيلية",
      titleEn: "Operating Budget Variance",
      valAr: "+6.4%",
      valEn: "+6.4%",
      countAr: "3 مشاريع متجاوزة",
      countEn: "3 over-budget projects",
      trend: "danger",
      trendTextAr: "تجاوز السقف المحدد",
      trendTextEn: "Above baseline threshold"
    },
    {
      id: "risks",
      titleAr: "المخاطر المفتوحة ذات الأولوية",
      titleEn: "High-Priority Risks",
      valAr: "5",
      valEn: "5",
      countAr: "2 حرجة · 3 مرتفعة",
      countEn: "2 Critical · 3 High",
      trend: "danger",
      trendTextAr: "تتطلب قراراً فورياً",
      trendTextEn: "Action required today"
    },
    {
      id: "projects",
      titleAr: "مشاريع تحت المراقبة",
      titleEn: "Projects Under Watch",
      valAr: "2 من أصل 8",
      valEn: "2 of 8",
      countAr: "انحراف في الجدول الزمني",
      countEn: "Schedule slippage > 12%",
      trend: "warning",
      trendTextAr: "مشروع برج الأفق 2",
      trendTextEn: "Horizon Tower Project"
    },
    {
      id: "suppliers",
      titleAr: "تفاوت أسعار الموردين",
      titleEn: "Supplier Discrepancies",
      valAr: "4 موردين",
      valEn: "4 Vendors",
      countAr: "زيادة سعرية غير مبررة",
      countEn: "Unexplained price hike",
      trend: "warning",
      trendTextAr: "فروقات تصل إلى 18%",
      trendTextEn: "Discrepancy up to 18%"
    },
    {
      id: "dataHealth",
      titleAr: "مؤشر موثوقية البيانات",
      titleEn: "Data Health Score",
      valAr: "94.8%",
      valEn: "94.8%",
      countAr: "4 مصادر متزامنة",
      countEn: "4 synced connectors",
      trend: "positive",
      trendTextAr: "آخر تحديث: قبل 12 دقيقة",
      trendTextEn: "Updated 12 mins ago"
    }
  ],

  // "Needs Your Attention" - Prioritized Work Queue (Section 5 in Prompt)
  attentionQueue: [
    {
      id: "ATT-101",
      titleAr: "اشتباه فاتورة مكررة بمبلغ 128,400 ر.س — شركة التوريدات الهندسية",
      titleEn: "Duplicate Invoice Suspect (SAR 128,400) — Engineering Supplies Co.",
      severity: "critical",
      severityAr: "حرج",
      severityEn: "Critical",
      impactAr: "128,400 ر.س (وفر مؤكد حال الإلغاء)",
      impactEn: "SAR 128,400 potential savings",
      reasonAr: "تطابق المبلغ وتاريخ الاستحقاق والبنود مع الفاتورة رقم INV-8841 المسددة مسبقاً قبل 14 يوماً.",
      reasonEn: "Identical amount, due date and line items matching paid invoice INV-8841 from 14 days ago.",
      ownerAr: "أحمد السليمان (المدير المالي)",
      ownerEn: "Ahmed Al-Sulaiman (CFO)",
      dueDate: "اليوم 14:00",
      status: "pending",
      statusAr: "قيد المراجعة",
      statusEn: "Pending Review",
      evidenceId: "EV-INV-09"
    },
    {
      id: "ATT-102",
      titleAr: "ارتفاع سعر توريد حديد التسليح بنسبة 16.5% عن السعر المعتمد في العقد",
      titleEn: "Rebar Supply Price Hike +16.5% Above Contract Agreed Baseline",
      severity: "high",
      severityAr: "مرتفع",
      severityEn: "High",
      impactAr: "84,000 ر.س انحراف تكلفة",
      impactEn: "SAR 84,000 cost deviation",
      reasonAr: "سعر الطن المسجل 3,150 ر.س بينما ملحق العقد الموقع رقم CTR-2026/04 ينص على 2,705 ر.س للطن.",
      reasonEn: "Invoiced ton at SAR 3,150 vs signed contract addendum CTR-2026/04 fixed at SAR 2,705.",
      ownerAr: "خالد المنصور (مدير المشتريات)",
      ownerEn: "Khaled Al-Mansour (Procurement)",
      dueDate: "غداً 11:00",
      status: "assigned",
      statusAr: "مكلف للمراجعة",
      statusEn: "Assigned",
      evidenceId: "EV-SUP-04"
    },
    {
      id: "ATT-103",
      titleAr: "خطر تأخر استلام المحولات الكهربائية لمشروع الواحة سيتسبب بغرامة تأخير",
      titleEn: "Transformer Delivery Delay Risk on Oasis Project Triggering Penalty",
      severity: "critical",
      severityAr: "حرج",
      severityEn: "Critical",
      impactAr: "150,000 ر.س غرامة محتملة",
      impactEn: "SAR 150,000 penalty exposure",
      reasonAr: "تأخر الشحن من المورد لمدة 18 يوماً، مما يهدد المسار الحرج للمرحلة الكهروميكانيكية.",
      reasonEn: "18-day factory dispatch delay directly threatening electromechanical critical path milestone.",
      ownerAr: "م. فهد العتيبي (مدير المشروع)",
      ownerEn: "Eng. Fahad Al-Otaibi (Project Lead)",
      dueDate: "14 أكتوبر 2026",
      status: "pending",
      statusAr: "قيد المراجعة",
      statusEn: "Pending Review",
      evidenceId: "EV-PRJ-02"
    },
    {
      id: "ATT-104",
      titleAr: "سداد مصروف استشاري خارج حدود صلاحيات الاعتماد المعتمدة في اللائحة",
      titleEn: "Consulting Expense Approval Exceeding Defined Delegation Threshold",
      severity: "medium",
      severityAr: "متوسط",
      severityEn: "Medium",
      impactAr: "45,000 ر.س",
      impactEn: "SAR 45,000 policy violation",
      reasonAr: "تم إصدار أمر الشراء بدون توقيع المدير التنفيذي طبقاً للائحة الصلاحيات المالية للمبالغ > 30,000 ر.س.",
      reasonEn: "PO approved without CEO counter-signature violating financial threshold policy for orders > 30k.",
      ownerAr: "سارة النعيمي (مسؤولة الامتثال)",
      ownerEn: "Sarah Al-Nuaimi (Compliance)",
      dueDate: "15 أكتوبر 2026",
      status: "in-progress",
      statusAr: "جارِ التحقق",
      statusEn: "In Progress",
      evidenceId: "EV-POL-01"
    }
  ],

  // Financial Anomalies Detailed Records (Section 7 in Prompt)
  financialAnomalies: [
    {
      id: "FAN-2026-081",
      vendorAr: "شركة التوريدات الهندسية الحديثة",
      vendorEn: "Modern Engineering Supplies Co.",
      typeAr: "اشتباه فاتورة مكررة",
      typeEn: "Duplicate Invoice Candidate",
      amount: "128,400 ر.س",
      amountNum: 128400,
      invNum: "INV-8912",
      date: "2026-10-09",
      ruleAr: "خوارزمية التطابق الثلاثي (المورد + القيمة + بنود التسليم)",
      ruleEn: "Three-way Similarity Match (Vendor + Amount + Line Items)",
      baselineAr: "الفاتورة المسددة مسبقاً رقم INV-8841 بتاريخ 2026-09-25",
      baselineEn: "Previously paid invoice INV-8841 dated 2026-09-25",
      confidence: "94.8%",
      status: "flagged",
      evidenceDoc: "PO-4091 / Delivery Note DN-8812"
    },
    {
      id: "FAN-2026-079",
      vendorAr: "مصنع اليمامة لمواد البناء",
      vendorEn: "Al-Yamama Building Materials Factory",
      typeAr: "تفاوت سعر المادة عن العقد",
      typeEn: "Contract Unit Price Variance",
      amount: "84,000 ر.س (انحراف)",
      amountNum: 84000,
      invNum: "INV-6652",
      date: "2026-10-08",
      ruleAr: "مقارنة السعر الفعلي بملحق العقد CTR-2026/04",
      ruleEn: "Variance Check against Contract Addendum CTR-2026/04",
      baselineAr: "السعر التعاقدي المعتمد: 2,705 ر.س/طن مقابل 3,150 ر.س/طن بالفاتورة",
      baselineEn: "Contract rate SAR 2,705/ton vs Invoiced rate SAR 3,150/ton",
      confidence: "99.1%",
      status: "flagged",
      evidenceDoc: "Contract CTR-2026/04 / PO-5510"
    },
    {
      id: "FAN-2026-074",
      vendorAr: "شركة التقنيات السحابية المتقدمة",
      vendorEn: "Advanced Cloud Technologies",
      typeAr: "تكرار اشتراك برمجي شهري",
      typeEn: "Duplicate SaaS License Renewal",
      amount: "18,250 ر.س",
      amountNum: 18250,
      invNum: "INV-ACT-114",
      date: "2026-10-04",
      ruleAr: "فحص تراخيص البرمجيات المتداخلة بين الإدارات",
      ruleEn: "Inter-department SaaS Multi-licensing Overlap Rule",
      baselineAr: "تم سداد نفس الاشتراك من ميزانية تقنية المعلومات مسبقاً",
      baselineEn: "Identical tier subscription already active in IT operating budget",
      confidence: "88.4%",
      status: "investigating",
      evidenceDoc: "Credit Card Billing Log & AP Record"
    },
    {
      id: "FAN-2026-068",
      vendorAr: "مؤسسة النقل السريع للخدمات اللوجستية",
      vendorEn: "Rapid Logistics & Transport",
      typeAr: "رسوم نقل غير مجدولة بدون أمر شراء",
      typeEn: "Unscheduled Freight Fees Without PO",
      amount: "32,600 ر.س",
      amountNum: 32600,
      invNum: "INV-RL-901",
      date: "2026-10-02",
      ruleAr: "قاعدة مطابقة الفاتورة بأمر شراء ساري (No PO, No Pay)",
      ruleEn: "Mandatory PO Association Enforcement Rule",
      baselineAr: "لا يوجد أمر شراء صادر ومطابق لهذه الشحنة",
      baselineEn: "Zero matching PO record found in Procurement database",
      confidence: "100%",
      status: "flagged",
      evidenceDoc: "Waybill WB-9921 without ERP Link"
    }
  ],

  // Risk Register Items (Section 8 in Prompt)
  riskRegister: [
    {
      id: "RSK-01",
      categoryAr: "مخاطر سلاسل الإمداد",
      categoryEn: "Supply Chain",
      titleAr: "نفاد وشيك لمادة السيليكون العازل لمشروع الواحة",
      titleEn: "Imminent Sealant Stockout at Oasis Construction Project",
      severity: "critical",
      horizonAr: "خلال 9 أيام",
      horizonEn: "Within 9 days",
      confidence: "91%",
      mitigationAr: "إصدار أمر توريد فوري من المورد البديل المعتمد (شركة السواحل).",
      mitigationEn: "Issue rapid PO to secondary certified supplier (Al-Sawahel Co)."
    },
    {
      id: "RSK-02",
      categoryAr: "مخاطر تجاوز الميزانية",
      categoryEn: "Cost Overrun",
      titleAr: "احتمال تجاوز ميزانية بند الكهروميكانيك بنسبة 14%",
      titleEn: "Projected 14% Cost Overrun on Electromechanical Sub-package",
      severity: "high",
      horizonAr: "نهاية الربع الرابع",
      horizonEn: "End of Q4",
      confidence: "86%",
      mitigationAr: "إعادة التفاوض على أوامر التغيير غير المعتمدة مع المقاول الرئيسي.",
      mitigationEn: "Hold change order review board with prime contractor before approval."
    },
    {
      id: "RSK-03",
      categoryAr: "مخاطر التدفق النقدي",
      categoryEn: "Cash Flow",
      titleAr: "تأخر تحصيل مستخلصات حكومية بقيمة 1.8 مليون ر.س",
      titleEn: "Delayed Collection of SAR 1.8M Governmental Progress Milestone",
      severity: "high",
      horizonAr: "خلال 20 يوماً",
      horizonEn: "Within 20 days",
      confidence: "94%",
      mitigationAr: "تفعيل التسهيل الائتماني الدوار لتغطية رواتب المقاولين من الباطن.",
      mitigationEn: "Activate revolving standby facility to cover subcontractor payroll."
    }
  ],

  // Project Intelligence (Section 9 in Prompt)
  projects: [
    {
      id: "PRJ-01",
      nameAr: "مشروع برج الأفق الإداري — الرياض",
      nameEn: "Horizon Administrative Tower — Riyadh",
      plannedProgress: "68%",
      actualProgress: "54%",
      budgetAllocated: "42,000,000 ر.س",
      budgetSpent: "31,800,000 ر.س",
      status: "behind",
      varianceTextAr: "تأخر 14% في مسار الواجهات الزجاجية",
      varianceTextEn: "14% delay on curtain-wall milestone"
    },
    {
      id: "PRJ-02",
      nameAr: "مجمع مستودعات الخرج اللوجستي",
      nameEn: "Al-Kharj Logistics Warehouse Park",
      plannedProgress: "85%",
      actualProgress: "82%",
      budgetAllocated: "18,500,000 ر.س",
      budgetSpent: "14,900,000 ر.س",
      status: "on-track",
      varianceTextAr: "ضمن الحدود المسموحة (انحراف 3% فقط)",
      varianceTextEn: "Within nominal bounds (3% variance)"
    },
    {
      id: "PRJ-03",
      nameAr: "تطوير مجمع الظهران السكني",
      nameEn: "Dhahran Residential Community Phase 2",
      plannedProgress: "40%",
      actualProgress: "41%",
      budgetAllocated: "26,000,000 ر.س",
      budgetSpent: "10,200,000 ر.س",
      status: "ahead",
      varianceTextAr: "متقدم عن الجدول بيومين وتوفير 2% في التكاليف",
      varianceTextEn: "2 days ahead with 2% cost savings"
    }
  ],

  // Data Quality Connectors (Section 12 in Prompt)
  connectors: [
    {
      name: "SAP S/4HANA (Financials & GL)",
      type: "ERP Connector",
      status: "connected",
      statusAr: "متصل ويعمل",
      statusEn: "Healthy & Synced",
      lastSyncAr: "منذ 14 دقيقة",
      lastSyncEn: "14 mins ago",
      recordsCount: "428,910 سجل"
    },
    {
      name: "Oracle Cloud Procurement",
      type: "Purchasing Connector",
      status: "connected",
      statusAr: "متصل ويعمل",
      statusEn: "Healthy & Synced",
      lastSyncAr: "منذ 28 دقيقة",
      lastSyncEn: "28 mins ago",
      recordsCount: "194,520 سجل"
    },
    {
      name: "Al-Rajhi Corporate Banking Feed",
      type: "Bank Statement API",
      status: "connected",
      statusAr: "متصل ويعمل",
      statusEn: "Healthy & Synced",
      lastSyncAr: "منذ 5 دقائق",
      lastSyncEn: "5 mins ago",
      recordsCount: "82,400 حركة"
    },
    {
      name: "Odoo Multi-branch Inventory",
      type: "Warehouse Connector",
      status: "syncing",
      statusAr: "جارِ التحديث",
      statusEn: "Sync in progress",
      lastSyncAr: "الآن",
      lastSyncEn: "Just now",
      recordsCount: "51,300 سجل"
    }
  ],

  // Grounded AI Assistant Pre-canned Responses (Section 11 in Prompt)
  // Grounded strictly in database facts, distinguishing assertions from recommendations
  aiAssistantResponses: {
    "default": {
      ar: "بناءً على السجلات المؤكدة في قاعدة البيانات حتى تاريخ اليوم: يرجى تحديد الاستعلام المطلوب للاطلاع على الأدلة والسجلات المصدرية المرتبطة.",
      en: "Based on verified database records as of today: Please specify your inquiry to review linked source documents and evidence."
    },
    "anomalies": {
      ar: "رصد النظام 14 حالة هدر مالي مشتبه بها بإجمالي 482,500 ر.س. أهمها حالياً: الفاتورة رقم INV-8912 لشركة التوريدات الهندسية بقيمة 128,400 ر.س بسبب تطابقها مع فاتورة مسددة مسبقاً (INV-8841). نوصي بمراجعة المستند المصدري واعتماد إيقاف الصرف.",
      en: "The system flagged 14 suspicious financial transactions totaling SAR 482,500. Most pressing: Invoice INV-8912 (Engineering Supplies Co., SAR 128,400) matching previously paid invoice INV-8841. Recommendation: Review source delivery notes and freeze payment authorization.",
      citations: ["FAN-2026-081", "INV-8912", "PO-4091", "INV-8841"]
    },
    "projects": {
      ar: "أهم المشاريع المعرضة لتجاوز الميزانية والجدول الزمني هو 'مشروع برج الأفق الإداري'. نسبة الإنجاز الفعلي 54% مقارنة بـ 68% مخطط، ومعدل استهلاك الميزانية بلغ 75.7% نتيجة تأخر توريدات الواجهات الزجاجية من المورد الخارجي.",
      en: "The project most exposed to schedule and cost slippage is 'Horizon Administrative Tower'. Actual completion is 54% vs 68% planned, with budget burn at 75.7% due to external facade supplier lead time issues.",
      citations: ["PRJ-01", "RSK-02", "CTR-FACADE-08"]
    },
    "suppliers": {
      ar: "تم رصد تفاوت سعري غير مبرر لدى 'مصنع اليمامة لمواد البناء' في الفاتورة INV-6652، حيث تم احتساب سعر طن حديد التسليح بـ 3,150 ر.س متجاوزاً السعر التعاقدي المعتمد (2,705 ر.س/طن) بفارق 84,000 ر.س. مسودة العقد لا تتضمن بند تعديل أسعار للشحنة الحالية.",
      en: "An unapproved price hike was flagged for 'Al-Yamama Building Materials Factory' on invoice INV-6652. Rebar was billed at SAR 3,150/ton vs contract rate SAR 2,705/ton (SAR 84,000 variance). The signed contract contains no escalation clause for this period.",
      citations: ["FAN-2026-079", "INV-6652", "CTR-2026/04"]
    }
  }
};
