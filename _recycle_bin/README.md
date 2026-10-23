# 🗑️ سلة المحذوفات والمراجعة (Mikhlafi Labs — Quarantine Recycle Bin)

هذا المجلد تم إنشاؤه بناءً على طلبك لجمع كافة الملفات، الأكواد، الصفحات، والصور غير المستخدمة أو الزائدة عن الحاجة، حتى تتمكن من مراجعتها والتأكد منها بنفسك قبل حذفها نهائياً.

---

## 📑 فهرس المحتويات المعزولة

### 1. مجلد `unused_workbenches/` (مكونات البيئة التجريبية المحذوفة)
هذه هي شاشات العرض التفاعلية الوهمية التي كانت تظهر في صفحات المحركات الـ 8 بالموقع العام، والتي طلبت حذفها:
- `ForensicAuditWorkbench.tsx` (~59 KB) — كان مستخدماً في محرك كشف التسريب المالي.
- `ExecutiveDecisionWorkbench.tsx` (~70 KB) — كان مستخدماً في محرك القرارات التنفيذية.
- `PredictiveRiskWorkbench.tsx` (~57 KB) — كان مستخدماً في محرك رادار المخاطر.
- `ProjectMarginWorkbench.tsx` (~76 KB) — كان مستخدماً في محرك هوامش المشاريع.
- `SupplierRiskWorkbench.tsx` (~71 KB) — كان مستخدماً في محرك مخاطر الموردين.
- `CustomerRiskWorkbench.tsx` (~73 KB) — كان مستخدماً في محرك مخاطر واحتفاظ العملاء.
- `ExecutiveAssistantWorkbench.tsx` (~56 KB) — كان مستخدماً في محرك المساعد التنفيذي.
- `DataQualityWorkbench.tsx` (~44 KB) — كان مستخدماً في محرك حوكمة وجودة البيانات.
- `SandboxNotice.tsx` (~3 KB) — شريط إشعار "بيئة تدريب تفاعلية" الذي كان مرافقاً لها.
> **النتيجة:** توفير ما يزيد عن **509 كيلوبايت** من الأكواد المهملة، وتنظيف 7 مجلدات كانت فارغة.

---

### 2. مجلد `redundant_components/` (مكونات مكررة وغير مستخدمة)
- `BrandMark.tsx` (~2.5 KB) — مكون شعار قديم مكرر تم استبداله بالكامل بمكون `BrandLogo.tsx`.
- `PricingPackagesSection.tsx` (~4.1 KB) — سكشن باقات قديم مكرر تم استبداله بصفحة الباقات المستقلة `PricingPage.tsx`.
- `ChartPreview.tsx` (~4.1 KB) — مكون رسم بياني اختباري مؤقت لم يعد مستخدماً في المنصة.
- `KpiCard.tsx` (~1.2 KB) — كرت مؤشرات قديم تم استبداله ببطاقات مؤشرات المنصة المعتمدة.

---

### 3. مجلد `unused_images/` (صور ضخمة غير مستخدمة بالموقع)
كانت هذه الصور موجودة داخل `apps/platform/public/assets/images` دون أي استخدام فعلي في الكود، وتسبب بطء النشر على Vercel:
- `enterprise-audit-shield.jpg` (1.11 MB)
- `smart-industry-twin.jpg` (1.09 MB)
- `neural-mesh-vault.jpg` (1.05 MB)
- `hero-neural-mesh.jpg` (887 KB)
- `enterprise-decision-cockpit.jpg` (788 KB)
- `corporate-hero-cockpit.jpg` (699 KB)
- `hero-platform-cockpit.jpg` (662 KB)
> **النتيجة:** توفير أكثر من **6.27 ميجابايت** من وزن الموقع وحجم النشر!

---

### 4. مجلد `temporary_assets/` (ملفات وسكربتات مؤقتة)
- `test_crop.png` (~71 KB) — صورة تجربة قص شعار مؤقتة في مجلد `brand`.
- `favicon-base.png` (~69 KB) — ملف أيقونة تجريبي قديم.
- `gen_favicons.py` (~5.2 KB) — سكربت بايثون لتوليد الأيقونات كان متروكاً في مجلد `public`.

---

### 5. مجلد `root_duplicate_assets/` (مجلد صور مكرر بالكامل)
- مجلد `assets/` الرئيسي في جذر المشروع، والذي كان مجرد نسخة مطابقة لمجلد `apps/platform/public/assets`.

---

### 6. مجلد `tools_reports/` (تقارير نصوص قديمة)
ملفات نصية متبقية من عمليات تدقيق وفحص الحروف السابقة:
- `audit-report.txt`
- `char-report.txt`
- `mojibake-repair.txt`
- `mojibake-report.txt`

---

## 🔄 كيفية الاستعادة
إذا أردت في أي وقت استعادة أي ملف من هذه الملفات، يمكنك ببساطة نقله من هذا المجلد إلى مكانه الأصلي أو تشغيل أمر النقل المناسب.
وإذا كنت راضياً عن هذه المراجعة وتريد التخلص منها نهائياً، يمكنك حذف مجلد `_recycle_bin` بنقرة واحدة!
