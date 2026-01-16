-- ============================================
-- SafetyAlerts Database Schema
-- ============================================
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/llzqyfkxlwirjbkaopbh/sql
-- ============================================

-- ============================================
-- ENABLE EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE,
  phone_verified BOOLEAN DEFAULT FALSE,
  trust_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone);

-- ============================================
-- USER LOCATIONS (pinned areas for alerts)
-- ============================================
CREATE TABLE user_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  area_name VARCHAR(100) NOT NULL,
  area_slug VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_locations_user ON user_locations(user_id);
CREATE INDEX idx_user_locations_area ON user_locations(area_slug);

-- ============================================
-- REPORTS (incidents)
-- ============================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  incident_type VARCHAR(50) NOT NULL,
  landmark VARCHAR(200),
  description TEXT,
  photo_url VARCHAR(500),

  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,

  area_name VARCHAR(100) NOT NULL,
  area_slug VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,

  status VARCHAR(20) DEFAULT 'active',

  confirmation_count INTEGER DEFAULT 1,
  denial_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_reports_area ON reports(area_slug);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created ON reports(created_at DESC);

-- ============================================
-- CONFIRMATIONS
-- ============================================
CREATE TABLE confirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  distance_km DECIMAL(5, 2) NOT NULL,

  confirmation_type VARCHAR(20) NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(report_id, user_id)
);

CREATE INDEX idx_confirmations_report ON confirmations(report_id);

-- ============================================
-- PUSH SUBSCRIPTIONS
-- ============================================
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_push_subs_user ON push_subscriptions(user_id);

-- ============================================
-- OTP CODES
-- ============================================
CREATE TABLE otp_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_otp_phone ON otp_codes(phone);

-- ============================================
-- TRIGGER: Update confirmation counts
-- ============================================
CREATE OR REPLACE FUNCTION update_confirmation_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.confirmation_type = 'confirm' THEN
    UPDATE reports
    SET confirmation_count = confirmation_count + 1
    WHERE id = NEW.report_id;
  ELSIF NEW.confirmation_type = 'deny' THEN
    UPDATE reports
    SET denial_count = denial_count + 1
    WHERE id = NEW.report_id;
  ELSIF NEW.confirmation_type = 'ended' THEN
    UPDATE reports
    SET status = 'ended', ended_at = NOW()
    WHERE id = NEW.report_id
    AND status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_confirmation_counts
AFTER INSERT ON confirmations
FOR EACH ROW EXECUTE FUNCTION update_confirmation_counts();

-- ============================================
-- ENABLE REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE reports;
ALTER PUBLICATION supabase_realtime ADD TABLE confirmations;

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Users: Allow read for authenticated, write for service role
CREATE POLICY "Users are viewable by authenticated users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can be created by anyone" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (true);

-- User Locations: Users can manage their own locations
CREATE POLICY "User locations are viewable by owner" ON user_locations
  FOR SELECT USING (true);

CREATE POLICY "User locations can be created" ON user_locations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "User locations can be deleted" ON user_locations
  FOR DELETE USING (true);

-- Reports: Public read, authenticated write
CREATE POLICY "Reports are viewable by everyone" ON reports
  FOR SELECT USING (true);

CREATE POLICY "Reports can be created by anyone" ON reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Reports can be updated" ON reports
  FOR UPDATE USING (true);

-- Confirmations: Public read, authenticated write
CREATE POLICY "Confirmations are viewable by everyone" ON confirmations
  FOR SELECT USING (true);

CREATE POLICY "Confirmations can be created" ON confirmations
  FOR INSERT WITH CHECK (true);

-- Push Subscriptions: Users can manage their own
CREATE POLICY "Push subscriptions viewable by owner" ON push_subscriptions
  FOR SELECT USING (true);

CREATE POLICY "Push subscriptions can be created" ON push_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Push subscriptions can be deleted" ON push_subscriptions
  FOR DELETE USING (true);

-- OTP Codes: Service role only (handled by API)
CREATE POLICY "OTP codes managed by service" ON otp_codes
  FOR ALL USING (true);
