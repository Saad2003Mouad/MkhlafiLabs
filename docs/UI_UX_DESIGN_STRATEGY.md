# UI_UX_DESIGN_STRATEGY.md
# MIKHLAFI LABS — استراتيجية التصميم وتجربة المستخدم
### ENTERPRISE DESIGN SYSTEM, THEMES, LOCALIZATION & ACCESSIBILITY
**Version:** 1.0.0 (Master Architecture Plan)  

---

## 1. الهوية البصرية وفلسفة التصميم (Visual Brand Philosophy)

* **الشخصية البصرية:** رصينة، واثقة، هندسية، ومبنية لبيئة الأعمال المؤسسية الرفيعة (Restrained, Confident, Modern Enterprise).
* **تجنب الصيحات الرخيصة والمشتتة (Strict Anti-Patterns):**
  * ❌ يُمنع التوهج المبالغ فيه (Neon glows) وتدرجات الذكاء الاصطناعي البنفسجية/الزرقاء المبتذلة.
  * ❌ يُمنع الزجاجية المفرطة (Glassmorphism) التي تضر بوضوح قراءة الأرقام الحساسة.
  * ❌ يُمنع تكديس البطاقات داخل بعضها دون هدف معماري.
  * ❌ يُمنع استخدام الرموز التعبيرية (Emoji) كبديل لمنظومة الأيقونات المتناسقة.
  * ❌ يُمنع الرسوم البيانية التزيينية التي لا تقدم قيمة تحليلية حقيقية.
* **لوحة الألوان الأساسية المعتمدة (Palette Foundations):**
  * **الأساس المحايد (Neutral/Charcoal):** رماديات وفحميات عميقة، هادئة ومريحة للعين.
  * **اللون المميز الرصين (Refined Accent):** زيتوني هادئ وخافت / برونزي مؤسسي خافت (`#876C36` أو `hsl(142, 45%, 35%)` مع التحقق من التباين العالي WCAG AA).
  * **ألوان الدلالة الوظيفية (Semantic Status):**
    * النجاح (Success): أخضر زمردي عميق وواضح.
    * التحذير (Warning): كهرماني دافئ متزن.
    * الخطر / الشذوذ (Danger): أحمر قرمزي نقي دون وهج.
    * المعلومات (Info): أزرق فولاذي هادئ.

---

## 2. نظام المتغيرات الدلالية الموحدة (Design Tokens)

يتم تعريف كافة الألوان والأحجام باستخدام **Design Tokens دلالية** في CSS / TypeScript، بحيث تتغير قيمتها تلقائياً وفقاً للسمة (Theme) واللغة، مع حظر وضع قيم ألوان عشوائية داخل المكونات:

```css
:root {
  /* Surface Tokens */
  --bg-app: #0B0F12;
  --bg-surface: #141B20;
  --bg-surface-elevated: #1B242B;
  --bg-surface-subtle: #10161A;

  /* Text Tokens */
  --text-primary: #F0F4F8;
  --text-secondary: #94A3B8;
  --text-tertiary: #64748B;
  --text-inverse: #0B0F12;

  /* Border Tokens */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-default: rgba(255, 255, 255, 0.15);
  --border-strong: rgba(255, 255, 255, 0.25);

  /* Brand & Accent Tokens */
  --accent-base: #876C36;
  --accent-light: #A38547;
  --accent-subtle: rgba(135, 108, 54, 0.15);

  /* Status Tokens */
  --status-success: #10B981;
  --status-warning: #F59E0B;
  --status-danger: #EF4444;
  --status-info: #3B82F6;

  /* Geometry & Spacing */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --sidebar-width: 270px;
  --header-height: 68px;
}

[data-theme="light"] {
  --bg-app: #F8FAFC;
  --bg-surface: #FFFFFF;
  --bg-surface-elevated: #FFFFFF;
  --bg-surface-subtle: #F1F5F9;

  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-tertiary: #94A3B8;
  --text-inverse: #FFFFFF;

  --border-subtle: rgba(0, 0, 0, 0.06);
  --border-default: rgba(0, 0, 0, 0.12);
  --border-strong: rgba(0, 0, 0, 0.22);
}
```

---

## 3. تجربة تعدد اللغات وتوافق RTL و LTR الكامل

1. **العربية والإنجليزية كركيزتين أساسيتين متساويتين:**
   * اللغة العربية ليست مجرد ترجمة نصوص سطحية، بل هي بنية تخطيط أصيلة.
   * استخدام الخصائص المنطقية في CSS (Logical Properties): `margin-inline-start`, `padding-inline`, `border-inline-start` بدلاً من `left` و `right` الثابتة.
2. **الخطوط المعتمدة (Typography Stack):**
   * **العربية:** خط `Almarai` أو `Readex Pro` أو `IBM Plex Sans Arabic` للحصول على وضوح مؤسسي عالي في الأرقام والمصطلحات.
   * **الإنجليزية:** `Sora` أو `Inter` للعناوين والنصوص المؤسسية.
   * **الأرقام والأكواد:** `JetBrains Mono` لعرض الأرقام والمؤشرات المالية وجداول التدقيق دون اختلال المحاذاة.
3. **تنسيق الأرقام والعملات والتواريخ:**
   * استخدام `Intl.NumberFormat` و `Intl.DateTimeFormat` ديناميكياً بناءً على إعدادات المؤسسة واللغة المختارة دون تثبيت قيم العملة بالريال أو الدولار بشكل مسبق.

---

## 4. إمكانية الوصول والتجاوب مع مختلف الشاشات (Accessibility & Responsiveness)

* **الأجهزة المدعومة:** الشاشات المكتبية العريضة (Desktop 1920px+)، الحواسيب المحمولة (1366px-1440px)، الأجهزة اللوحية (Tablet 768px-1024px)، والهواتف الذكية (Mobile < 768px).
* **سلوك الشاشات الضيقة:**
  * تحويل القائمة الجانبية (Sidebar) إلى درج انزلاقي سلس (Drawer).
  * تكيف الجداول الضخمة عبر التمرير الأفقي المحمي أو بطاقات العرض المركزة.
  * الحفاظ على سهولة الوصول للإجراءات الحاسمة وأزرار التصفية.
* **معايير الوصول (Accessibility Checklist):**
  * وضوح تباين الألوان (Color Contrast > 4.5:1 للنصوص العادية).
  * التنقل الكامل باستخدام لوحة المفاتيح (Tab navigation & visible focus indicators).
  * عدم الاعتماد على اللون بمفرده للتعبير عن الحالة (إضافة أيقونات ونصوص توضيحية بجانب الألوان).
  * دعم تفضيل تقليل الحركة (`prefers-reduced-motion`).
