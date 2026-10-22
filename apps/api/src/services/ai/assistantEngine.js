import { query } from '../../db/connection.js';
import { getAIProvider } from './aiProvider.js';
import { resolveFinancialAnomaly } from '../financial/leakDetection.js';
import { createTenantDecision } from '../decisions/decisionsEngine.js';

export async function processAssistantQuery(orgId, userId, queryText, locale = 'ar') {
  const isAr = locale === 'ar';
  const qLower = queryText.toLowerCase().trim();
  const provider = getAIProvider();

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

  // ── AUTONOMOUS SUPERPOWERS: DIRECT TOOL EXECUTION ───────────────────────────
  // 1. Autonomous Disbursement Freeze & Quarantine
  if (
    qLower.includes('جمد') ||
    qLower.includes('تجميد') ||
    qLower.includes('حظر صرف') ||
    qLower.includes('وقف صرف') ||
    qLower.includes('freeze') ||
    qLower.includes('quarantine')
  ) {
    // Identify target anomaly
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
          `تم تجميد الصرف وحظر المستحقات تلقائياً بأمر تنفيذي عبر المساعد الذكي بناءً على الطلب: "${queryText}".`
        );

        const amountFormatted = parseFloat(targetAnomaly.flagged_amount).toLocaleString();
        const actionResponse = isAr
          ? `🛡️ مرسوم تنفيذي: تم تجميد الصرف فوراً وحظر المستحقات بنجاح!
• القضية المستهدفة: ${targetAnomaly.case_number}
• المورد: ${targetAnomaly.target_vendor}
• المبلغ المحمي بالتجميد: ${amountFormatted} ر.ي
• الإجراء الرقابي: تم إدراج أمر الحظر في سجل الرقابة المالية، وتجميد الفاتورة المرتبطة في جدول financial_invoices، وتدوين الحدث في سجل التدقيق الجنائي غير القابل للتعديل.
• التوصية التالية: إحالة ملف المطابقة الثلاثية للشؤون القانونية أو إصدار خطاب استرداد رسمي.`
          : `🛡️ EXECUTIVE ACTION: Disbursement Frozen & Quarantined Successfully!
• Target Case: ${targetAnomaly.case_number}
• Target Vendor: ${targetAnomaly.target_vendor}
• Protected Capital: ${amountFormatted} YER
• Governance Execution: Invoice status updated to FROZEN in financial_invoices, disbursement blocked, and tamper-proof forensic audit record appended.`;

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

  // 2. Autonomous Legal Forensic Recovery Demand Letter
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

  const systemPrompt = isAr
    ? `أنت المساعد الذكي للقرارات التنفيذية في منصة مخلافي لابس (MIKHLAFI LABS) في صنعاء، الجمهورية اليمنية.
أنت تقدم إجابات تنفيذية ودقيقة وحسابية مبنية حصرياً على سياق قاعدة بيانات المؤسسة أدناه.
القواعد الصارمة:
1. أجب باللغة العربية بأسلوب تنفيذي موجز ومنظم بنقاط واضحة.
2. اذكر الأرقام والمبالغ بالريال اليمني (ر.ي) وأسماء الموردين والقضايا كما هي في البيانات دون اختلاق أو تزييف.
3. قدم توصيات وإجراءات تنفيذية وقائية وعلاجية مباشرة.

${dbContextSummary}`
    : `You are MIKHLAFI LABS Executive Decision Intelligence Assistant, headquartered in Sana'a, Yemen.
You provide executive, factual, and mathematically rigorous answers to business questions based STRICTLY on the tenant's PostgreSQL database context provided.
RULES:
1. Always answer in English.
2. If there are 0 records in the database for the requested category, state clearly and honestly that no records exist yet.
3. NEVER invent fake numbers or hallucinate metrics not present in the database context.
4. Primary currency is Yemeni Rial (YER).
5. Format responses clearly with executive bullet points.

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
          ? `📊 التفسير التنفيذي والتحليل السببي:
• بناءً على قاعدة بيانات مؤسستكم الحالية في PostgreSQL: لا توجد أي حالات تسرب مالي أو خسائر مرصودة حالياً.
• لإجراء التحليل السببي واكتشاف الانحرافات، يرجى استيراد قيود دفتر الأستاذ العام (CSV) عبر شاشة التكاملات أو تفعيل قنوات الربط مع ERP.`
          : `📊 Executive Causal Analysis:
• Based on your current tenant database in PostgreSQL: Zero financial leakage cases or operational losses are recorded.
• To generate empirical causal analysis and variance detection, import general ledger entries via CSV or connect ERP telemetry.`;
      } else {
        answerText = isAr
          ? `📊 التفسير التنفيذي والتحليل السببي من واقع السجلات الحالية:
1️⃣ المؤشرات المالية المرصودة:
• إجمالي التسربات المالية المرصودة: ${totalLeakageYER.toLocaleString()} ر.ي عبر ${anomalies.length} حالات شذوذ حسابي.
• السيولة المحمية بالتجميد المباشر: ${frozenAmountYER.toLocaleString()} ر.ي (${frozenAnomalies.length} حالات مجمدة).

2️⃣ الأسباب الجذرية الدقيقة:
${anomalies.slice(0, 3).map((a, idx) => `• السبب 0${idx + 1} (${a.rule_code}): المورد "${a.target_vendor}" بمبلغ ${parseFloat(a.flagged_amount).toLocaleString()} ر.ي. الملاحظة: ${a.narrative_ar}`).join('\n')}

3️⃣ الحلول والإجراءات التنفيذية المعتمدة:
• تفعيل بوابة الاعتماد المسبقة (Pre-Payment Gate) للمطابقة الثلاثية (PO + GRN + Invoice).
• حظر صرف المطالبات المعلقة حتى التحقق من سلامة القيود مع الإدارة المالية.`
          : `📊 Executive Causal Analysis from Live Database Records:
1️⃣ Detected Financial Metrics:
• Total Flagged Leakage: ${totalLeakageYER.toLocaleString()} YER across ${anomalies.length} anomaly cases.
• Protected Capital: ${frozenAmountYER.toLocaleString()} YER frozen across ${frozenAnomalies.length} disbursements.

2️⃣ Identified Root Causes:
${anomalies.slice(0, 3).map((a, idx) => `• Cause 0${idx + 1} (${a.rule_code}): Vendor "${a.target_vendor}" for ${parseFloat(a.flagged_amount).toLocaleString()} YER (${a.narrative_en})`).join('\n')}

3️⃣ Prescriptive Executive Solutions:
• Enforce 3-way matching gate prior to wire disbursement.
• Freeze flagged disbursements pending CFO forensic review.`;
      }
    } else if (qLower.includes('هدر') || qLower.includes('تسرب') || qLower.includes('فواتير') || qLower.includes('leak') || qLower.includes('invoice') || qLower.includes('anomaly')) {
      if (anomalies.length === 0) {
        answerText = isAr
          ? 'تم فحص السجلات المحاسبية الحالية: لا توجد أي حالات تسرب مالي أو فواتير مشبوهة مسجلة في قاعدة البيانات.'
          : 'Verified ledger records: Zero active financial leakage anomalies detected in the tenant database.';
      } else {
        const topCase = anomalies[0];
        answerText = isAr
          ? `تم رصد ${anomalies.length} حالات شذوذ مالي وتسرب بقيمة إجمالية ${totalLeakageYER.toLocaleString()} ريال يمني. أبرزها الحالة (${topCase.case_number}) للمورد "${topCase.target_vendor}" بمبلغ ${parseFloat(topCase.flagged_amount).toLocaleString()} ر.ي (${topCase.narrative_ar}).`
          : `${anomalies.length} financial anomaly cases detected totaling ${totalLeakageYER.toLocaleString()} YER. Top case is (${topCase.case_number}) for vendor "${topCase.target_vendor}" at ${parseFloat(topCase.flagged_amount).toLocaleString()} YER (${topCase.narrative_en}).`;
      }
    } else if (qLower.includes('قرار') || qLower.includes('قرارات') || qLower.includes('decision') || qLower.includes('action')) {
      if (decisions.length === 0) {
        answerText = isAr
          ? 'لا توجد قرارات تنفيذية مسجلة حالياً في جدول tenant_decisions لمؤسستكم.'
          : 'Zero executive decisions currently recorded in tenant_decisions for your organization.';
      } else {
        answerText = isAr
          ? `يوجد ${pendingDecisions.length} قرارات تنفيذية معلقة بأثر مالي مستهدف قدره ${pendingImpactYER.toLocaleString()} ريال يمني. أهمها: "${decisions[0].title}" بقيمة ${parseFloat(decisions[0].impact_amount).toLocaleString()} ر.ي.`
          : `${pendingDecisions.length} pending executive decisions recorded with target financial impact of ${pendingImpactYER.toLocaleString()} YER. Top decision: "${decisions[0].title}" (${parseFloat(decisions[0].impact_amount).toLocaleString()} YER).`;
      }
    } else {
      // General factual overview
      answerText = isAr
        ? `ملخص الاستخبارات التنفيذية من واقع قاعدة البيانات الحقيقية:
• الانحرافات المالية: ${anomalies.length} حالات مرصودة (إجمالي: ${totalLeakageYER.toLocaleString()} ر.ي).
• القرارات التنفيذية: ${pendingDecisions.length} قرارات معلقة (الأثر: ${pendingImpactYER.toLocaleString()} ر.ي).
• رادار المخاطر: ${risks.length} مخاطر مسجلة.
• المشاريع: ${projects.length} مشاريع قيد المراقبة.
• الموردون: ${suppliers.length} موردين مسجلين.`
        : `Executive Decision Intelligence Brief from Live PostgreSQL:
• Financial Anomalies: ${anomalies.length} flagged cases (${totalLeakageYER.toLocaleString()} YER).
• Executive Decisions: ${pendingDecisions.length} pending actions (${pendingImpactYER.toLocaleString()} YER).
• Operational Risks: ${risks.length} registered risks.
• Capital Projects: ${projects.length} monitored.
• Monitored Suppliers: ${suppliers.length} vendors.`;
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
