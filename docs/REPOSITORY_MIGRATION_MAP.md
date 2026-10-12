# REPOSITORY_MIGRATION_MAP.md
# MIKHLAFI LABS — خريطة ترحيل الملفات الحالية
### COMPREHENSIVE FILE-BY-FILE AUDIT, REUSE & REPLACEMENT STRATEGY
**Version:** 1.0.0 (Master Architecture Plan)  

---

## تصنيف قرارات الترحيل (Migration Decisions Legend)
* **Preserve and reuse (حفظ وإعادة استخدام):** يُحتفظ به ويُعاد استخدامه كجزء من بنية النظام المستهدفة.
* **Adapt during migration (تكييف وتطوير):** يُعاد تشكيله واستخدامه داخل حزم React أو السيرفر الجديد.
* **Replace after equivalent exists (استبدال بعد اكتمال البديل):** يبقى قيد العمل حتى يكتمل بديله بنسبة 100% ويتم اختباره، ثم يُستبدل.
* **Retain temporarily for compatibility (احتفاظ مؤقت للتوافق):** يبقى لتشغيل العرض الحالي على `localhost:3000`.
* **Remove only after verified (إزالة آمنة بعد التحقق):** ملفات مهملة أو مكررة يتم التخلص منها لاحقاً دون أثر سلبي.

---

## جدول جرد وتصنيف الملفات (File-by-File Disposition Table)

| المسار الحالي للملف | الحجم والوصف الحالي | القرار المعتمد | الوجهة المستهدفة / البديل | التبعات وشرط الإزالة |
|---|---|---|---|---|
| `index.html` | 67 KB — الواجهة الحالية المكتملة | **Retain temporarily** | `apps/website` أو استبداله بـ React SPA | يظل متاحاً لتشغيل العرض التجريبي الحالي على `localhost:3000`. لا يُحذف إلا بعد تشغيل مساحة React بالكامل. |
| `server.js` | 2.4 KB — خادم static خفيف | **Preserve and reuse** | خادم تطوير وتشغيل تجريبي محلي | يبقى كأداة سريعة لتشغيل الواجهة الساكنة دون تبعيات. |
| `package.json` | 309 B — إعداد monorepo أساسي | **Adapt during migration** | Root Monorepo `package.json` | توسيعه ليشمل أوامر التشغيل والبناء الشامل (`pnpm dev`, `pnpm build`, `pnpm test`). |
| `pnpm-workspace.yaml` | 57 B — إعداد مساحات العمل | **Preserve and reuse** | Root Workspace Config | توجيه وإدارة تطبيقات `apps/*` وحزم `packages/*`. |
| `.gitignore` | 300 B — استثناء الملفات | **Preserve and reuse** | Root Git Config | التأكد من استبعاد `.env`, `node_modules`, `dist/`. |
| `css/design-system.css` | 15 KB — المتغيرات والخطوط | **Adapt during migration** | `packages/design-system/tokens.css` | ترحيل المتغيرات إلى نظام الرموز الدلالية (Tokens) في React. |
| `css/website.css` | 50 KB — أنماط الموقع العام | **Adapt during migration** | `apps/website/src/styles/` | تحويلها إلى وحدات CSS modules أو أنماط منسقة للموقع التسويقي. |
| `css/platform.css` | 19 KB — أنماط لوحة التحكم | **Adapt during migration** | `packages/ui` & `apps/platform` | تكييف أنماط البطاقات والجداول والقائمة الجانبية داخل مكونات React. |
| `js/app.js` | 7.6 KB — منسق التطبيق القديم | **Replace after equivalent** | `apps/platform/src/App.tsx` & Router | يستبدل بالكامل بنظام التوجيه React Router ومزودات السياق (Context Providers). |
| `js/data.js` | 44 KB — طبقة البيانات الوهمية | **Adapt during migration** | `packages/mock-data` (Demo Provider) | يُعاد استخدامه كـ Mock Data Provider لوضع العرض التجريبي (Demo Mode) لحين اكتمال الـ API الحقيقي. |
| `js/i18n.js` | 25 KB — قواميس الترجمة AR/EN | **Adapt during migration** | `packages/i18n/locales/*.json` | استخراج النصوص ونقلها لملفات ترجمة JSON قياسية تُستخدم في React. |
| `js/website.js` | 23 KB — منطق الموقع التسويقي | **Replace after equivalent** | `apps/website/src/pages/*` | إعادة بنائه كمكونات وصفحات React تفاعلية. |
| `js/platform.js` | 46 KB — منطق لوحة التحكم | **Replace after equivalent** | `apps/platform/src/features/*` | تفتيته إلى مكونات React صغيرة ونظيفة لكل وحدة ذكاء. |
| `apps/api/src/index.js` | 5.9 KB — API stub حالي | **Replace after equivalent** | `apps/api/src/server.ts` (Fastify) | استبداله بخادم Fastify حقيقي متصل بقاعدة بيانات PostgreSQL و Drizzle ORM. |
| `apps/admin/src/index.js` | 623 B — stub فارغ | **Adapt during migration** | `apps/admin/src/App.tsx` | تحويله لتطبيق React مخصص لمشغلي المنصة في المرحلة 5. |
| `apps/platform/src/index.js`| 106 B — stub فارغ | **Adapt during migration** | `apps/platform/src/main.tsx` | المدخل الرئيسي لتطبيق React الخاص بالعميل. |
| `apps/worker/src/index.js` | 1.1 KB — worker stub | **Adapt during migration** | `apps/worker/src/index.ts` | ربطه بـ Redis و BullMQ لمعالجة المهام الخلفية الحقيقية في المرحلة 2/3. |
| `services/*/` (8 خدمات) | مجلدات تحتوي README فقط | **Preserve & implement** | `services/*/domain/*` داخل الـ Monolith | بناء منطق الأعمال داخل الحزم المعيارية تدريجياً دون تحويلها لـ Microservices منفصلة. |
| `packages/*/` (15 حزمة) | مجلدات stubs فارغة | **Adapt during migration** | دمج وتفعيل الحزم الحيوية | تفعيل `packages/database`, `packages/ui`, `packages/types`, `packages/api-client`, `packages/identity`. |
