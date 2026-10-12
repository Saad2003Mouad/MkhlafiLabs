-- MIKHLAFI LABS — 001_initial_schema.sql
-- Foundational Multi-Tenant Relational Schema (PostgreSQL 16)
-- Conforms to Master Architecture v1.0, docs/DATABASE_AND_DOMAIN_MODEL.md, and docs/SECURITY_AND_AUTHORIZATION_PLAN.md

-- 1. Migration Tracker
CREATE TABLE IF NOT EXISTS _migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          VARCHAR(255) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  name_ar        VARCHAR(150),
  name_en        VARCHAR(150) NOT NULL,
  phone          VARCHAR(50),
  is_verified    BOOLEAN NOT NULL DEFAULT false,
  status         VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'deactivated'
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 3. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             VARCHAR(100) NOT NULL UNIQUE,
  name_ar          VARCHAR(200) NOT NULL,
  name_en          VARCHAR(200) NOT NULL,
  industry_type    VARCHAR(100) NOT NULL DEFAULT 'general',
  default_currency VARCHAR(10) NOT NULL DEFAULT 'SAR',
  default_locale   VARCHAR(10) NOT NULL DEFAULT 'ar',
  timezone         VARCHAR(50) NOT NULL DEFAULT 'Asia/Riyadh',
  status           VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'archived'
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);

-- 4. Branches Table
CREATE TABLE IF NOT EXISTS branches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code            VARCHAR(50),
  name_ar         VARCHAR(200) NOT NULL,
  name_en         VARCHAR(200) NOT NULL,
  city            VARCHAR(100),
  is_main_hq      BOOLEAN NOT NULL DEFAULT false,
  status          VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_branches_org ON branches(organization_id);

-- 5. Roles & Permissions Table (RBAC)
CREATE TABLE IF NOT EXISTS roles (
  id          VARCHAR(50) PRIMARY KEY, -- 'org_owner', 'org_admin', 'manager', 'analyst', 'viewer'
  name_ar     VARCHAR(100) NOT NULL,
  name_en     VARCHAR(100) NOT NULL,
  description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS permissions (
  id          VARCHAR(100) PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  category    VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       VARCHAR(50) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id VARCHAR(100) NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 6. Memberships Table (User to Organization with Strict Tenant Isolation)
CREATE TABLE IF NOT EXISTS memberships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role            VARCHAR(50) NOT NULL REFERENCES roles(id),
  branch_id       UUID REFERENCES branches(id) ON DELETE SET NULL,
  status          VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'invited'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_memberships_user_org UNIQUE (user_id, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_org ON memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_memberships_org_role ON memberships(organization_id, role);

-- 7. User Sessions Table (Cryptographically Hashed Server Sessions)
CREATE TABLE IF NOT EXISTS user_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  is_revoked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_user_expires ON user_sessions(user_id, expires_at);

-- 8. Audit Logs Table (Immutable Security & Administrative Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  action          VARCHAR(100) NOT NULL,
  entity_type     VARCHAR(100) NOT NULL,
  entity_id       VARCHAR(100),
  details         JSONB,
  ip_address      VARCHAR(45),
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created ON audit_logs(organization_id, created_at DESC);

-- 9. Tenant Decisions Table (Domain Entity Proving Strict Tenant Isolation)
CREATE TABLE IF NOT EXISTS tenant_decisions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id       UUID REFERENCES branches(id) ON DELETE SET NULL,
  title           VARCHAR(255) NOT NULL,
  category        VARCHAR(100) NOT NULL,
  impact_amount   NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  currency        VARCHAR(10) NOT NULL DEFAULT 'SAR',
  risk_level      VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
  status          VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'EXECUTED', 'REJECTED'
  source_system   VARCHAR(100) DEFAULT 'ERP_RECONCILIATION',
  details         JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenant_decisions_org ON tenant_decisions(organization_id);
CREATE INDEX IF NOT EXISTS idx_tenant_decisions_org_status ON tenant_decisions(organization_id, status);

-- 10. Seed Core Roles & Permissions
INSERT INTO roles (id, name_ar, name_en, description) VALUES
  ('org_owner', 'مالك المؤسسة', 'Organization Owner', 'Full control over organization, members, billing, settings and intelligence operations'),
  ('org_admin', 'مدير المؤسسة', 'Organization Administrator', 'Manage members, branches, integrations and view all audit trails'),
  ('manager', 'مدير عمليات', 'Operations Manager', 'Manage branch operations and execute decision workflows'),
  ('analyst', 'محلل أعمال', 'Business Analyst', 'Analyze intelligence metrics, run simulations, export reports'),
  ('viewer', 'مشاهد فقط', 'Auditor / Viewer', 'Read-only access to approved reports and dashboard metrics')
ON CONFLICT (id) DO NOTHING;

INSERT INTO permissions (id, description, category) VALUES
  ('org:view', 'View organization details and profile', 'organization'),
  ('org:update', 'Update organization settings and defaults', 'organization'),
  ('org:delete', 'Delete organization (owner only)', 'organization'),
  ('member:view', 'View organization members', 'memberships'),
  ('member:invite', 'Invite new members to organization', 'memberships'),
  ('member:update', 'Update member role and branch assignment', 'memberships'),
  ('member:remove', 'Remove members from organization', 'memberships'),
  ('branch:view', 'View organization branches', 'branches'),
  ('branch:manage', 'Create, update, or deactivate branches', 'branches'),
  ('decision:view', 'View decision recommendations and radar', 'decisions'),
  ('decision:execute', 'Execute or approve mitigation decisions', 'decisions'),
  ('audit:view', 'View immutable audit log trail', 'audit')
ON CONFLICT (id) DO NOTHING;

-- Map Permissions to Roles
-- Owner: All permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'org_owner', id FROM permissions
ON CONFLICT DO NOTHING;

-- Admin: All except org:delete
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'org_admin', id FROM permissions WHERE id != 'org:delete'
ON CONFLICT DO NOTHING;

-- Manager: Operations, branches view, decisions execute
INSERT INTO role_permissions (role_id, permission_id) VALUES
  ('manager', 'org:view'),
  ('manager', 'branch:view'),
  ('manager', 'decision:view'),
  ('manager', 'decision:execute'),
  ('manager', 'audit:view')
ON CONFLICT DO NOTHING;

-- Analyst: View org, view branches, view decisions
INSERT INTO role_permissions (role_id, permission_id) VALUES
  ('analyst', 'org:view'),
  ('analyst', 'branch:view'),
  ('analyst', 'decision:view'),
  ('analyst', 'audit:view')
ON CONFLICT DO NOTHING;

-- Viewer: Read only basic info
INSERT INTO role_permissions (role_id, permission_id) VALUES
  ('viewer', 'org:view'),
  ('viewer', 'branch:view'),
  ('viewer', 'decision:view')
ON CONFLICT DO NOTHING;
