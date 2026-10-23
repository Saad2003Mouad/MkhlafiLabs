-- MIKHLAFI LABS — 010_team_collaboration_and_tasks.sql
-- Enterprise Team Collaboration, Internal Chat, and Task Assignment Engine
-- Multi-Tenant isolated to the authenticated organization.

-- 1. Extend memberships with department and job title
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS job_title VARCHAR(100);

-- 2. Team Channels Table (Scoped to Tenant Organization)
CREATE TABLE IF NOT EXISTS team_channels (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  slug            VARCHAR(100) NOT NULL,
  name_ar         VARCHAR(100) NOT NULL,
  name_en         VARCHAR(100) NOT NULL,
  description_ar  VARCHAR(255),
  description_en  VARCHAR(255),
  is_default      BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_team_channels_org_slug UNIQUE (organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_team_channels_org ON team_channels(organization_id);

-- 3. Team Tasks Table (Task assignments & tracking within the company)
CREATE TABLE IF NOT EXISTS team_tasks (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id    UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title              VARCHAR(255) NOT NULL,
  description        TEXT,
  assigned_to        UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  priority           VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'urgent', 'high', 'medium', 'low'
  status             VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'approved'
  due_date           DATE,
  related_report_ref VARCHAR(100),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_team_tasks_org ON team_tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_tasks_assigned ON team_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_team_tasks_status ON team_tasks(organization_id, status);

-- 4. Team Chat Messages Table (Internal chat with attachments)
CREATE TABLE IF NOT EXISTS team_messages (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id    UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  channel_id         UUID NOT NULL REFERENCES team_channels(id) ON DELETE CASCADE,
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content            TEXT NOT NULL,
  attachment_type    VARCHAR(50) NOT NULL DEFAULT 'none', -- 'none', 'report', 'task', 'alert', 'ledger_entry'
  attachment_data    JSONB,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_team_messages_channel ON team_messages(channel_id, created_at);
CREATE INDEX IF NOT EXISTS idx_team_messages_org ON team_messages(organization_id);

-- 5. Seed default channels for all existing organizations
INSERT INTO team_channels (organization_id, slug, name_ar, name_en, description_ar, description_en, is_default)
SELECT
  id,
  'general',
  'النقاشات العامة',
  'General Discussion',
  'القناة الرسمية لنقاشات وتوجيهات فريق العمل',
  'Official channel for team updates and announcements',
  true
FROM organizations
ON CONFLICT (organization_id, slug) DO NOTHING;

INSERT INTO team_channels (organization_id, slug, name_ar, name_en, description_ar, description_en, is_default)
SELECT
  id,
  'audit-finance',
  'التدقيق والعمليات المالية',
  'Audit & Financial Operations',
  'متابعة ومراجعة القيود المشبوهة وفروقات الموردين ومطابقات الصرف',
  'Reviewing audit variances, supplier pricing, and disbursement holds',
  false
FROM organizations
ON CONFLICT (organization_id, slug) DO NOTHING;

INSERT INTO team_channels (organization_id, slug, name_ar, name_en, description_ar, description_en, is_default)
SELECT
  id,
  'tasks-reports',
  'المهام والتقارير التنفيذية',
  'Tasks & Executive Reports',
  'مشاركة وتكليف المهام بين الموظفين ومتابعة إنجازها',
  'Collaborative task assignments, executive briefs, and sign-offs',
  false
FROM organizations
ON CONFLICT (organization_id, slug) DO NOTHING;

-- 6. Team Collaboration Permissions
INSERT INTO permissions (id, description, category) VALUES
  ('team:chat', 'Send and read team chat messages and attachments', 'team'),
  ('team:task:create', 'Create and assign internal team tasks', 'team'),
  ('team:task:manage', 'Update task status, priority, and assignees', 'team')
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id) VALUES
  ('org_owner', 'team:chat'),
  ('org_owner', 'team:task:create'),
  ('org_owner', 'team:task:manage'),
  ('org_admin', 'team:chat'),
  ('org_admin', 'team:task:create'),
  ('org_admin', 'team:task:manage'),
  ('manager', 'team:chat'),
  ('manager', 'team:task:create'),
  ('manager', 'team:task:manage'),
  ('analyst', 'team:chat'),
  ('analyst', 'team:task:create'),
  ('viewer', 'team:chat')
ON CONFLICT DO NOTHING;
