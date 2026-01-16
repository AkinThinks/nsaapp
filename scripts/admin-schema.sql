-- =============================================
-- SafetyAlerts Admin Dashboard Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Create admin role enum
CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'moderator', 'analyst', 'support');

-- 2. Create user status enum (for existing users table)
CREATE TYPE user_status AS ENUM ('active', 'warned', 'suspended', 'banned');

-- 3. Create moderation status enum
CREATE TYPE moderation_status AS ENUM ('pending', 'approved', 'removed');

-- 4. Create flag status enum
CREATE TYPE flag_status AS ENUM ('pending', 'reviewed', 'actioned', 'dismissed');

-- 5. Create flag reason enum
CREATE TYPE flag_reason AS ENUM ('false_report', 'spam', 'harassment', 'inappropriate', 'other');

-- =============================================
-- ADMIN USERS TABLE
-- =============================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role admin_role NOT NULL DEFAULT 'moderator',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMPTZ,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);

-- =============================================
-- ADMIN SESSIONS TABLE
-- =============================================
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for token lookups and cleanup
CREATE INDEX idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- =============================================
-- ADMIN AUDIT LOGS TABLE
-- =============================================
CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id),
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for filtering and searching
CREATE INDEX idx_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX idx_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON admin_audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON admin_audit_logs(created_at DESC);

-- =============================================
-- MODERATION ACTIONS TABLE
-- =============================================
CREATE TABLE moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('report', 'user')),
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  reason TEXT,
  internal_notes TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for entity lookups
CREATE INDEX idx_moderation_actions_entity ON moderation_actions(entity_type, entity_id);
CREATE INDEX idx_moderation_actions_admin ON moderation_actions(admin_id);

-- =============================================
-- USER FLAGS TABLE
-- =============================================
CREATE TABLE user_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id),
  flagged_user_id UUID REFERENCES users(id),
  report_id UUID REFERENCES reports(id),
  reason flag_reason NOT NULL,
  description TEXT,
  status flag_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES admin_users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for filtering
CREATE INDEX idx_user_flags_status ON user_flags(status);
CREATE INDEX idx_user_flags_flagged_user ON user_flags(flagged_user_id);

-- =============================================
-- SYSTEM SETTINGS TABLE
-- =============================================
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES admin_users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- ADD COLUMNS TO EXISTING USERS TABLE
-- =============================================
ALTER TABLE users
ADD COLUMN IF NOT EXISTS status user_status DEFAULT 'active',
ADD COLUMN IF NOT EXISTS status_reason TEXT,
ADD COLUMN IF NOT EXISTS status_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS warning_count INTEGER DEFAULT 0;

-- =============================================
-- ADD COLUMNS TO EXISTING REPORTS TABLE
-- =============================================
ALTER TABLE reports
ADD COLUMN IF NOT EXISTS moderation_status moderation_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES admin_users(id),
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS removal_reason TEXT;

-- Index for moderation queue
CREATE INDEX IF NOT EXISTS idx_reports_moderation_status ON reports(moderation_status);

-- =============================================
-- UPDATE TIMESTAMP TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to admin_users
CREATE TRIGGER trigger_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all admin tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for API routes)
CREATE POLICY "Service role has full access to admin_users"
  ON admin_users FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to admin_sessions"
  ON admin_sessions FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to admin_audit_logs"
  ON admin_audit_logs FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to moderation_actions"
  ON moderation_actions FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to user_flags"
  ON user_flags FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to system_settings"
  ON system_settings FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================
-- INSERT DEFAULT SYSTEM SETTINGS
-- =============================================
INSERT INTO system_settings (key, value, description) VALUES
  ('maintenance_mode', 'false', 'Enable maintenance mode for the app'),
  ('min_trust_score_report', '0', 'Minimum trust score required to submit reports'),
  ('max_daily_reports', '10', 'Maximum reports a user can submit per day'),
  ('alert_radius_km', '5', 'Default radius in km for alert notifications'),
  ('auto_end_hours', '24', 'Hours after which inactive alerts are auto-ended')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- CLEANUP FUNCTION FOR EXPIRED SESSIONS
-- =============================================
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM admin_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- DONE
-- =============================================
-- Run this SQL in your Supabase SQL Editor
-- Then run: npx tsx scripts/create-first-admin.ts
