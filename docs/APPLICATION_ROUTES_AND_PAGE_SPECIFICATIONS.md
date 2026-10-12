# APPLICATION_ROUTES_AND_PAGE_SPECIFICATIONS.md
# MIKHLAFI LABS — جدول المسارات ومواصفات الشاشات
### COMPREHENSIVE ROUTE INVENTORY & PAGE COMPONENT SPECIFICATIONS
**Version:** 1.0.0 (Master Architecture Plan)  

---

## 1. شجرة المسارات العامة والمكونات (Route-to-Component Mapping)

```
/ (Root Layout)
├── (Public Website Layout)
│   ├── /                          -> HomePage
│   ├── /platform                  -> PlatformOverviewPage
│   ├── /capabilities              -> SharedCapabilitiesPage
│   ├── /solutions                 -> SolutionsIndexPage
│   ├── /solutions/:slug           -> DynamicSolutionDetailPage
│   ├── /integrations              -> IntegrationsEcosystemPage
│   ├── /security                  -> SecurityAndTrustPage
│   ├── /deployment                -> DeploymentOptionsPage
│   ├── /pricing                   -> PricingAndCatalogPage
│   ├── /about                     -> AboutCompanyPage
│   ├── /contact                   -> QualifiedInquiriesPage
│   ├── /book-demo                 -> BookDemoRequestPage
│   ├── /privacy                   -> PrivacyPolicyPage
│   └── /terms                     -> TermsOfServicePage
│
├── (Auth & Onboarding Layout)
│   ├── /login                     -> LoginPage
│   ├── /forgot-password           -> ForgotPasswordPage
│   ├── /reset-password            -> ResetPasswordPage
│   ├── /verify-email              -> VerifyEmailPage
│   ├── /accept-invitation         -> AcceptInvitationPage
│   └── /onboarding
│       ├── /organization          -> CreateOrJoinOrgStep
│       ├── /profile               -> UserProfileStep
│       ├── /preferences           -> LocaleAndCurrencyStep
│       ├── /connect-data          -> ConnectDataSourceOrDemoStep
│       └── /complete              -> OnboardingSummaryStep
│
├── (Customer App Layout - /app/*) [Requires Auth & Active Org Context]
│   ├── /app                       -> Redirect to /app/overview
│   ├── /app/overview              -> ExecutiveWorkspaceOverviewPage
│   ├── /app/command-center        -> OperationalCommandCenterPage
│   │
│   ├── (Intelligence Modules)
│   │   ├── /app/intelligence                 -> IntelligenceDirectoryPage
│   │   ├── /app/intelligence/financial       -> FinancialIntelligencePage
│   │   ├── /app/intelligence/decisions       -> ExecutiveDecisionCenterPage
│   │   ├── /app/intelligence/risks           -> RiskIntelligencePage
│   │   ├── /app/intelligence/projects        -> ProjectIntelligencePage
│   │   ├── /app/intelligence/suppliers       -> SupplierIntelligencePage
│   │   ├── /app/intelligence/customers       -> CustomerIntelligencePage
│   │   └── /app/intelligence/data-quality    -> DataQualityIntelligencePage
│   │
│   ├── /app/assistant                        -> AiBusinessAssistantPage
│   ├── /app/assistant/history/:conversationId-> ConversationHistoryPage
│   ├── /app/reports                          -> ReportsIndexPage
│   ├── /app/reports/:reportId                -> ReportViewerPage
│   ├── /app/alerts                           -> AlertsManagementPage
│   ├── /app/activity                         -> AuditActivityStreamPage
│   ├── /app/workflows                        -> WorkflowsIndexPage
│   ├── /app/data-sources                     -> DataSourcesManagementPage
│   ├── /app/integrations                     -> CustomerIntegrationsPage
│   │
│   ├── (Organization & Tenancy Admin)
│   │   ├── /app/organization                 -> OrgProfileSettingsPage
│   │   ├── /app/organization/branches        -> OrgBranchesPage
│   │   ├── /app/organization/members         -> OrgMembersAndInvitesPage
│   │   ├── /app/organization/roles           -> OrgRolesAndPermissionsPage
│   │   ├── /app/organization/security        -> OrgSecuritySettingsPage
│   │   └── /app/organization/audit           -> OrgAuditLogsPage
│   │
│   ├── (Billing & Entitlements)
│   │   ├── /app/billing/plan                 -> CurrentPlanAndEntitlementsPage
│   │   ├── /app/billing/usage                -> ResourceUsageMetricsPage
│   │   └── /app/billing/invoices             -> InvoicesAndReceiptsPage
│   │
│   └── (User Settings)
│       ├── /app/settings/profile             -> PersonalProfilePage
│       ├── /app/settings/appearance          -> ThemeAndLanguageSettingsPage
│       └── /app/settings/security            -> PasswordAndSessionsPage
│
└── (Internal Platform Admin Layout - /admin/*) [Requires Platform Operator Role]
    ├── /admin                     -> PlatformOperatorOverviewPage
    ├── /admin/organizations       -> TenantsDirectoryPage
    ├── /admin/organizations/:id   -> TenantDetailAndImpersonationPage
    ├── /admin/users               -> GlobalUsersDirectoryPage
    ├── /admin/services            -> CapabilityCatalogManagerPage
    ├── /admin/plans               -> SubscriptionPlansManagerPage
    ├── /admin/entitlements        -> EntitlementsOverridePage
    ├── /admin/deployments         -> ClusterAndDeploymentsPage
    ├── /admin/jobs                -> BackgroundJobsQueueMonitorPage
    ├── /admin/audit               -> GlobalSecurityAuditPage
    └── /admin/system-health       -> PlatformHealthAndDiagnosticsPage
```

---

## 2. مواصفات شاشات مساحة عمل العميل (Customer Workspace Specs)

### 2.1 الشريط العلوي الموحد (Application Header)
* **محدد المؤسسة (Workspace / Org Selector):** يتيح التبديل الفوري بين المؤسسات المصرح للمستخدم بالوصول إليها.
* **محدد الفرع (Branch Selector):** متاح فقط عند تفعيل الفروع داخل إعدادات المؤسسة.
* **محدد النطاق الزمني (Date-Range Selector):** (اليوم، آخر 7 أيام، الشهر الحالي، الربع السنوي، مخصص).
* **محدد اللغة والمظهر:** تبديل فوري بين العربية والإنجليزية، والوضع الداكن/الفاتح، دون إعادة تحميل الصفحة.
* **مركز التنبيهات والملف الشخصي:** إشعارات فورية مع قائمة سريعة لتسجيل الخروج والإعدادات.

### 2.2 لوحة القيادة التنفيذية العامة (`/app/overview`)
* **بطاقات المؤشرات الحيوية (KPI Cards):**
  * تتكيف حسب القطاع وتوفر البيانات المتاحة.
  * كل بطاقة تعرض: القيمة الحالية، التغير مقارنة بالفترة السابقة، الوحدة، ومصدر البيانات، وحالة الجودة (محدث، قديم، غير مكتمل).
  * تمييز صريح: الارتفاع ليس دائماً إيجابياً (مثال: ارتفاع تكاليف التشغيل سلبي).
* **شاشات الحالات الخاصة (States):**
  * **Loading Skeleton:** تحميل هيكلي أنيق ومريح للعين.
  * **Honest Empty State:** رسالة واضحة عند عدم ربط مصادر بيانات مع زر "ربط مصدر بيانات جديد" بدلاً من إظهار أرقام وهمية.
  * **Stale Data Warning:** تنبيه بارز إذا لم تُحدث البيانات منذ أكثر من 24 ساعة.

---

## 3. مواصفات الشاشات التخصصية لوحدات الذكاء الثمانية

1. **الذكاء المالي (`/app/intelligence/financial`):**
   * كشف الانحرافات، تسرب الإيرادات، تدقيق المدفوعات غير الاعتيادية، ومطابقة القيود.
   * التمييز الصارم بين "شذوذ محتمل يحتاج تدقيق" وبين "تأكيد احتيال أو خسارة".
2. **مركز القرارات التنفيذية (`/app/intelligence/decisions`):**
   * عرض الأولويات الحيوية، الفرص الضائعة، سيناريوهات المقارنة (Trade-offs)، والتوصيات المدعومة بالأدلة.
3. **ذكاء المخاطر (`/app/intelligence/risks`):**
   * سجل المخاطر التشغيلية والمالية، مصفوفة التأثير والاحتمالية، وتاريخ المتابعة.
4. **ذكاء المشاريع (`/app/intelligence/projects`):**
   * للشركات القائمة على المشاريع: نسب الإنجاز، انحرافات الميزانية، ومؤشرات التأخير. (ميزة اختيارية غير مفروضة على باقي القطاعات).
5. **ذكاء الموردين (`/app/intelligence/suppliers`):**
   * تقييم دقة التوريد، تركز المخاطر على موردين محددين، ومقارنات الأسعار وفق البيانات المسجلة.
6. **ذكاء العملاء (`/app/intelligence/customers`):**
   * تتبع فترات النشاط، العملاء المعرضين للانسحاب (Churn risk)، وتركز الإيرادات.
7. **المساعد الذكي للأعمال (`/app/assistant`):**
   * استجواب بيانات الشركة باللغة الطبيعية (عربي/إنجليزي)، مع توثيق المصدر البرمجي لكل إجابة وعدم اختلاق معلومات عند نقص البيانات.
8. **ذكاء جودة البيانات (`/app/intelligence/data-quality`):**
   * حصر السجلات الناقصة، المكررة، المعاملات غير المتطابقة، ومشاكل المزامنة.
