-- MIKHLAFI LABS — 011_cloud_saas_three_tiers.sql
-- Streamline subscription packages to exactly 3 standard Cloud SaaS tiers:
-- 1) plan_starter ($99/mo / 375 SAR) - 3 Engines, 100K records/mo, 5 users
-- 2) plan_pro ($299/mo / 1,125 SAR) - 5 Engines, 1M records/mo, 25 users
-- 3) plan_enterprise ($799/mo / 2,995 SAR) - All 8 Engines + AI, 10M+ records/mo, 100 users
-- Sovereign/Air-Gapped is maintained through custom on-premise inquiry rather than standard SaaS catalog.

-- 1. Reassign any existing subscriptions pointing to deprecated packages (e.g. plan_sovereign)
UPDATE organization_subscriptions
SET package_id = 'plan_enterprise'
WHERE package_id NOT IN ('plan_starter', 'plan_pro', 'plan_enterprise');

-- 2. Clear capability mappings for deprecated packages
DELETE FROM package_capabilities
WHERE package_id NOT IN ('plan_starter', 'plan_pro', 'plan_enterprise');

-- 3. Delete deprecated packages from subscription_packages table
DELETE FROM subscription_packages
WHERE id NOT IN ('plan_starter', 'plan_pro', 'plan_enterprise');

-- 4. Upsert the 3 Canonical Cloud SaaS packages with realistic market rates and strict monthly record limits
INSERT INTO subscription_packages (
  id, name_en, name_ar, tier_level, monthly_price_sar, annual_price_sar,
  currency, max_branches, max_members, monthly_record_limit, is_public, is_active
) VALUES
  (
    'plan_starter',
    'Starter Suite',
    'الباقة الأساسية',
    1,
    375.00,
    3550.00,
    'SAR',
    2,
    5,
    100000,
    true,
    true
  ),
  (
    'plan_pro',
    'Professional Suite',
    'الباقة الاحترافية',
    2,
    1125.00,
    10755.00,
    'SAR',
    10,
    25,
    1000000,
    true,
    true
  ),
  (
    'plan_enterprise',
    'Enterprise Suite',
    'باقة المؤسسات الشاملة',
    3,
    2995.00,
    29200.00,
    'SAR',
    999,
    100,
    10000000,
    true,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name_en              = EXCLUDED.name_en,
  name_ar              = EXCLUDED.name_ar,
  tier_level           = EXCLUDED.tier_level,
  monthly_price_sar    = EXCLUDED.monthly_price_sar,
  annual_price_sar     = EXCLUDED.annual_price_sar,
  currency             = EXCLUDED.currency,
  max_branches         = EXCLUDED.max_branches,
  max_members          = EXCLUDED.max_members,
  monthly_record_limit = EXCLUDED.monthly_record_limit,
  is_public            = EXCLUDED.is_public,
  is_active            = EXCLUDED.is_active;

-- 5. Re-map capabilities cleanly for the 3 packages

-- Starter (3 engines: Financial, Decisions, Data Quality)
DELETE FROM package_capabilities WHERE package_id = 'plan_starter';
INSERT INTO package_capabilities (package_id, capability_id) VALUES
  ('plan_starter', 'financial-intelligence'),
  ('plan_starter', 'executive-decisions'),
  ('plan_starter', 'data-quality')
ON CONFLICT DO NOTHING;

-- Pro (5 engines: Starter + Risk, Suppliers)
DELETE FROM package_capabilities WHERE package_id = 'plan_pro';
INSERT INTO package_capabilities (package_id, capability_id) VALUES
  ('plan_pro', 'financial-intelligence'),
  ('plan_pro', 'executive-decisions'),
  ('plan_pro', 'data-quality'),
  ('plan_pro', 'risk-intelligence'),
  ('plan_pro', 'supplier-intelligence')
ON CONFLICT DO NOTHING;

-- Enterprise (All 8 Engines + AI)
DELETE FROM package_capabilities WHERE package_id = 'plan_enterprise';
INSERT INTO package_capabilities (package_id, capability_id)
SELECT 'plan_enterprise', id FROM platform_capabilities
ON CONFLICT DO NOTHING;
