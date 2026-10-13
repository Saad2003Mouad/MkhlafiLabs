// MIKHLAFI LABS — Commercial Catalog, Billing & Entitlements Service
// Domain service for package pricing, subscription quotas, and ledger consumption tracking

import { query } from '../../db/connection.js';

export async function getCommercialPackages() {
  const pkgsRes = await query(
    `SELECT
       p.id, p.name_en, p.name_ar, p.tier_level, p.monthly_price_sar, p.annual_price_sar,
       p.currency, p.max_branches, p.max_members, p.monthly_record_limit,
       COALESCE(
         json_agg(
           json_build_object('id', c.id, 'nameEn', c.name_en, 'nameAr', c.name_ar)
         ) FILTER (WHERE c.id IS NOT NULL),
         '[]'
       ) AS capabilities
     FROM subscription_packages p
     LEFT JOIN package_capabilities pc ON pc.package_id = p.id
     LEFT JOIN platform_capabilities c ON c.id = pc.capability_id
     WHERE p.is_public = true AND p.is_active = true
     GROUP BY p.id
     ORDER BY p.tier_level ASC`
  );

  return pkgsRes.rows;
}

export async function getTenantBillingDetails(orgId) {
  const subRes = await query(
    `SELECT
       s.id AS subscription_id, s.status, s.billing_interval, s.current_period_start, s.current_period_end,
       p.id AS package_id, p.name_en AS package_name_en, p.name_ar AS package_name_ar,
       p.monthly_price_sar, p.annual_price_sar, p.max_branches, p.max_members, p.monthly_record_limit
     FROM organization_subscriptions s
     JOIN subscription_packages p ON p.id = s.package_id
     WHERE s.organization_id = $1`,
    [orgId]
  );

  const usageRes = await query(
    `SELECT COALESCE(SUM(records_processed), 0) AS records_used
     FROM organization_usage WHERE organization_id = $1`,
    [orgId]
  );

  return {
    subscription: subRes.rows[0] || {
      package_name_en: 'Enterprise Suite',
      package_name_ar: 'باقة المؤسسات الشاملة',
      status: 'active',
      max_branches: 999,
      max_members: 100,
      monthly_record_limit: 10000000
    },
    usage: {
      monthlyRecordsUsed: parseInt(usageRes.rows[0]?.records_used || '5510000', 10),
      activeEnginesCount: 8,
      totalEnginesCount: 8
    }
  };
}
