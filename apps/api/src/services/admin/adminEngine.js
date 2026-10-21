import { query } from '../../db/connection.js';
import { tenantManager } from '../../db/tenantManager.js';
import { hashPassword } from '../../auth/passwords.js';

export async function getPlatformOverview() {
  const orgStats = await query(
    `SELECT
       COUNT(*) AS total_orgs,
       COUNT(CASE WHEN status = 'active' THEN 1 END) AS active_orgs,
       COUNT(CASE WHEN status = 'suspended' THEN 1 END) AS suspended_orgs
     FROM organizations`
  );
  const userStats = await query(`SELECT COUNT(*) AS total_users FROM users`);
  const subStats = await query(
    `SELECT package_id, COUNT(*) AS count
     FROM organization_subscriptions
     GROUP BY package_id`
  );
  const leaksStats = await query(
    `SELECT
       COUNT(*) AS total_leaks,
       COALESCE(SUM(flagged_amount), 0) AS total_leakage_sar
     FROM financial_anomalies`
  );
  const leadsStats = await query(
    `SELECT COUNT(*) AS total_leads, COUNT(CASE WHEN status = 'NEW' THEN 1 END) AS new_leads FROM lead_inquiries`
  );

  return {
    organizations: {
      total: parseInt(orgStats.rows[0]?.total_orgs || '0', 10),
      active: parseInt(orgStats.rows[0]?.active_orgs || '0', 10),
      suspended: parseInt(orgStats.rows[0]?.suspended_orgs || '0', 10)
    },
    users: { total: parseInt(userStats.rows[0]?.total_users || '0', 10) },
    subscriptions: subStats.rows,
    financialIntelligence: {
      totalCases: parseInt(leaksStats.rows[0]?.total_leaks || '0', 10),
      totalFlaggedSAR: parseFloat(leaksStats.rows[0]?.total_leakage_sar || '0')
    },
    leads: {
      total: parseInt(leadsStats.rows[0]?.total_leads || '0', 10),
      new: parseInt(leadsStats.rows[0]?.new_leads || '0', 10)
    },
    platformStatus: 'OPERATIONAL'
  };
}

export async function listTenants() {
  const orgsRes = await query(
    `SELECT
       o.id, o.slug, o.name_en, o.name_ar, o.default_currency AS currency, o.timezone, o.status, o.created_at,
       s.package_id, s.status AS subscription_status, s.billing_interval, s.current_period_end,
       p.name_ar AS package_name_ar, p.name_en AS package_name_en,
       COUNT(DISTINCT m.id) AS member_count,
       COUNT(DISTINCT b.id) AS branch_count
     FROM organizations o
     LEFT JOIN organization_subscriptions s ON s.organization_id = o.id
     LEFT JOIN subscription_packages p ON p.id = s.package_id
     LEFT JOIN memberships m ON m.organization_id = o.id
     LEFT JOIN branches b ON b.organization_id = o.id
     GROUP BY o.id, s.package_id, s.status, s.billing_interval, s.current_period_end, p.name_ar, p.name_en
     ORDER BY o.created_at DESC`
  );

  return orgsRes.rows;
}

export async function createTenant({
  nameAr,
  nameEn,
  slug,
  currency = 'SAR',
  timezone = 'Asia/Riyadh',
  adminEmail,
  adminPassword = 'TempPassword2026!',
  adminNameAr,
  adminNameEn,
  packageId = 'plan_enterprise',
  subscriptionMonths = 12,
  operatorId,
  remoteIp
}) {
  const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');

  // Verify slug uniqueness
  const existingSlug = await query(`SELECT id FROM organizations WHERE slug = $1`, [cleanSlug]);
  if (existingSlug.rows.length > 0) {
    throw new Error(`معرّف المنشأة (Slug) "${cleanSlug}" مستخدم بالفعل.`);
  }

  const cleanNameAr = (nameAr || '').trim();
  const cleanNameEn = (nameEn || cleanNameAr || 'Organization').trim();
  const cleanAdminNameAr = (adminNameAr || 'مسؤول المنشأة').trim();
  const cleanAdminNameEn = (adminNameEn || 'Enterprise Admin').trim();

  // 1. Create Organization
  const orgInsert = await query(
    `INSERT INTO organizations (slug, name_en, name_ar, default_currency, timezone, status)
     VALUES ($1, $2, $3, $4, $5, 'active')
     RETURNING id, slug, name_en, name_ar, default_currency AS currency, timezone, status, created_at`,
    [cleanSlug, cleanNameEn, cleanNameAr, currency, timezone]
  );
  const organization = orgInsert.rows[0];

  // 2. Create or Find User
  const cleanEmail = adminEmail.trim().toLowerCase();
  let user;
  const userCheck = await query(`SELECT id, email FROM users WHERE email = $1`, [cleanEmail]);
  if (userCheck.rows.length > 0) {
    user = userCheck.rows[0];
  } else {
    const passwordHash = await hashPassword(adminPassword);
    const userInsert = await query(
      `INSERT INTO users (email, password_hash, name_en, name_ar, is_verified, is_platform_admin, status)
       VALUES ($1, $2, $3, $4, true, false, 'active')
       RETURNING id, email, name_en, name_ar, status`,
      [cleanEmail, passwordHash, cleanAdminNameEn, cleanAdminNameAr]
    );
    user = userInsert.rows[0];
  }

  // 3. Create Default Branch
  const branchInsert = await query(
    `INSERT INTO branches (organization_id, name_en, name_ar, is_main_hq)
     VALUES ($1, 'Main Headquarters', 'الفرع الرئيسي', true)
     RETURNING id`,
    [organization.id]
  );
  const branchId = branchInsert.rows[0]?.id;

  // 4. Create Membership as org_owner
  await query(
    `INSERT INTO memberships (organization_id, user_id, role, branch_id)
     VALUES ($1, $2, 'org_owner', $3)
     ON CONFLICT (organization_id, user_id) DO NOTHING`,
    [organization.id, user.id, branchId]
  );

  // 5. Create Subscription
  const months = Math.max(1, parseInt(subscriptionMonths, 10) || 12);
  const subInsert = await query(
    `INSERT INTO organization_subscriptions (organization_id, package_id, status, billing_interval, current_period_start, current_period_end)
     VALUES ($1, $2, 'active', 'annual', now(), now() + ($3 || ' months')::interval)
     RETURNING id, package_id, status, billing_interval, current_period_start, current_period_end`,
    [organization.id, packageId, String(months)]
  );
  const subscription = subInsert.rows[0];

  // 6. Log in Audit Trail
  await query(
    `INSERT INTO platform_audit_logs (operator_id, action, target_tenant_id, details, ip_address)
     VALUES ($1, 'TENANT_CREATED_MANUALLY', $2, $3, $4)`,
    [
      operatorId,
      organization.id,
      JSON.stringify({
        orgNameAr: nameAr,
        orgNameEn: nameEn,
        slug: cleanSlug,
        adminEmail: cleanEmail,
        packageId,
        subscriptionMonths: months
      }),
      remoteIp
    ]
  );

  return { organization, adminUser: user, subscription };
}

export async function updateTenantDetails(targetOrgId, { nameAr, nameEn, slug, currency, timezone, status, operatorId, remoteIp }) {
  const current = await query(`SELECT * FROM organizations WHERE id = $1`, [targetOrgId]);
  if (current.rows.length === 0) {
    throw new Error('المنشأة غير موجودة.');
  }

  const cleanSlug = slug ? slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-') : current.rows[0].slug;

  const updateRes = await query(
    `UPDATE organizations
     SET name_ar = COALESCE($1, name_ar),
         name_en = COALESCE($2, name_en),
         slug = $3,
         default_currency = COALESCE($4, default_currency),
         timezone = COALESCE($5, timezone),
         status = COALESCE($6, status),
         updated_at = now()
     WHERE id = $7
     RETURNING id, slug, name_en, name_ar, default_currency AS currency, timezone, status, updated_at`,
    [nameAr, nameEn, cleanSlug, currency, timezone, status, targetOrgId]
  );

  await query(
    `INSERT INTO platform_audit_logs (operator_id, action, target_tenant_id, details, ip_address)
     VALUES ($1, 'TENANT_DETAILS_UPDATED', $2, $3, $4)`,
    [operatorId, targetOrgId, JSON.stringify({ nameAr, nameEn, slug: cleanSlug, status }), remoteIp]
  );

  return updateRes.rows[0];
}

export async function deleteTenant(targetOrgId, operatorId, remoteIp) {
  const current = await query(`SELECT id, name_ar, name_en, slug FROM organizations WHERE id = $1`, [targetOrgId]);
  if (current.rows.length === 0) {
    throw new Error('المنشأة غير موجودة.');
  }
  const org = current.rows[0];

  // Delete organization (cascades to subscriptions, memberships, branches)
  await query(`DELETE FROM organizations WHERE id = $1`, [targetOrgId]);

  await query(
    `INSERT INTO platform_audit_logs (operator_id, action, target_tenant_id, details, ip_address)
     VALUES ($1, 'TENANT_DELETED', NULL, $2, $3)`,
    [operatorId, JSON.stringify({ deletedOrgId: targetOrgId, orgNameAr: org.name_ar, slug: org.slug }), remoteIp]
  );

  return { success: true, deleted: org };
}

export async function updateTenantStatus(targetOrgId, status, reason, operatorId, remoteIp) {
  const updateOrg = await query(
    `UPDATE organizations SET status = $1, updated_at = now() WHERE id = $2 RETURNING id, name_en, status`,
    [status, targetOrgId]
  );

  if (updateOrg.rows.length === 0) {
    return null;
  }

  if (status === 'suspended') {
    try {
      await tenantManager.suspendTenantEnvironment(targetOrgId);
    } catch (e) {
      console.error('[Tenant Suspension Warning]:', e.message);
    }
  }

  await query(
    `INSERT INTO platform_audit_logs (operator_id, action, target_tenant_id, details, ip_address)
     VALUES ($1, 'ORGANIZATION_STATUS_CHANGED', $2, $3, $4)`,
    [operatorId, targetOrgId, JSON.stringify({ newStatus: status, reason }), remoteIp]
  );

  return updateOrg.rows[0];
}

export async function addManualSubscription(targetOrgId, {
  packageId,
  durationMonths = 12,
  amount = 0,
  paymentMethod = 'BANK_TRANSFER',
  referenceNumber = 'MANUAL-REF',
  notes = '',
  operatorId,
  remoteIp
}) {
  const orgCheck = await query(`SELECT id, name_ar, name_en FROM organizations WHERE id = $1`, [targetOrgId]);
  if (orgCheck.rows.length === 0) {
    throw new Error('المنشأة غير موجودة.');
  }

  const months = Math.max(1, parseInt(durationMonths, 10) || 12);

  const subUpsert = await query(
    `INSERT INTO organization_subscriptions (organization_id, package_id, status, billing_interval, current_period_start, current_period_end, updated_at)
     VALUES ($1, $2, 'active', 'annual', now(), now() + ($3 || ' months')::interval, now())
     ON CONFLICT (organization_id)
     DO UPDATE SET
       package_id = EXCLUDED.package_id,
       status = 'active',
       current_period_start = now(),
       current_period_end = now() + ($3 || ' months')::interval,
       updated_at = now()
     RETURNING id, package_id, status, billing_interval, current_period_start, current_period_end`,
    [targetOrgId, packageId, String(months)]
  );

  await query(
    `INSERT INTO platform_audit_logs (operator_id, action, target_tenant_id, details, ip_address)
     VALUES ($1, 'MANUAL_SUBSCRIPTION_PROVISIONED', $2, $3, $4)`,
    [
      operatorId,
      targetOrgId,
      JSON.stringify({
        packageId,
        durationMonths: months,
        amount: parseFloat(amount) || 0,
        paymentMethod,
        referenceNumber,
        notes,
        confirmedAt: new Date().toISOString()
      }),
      remoteIp
    ]
  );

  return subUpsert.rows[0];
}

export async function confirmOrganizationPayment(orgId, { amount = 0, referenceNumber = 'MANUAL-WIRE', notes = '', operatorId, remoteIp }) {
  const subUpdate = await query(
    `UPDATE organization_subscriptions
     SET status = 'active',
         current_period_end = now() + interval '365 days',
         updated_at = now()
     WHERE organization_id = $1
     RETURNING id, package_id, status, current_period_end`,
    [orgId]
  );

  await query(
    `INSERT INTO platform_audit_logs (operator_id, action, target_tenant_id, details, ip_address)
     VALUES ($1, 'MANUAL_PAYMENT_CONFIRMED', $2, $3, $4)`,
    [operatorId, orgId, JSON.stringify({ amount, referenceNumber, notes, confirmedAt: new Date().toISOString() }), remoteIp]
  );

  return subUpdate.rows[0] || null;
}

export async function listPackages() {
  const res = await query(
    `SELECT p.*,
       COALESCE(
         (SELECT json_agg(pc.capability_id) FROM package_capabilities pc WHERE pc.package_id = p.id),
         '[]'::json
       ) AS capabilities,
       (SELECT COUNT(*) FROM organization_subscriptions s WHERE s.package_id = p.id AND s.status = 'active') AS active_subscribers_count
     FROM subscription_packages p
     ORDER BY p.tier_level ASC`
  );
  return res.rows;
}

export async function createCustomPackage({
  id,
  nameAr,
  nameEn,
  tierLevel = 1,
  monthlyPriceSar = 0,
  annualPriceSar = 0,
  maxBranches = 1,
  maxMembers = 5,
  monthlyRecordLimit = 100000,
  capabilities = [],
  operatorId,
  remoteIp
}) {
  const cleanId = id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');

  const check = await query(`SELECT id FROM subscription_packages WHERE id = $1`, [cleanId]);
  if (check.rows.length > 0) {
    throw new Error(`معرف الباقة "${cleanId}" موجود مسبقاً.`);
  }

  const pkgInsert = await query(
    `INSERT INTO subscription_packages (id, name_en, name_ar, tier_level, monthly_price_sar, annual_price_sar, max_branches, max_members, monthly_record_limit, is_public, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, true)
     RETURNING *`,
    [
      cleanId,
      nameEn.trim(),
      nameAr.trim(),
      parseInt(tierLevel, 10) || 1,
      parseFloat(monthlyPriceSar) || 0,
      parseFloat(annualPriceSar) || 0,
      parseInt(maxBranches, 10) || 1,
      parseInt(maxMembers, 10) || 5,
      parseInt(monthlyRecordLimit, 10) || 100000
    ]
  );
  const pkg = pkgInsert.rows[0];

  if (Array.isArray(capabilities) && capabilities.length > 0) {
    for (const capId of capabilities) {
      await query(
        `INSERT INTO package_capabilities (package_id, capability_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [cleanId, capId]
      );
    }
  }

  await query(
    `INSERT INTO platform_audit_logs (operator_id, action, target_tenant_id, details, ip_address)
     VALUES ($1, 'SUBSCRIPTION_PACKAGE_CREATED', NULL, $2, $3)`,
    [operatorId, JSON.stringify({ packageId: cleanId, nameAr, monthlyPriceSar, annualPriceSar }), remoteIp]
  );

  return pkg;
}

export async function updatePackageDetails(packageId, {
  nameAr,
  nameEn,
  tierLevel,
  monthlyPriceSar,
  annualPriceSar,
  maxBranches,
  maxMembers,
  monthlyRecordLimit,
  capabilities,
  isActive,
  operatorId,
  remoteIp
}) {
  const check = await query(`SELECT * FROM subscription_packages WHERE id = $1`, [packageId]);
  if (check.rows.length === 0) {
    throw new Error('الباقة غير موجودة.');
  }

  const updateRes = await query(
    `UPDATE subscription_packages
     SET name_ar = COALESCE($1, name_ar),
         name_en = COALESCE($2, name_en),
         tier_level = COALESCE($3, tier_level),
         monthly_price_sar = COALESCE($4, monthly_price_sar),
         annual_price_sar = COALESCE($5, annual_price_sar),
         max_branches = COALESCE($6, max_branches),
         max_members = COALESCE($7, max_members),
         monthly_record_limit = COALESCE($8, monthly_record_limit),
         is_active = COALESCE($9, is_active)
     WHERE id = $10
     RETURNING *`,
    [
      nameAr,
      nameEn,
      tierLevel !== undefined ? parseInt(tierLevel, 10) : null,
      monthlyPriceSar !== undefined ? parseFloat(monthlyPriceSar) : null,
      annualPriceSar !== undefined ? parseFloat(annualPriceSar) : null,
      maxBranches !== undefined ? parseInt(maxBranches, 10) : null,
      maxMembers !== undefined ? parseInt(maxMembers, 10) : null,
      monthlyRecordLimit !== undefined ? parseInt(monthlyRecordLimit, 10) : null,
      isActive !== undefined ? Boolean(isActive) : null,
      packageId
    ]
  );

  if (Array.isArray(capabilities)) {
    await query(`DELETE FROM package_capabilities WHERE package_id = $1`, [packageId]);
    for (const capId of capabilities) {
      await query(
        `INSERT INTO package_capabilities (package_id, capability_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [packageId, capId]
      );
    }
  }

  await query(
    `INSERT INTO platform_audit_logs (operator_id, action, target_tenant_id, details, ip_address)
     VALUES ($1, 'SUBSCRIPTION_PACKAGE_UPDATED', NULL, $2, $3)`,
    [operatorId, JSON.stringify({ packageId, nameAr, monthlyPriceSar, annualPriceSar }), remoteIp]
  );

  return updateRes.rows[0];
}

export async function deleteCustomPackage(packageId, operatorId, remoteIp) {
  // Check if active subscribers exist
  const countCheck = await query(
    `SELECT COUNT(*) AS active_count FROM organization_subscriptions WHERE package_id = $1 AND status = 'active'`,
    [packageId]
  );
  const activeCount = parseInt(countCheck.rows[0]?.active_count || '0', 10);

  if (activeCount > 0) {
    // If active subscribers exist, we cannot hard delete; we soft-disable it
    await query(`UPDATE subscription_packages SET is_active = false, is_public = false WHERE id = $1`, [packageId]);
    await query(
      `INSERT INTO platform_audit_logs (operator_id, action, target_tenant_id, details, ip_address)
       VALUES ($1, 'PACKAGE_DEACTIVATED_DUE_TO_ACTIVE_USERS', NULL, $2, $3)`,
      [operatorId, JSON.stringify({ packageId, activeCount }), remoteIp]
    );
    return { success: true, deactivated: true, message: 'تم إيقاف تفعيل الباقة لوجود اشتراكات نشطة عليها.' };
  }

  await query(`DELETE FROM package_capabilities WHERE package_id = $1`, [packageId]);
  await query(`DELETE FROM subscription_packages WHERE id = $1`, [packageId]);

  await query(
    `INSERT INTO platform_audit_logs (operator_id, action, target_tenant_id, details, ip_address)
     VALUES ($1, 'PACKAGE_DELETED', NULL, $2, $3)`,
    [operatorId, JSON.stringify({ packageId }), remoteIp]
  );

  return { success: true, deleted: true };
}

export async function listPlatformUsers(limit = 100) {
  const usersRes = await query(
    `SELECT u.id, u.email, u.name_en, u.name_ar, u.is_verified, u.is_platform_admin, u.status, u.created_at,
       COUNT(DISTINCT m.organization_id) AS tenant_count,
       COALESCE(string_agg(DISTINCT o.name_ar, ', '), 'بدون منظمة (مشرف منصة)') AS organizations_summary
     FROM users u
     LEFT JOIN memberships m ON m.user_id = u.id
     LEFT JOIN organizations o ON o.id = m.organization_id
     GROUP BY u.id
     ORDER BY u.created_at DESC
     LIMIT $1`,
    [limit]
  );

  return usersRes.rows;
}

export async function createPlatformUser({
  email,
  password,
  nameAr,
  nameEn,
  isPlatformAdmin = false,
  operatorId,
  remoteIp
}) {
  const cleanEmail = email.trim().toLowerCase();
  const exists = await query(`SELECT id FROM users WHERE email = $1`, [cleanEmail]);
  if (exists.rows.length > 0) {
    throw new Error(`البريد الإلكتروني "${cleanEmail}" مسجل مسبقاً.`);
  }

  const passwordHash = await hashPassword(password);
  const userInsert = await query(
    `INSERT INTO users (email, password_hash, name_en, name_ar, is_verified, is_platform_admin, status)
     VALUES ($1, $2, $3, $4, true, $5, 'active')
     RETURNING id, email, name_en, name_ar, is_verified, is_platform_admin, status, created_at`,
    [cleanEmail, passwordHash, nameEn.trim(), nameAr.trim(), Boolean(isPlatformAdmin)]
  );

  await query(
    `INSERT INTO platform_audit_logs (operator_id, action, target_tenant_id, details, ip_address)
     VALUES ($1, 'GLOBAL_USER_CREATED', NULL, $2, $3)`,
    [operatorId, JSON.stringify({ email: cleanEmail, isPlatformAdmin }), remoteIp]
  );

  return userInsert.rows[0];
}

export async function updatePlatformUserDetails(userId, {
  nameAr,
  nameEn,
  status,
  isPlatformAdmin,
  newPassword,
  operatorId,
  remoteIp
}) {
  const check = await query(`SELECT * FROM users WHERE id = $1`, [userId]);
  if (check.rows.length === 0) {
    throw new Error('المستخدم غير موجود.');
  }

  let passwordHash = null;
  if (newPassword && newPassword.trim()) {
    passwordHash = await hashPassword(newPassword.trim());
  }

  const updateRes = await query(
    `UPDATE users
     SET name_ar = COALESCE($1, name_ar),
         name_en = COALESCE($2, name_en),
         status = COALESCE($3, status),
         is_platform_admin = COALESCE($4, is_platform_admin),
         password_hash = COALESCE($5, password_hash),
         updated_at = now()
     WHERE id = $6
     RETURNING id, email, name_en, name_ar, is_verified, is_platform_admin, status, updated_at`,
    [
      nameAr,
      nameEn,
      status,
      isPlatformAdmin !== undefined ? Boolean(isPlatformAdmin) : null,
      passwordHash,
      userId
    ]
  );

  await query(
    `INSERT INTO platform_audit_logs (operator_id, action, target_tenant_id, details, ip_address)
     VALUES ($1, 'GLOBAL_USER_UPDATED', NULL, $2, $3)`,
    [operatorId, JSON.stringify({ userId, status, isPlatformAdmin, passwordReset: Boolean(passwordHash) }), remoteIp]
  );

  return updateRes.rows[0];
}

export async function deletePlatformUser(userId, operatorId, remoteIp) {
  if (userId === operatorId) {
    throw new Error('لا يمكنك حذف حسابك الشخصي الذي تستخدمه حالياً لإدارة المنصة.');
  }

  const check = await query(`SELECT id, email FROM users WHERE id = $1`, [userId]);
  if (check.rows.length === 0) {
    throw new Error('المستخدم غير موجود.');
  }
  const user = check.rows[0];

  await query(`DELETE FROM memberships WHERE user_id = $1`, [userId]);
  await query(`DELETE FROM users WHERE id = $1`, [userId]);

  await query(
    `INSERT INTO platform_audit_logs (operator_id, action, target_tenant_id, details, ip_address)
     VALUES ($1, 'GLOBAL_USER_DELETED', NULL, $2, $3)`,
    [operatorId, JSON.stringify({ deletedUserId: userId, email: user.email }), remoteIp]
  );

  return { success: true, deletedUser: user };
}

export async function listLeadInquiries(limit = 100) {
  const leadsRes = await query(
    `SELECT * FROM lead_inquiries ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );

  return leadsRes.rows;
}

export async function updateLeadStatus(leadId, status, notes = '', operatorId, remoteIp) {
  const updateRes = await query(
    `UPDATE lead_inquiries
     SET status = $1,
         message = CASE WHEN $2 <> '' THEN COALESCE(message, '') || E'\n[ملاحظة المشغل]: ' || $2 ELSE message END
     WHERE id = $3
     RETURNING *`,
    [status, notes, leadId]
  );

  if (updateRes.rows.length === 0) {
    throw new Error('طلب التواصل غير موجود.');
  }

  await query(
    `INSERT INTO platform_audit_logs (operator_id, action, target_tenant_id, details, ip_address)
     VALUES ($1, 'LEAD_STATUS_UPDATED', NULL, $2, $3)`,
    [operatorId, JSON.stringify({ leadId, status, notes }), remoteIp]
  );

  return updateRes.rows[0];
}

// ── Platform Services Catalog ───────────────────────────────────────────────
// The eight intelligence engines are operator-owned data. The console edits
// them here; the public website reads the same rows. Nothing is hard-coded.

export async function listPlatformServices() {
  const res = await query(
    `SELECT id, engine_number, slug, badge_ar, badge_en, title_ar, title_en,
            summary_ar, summary_en, sort_order, is_enabled, updated_at
     FROM platform_services
     ORDER BY sort_order ASC, engine_number ASC`
  );
  return res.rows;
}

/** What the public website is allowed to show: enabled engines, in order. */
export async function listPublishedServices() {
  const res = await query(
    `SELECT id, engine_number, slug, badge_ar, badge_en, title_ar, title_en,
            summary_ar, summary_en, sort_order
     FROM platform_services
     WHERE is_enabled = true
     ORDER BY sort_order ASC, engine_number ASC`
  );
  return res.rows;
}

export async function updatePlatformService(serviceId, {
  badgeAr,
  badgeEn,
  titleAr,
  titleEn,
  summaryAr,
  summaryEn,
  sortOrder,
  isEnabled,
  operatorId,
  remoteIp
} = {}) {
  const existing = await query(`SELECT id FROM platform_services WHERE id = $1`, [serviceId]);
  if (existing.rows.length === 0) {
    throw new Error('الخدمة غير موجودة.');
  }

  const updateRes = await query(
    `UPDATE platform_services
     SET badge_ar   = COALESCE($1, badge_ar),
         badge_en   = COALESCE($2, badge_en),
         title_ar   = COALESCE($3, title_ar),
         title_en   = COALESCE($4, title_en),
         summary_ar = COALESCE($5, summary_ar),
         summary_en = COALESCE($6, summary_en),
         sort_order = COALESCE($7, sort_order),
         is_enabled = COALESCE($8, is_enabled),
         updated_at = now()
     WHERE id = $9
     RETURNING *`,
    [
      badgeAr ?? null,
      badgeEn ?? null,
      titleAr ?? null,
      titleEn ?? null,
      summaryAr ?? null,
      summaryEn ?? null,
      typeof sortOrder === 'number' ? sortOrder : null,
      typeof isEnabled === 'boolean' ? isEnabled : null,
      serviceId
    ]
  );

  await query(
    `INSERT INTO platform_audit_logs (operator_id, action, target_tenant_id, details, ip_address)
     VALUES ($1, 'SERVICE_UPDATED', NULL, $2, $3)`,
    [
      operatorId,
      JSON.stringify({
        serviceId,
        titleAr,
        titleEn,
        isEnabled,
        sortOrder
      }),
      remoteIp
    ]
  );

  return { success: true, service: updateRes.rows[0] };
}

export async function listPlatformAuditLogs(limit = 100) {
  const auditRes = await query(
    `SELECT a.*, u.email AS operator_email, u.name_ar AS operator_name_ar,
       o.name_ar AS target_tenant_name_ar
     FROM platform_audit_logs a
     LEFT JOIN users u ON u.id = a.operator_id
     LEFT JOIN organizations o ON o.id = a.target_tenant_id
     ORDER BY a.created_at DESC LIMIT $1`,
    [limit]
  );

  return auditRes.rows;
}
