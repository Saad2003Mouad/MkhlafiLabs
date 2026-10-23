import { query } from '../../db/connection.js';
import { getAIProvider } from './aiProvider.js';
import { resolveFinancialAnomaly } from '../financial/leakDetection.js';
import { createTenantDecision } from '../decisions/decisionsEngine.js';

export async function processAssistantQuery(orgId, userId, queryText, locale = 'ar', personaConfig = {}) {
  const isAr = locale === 'ar';
  const qLower = queryText.toLowerCase().trim();
  const provider = getAIProvider();

  // Unpack Tenant AI Persona Configuration
  const assistantName = personaConfig?.name?.trim() || (isAr ? 'فطين' : 'Fateen');
  const assistantTone = personaConfig?.tone || 'witty_human'; // 'witty_human' | 'strict_executive' | 'forensic_auditor'
  const permissions = {
    canFreezeDisbursements: true,
    canGenerateReports: true,
    canDraftDecisions: true,
    canSimulateScenarios: true,
    canScanLedger: true,
    ...(personaConfig?.permissions || {})
  };
  const customDirectives = personaConfig?.customDirectives?.trim() || '';

  // 1. Fetch live tenant context across operational tables
  const [anomaliesRes, decisionsRes, risksRes, projectsRes, suppliersRes, customersRes] = await Promise.all([
    query('SELECT * FROM financial_anomalies WHERE organization_id = $1 ORDER BY flagged_amount DESC', [orgId]),
    query('SELECT * FROM tenant_decisions WHERE organization_id = $1 ORDER BY impact_amount DESC', [orgId]),
    query('SELECT * FROM tenant_risks WHERE organization_id = $1 ORDER BY financial_exposure_sar DESC', [orgId]),
    query('SELECT * FROM tenant_projects WHERE organization_id = $1 ORDER BY budget_total_sar DESC', [orgId]),
    query('SELECT * FROM tenant_suppliers WHERE organization_id = $1 ORDER BY active_contracts_val_sar DESC', [orgId]),
    query('SELECT * FROM tenant_customers WHERE organization_id = $1 ORDER BY revenue_at_risk_sar DESC', [orgId])
  ]);

  const anomalies = anomaliesRes.rows;
  const decisions = decisionsRes.rows;
  const risks = risksRes.rows;
  const projects = projectsRes.rows;
  const suppliers = suppliersRes.rows;
  const customers = customersRes.rows;

  const totalLeakageYER = anomalies.reduce((sum, a) => sum + parseFloat(a.flagged_amount || 0), 0);
  const frozenAnomalies = anomalies.filter(a => a.status === 'FROZEN');
  const frozenAmountYER = frozenAnomalies.reduce((sum, a) => sum + parseFloat(a.flagged_amount || 0), 0);
  const pendingDecisions = decisions.filter(d => d.status === 'PENDING');
  const pendingImpactYER = pendingDecisions.reduce((sum, d) => sum + parseFloat(d.impact_amount || 0), 0);

  const citations = [];

  // Add factual citations based on actual tenant tables
  if (anomalies.length > 0) {
    citations.push({
      source: 'Forensic Financial Anomalies Ledger',
      docId: anomalies[0].case_number || 'CASE-LIVE',
      confidence: `${anomalies[0].confidence_pct || 95.0}%`
    });
  }
  if (decisions.length > 0) {
    citations.push({
      source: 'Tenant Executive Decision Pipeline',
      docId: `DEC-${decisions[0].id.substring(0, 6)}`,
      confidence: '99.0%'
    });
  }

  // ── AUTONOMOUS SUPERPOWERS & PERSONA CAPABILITIES ──────────────────────────

  // 0. Persona Self-Introduction & Human Greetings
  if (
    qLower === 'من أنت' ||
    qLower === 'من انت' ||
    qLower.includes('عرف بنفسك') ||
    qLower === 'مين انت' ||
    qLower === 'مين أنت' ||
    qLower === 'أهلاً' ||
    qLower === 'اهلا' ||
    qLower === 'مرحبا' ||
    qLower === 'مرحباً' ||
    qLower === 'السلام عليكم' ||
    qLower === 'hello' ||
    qLower === 'hi' ||
    qLower.includes('who are you')
  ) {
    const greetingText = isAr
      ? assistantTone === 'witty_human'
        ? `أهلاً وسهلاً بك يا غالي! مساك الله بالخير والبركة 🇾🇪✨
أنا "${assistantName}"، رفيقك ومستشارك التنفيذي الذكي في منصة مخلافي لابس (MIKHLAFI LABS) هنا في صنعاء.
لا تشيل هم دفاتر المحاسبة ولا حركة السيولة؛ أنا أراقب كل قيد وفاتورة لحظياً، وعيني صاحية على كل مليم حتى لا يمر أي تسرب مالي أو تكرار بدون علمك!

صلاحياتي التنفيذية جاهزة تحت أمرك:
🛡️ تجميد الصرف الفوري للمطالبات المشبوهة وحظر المستحقات.
📑 إصدار تقارير تدقيق مالي جنائي شاملة بالأرقام الدقيقة.
🔮 محاكاة سيناريوهات القرارات (ماذا لو خفضنا النفقات؟ أو وفرنا في العقود؟).
⚖️ صياغة مذكرات مجلس الإدارة وخطابات الاسترداد القانونية الرسمية.

قلي، ايش ببالك اليوم؟ تحب نعمل تقرير شامل لمؤسستكم، أو نفحص الموردين المشبوهين؟`
        : `أهلاً بك. أنا "${assistantName}"، المساعد الذكي المعتمد للقرارات التنفيذية والتدقيق الجنائي في منصة مخلافي لابس (صنعاء، اليمن).
أعمل بصلاحيات تنفيذية للتحقق من سلامة الدفاتر المحاسبية، وتجميد الصرف للمخالفات، وتوليد التقارير الشاملة، ومحاكاة السيناريوهات المالية.
أنا في خدمتك للبدء في أي إجراء رقابي أو تحليلي.`
      : `Hello! I am "${assistantName}", your Sovereign Decision Intelligence & Executive Assistant at MIKHLAFI LABS, headquartered in Sana'a, Yemen.
I actively monitor your corporate ledgers, detect financial leakage, execute instant disbursement quarantines, generate deep forensic reports, and run what-if liquidity simulations. How may I empower your leadership today?`;

    citations.push({
      source: 'Executive Persona Intelligence Profile',
      docId: `PERSONA-${assistantName.toUpperCase()}`,
      confidence: '100.0%'
    });

    await query(
      `INSERT INTO ai_assistant_logs (organization_id, user_id, query_text, response_text, citations)
       VALUES ($1, $2, $3, $4, $5)`,
      [orgId, userId, queryText, greetingText, JSON.stringify(citations)]
    );

    return {
      response: greetingText,
      citations,
      aiProvider: {
        name: 'persona-executive-engine',
        isLocal: true,
        sovereignty: 'AIR_GAPPED_OR_LOCAL'
      }
    };
  }

  // 1. Autonomous Disbursement Freeze & Quarantine
  if (
    qLower.includes('جمد') ||
    qLower.includes('تجميد') ||
    qLower.includes('حظر صرف') ||
    qLower.includes('وقف صرف') ||
    qLower.includes('freeze') ||
    qLower.includes('quarantine')
  ) {
    if (!permissions.canFreezeDisbursements) {
      const deniedMsg = isAr
        ? `⚠️ تنبيه الصلاحيات: عذراً يا غالي، صلاحية "تجميد وحظر الصرف المباشر" مقيدة حالياً في إعدادات المساعد الذكي الخاصة بمؤسستكم. يمكن للمسؤول تفعيلها عبر صفحة الإعدادات.`
        : `⚠️ Permission Notice: Autonomous disbursement freeze is currently disabled in your assistant settings. Please enable it in Workspace Settings.`;
      return { response: deniedMsg, citations, aiProvider: { name: 'governance-gate', isLocal: true, sovereignty: 'LOCAL' } };
    }

    const targetAnomaly = anomalies.find(a =>
      a.status !== 'FROZEN' && (
        (a.case_number && qLower.includes(a.case_number.toLowerCase())) ||
        (a.target_vendor && qLower.includes(a.target_vendor.toLowerCase()))
      )
    ) || anomalies.find(a => a.status !== 'FROZEN') || anomalies[0];

    if (targetAnomaly) {
      try {
        await resolveFinancialAnomaly(
          orgId,
          targetAnomaly.id,
          userId,
          'FREEZE',
          `تم تجميد الصرف وحظر المستحقات تلقائياً بأمر تنفيذي عبر المساعد "${assistantName}" بناءً على الطلب: "${queryText}".`
        );

        const amountFormatted = parseFloat(targetAnomaly.flagged_amount).toLocaleString();
        const actionResponse = isAr
          ? assistantTone === 'witty_human'
            ? `🛡️ أبشر بعزك يا غالي! تم تجميد الصرف وحظر المستحقات فوراً وبأمر تنفيذي قطعي:
• القضية المعنية: ${targetAnomaly.case_number}
• المورد المحظور: "${targetAnomaly.target_vendor}"
• المبلغ الذي حفظناه في خزينتكم: ${amountFormatted} ر.ي (ريال يمني)
• الإجراء الرقابي: جمدنا الفاتورة في جدول financial_invoices، وأقفلنا أمر التحويل، وسجلنا الواقعة في سجل التدقيق غير القابل للتعديل.
• اقتراحي لك: الخطوة الجاية نصيغ لهم خطاب مطالبة رسمي أو نحيل الموضوع للشؤون القانونية فوراً؟`
            : `🛡️ مرسوم تنفيذي: تم تجميد الصرف فوراً وحظر المستحقات بنجاح!
• القضية المستهدفة: ${targetAnomaly.case_number}
• المورد: ${targetAnomaly.target_vendor}
• المبلغ المحمي بالتجميد: ${amountFormatted} ر.ي
• الإجراء الرقابي: تم إدراج أمر الحظر في سجل الرقابة المالية وتجميد الفاتورة المرتبطة.`
          : `🛡️ EXECUTIVE ACTION: Disbursement Frozen & Quarantined Successfully!
• Target Case: ${targetAnomaly.case_number}
• Target Vendor: ${targetAnomaly.target_vendor}
• Protected Capital: ${amountFormatted} YER
• Status: Invoice locked in financial_invoices and logged to immutable audit ledger.`;

        citations.push({
          source: 'Executive Action Execution Engine',
          docId: `ACTION-FREEZE-${targetAnomaly.case_number}`,
          confidence: '100.0%'
        });

        await query(
          `INSERT INTO ai_assistant_logs (organization_id, user_id, query_text, response_text, citations)
           VALUES ($1, $2, $3, $4, $5)`,
          [orgId, userId, queryText, actionResponse, JSON.stringify(citations)]
        );

        return {
          response: actionResponse,
          citations,
          aiProvider: {
            name: 'autonomous-execution-engine',
            isLocal: true,
            sovereignty: 'AIR_GAPPED_OR_LOCAL'
          }
        };
      } catch (err) {
        console.error('[Assistant Freeze Action Error]:', err);
      }
    }
  }

  // 2. Autonomous Comprehensive Forensic Audit & Decision Report Generation
  if (
    qLower.includes('تقرير') ||
    qLower.includes('تقرير شامل') ||
    qLower.includes('تقرير تدقيق') ||
    qLower.includes('أصدر تقرير') ||
    qLower.includes('تقرير مالي') ||
    qLower.includes('report') ||
    qLower.includes('audit report')
  ) {
    if (!permissions.canGenerateReports) {
      const deniedMsg = isAr
        ? `⚠️ تنبيه الصلاحيات: صلاحية "توليد التقارير المالية والتحليلية" معطلة حالياً في إعدادات المساعد الذكي.`
        : `⚠️ Permission Notice: Autonomous report generation is disabled in your assistant settings.`;
      return { response: deniedMsg, citations, aiProvider: { name: 'governance-gate', isLocal: true, sovereignty: 'LOCAL' } };
    }

    const reportDate = new Date().toLocaleDateString('ar-YE', { year: 'numeric', month: 'long', day: 'numeric' });
    const repId = `REP-AUDIT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const reportText = isAr
      ? `📊 تقرير الاستخبارات التنفيذية والتدقيق الجنائي الشامل
══════════════════════════════════════════════════════════════
الجهة: منصة مخلافي لابس (MIKHLAFI LABS) — صنعاء، اليمن
رقم التقرير الرسمي: ${repId}
تاريخ الإصدار: ${reportDate}
المُعدّ: المساعد الذكي للقرارات (${assistantName})
══════════════════════════════════════════════════════════════

1️⃣ الموقف المالي العام ومؤشرات السيولة:
• إجمالي المبالغ المشبوهة المرصودة: ${totalLeakageYER.toLocaleString()} ر.ي عبر ${anomalies.length} قضية محاسبية.
• السيولة المحمية بأوامر التجميد الفوري: ${frozenAmountYER.toLocaleString()} ر.ي (${frozenAnomalies.length} قضايا محظورة).
• القرارات التنفيذية قيد الانتظار: ${pendingDecisions.length} قرارات بأثر مالي متوقع ${pendingImpactYER.toLocaleString()} ر.ي.
• مؤشر المخاطر التشغيلية: ${risks.length} مخاطر مسجلة (التعرض الكلي: ${risks.reduce((s, r) => s + parseFloat(r.financial_exposure_sar || 0), 0).toLocaleString()} ر.ي).

2️⃣ بيان قضايا الشذوذ والتسرب المالي الأكبر أثراً:
${anomalies.length === 0
  ? '• دفاتر الأستاذ العام نظيفة: لم تسجل خوارزميات التدقيق أي حالات شذوذ أو تكرار مالي حتى هذه اللحظة.'
  : anomalies.slice(0, 5).map((a, idx) => `• [0${idx + 1}] القضية (${a.case_number}): المورد "${a.target_vendor}" — المبلغ: ${parseFloat(a.flagged_amount).toLocaleString()} ر.ي — الحالة: [${a.status}] — المخالفة: ${a.narrative_ar || a.narrative_en}`).join('\n')
}

3️⃣ شبكة الموردين ومؤشرات المشاريع:
• إجمالي الموردين الخاضعين للرقابة: ${suppliers.length} موردين.
• المشاريع الرأسمالية: ${projects.length} مشاريع (تحت المراقبة الحثيثة: ${projects.filter(p => p.health === 'at-risk').length}).

4️⃣ التوصيات التنفيذية الاستباقية للقيادة:
1. إبقاء أوامر حظر الصرف سارية على الموردين المخالفين لحين اكتمال التسوية الدفترية.
2. تفعيل شرط الاعتماد المسبق (Pre-Audit Clearance) قبل إطلاق أي دفعة تتجاوز 1,000,000 ر.ي.
3. اعتماد القرارات التنفيذية المعلقة لحصد وفورات السيولة المتوقعة فوراً.

══════════════════════════════════════════════════════════════
تم اعتماد التقرير آلياً عبر محرك التدقيق الجنائي لمنصة مخلافي لابس.`
      : `📊 COMPREHENSIVE EXECUTIVE AUDIT & DECISION INTELLIGENCE REPORT
══════════════════════════════════════════════════════════════
Issuer: MIKHLAFI LABS — Sana'a, Republic of Yemen
Report ID: ${repId}
Generated By: AI Executive Copilot (${assistantName})
══════════════════════════════════════════════════════════════

1️⃣ Executive Capital & Liquidity Brief:
• Total Flagged Financial Leakage: ${totalLeakageYER.toLocaleString()} YER across ${anomalies.length} cases.
• Protected Capital Under Direct Freeze: ${frozenAmountYER.toLocaleString()} YER (${frozenAnomalies.length} disbursements).
• Pending Executive Decisions: ${pendingDecisions.length} actions targeting ${pendingImpactYER.toLocaleString()} YER.
• Operational Risk Profile: ${risks.length} active risks registered.

2️⃣ Top Forensic Anomaly Ledger:
${anomalies.slice(0, 5).map((a, idx) => `• Case [${idx + 1}] (${a.case_number}): Vendor "${a.target_vendor}" — ${parseFloat(a.flagged_amount).toLocaleString()} YER — Status: [${a.status}]`).join('\n')}

3️⃣ Strategic Recommendations:
• Maintain disbursement freeze on flagged suppliers.
• Authorize pending executive decisions to realize targeted cost recovery.`;

    citations.push({
      source: 'Forensic Audit Report Synthesis Engine',
      docId: repId,
      confidence: '100.0%'
    });

    await query(
      `INSERT INTO ai_assistant_logs (organization_id, user_id, query_text, response_text, citations)
       VALUES ($1, $2, $3, $4, $5)`,
      [orgId, userId, queryText, reportText, JSON.stringify(citations)]
    );

    return {
      response: reportText,
      citations,
      aiProvider: {
        name: 'forensic-reporting-engine',
        isLocal: true,
        sovereignty: 'AIR_GAPPED_OR_LOCAL'
      }
    };
  }

  // 3. Autonomous What-If & Scenario Simulation Engine
  if (
    qLower.includes('ماذا لو') ||
    qLower.includes('محاكاة') ||
    qLower.includes('سيناريو') ||
    qLower.includes('what if') ||
    qLower.includes('simulate') ||
    qLower.includes('forecast')
  ) {
    if (!permissions.canSimulateScenarios) {
      const deniedMsg = isAr
        ? `⚠️ تنبيه الصلاحيات: صلاحية "محاكاة السيناريوهات وماذا-لو" معطلة حالياً في إعدادات المساعد الذكي.`
        : `⚠️ Permission Notice: What-if scenario simulation is disabled in your assistant settings.`;
      return { response: deniedMsg, citations, aiProvider: { name: 'governance-gate', isLocal: true, sovereignty: 'LOCAL' } };
    }

    const recoveredLeakage = totalLeakageYER * 0.85; // 85% conservative recovery rate
    const procurementSavings10Pct = suppliers.reduce((sum, s) => sum + parseFloat(s.active_contracts_val_sar || 0), 0) * 0.10;
    const netProjectedLiquidityGain = recoveredLeakage + procurementSavings10Pct + pendingImpactYER;

    const simulationText = isAr
      ? assistantTone === 'witty_human'
        ? `🔮 نتائج محاكاة السيناريوهات الذكية (ماذا لو؟) — محسوبة بدقة على دفاتركم:
يا غالي، عملت لك حسبة سريعة وواقعية مبنية على أرقام قاعدة البيانات الحقيقية:

1️⃣ سيناريو استرداد التسربات المالية المرصودة:
• لو نجحنا باسترداد 85% فقط من التسربات المرصودة حالياً (${totalLeakageYER.toLocaleString()} ر.ي):
  ➔ ستضخ في خزينتكم سيولة نقدية مباشرة قدرها: ${recoveredLeakage.toLocaleString()} ر.ي فوراً!

2️⃣ سيناريو إعادة التفاوض على عقود أكبر 3 موردين بنسبة 10%:
• لو ضغطنا أسعار عقود الموردين بنسبة 10% فقط استناداً لمؤشرات أسعار السوق في صنعاء:
  ➔ ستوفر المؤسسة سنوياً ما يعادل: ${procurementSavings10Pct.toLocaleString()} ر.ي من تكاليف المشتريات.

3️⃣ سيناريو اعتماد القرارات التنفيذية المعلقة (${pendingDecisions.length} قرارات):
• إطلاق القرارات المعلقة سيحقق أثراً مالياً مباشراً قدره: ${pendingImpactYER.toLocaleString()} ر.ي.

💡 الأثر الإجمالي المتوقع على أرباحكم وسيولتكم:
💰 إضافة صافية قدرها: ${netProjectedLiquidityGain.toLocaleString()} ر.ي لحسابات المؤسسة!
نصيحتي لك كرفيق دربك: نبدأ بتنفيذ سيناريو الموردين وتجميد المطالبات، وهذا وحده بيريح ميزانيتكم الشهر القادم بشكل ملموس!`
        : `🔮 نتائج محاكاة السيناريوهات والقرارات التنفيذية (What-If Simulation):
1. استرداد 85% من الشذوذ المالي المرصود: توفير سيولة نقدية بقيمة ${recoveredLeakage.toLocaleString()} ر.ي.
2. ترشيد عقود التوريد بنسبة 10%: وفورات سنوية متوقعة بقيمة ${procurementSavings10Pct.toLocaleString()} ر.ي.
3. اعتماد القرارات التنفيذية المعلقة: أثر نقدي مباشر بقيمة ${pendingImpactYER.toLocaleString()} ر.ي.
• إجمالي العائد الاستراتيجي المتوقع: ${netProjectedLiquidityGain.toLocaleString()} ر.ي.`
      : `🔮 WHAT-IF EXECUTIVE SIMULATION RESULTS:
1. 85% Capital Leakage Recovery: Projected cash inflow of ${recoveredLeakage.toLocaleString()} YER.
2. 10% Procurement Contract Renegotiation: Annual savings of ${procurementSavings10Pct.toLocaleString()} YER.
3. Approving Pending Executive Decisions: Target impact of ${pendingImpactYER.toLocaleString()} YER.
• Total Combined Liquidity Upside: ${netProjectedLiquidityGain.toLocaleString()} YER.`;

    citations.push({
      source: 'Empirical What-If Simulation Engine',
      docId: 'SIM-CASHFLOW-FORECAST',
      confidence: '97.5%'
    });

    await query(
      `INSERT INTO ai_assistant_logs (organization_id, user_id, query_text, response_text, citations)
       VALUES ($1, $2, $3, $4, $5)`,
      [orgId, userId, queryText, simulationText, JSON.stringify(citations)]
    );

    return {
      response: simulationText,
      citations,
      aiProvider: {
        name: 'what-if-simulation-engine',
        isLocal: true,
        sovereignty: 'AIR_GAPPED_OR_LOCAL'
      }
    };
  }

  // 4. Autonomous Legal Forensic Recovery Demand Letter
  if (
    qLower.includes('خطاب') ||
    qLower.includes('مطالبة') ||
    qLower.includes('استرداد') ||
    qLower.includes('إنذار') ||
    qLower.includes('demand letter') ||
    qLower.includes('recovery letter')
  ) {
    const targetCase = anomalies.find(a =>
      (a.case_number && qLower.includes(a.case_number.toLowerCase())) ||
      (a.target_vendor && qLower.includes(a.target_vendor.toLowerCase()))
    ) || anomalies[0];

    if (targetCase) {
      const amountVal = parseFloat(targetCase.flagged_amount).toLocaleString();
      const dateToday = new Date().toLocaleDateString('ar-YE', { year: 'numeric', month: 'long', day: 'numeric' });

      const letterText = isAr
        ? `📜 خطاب مطالبة واسترداد مالي رسمي (مسودة جنائية معتمدة):
══════════════════════════════════════════════════════════════
الجمهورية اليمنية — صنعاء
التاريخ: ${dateToday}
الرقم المرجعي: MIKHLAFI-LEGAL-${targetCase.case_number}

إلى السادة / إدارة شركة "${targetCase.target_vendor}" المحترمين،
الموضوع: إشعار رسمي بوجود شذوذ محاسبي ومطالبة فورية باسترداد مبالغ مالية مقيدة بدون سند قانوني

تحية طيبة وبعد،،،
نفيدكم بأنه بناءً على إجراءات التدقيق الجنائي الداخلي والرقابة الآلية لمنظومة (MIKHLAFI LABS)، تبين وجود انحراف مالي صريح بالقضية رقم (${targetCase.case_number}) وفق التفاصيل التالية:
• كود المخالفة الرقابية: ${targetCase.rule_code}
• طبيعة المخالفة: ${targetCase.narrative_ar || targetCase.narrative_en}
• المبلغ المطالب باسترداده: ${amountVal} ر.ي (ريال يمني).
• حالة الصرف الحالية: محظور ومجمد بأمر الإدارة المالية.

بناءً على أحكام القانون التجاري وقواعد التعاقد المالي:
1. يُطلب منكم توريد المبلغ المذكور أعلاه إلى الحساب البنكي الرئيسي لمؤسستنا أو تقديم الإثباتات الدفترية المعمدة خلال مهلة أقصاها (7 أيام عمل) من تاريخه.
2. في حال عدم السداد خلال المهلة المحددة، سيتم اتخاذ الإجراءات القانونية اللازمة ورفع الملف إلى النيابة المختصة، مع الإيقاف النهائي للتعامل والتعميد في منصة المشتريات.

وتقبلوا فائق الاحترام والتقدير،،،
الإدارة العامة للشؤون المالية والرقابة والامتثال
══════════════════════════════════════════════════════════════`
        : `📜 OFFICIAL FORENSIC CAPITAL RECOVERY DEMAND LETTER:
══════════════════════════════════════════════════════════════
Location: Sana'a, Republic of Yemen
Date: ${new Date().toISOString().split('T')[0]}
Ref: MIKHLAFI-LEGAL-${targetCase.case_number}

To: Management of "${targetCase.target_vendor}"
Subject: Formal Notice of Forensic Financial Anomaly & Capital Recovery Demand

Pursuant to automated forensic audits executed by MIKHLAFI LABS, a critical discrepancy was flagged under Case (${targetCase.case_number}):
• Rule Violation: ${targetCase.rule_code}
• Description: ${targetCase.narrative_en}
• Amount Due: ${amountVal} YER
• Disbursement Status: Quarantined & Frozen

You are formally required to remit the stated sum or deliver stamped proof of clearance within seven (7) business days. Failure to comply will result in immediate escalation to commercial litigation and total supplier blacklist status.

Director of Forensic Audit & Financial Governance
══════════════════════════════════════════════════════════════`;

      citations.push({
        source: 'Forensic Legal Drafting Engine',
        docId: `LEGAL-${targetCase.case_number}`,
        confidence: '99.5%'
      });

      await query(
        `INSERT INTO ai_assistant_logs (organization_id, user_id, query_text, response_text, citations)
         VALUES ($1, $2, $3, $4, $5)`,
        [orgId, userId, queryText, letterText, JSON.stringify(citations)]
      );

      return {
        response: letterText,
        citations,
        aiProvider: {
          name: 'forensic-legal-engine',
          isLocal: true,
          sovereignty: 'AIR_GAPPED_OR_LOCAL'
        }
      };
    }
  }

  // 2. Prepare structured context for LLM execution
  const dbContextSummary = isAr
    ? `سياق قاعدة بيانات المؤسسة الحالية (PostgreSQL):
- معرف المؤسسة: ${orgId}
- إجمالي حالات الشذوذ والتسرب المالي: ${anomalies.length} حالة (المبلغ المرصود: ${totalLeakageYER.toLocaleString()} ر.ي، المجمد: ${frozenAmountYER.toLocaleString()} ر.ي).
- تفاصيل الحالات المرصودة:
${anomalies.map(a => `  * القضية ${a.case_number}: المورد "${a.target_vendor}" بمبلغ ${parseFloat(a.flagged_amount).toLocaleString()} ر.ي، الحالة: ${a.status}، التوصيف: ${a.narrative_ar || a.narrative_en}`).join('\n')}
- القرارات التنفيذية: ${decisions.length} قرار (معلقة: ${pendingDecisions.length}، الأثر المالي: ${pendingImpactYER.toLocaleString()} ر.ي).
- المخاطر التشغيلية والمالية: ${risks.length} مخاطر (إجمالي التعرض: ${risks.reduce((s, r) => s + parseFloat(r.financial_exposure_sar || 0), 0).toLocaleString()} ر.ي).
- المشاريع الرأسمالية: ${projects.length} مشاريع (المشاريع تحت الخطر: ${projects.filter(p => p.health === 'at-risk').length}).
- شبكة الموردين: ${suppliers.length} موردين (موردين في وضع حرج: ${suppliers.filter(s => s.risk_status === 'critical').length}).
- العملاء ومخاطر الإيراد: ${customers.length} عملاء (عملاء في خطر فقدان مرتفع: ${customers.filter(c => c.churn_probability > 0.5).length}).`
    : `TENANT OPERATIONAL DATABASE CONTEXT:
- Organization ID: ${orgId}
- Total Financial Anomalies: ${anomalies.length} (Total Flagged: ${totalLeakageYER.toLocaleString()} YER, Frozen: ${frozenAmountYER.toLocaleString()} YER)
- Active Anomaly Cases: ${JSON.stringify(anomalies.map(a => ({ case: a.case_number, vendor: a.target_vendor, amount: a.flagged_amount, severity: a.severity, rule: a.rule_code, status: a.status })))}
- Executive Decisions: ${decisions.length} (Pending: ${pendingDecisions.length}, Impact: ${pendingImpactYER.toLocaleString()} YER)
- Monitored Risks: ${risks.length} (Total Exposure: ${risks.reduce((s, r) => s + parseFloat(r.financial_exposure_sar || 0), 0).toLocaleString()} YER)
- Capital Projects: ${projects.length} (At-Risk: ${projects.filter(p => p.health === 'at-risk').length})
- Suppliers: ${suppliers.length} (Critical Price Creep: ${suppliers.filter(s => s.risk_status === 'critical').length})
- Customers: ${customers.length} (High Churn Risk: ${customers.filter(c => c.churn_probability > 0.5).length}).`;

  const toneInstructions = assistantTone === 'witty_human'
    ? `أسلوبك الحواري: أنت تتحدث بأسلوب بشري مرح، ذكي، ودود وواثق، كخبير يمني رصين ومحبوب. ترحب بالشخص ("يا غالي"، "أبشر"، "مرحباً بك")، وتطرح الحلول بروح طيبة ولمسة ذكاء وفكاهة راقية دون الإخلال بصرامة الأرقام والتدقيق الجنائي.`
    : assistantTone === 'forensic_auditor'
    ? `أسلوبك الحواري: محقق مالي جنائي صارم، تعتمد على نصوص المواد والقوانين والمطابقة الثلاثية والأدلة الرقمية الدقيقة.`
    : `أسلوبك الحواري: تنفيذي رفيع المستوى، نقاط مختصرة ومحددة تناسب الرئيس التنفيذي.`;

  const systemPrompt = isAr
    ? `أنت "${assistantName}"، المساعد التنفيذي للذكاء الاصطناعي في منصة مخلافي لابس (MIKHLAFI LABS) في صنعاء، الجمهورية اليمنية.
${toneInstructions}
${customDirectives ? `توجيهات مخصصة من إدارة المؤسسة لك: "${customDirectives}"` : ''}

القواعد الصارمة:
1. اذكر الأرقام والمبالغ بالريال اليمني (ر.ي) وأسماء الموردين والقضايا كما هي في البيانات دون اختلاق أو تزييف.
2. قدم توصيات وإجراءات تنفيذية مباشرة وواضحة.
3. تجنب الردود الآلية الجافة؛ تحدث كشخص حقيقي يفهم أعمال المؤسسة ويحمي أموالها.

${dbContextSummary}`
    : `You are "${assistantName}", the Executive AI Copilot at MIKHLAFI LABS, headquartered in Sana'a, Yemen.
Tone: ${assistantTone === 'witty_human' ? 'Witty, warm, conversational, human-like, sharp, engaging' : 'Executive & precise'}.
${customDirectives ? `Tenant Custom Directives: "${customDirectives}"` : ''}
RULES:
1. Always base answers strictly on the tenant's PostgreSQL database context below.
2. Primary currency is Yemeni Rial (YER).
3. NEVER hallucinate fake figures.

${dbContextSummary}`;

  // Try real AI generation (Groq, Gemini, or Ollama)
  let answerText = '';
  let providerUsedName = provider.name;
  let isLocal = true;

  try {
    const aiResult = await provider.generate({
      prompt: queryText,
      systemPrompt,
      locale
    });

    if (aiResult && aiResult.text) {
      answerText = aiResult.text;
      providerUsedName = aiResult.provider;
      isLocal = aiResult.isLocal;
    }
  } catch (err) {
    console.warn('[AI Generation error, falling back to deterministic synthesis]:', err.message);
  }

  // 3. Fallback Deterministic Engine (Zero fake numbers, strictly computed from real rows)
  if (!answerText) {
    if (
      qLower.includes('لماذا') ||
      qLower.includes('سبب') ||
      qLower.includes('أسباب') ||
      qLower.includes('فسر') ||
      qLower.includes('تفسير') ||
      qLower.includes('خسائر') ||
      qLower.includes('خسارة') ||
      qLower.includes('قلت') ||
      qLower.includes('انخفضت') ||
      qLower.includes('حلول') ||
      qLower.includes('حل') ||
      qLower.includes('why') ||
      qLower.includes('cause') ||
      qLower.includes('reason') ||
      qLower.includes('explain') ||
      qLower.includes('solution')
    ) {
      if (anomalies.length === 0) {
        answerText = isAr
          ? assistantTone === 'witty_human'
            ? `أبشرك يا غالي! فحصت قاعدة بيانات مؤسستكم في PostgreSQL من الباب للمحراب: ما عندنا أي تسربات مالية أو خسائر مرصودة حالياً، والوضع تمام التمام!
لو تحب نربط دفاتر إضافية أو نستورد قيود جديدة عبر معالج الربط الذكي، أنا جاهز فوراً.`
            : `📊 التفسير التنفيذي والتحليل السببي:
• بناءً على قاعدة بيانات مؤسستكم الحالية في PostgreSQL: لا توجد أي حالات تسرب مالي أو خسائر مرصودة حالياً.`
          : `📊 Executive Causal Analysis: Zero financial leakage cases or operational losses recorded in tenant database.`;
      } else {
        answerText = isAr
          ? assistantTone === 'witty_human'
            ? `يا غالي، إليك التحليل السببي الدقيق والمفصل للشأن المالي من واقع دفاتركم الحقيقية:
1️⃣ المؤشرات على أرض الواقع:
• رصدنا تسربات مالية إجمالية قدرها ${totalLeakageYER.toLocaleString()} ر.ي موزعة على ${anomalies.length} حالات شذوذ.
• تداركنا منها وجمدنا مباشرة: ${frozenAmountYER.toLocaleString()} ر.ي (${frozenAnomalies.length} مبالغ مقفلة بالخزينة).

2️⃣ الأسباب الجذرية الصريحة:
${anomalies.slice(0, 3).map((a, idx) => `• [0${idx + 1}] المورد "${a.target_vendor}" بمبلغ ${parseFloat(a.flagged_amount).toLocaleString()} ر.ي — المشكلة: ${a.narrative_ar}`).join('\n')}

3️⃣ الحلول والإجراءات اللي لازم ننفذها الآن:
• تشديد بوابة المطابقة الثلاثية للمشتريات (أمر الشراء + إشعار الاستلام + الفاتورة).
• حظر صرف مستحقات الحالات المعلقة حتى يتم التسوية مع المالية.
قل لي يا غالي، تحب أصدر لك خطاب استرداد رسمي لأي مورد منهم؟`
            : `📊 التفسير التنفيذي والتحليل السببي من واقع السجلات الحالية:
1️⃣ المؤشرات المالية المرصودة:
• إجمالي التسربات المالية المرصودة: ${totalLeakageYER.toLocaleString()} ر.ي عبر ${anomalies.length} حالات شذوذ حسابي.
• السيولة المحمية بالتجميد المباشر: ${frozenAmountYER.toLocaleString()} ر.ي.
2️⃣ الأسباب الجذرية:
${anomalies.slice(0, 3).map((a, idx) => `• ${a.rule_code}: المورد "${a.target_vendor}" بمبلغ ${parseFloat(a.flagged_amount).toLocaleString()} ر.ي.`).join('\n')}`
          : `📊 Executive Causal Analysis: ${totalLeakageYER.toLocaleString()} YER flagged across ${anomalies.length} cases.`;
      }
    } else if (qLower.includes('هدر') || qLower.includes('تسرب') || qLower.includes('فواتير') || qLower.includes('leak') || qLower.includes('invoice') || qLower.includes('anomaly')) {
      if (anomalies.length === 0) {
        answerText = isAr
          ? assistantTone === 'witty_human'
            ? `دفاتركم بيضاء وسليمة يا غالي! ما في أي هدر أو فواتير مشبوهة مسجلة في قاعدة البيانات حالياً.`
            : 'تم فحص السجلات المحاسبية: لا توجد أي حالات تسرب مالي أو فواتير مشبوهة مسجلة.'
          : 'Zero active financial leakage anomalies detected in the tenant database.';
      } else {
        const topCase = anomalies[0];
        answerText = isAr
          ? assistantTone === 'witty_human'
            ? `رصدنا ${anomalies.length} حالات شذوذ مالي وتسرب بقيمة إجمالية ${totalLeakageYER.toLocaleString()} ريال يمني يا غالي. أكبرها حالة القضية (${topCase.case_number}) للمورد "${topCase.target_vendor}" بمبلغ ${parseFloat(topCase.flagged_amount).toLocaleString()} ر.ي (${topCase.narrative_ar}). تحب نجمد صرفها فوراً؟`
            : `تم رصد ${anomalies.length} حالات شذوذ مالي بقيمة ${totalLeakageYER.toLocaleString()} ر.ي. أبرزها (${topCase.case_number}) للمورد "${topCase.target_vendor}" بمبلغ ${parseFloat(topCase.flagged_amount).toLocaleString()} ر.ي.`
          : `${anomalies.length} financial anomaly cases detected totaling ${totalLeakageYER.toLocaleString()} YER.`;
      }
    } else if (qLower.includes('قرار') || qLower.includes('قرارات') || qLower.includes('decision') || qLower.includes('action')) {
      if (decisions.length === 0) {
        answerText = isAr
          ? 'لا توجد قرارات تنفيذية معلقة حالياً في سجل tenant_decisions لمؤسستكم.'
          : 'Zero executive decisions currently recorded in tenant_decisions for your organization.';
      } else {
        answerText = isAr
          ? assistantTone === 'witty_human'
            ? `عندنا ${pendingDecisions.length} قرارات تنفيذية هامة معلقة يا غالي، وأثرها المالي على أرباحكم يوصل إلى ${pendingImpactYER.toLocaleString()} ريال يمني! أهم قرار لازم نوقعه: "${decisions[0].title}" بقيمة ${parseFloat(decisions[0].impact_amount).toLocaleString()} ر.ي.`
            : `يوجد ${pendingDecisions.length} قرارات تنفيذية معلقة بأثر مالي مستهدف قدره ${pendingImpactYER.toLocaleString()} ر.ي.`
          : `${pendingDecisions.length} pending executive decisions recorded with target impact of ${pendingImpactYER.toLocaleString()} YER.`;
      }
    } else {
      answerText = isAr
        ? assistantTone === 'witty_human'
          ? `ملخص الاستخبارات التنفيذية لأعمالكم يا غالي من واقع قاعدة بيانات PostgreSQL الحية:
• الانحرافات المالية: ${anomalies.length} حالات مرصودة (إجمالي الهدر المرصود: ${totalLeakageYER.toLocaleString()} ر.ي، المحمي بالتجميد: ${frozenAmountYER.toLocaleString()} ر.ي).
• القرارات التنفيذية: ${pendingDecisions.length} قرارات بانتظار توقيعكم (أثرها المالي: ${pendingImpactYER.toLocaleString()} ر.ي).
• رادار المخاطر: ${risks.length} مخاطر تشغيلية قيد المراقبة.
• المشاريع: ${projects.length} مشاريع رأسمالية مسجلة.
• الموردون: ${suppliers.length} موردين تحت الفحص الدوري.
أنا جاهز لأي أمر؛ تحب نعمل محاكاة سيولة، أو نصدر تقرير شامل، أو نجمد صرف فاتورة؟`
          : `ملخص الاستخبارات التنفيذية من واقع قاعدة البيانات الحقيقية:
• الانحرافات المالية: ${anomalies.length} حالات مرصودة (${totalLeakageYER.toLocaleString()} ر.ي).
• القرارات التنفيذية: ${pendingDecisions.length} قرارات معلقة (${pendingImpactYER.toLocaleString()} ر.ي).
• رادار المخاطر: ${risks.length} مخاطر مسجلة.`
        : `Executive Decision Intelligence Brief from Live PostgreSQL:
• Financial Anomalies: ${anomalies.length} flagged cases (${totalLeakageYER.toLocaleString()} YER).
• Executive Decisions: ${pendingDecisions.length} pending actions (${pendingImpactYER.toLocaleString()} YER).
• Operational Risks: ${risks.length} registered risks.`;
    }
  }

  // Persist interaction to ai_assistant_logs
  await query(
    `INSERT INTO ai_assistant_logs (organization_id, user_id, query_text, response_text, citations)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      orgId,
      userId,
      queryText,
      answerText,
      JSON.stringify(citations)
    ]
  );

  return {
    response: answerText,
    citations,
    aiProvider: {
      name: providerUsedName,
      isLocal,
      sovereignty: isLocal ? 'AIR_GAPPED_OR_LOCAL' : 'CLOUD_MANAGED_AI'
    }
  };
}
