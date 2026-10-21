// MIKHLAFI LABS — Enterprise Services & Engines Master Knowledge Base
// Comprehensive definitions, deterministic algorithms, and telemetry for the 8 engines

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

export interface ServiceFaq {
  qAr: string;
  qEn: string;
  aAr: string;
  aEn: string;
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
        val: 'RULE-BASED',
        labelAr: 'طريقة كشف المخالفات المالية',
        labelEn: 'Deterministic Detection Method',
        noteAr: 'مطابقة قواعدية ثابتة لا تخمين إحصائي',
        noteEn: 'Fixed rule matching rather than probabilistic guessing'
      },
      {
        val: 'READ-ONLY',
        labelAr: 'نمط الوصول إلى أنظمة ERP',
        labelEn: 'Read-Only Source Access',
        noteAr: 'لا كتابة أو تعديل على قواعد بيانات الإنتاج',
        noteEn: 'No writes or modifications to production databases'
      },
      {
        val: 'LEDGER-LINK',
        labelAr: 'إسناد كل ملاحظة إلى مصدرها',
        labelEn: 'Traceability to Source Record',
        noteAr: 'كل مخالفة مرتبطة برقم القيد والفاتورة الأصلية',
        noteEn: 'Every finding linked to its original voucher and invoice ID'
      }
    ],
    executiveSummaryAr:
      'في المؤسسات الكبرى تتراكم أخطاء بشرية في فواتير المشتريات، وتكرار أوامر الصرف عبر فروع متباعدة، وتجاوزات أسعار بنود العقود. تعمل المنظومة كحارس مالي استباقي يمنع خروج الريال قبل التحقق من استحقاقه النظامي.',
    executiveSummaryEn:
      'Enterprise conglomerates accumulate duplicate invoices, split purchase requisitions, and vendor pricing drift across dispersed entities. MIKHLAFI LABS acts as an autonomous pre-disbursement barrier that validates entitlement before capital leaves the organization.',
    painPoints: [
      {
        num: '01',
        titleAr: 'الفواتير المكررة وتجزئة طلبات الشراء',
        titleEn: 'Duplicate Invoices & Split Requisitions',
        currentFailureAr: 'تكرار صرف فواتير لنفس الخدمة بأرقام مرجعية مختلفة أو تجزئة الفاتورة إلى مبالغ أقل من 50,000 ريال لتجاوز لجان الاعتماد.',
        currentFailureEn: 'Duplicate vendor billing under altered reference numbers, or dividing purchase orders below approval thresholds.',
        mikhlafiSolutionAr: 'مطابقة حتمية متعددة المعايير (Fuzzy Hash & Value Matching) للمورد ورقم الحساب والمبلغ وتاريخ الخدمة لمنع الصرف فوراً.',
        mikhlafiSolutionEn: 'Deterministic fuzzy-hash matching across vendor IBAN, timestamp, line-item quantities, and approval matrix.',
        impactAr: 'منع الصرف المزدوج فور تطابق الفاتورة مع سجل مصروف سابق',
        impactEn: 'Blocks double disbursement the moment an invoice matches a previously settled record'
      },
      {
        num: '02',
        titleAr: 'تباين أسعار الموردين للسلع المتطابقة',
        titleEn: 'Cross-Entity Vendor Price Divergence',
        currentFailureAr: 'شراء نفس المادة أو المعدة بواسطة فرعين تابعين بأسعار متفاوتة لصالح المورد دون وجود مقارنة مركزية.',
        currentFailureEn: 'Subsidiaries purchasing identical items at diverging price points without a central comparison.',
        mikhlafiSolutionAr: 'رادار مركزي لمقارنة أسعار العقود وأسعار التوريد الفعلي عبر كافة الشركات التابعة وتحديد السعر المرجعي الأقل.',
        mikhlafiSolutionEn: 'Centralized catalog rate benchmarking indexing line-item prices across all company entities instantly.',
        impactAr: 'تحديد السعر المرجعي الأقل عبر كافة الشركات التابعة قبل إصدار أمر الشراء',
        impactEn: 'Surfaces the lowest prevailing rate across all subsidiaries before a PO is issued'
      },
      {
        num: '03',
        titleAr: 'المعالم المنجزة غير المفوترة وتأخر التحصيل',
        titleEn: 'Unbilled Milestones & Stalled Collections',
        currentFailureAr: 'اكتمال مراحل تعاقدية لدى العملاء دون إصدار فواتير أو مطالبات مالية سريعة مما يؤدي لتجميد السيولة وتآكل التدفق النقدي.',
        currentFailureEn: 'Completed operational deliverables sitting unbilled for months, choking operational liquidity.',
        mikhlafiSolutionAr: 'ربط مباشر بين إنجاز الموقع/الخدمة ونظام الفوترة الإلكترونية مع تنبيهات فورية للمسؤولين عن إصدار المطالبات.',
        mikhlafiSolutionEn: 'Automated bridge linking operational delivery signs directly with ZATCA billing triggers.',
        impactAr: 'ربط المعالم المنجزة بالفوترة مع تنبيه فوري عند عدم إصدار المطالبة',
        impactEn: 'Links completed milestones to billing with an alert when no claim is raised'
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
        aAr: 'يمكن البدء بتحميل ملف القيود (CSV/Excel) لفحصه، أو ربط المنظومة بنظام ERP عبر واجهة قراءة فقط وفق الجدول الذي يتفق عليه فريقا التنفيذ.',
        aEn: 'You can start by uploading a ledger export (CSV/Excel), or connect the engine to your ERP through a read-only API on a schedule agreed with your team.'
      },
      {
        qAr: 'أين تُحفظ بياناتنا المالية وهل تتوافق مع نظام حماية البيانات الشخصية السعودي (PDPL)؟',
        qEn: 'Where is financial data hosted and is it compliant with Saudi PDPL?',
        aAr: 'تُستضاف كافة البيانات داخل مراكز بيانات سيادية معتمدة داخل المملكة العربية السعودية، بما يتوافق مع ضوابط الأمن السيبراني (NCA) وإرشادات حماية البيانات (SDAIA/PDPL).',
        aEn: 'All data resides in sovereign data centers within Saudi Arabia, aligned with NCA controls and SDAIA/PDPL guidelines.'
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
    taglineEn: 'Transform report noise into prioritized operational directives with assigned ownership',
    heroDescriptionAr:
      'محرك ذكي يجمع الإشارات الحيوية من كافة أقسام المؤسسة، ويقوم بفرزها وترتيبها حسب الأولوية المالية والمخاطر المترتبة، لتزويد الرئيس التنفيذي والإدارة العليا بقرارات واضحة محددة بالتكلفة والمردود والمكلف بالتنفيذ.',
    heroDescriptionEn:
      'Translates sprawling departmental reports into a single, ranked executive queue. Every decision is mathematically evaluated with expected financial impact, execution complexity, and clear accountability assignment.',
    heroMetrics: [
      {
        val: 'SCORED-MODEL',
        labelAr: 'أسلوب ترتيب القرارات',
        labelEn: 'Deterministic Ranking Model',
        noteAr: 'كل قرار يُقيَّم بمعايير حسابية معلنة',
        noteEn: 'Every directive scored by declared mathematical criteria'
      },
      {
        val: 'OWNER-BOUND',
        labelAr: 'إسناد كل توجيه لمنفّذه',
        labelEn: 'Assigned Decision Owner',
        noteAr: 'لا يصدر توجيه دون مسؤول مباشر للمتابعة',
        noteEn: 'No directive issued without a named accountable owner'
      },
      {
        val: 'SOURCE-LINK',
        labelAr: 'إسناد كل توجيه لمصدره',
        labelEn: 'Source-Linked Rationale',
        noteAr: 'مبررات كل قرار مرتبطة بالسجل الذي أنشأه',
        noteEn: 'Each rationale tied to the operational record that raised it'
      }
    ],
    executiveSummaryAr:
      'تغرق القيادات التنفيذية في سيل من تقارير PDF وجداول البيانات التي لا تقدم توجيهاً واضحاً. يقوم محرك القرارات التنفيذية بحساب الأولويات والمفاضلات الحرجة بين المشاريع وإدارة السيولة، مع تعيين مسؤول محدد وموعد إنجاز لكل خطوة.',
    executiveSummaryEn:
      'C-suite leaders waste critical hours deciphering disjointed management reports. MIKHLAFI LABS applies a deterministic scoring model across competing requests, producing a ranked executive backlog where every entry carries its rationale and assigned owner.',
    painPoints: [
      {
        num: '01',
        titleAr: 'تضارب الأولويات وشلل اتخاذ القرار',
        titleEn: 'Conflicting Priorities & Decision Paralysis',
        currentFailureAr: 'تزاحم عشرات الطلبات والمقترحات من مدراء الإدارات دون معيار حسابي موحد يحدد أيها يقدم العائد الأكبر والمخاطرة الأقل.',
        currentFailureEn: 'Dozens of competing capex and opex requests debated without mathematical ranking of actual cash-flow impact.',
        mikhlafiSolutionAr: 'مصفوفة أولويات حتمية تصنف كل قرار بناءً على الأثر المالي الصافي وسرعة التنفيذ وفترة استرداد رأس المال.',
        mikhlafiSolutionEn: 'Deterministic ranking matrix scoring actions by net NPV, implementation difficulty, and downside risk exposure.',
        impactAr: 'ترتيب المبادرات حتمياً حسب أثرها المالي ومخاطرها قبل النقاش',
        impactEn: 'Ranks initiatives deterministically by net financial impact and downside risk before debate'
      },
      {
        num: '02',
        titleAr: 'غياب المسؤولية والمتابعة بعد القرار',
        titleEn: 'Execution Drift & Diffused Accountability',
        currentFailureAr: 'اتخاذ قرارات في اجتماعات الإدارة ثم ضياع أثرها أو تأخر تنفيذها دون تنبيهات آلية عند انحراف مؤشرات الأداء المستهدفة.',
        currentFailureEn: 'Decisions agreed in boardrooms evaporating due to unassigned ownership and lack of milestone tracking.',
        mikhlafiSolutionAr: 'تعيين مسؤول مباشر (Single Decision Owner) لكل إجراء مع تتبع آلي لحظي لتنفيذ الالتزامات والأثر المحقق.',
        mikhlafiSolutionEn: 'Single assigned owner per directive with automated milestone telemetry and SLA breach escalations.',
        impactAr: 'تتبع آلي لحالة كل توجيه ومسؤوله حتى الإغلاق',
        impactEn: 'Automated tracking of each directive and its owner through to closure'
      },
      {
        num: '03',
        titleAr: 'القرارات المبنية على الحدس لا الأرقام',
        titleEn: 'Intuition-Based Rather Than Evidence-Based Moves',
        currentFailureAr: 'الموافقة على خصومات تجارية أو تمديد فترات ائتمان بناءً على العلاقات والتقدير الشخصي دون قياس أثرها على السيولة.',
        currentFailureEn: 'Offering commercial credit terms or price discounts based on gut feelings rather than empirical liquidity models.',
        mikhlafiSolutionAr: 'محاكاة الأثر المالي الفوري لكل خيار (What-If Simulation) قبل اعتماده لبيان تأثيره على التدفق النقدي وهوامش الربح.',
        mikhlafiSolutionEn: 'Instant What-If cash-flow and runway simulation before approving credit lines or major procurement commitments.',
        impactAr: 'محاكاة الأثر النقدي لكل خيار قبل اعتماده',
        impactEn: 'Simulates the cash-flow effect of each option before approval'
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
      'رادار استباقي متطور يحلل المؤشرات التشغيلية والمالية وسلاسل الإمداد، للتنبؤ المبكر بمخاطر نقص السيولة النقدية، انقطاع المواد الحيوية، واختلال التوازنات التعاقدية قبل وقوعها.',
    heroDescriptionEn:
      'Predictive telemetry monitoring operational, financial, and supply variables to forecast cash crunches, single-source vendor failures, and project margin slippages before they materialize.',
    heroMetrics: [
      {
        val: 'MULTI-SOURCE',
        labelAr: 'نطاق الإشارات المرصودة',
        labelEn: 'Multi-Source Signal Coverage',
        noteAr: 'كشوف البنوك، المخزون، أوامر الشراء، وسجلات المواقع',
        noteEn: 'Bank statements, inventory, aged POs, and site telemetry'
      },
      {
        val: 'DETERMINISTIC',
        labelAr: 'أسلوب ربط الإشارات',
        labelEn: 'Deterministic Correlation',
        noteAr: 'ربط قواعدي بين المصادر لا تخمين احتمالي',
        noteEn: 'Rule-based correlation across sources rather than probabilistic guessing'
      },
      {
        val: '3-TIER',
        labelAr: 'تصنيف درجة الخطر',
        labelEn: 'Three-Tier Severity Scale',
        noteAr: 'حرج أو يستدعي الانتباه أو مستقر',
        noteEn: 'Critical, Warning, or Stable'
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
        impactAr: 'ربط مستويات المخزون بشحنات التوريد لاتخاذ إجراء قبل النفاد',
        impactEn: 'Links inventory levels to inbound shipments so action can be taken before stockout'
      },
      {
        num: '03',
        titleAr: 'التعرض المالي المفرط لمورد أو عميل متعثر',
        titleEn: 'Extreme Counterparty Exposure & Default Risks',
        currentFailureAr: 'الاعتماد على مورد واحد يمثل 60% من المشتريات دون متابعة مؤشرات ملاءته المالية والتزامه بمواعيد التوريد.',
        currentFailureEn: 'Over-concentrated reliance on a single supplier or customer without monitoring counterparty default risk.',
        mikhlafiSolutionAr: 'مؤشر تركز المخاطر (Concentration Risk Index) لكشف الحسابات التي تشكل خطراً سيادياً على المؤسسة واقتراح تنويع الموردين.',
        mikhlafiSolutionEn: 'Real-time Concentration Index highlighting systemic dependency risks and recommending vetted diversification.',
        impactAr: 'إظهار حصة كل مورد واقتراح بدائل قبل بلوغ درجة التركز الحرجة',
        impactEn: 'Surfaces each vendor share and proposes alternatives before concentration becomes critical'
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
        val: 'DIGITAL-BASE',
        labelAr: 'مرجع مطابقة العقود',
        labelEn: 'Digitized Contract Baseline',
        noteAr: 'جدول الكميات والمعالم وشروط الدفع في هيكل قابل للاستعلام',
        noteEn: 'BOQ, milestones, and payment terms in a queryable structure'
      },
      {
        val: 'FIELD-MATCH',
        labelAr: 'أساس تدقيق المطالبات',
        labelEn: 'Field-Verified Claim Audit',
        noteAr: 'مقارنة الكميات المطالب بها بسندات الاستلام الفعلية',
        noteEn: 'Claimed quantities compared against actual goods receipts'
      },
      {
        val: 'CPI / SPI',
        labelAr: 'مقياس انحراف المشروع',
        labelEn: 'Earned-Value Indicators',
        noteAr: 'استخدام مؤشرات كفاءة التكلفة والجدول الزمني',
        noteEn: 'Uses Cost and Schedule Performance Indices'
      }
    ],
    executiveSummaryAr:
      'تصدر أوامر التغيير غير المفوترة، ومطالبات مقاولي الباطن غير المدققة، وتأخر إنجاز المعالم التعاقدية، فتتآكل هوامش الربح المتوقعة. تحافظ المنظومة على الهامش عبر التدقيق اللحظي المستمر مقابل خط الأساس التعاقدي.',
    executiveSummaryEn:
      'Unbilled variation orders, untracked contractor claims, and delayed milestones erode the margins a project was underwritten on. MIKHLAFI LABS provides continuous margin assurance by auditing every posting against the agreed contractual baseline.',
    painPoints: [
      {
        num: '01',
        titleAr: 'تآكل هوامش الربح بسبب أوامر التغيير غير المعتمدة',
        titleEn: 'Silent Margin Bleed from Unapproved Scope Variations',
        currentFailureAr: 'تنفيذ أعمال إضافية في الموقع بطلب من العميل دون إصدار أمر تغيير تعاقدي معتمد مالياً، مما يحول تكلفتها إلى خسارة محضة.',
        currentFailureEn: 'Site teams performing scope additions without formal contractual variation orders, turning extra work into direct losses.',
        mikhlafiSolutionAr: 'ربط مباشر بين تقارير الموقع ونظام إدارة العقود لمنع صرف أي ريال على بنود خارج نطاق العقد إلا بعد توقيع التكلفة المعتمدة.',
        mikhlafiSolutionEn: 'Mandatory bridge matching daily site logs to executed contracts, barring unauthorized variations from disbursement.',
        impactAr: 'توثيق الأعمال الإضافية وأوامر التغيير فور تنفيذها',
        impactEn: 'Documents additional work and change orders as soon as they are executed'
      },
      {
        num: '02',
        titleAr: 'صرف مستخلصات مقاولي الباطن دون تحقق ميداني',
        titleEn: 'Inflated Subcontractor Progress Invoices',
        currentFailureAr: 'تقديم مقاولي الباطن لمطالبات بنسبة إنجاز 70% بينما الإنجاز الهندسي الفعلي لا يتجاوز 50%، مما يتسبب بدفعات مسبقة غير مضمونة.',
        currentFailureEn: 'Subcontractors invoicing 70% progress when physical inspection proves only 50% completion, risking overpayment.',
        mikhlafiSolutionAr: 'محرك مطابقة حتمي يقارن كميات المواد المستهلكة وتقارير الإشراف الميداني مع نسب الفوترة لمنع الصرف الزائد.',
        mikhlafiSolutionEn: 'Algorithmic reconciliation cross-referencing delivered materials, supervisor sign-offs, and billed percentages.',
        impactAr: 'مطابقة الدفعات المقترحة بالإنجاز الميداني قبل الصرف',
        impactEn: 'Reconciles proposed payments with field progress before disbursement'
      },
      {
        num: '03',
        titleAr: 'تأخر اكتشاف انحراف الجدول الزمني للمشاريع',
        titleEn: 'Late Discovery of Schedule & Burn Drift',
        currentFailureAr: 'اكتشاف تأخر المشروع عن موعد التسليم النهائي قبل شهر واحد فقط من انتهاء العقد، مما يوقع المؤسسة تحت غرامات التأخير الصارمة.',
        currentFailureEn: 'Discovering project schedule slippages just weeks before contract deadline, incurring severe liquidated damages.',
        mikhlafiSolutionAr: 'نموذج تنبؤ مستمر بمؤشر كفاءة التكلفة (CPI) ومؤشر كفاءة الجدول الزمني (SPI) ينذر بالانحراف قبل وقوعه بـ 90 يوماً.',
        mikhlafiSolutionEn: 'Predictive CPI and SPI index monitoring identifying schedule and cost drift 90 days before milestone deadlines.',
        impactAr: 'إنذار مبكر بانحراف الجدول الزمني والتكلفة قبل تجاوزهما',
        impactEn: 'Early warning on schedule and cost drift before they accumulate'
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
        aAr: 'المنظومة مصممة للمشاريع ذات الهياكل التعاقدية المعقدة وشبكات مقاولي الباطن المتعددة، حيث يحتاج الهامش إلى تدقيق مستمر لمنع الانحراف.',
        aEn: 'Designed for projects with complex contractual structures and multiple subcontractor networks, where margins require continuous auditing to prevent drift.'
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
        val: 'UNIFIED-FILE',
        labelAr: 'مرجع موردي المجموعة',
        labelEn: 'Unified Vendor Registry',
        noteAr: 'توحيد السجلات عبر الرقم الضريبي والآيبان',
        noteEn: 'Records consolidated by VAT number and IBAN'
      },
      {
        val: 'PEER-SET',
        labelAr: 'أساس قياس الأسعار',
        labelEn: 'Cross-Entity Price Benchmark',
        noteAr: 'مقارنة سعر كل صنف بين فروع المجموعة',
        noteEn: 'Compares each item price across group entities'
      },
      {
        val: 'SCORECARD',
        labelAr: 'مخرج تقييم الموردين',
        labelEn: 'Supplier Scorecard Output',
        noteAr: 'تجميع الالتزام بالمواعيد ونسب الرفض وسرعة الاستجابة',
        noteEn: 'Combines OTIF, rejection ratios, and response speed'
      }
    ],
    executiveSummaryAr:
      'تشتري معظم الشركات القابضة المواد والخدمات من نفس الموردين عبر فروع مختلفة وبأسعار وشروط سداد متفاوتة دون وجود رؤية موحدة. يجمع محرك ذكاء الموردين هذه المعاملات في سجل موحد وبطاقة أداء مركزية تدعم التفاوض وتحمي سلاسل الإمداد.',
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
        impactAr: 'إظهار السعر المرجعي الأقل المطبق في المجموعة قبل الشراء',
        impactEn: 'Surfaces the lowest prevailing rate in the group before a purchase is made'
      },
      {
        num: '02',
        titleAr: 'تأخر الشحنات دون إشعار مسبق وتعطيل العمليات',
        titleEn: 'Unannounced Shipping Slippages & Operational Halts',
        currentFailureAr: 'وعود الموردين بالتسليم خلال 10 أيام وتأخرها الفعلي إلى 28 يوماً، مما يربك خطط الإنتاج ويؤخر تسليم العقود للعملاء.',
        currentFailureEn: 'Suppliers promising 10-day fulfillment while consistently delivering in 28 days, causing site standstills.',
        mikhlafiSolutionAr: 'حساب زمن التوريد الفعلي (Real Lead Time) لكل مورد وتعديل خطط الشراء آلياً مع تنبيهات عند اقتراب مواعيد التأخير.',
        mikhlafiSolutionEn: 'Empirical lead-time telemetry scoring each vendor, factoring real transit drift into automated reorder points.',
        impactAr: 'مقارنة زمن التوريد الفعلي بالخطة وتعديل نقاط إعادة الطلب',
        impactEn: 'Compares actual lead time against the buying plan and adjusts reorder points'
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
        val: 'LEDGER-LINK',
        labelAr: 'مصدر مؤشر صحة العميل',
        labelEn: 'Financial-Record Basis',
        noteAr: 'الفواتير وسجلات السداد بدل استطلاعات الرأي',
        noteEn: 'Invoices and settlement records rather than surveys'
      },
      {
        val: 'COMPOSITE',
        labelAr: 'أسلوب تقييم الحساب',
        labelEn: 'Composite Health Score',
        noteAr: 'دمج وتيرة الطلب وآجال السداد والنزاعات',
        noteEn: 'Combines order velocity, settlement aging, and disputes'
      },
      {
        val: 'DRIFT-ALERT',
        labelAr: 'مخرج كشف الانسحاب',
        labelEn: 'Deviation Alert Output',
        noteAr: 'إشعار عند خروج وتيرة الطلب عن نطاقها التاريخي',
        noteEn: 'Flags when order velocity leaves its historical band'
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
        impactAr: 'كشف تراجع الطلب في بدايته قبل نهاية دورة التجديد',
        impactEn: 'Detects order decline at its onset, before the renewal cycle closes'
      },
      {
        num: '02',
        titleAr: 'مفاجآت عدم تجديد العقود السنوية',
        titleEn: 'Contract Non-Renewal Shocks at Expiry Dates',
        currentFailureAr: 'توقع تجديد عقد العميل السنوي تلقائياً، ليتفاجأ الفريق باختيار العميل لمنافس آخر بسبب مشاكل تشغيلية لم تصعد للإدارة.',
        currentFailureEn: 'Expecting auto-renewal only to receive non-renewal termination letters due to unescalated operational frustrations.',
        mikhlafiSolutionAr: 'بطاقة صحة العميل (Customer Health Index) التي تجمع بيانات الفواتير ومشاكل التوصيل والتأخير لتحديد الحسابات المعرضة للخطر قبل 90 يوماً.',
        mikhlafiSolutionEn: 'Customer Health Index synthesizing delivery frictions, billing disputes, and aging debt to flag at-risk renewals 90 days early.',
        impactAr: 'تجميع إشارات الاحتكاك التشغيلية في مؤشر صحة واحد',
        impactEn: 'Consolidates operational friction signals into a single health index'
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
        aAr: 'يمكن البدء بتحميل سجل المبيعات والفواتير (Excel/CSV)، أو الربط المباشر مع نظام ERP عبر واجهة قراءة فقط.',
        aEn: 'Start by uploading a sales and invoice export (Excel/CSV), or connect directly to your ERP through a read-only API.'
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
        val: 'SOURCE-CITED',
        labelAr: 'ربط كل إجابة بمصدرها',
        labelEn: 'Per-Answer Source Citation',
        noteAr: 'كل رقم مرتبط برقم القيد والفاتورة والسجل',
        noteEn: 'Each figure linked to its voucher, invoice, and ledger ID'
      },
      {
        val: 'FAIL-CLOSED',
        labelAr: 'سلوك غياب الدليل',
        labelEn: 'Refusal on Missing Evidence',
        noteAr: 'لا يخمّن المساعد عند غياب السجل بل يصرّح بذلك',
        noteEn: 'Declares the gap instead of guessing when no record exists'
      },
      {
        val: 'SOVEREIGN',
        labelAr: 'نموذج النشر والمعالجة',
        labelEn: 'Sovereign Deployment Model',
        noteAr: 'معالجة داخل المملكة مع عزل بيانات كل مؤسسة',
        noteEn: 'In-kingdom processing with isolated tenant data'
      }
    ],
    executiveSummaryAr:
      'تحتاج الإدارة العليا في كثير من الأحيان لمعرفة أرقام دقيقة وفورية قبل الاجتماعات: كم دفعنا للمورد الفلاني؟ ما هو أكثر مشروع استنزف السيولة هذا الشهر؟ ولماذا ارتفعت مصاريف الصيانة؟ يمنحك المساعد إجابة فورية ودقيقة وموثقة بالسجلات خلال ثوانٍ بدلاً من انتظار أيام.',
    executiveSummaryEn:
      'Executives need instantaneous, dependable data before high-stakes meetings. The Executive Assistant parses natural language questions and interrogates the relevant ledger records, providing audit-traceable summaries with direct links to source documents.',
    painPoints: [
      {
        num: '01',
        titleAr: 'انتظار أيام للحصول على تقارير مالية مخصصة',
        titleEn: 'Waiting Days for Ad-Hoc Management Reports',
        currentFailureAr: 'طلب الرئيس التنفيذي لمعلومة محددة من الإدارة المالية وانتظار 3 إلى 5 أيام لقيام المحللين بتجميعها يدوياً من عدة أنظمة.',
        currentFailureEn: 'C-suite requesting specific spend breakdowns and waiting 3 to 5 days while financial analysts manually assemble data.',
        mikhlafiSolutionAr: 'كتابة السؤال باللغة العربية الطبيعية والحصول على إجابة تحليلية فورية مع جداول ورسوم بيانية موثقة بروابط السجلات.',
        mikhlafiSolutionEn: 'Ask in plain Arabic or English; receive an instant executive dossier with charts and source record IDs in seconds.',
        impactAr: 'إتاحة الاستعلام المباشر من السجلات دون تجميع يدوي',
        impactEn: 'Provides direct querying of ledger records without manual assembly'
      },
      {
        num: '02',
        titleAr: 'مخاطر الهلوسة في نماذج الذكاء الاصطناعي العامة',
        titleEn: 'Hallucination Risks in Generic Commercial LLMs',
        currentFailureAr: 'استخدام نماذج عامة مثل ChatGPT قد يقدم أرقاماً تبدو مقنعة لكنها مختلقة تماماً ولا تستند إلى الحسابات الحقيقية للشركة.',
        currentFailureEn: 'Generic public LLMs hallucinating plausible-sounding but completely fabricated financial totals and dates.',
        mikhlafiSolutionAr: 'هندسة استرجاع حتمية صارمة (Deterministic RAG) تمنع النموذج من الإجابة إلا استناداً إلى سجلات ERP الموثقة.',
        mikhlafiSolutionEn: 'Deterministic RAG architecture strictly bounding model outputs to verified enterprise ledger records and vouchers.',
        impactAr: 'أجوبة مبنية حصراً على السجل الموثق مع رفض التخمين عند غيابه',
        impactEn: 'Answers grounded strictly in documented records, refusing to guess when they are absent'
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
        outputAr: 'إجابة موثقة تدقيقياً قابلة للتتبع',
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
        aAr: 'أبداً. نماذج الذكاء الاصطناعي تعمل بالكامل داخل السحابة السيادية المعتمدة في المملكة العربية السعودية، بما يتوافق مع ضوابط الأمن السيبراني (NCA).',
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
        val: 'MULTI-SYSTEM',
        labelAr: 'نطاق الأنظمة المشمولة',
        labelEn: 'Multi-System Coverage',
        noteAr: 'ERP وCRM وأنظمة المستودعات والدفترة الإلكترونية',
        noteEn: 'ERP, CRM, warehouse systems, and e-invoicing'
      },
      {
        val: 'SUB-LEDGER',
        labelAr: 'أساس تدقيق التوازن',
        labelEn: 'Sub-Ledger Reconciliation',
        noteAr: 'مقارنة الأنظمة الفرعية بدفتر الأستاذ العام',
        noteEn: 'Sub-ledgers compared against the general ledger'
      },
      {
        val: 'PRE-CHECK',
        labelAr: 'توقيت التحقق من الفواتير',
        labelEn: 'Pre-Transmission Validation',
        noteAr: 'تدقيق حقول الفاتورة الإلكترونية قبل إرسالها للمنصة',
        noteEn: 'E-invoice attributes checked before submission'
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
        impactAr: 'كشف القيود غير المتطابقة أثناء الشهر لا في نهايته',
        impactEn: 'Catches mismatched vouchers during the month rather than at close'
      },
      {
        num: '02',
        titleAr: 'غرامات ومخالفات هيئة الزكاة بسبب بيانات الفواتير الناقصة',
        titleEn: 'ZATCA Compliance Fines Due to Missing Invoice Attributes',
        currentFailureAr: 'إصدار فواتير ضريبية تفتقر للرقم الضريبي الصحيح أو الرمز التعريفي المشفر (UUID) مما يعرض الشركة لغرامات نظامية.',
        currentFailureEn: 'Issuing e-invoices with invalid buyer tax IDs or broken cryptographic stamps, exposing firms to regulatory penalties.',
        mikhlafiSolutionAr: 'فحص استباقي لقواعد الفوترة الإلكترونية والتحقق من صحة السجلات والبيانات قبل إرسالها أو تسجيلها.',
        mikhlafiSolutionEn: 'Pre-flight validation engine auditing all e-invoice XML attributes against ZATCA Phase 2 specifications.',
        impactAr: 'فحص حقول الفاتورة الإلكترونية قبل إرسالها للمنصة',
        impactEn: 'Validates e-invoice attributes before transmission to the platform'
      },
      {
        num: '03',
        titleAr: 'تكرار سجلات العملاء والموردين وتشتت البيانات',
        titleEn: 'Duplicate Master Data Records & Entity Fragmentation',
        currentFailureAr: 'وجود نفس المورد مسجلاً بـ 5 أسماء مختلفة في أنظمة الفروع، مما يعطل تتبع إجمالي المشتريات ومطابقة السجلات.',
        currentFailureEn: 'Same vendor registered under 5 variations across branch ERPs, shattering procurement tracking and auditability.',
        mikhlafiSolutionAr: 'محرك مطابقة ذكي يدمج السجلات المكررة آلياً استناداً إلى السجل التجاري ورقم الآيبان (IBAN) والرقم الضريبي.',
        mikhlafiSolutionEn: 'Intelligent entity resolution consolidating duplicate master records via unique Commercial Registration and IBAN keys.',
        impactAr: 'توحيد سجلات الموردين المكررة في مرجع واحد',
        impactEn: 'Consolidates duplicate vendor records into a single master'
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
        aEn: 'Yes, providing an immutable audit trail compliant with IFRS and SOCPA standards, with each entry traceable to its source document.'
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
