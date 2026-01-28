-- Location System Migration
-- Run this in Supabase SQL Editor
-- This creates the enhanced location system for verification and alert matching

-- ============================================
-- 1. ENHANCED USER_LOCATIONS TABLE
-- ============================================

-- First check if user_locations table exists, if not create it
CREATE TABLE IF NOT EXISTS user_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL DEFAULT 'My Location',
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    area_name VARCHAR(255),
    area_slug VARCHAR(255),
    lga VARCHAR(100),
    state VARCHAR(100),
    alert_radius_km DECIMAL(4, 1) DEFAULT 3.0,
    alerts_enabled BOOLEAN DEFAULT TRUE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add new columns if table already exists (safe to run multiple times)
DO $$
BEGIN
    -- Add latitude if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_locations' AND column_name = 'latitude') THEN
        ALTER TABLE user_locations ADD COLUMN latitude DECIMAL(10, 8);
    END IF;

    -- Add longitude if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_locations' AND column_name = 'longitude') THEN
        ALTER TABLE user_locations ADD COLUMN longitude DECIMAL(11, 8);
    END IF;

    -- Add name if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_locations' AND column_name = 'name') THEN
        ALTER TABLE user_locations ADD COLUMN name VARCHAR(100) DEFAULT 'My Location';
    END IF;

    -- Add lga if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_locations' AND column_name = 'lga') THEN
        ALTER TABLE user_locations ADD COLUMN lga VARCHAR(100);
    END IF;

    -- Add alert_radius_km if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_locations' AND column_name = 'alert_radius_km') THEN
        ALTER TABLE user_locations ADD COLUMN alert_radius_km DECIMAL(4, 1) DEFAULT 3.0;
    END IF;

    -- Add alerts_enabled if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_locations' AND column_name = 'alerts_enabled') THEN
        ALTER TABLE user_locations ADD COLUMN alerts_enabled BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Create indexes for efficient alert matching
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_coords ON user_locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_user_locations_lga ON user_locations(lga);
CREATE INDEX IF NOT EXISTS idx_user_locations_state ON user_locations(state);
CREATE INDEX IF NOT EXISTS idx_user_locations_alerts ON user_locations(alerts_enabled) WHERE alerts_enabled = TRUE;

-- ============================================
-- 2. REPORTS TABLE - ADD VERIFICATION FIELDS
-- ============================================

-- Add device location fields (separate from incident location)
ALTER TABLE reports ADD COLUMN IF NOT EXISTS device_latitude DECIMAL(10, 8);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS device_longitude DECIMAL(11, 8);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS device_accuracy_meters INTEGER;

-- Add LGA for better alert matching
ALTER TABLE reports ADD COLUMN IF NOT EXISTS lga VARCHAR(100);

-- Add verification status
ALTER TABLE reports ADD COLUMN IF NOT EXISTS verification_status VARCHAR(25) DEFAULT 'pending';
-- Values: 'verified_onsite' (< 500m), 'verified_nearby' (500m-2km),
--         'unverified_distant' (> 2km), 'unverified_manual',
--         'unverified_permission_denied', 'unverified_gps_failed', 'pending'

-- Add distance from incident (calculated)
ALTER TABLE reports ADD COLUMN IF NOT EXISTS distance_to_incident_meters INTEGER;

-- Add safe distance flag
ALTER TABLE reports ADD COLUMN IF NOT EXISTS is_safe_distance_report BOOLEAN DEFAULT FALSE;

-- Add location source
ALTER TABLE reports ADD COLUMN IF NOT EXISTS location_source VARCHAR(20) DEFAULT 'unknown';
-- Values: 'gps', 'network', 'manual', 'unknown'

-- Create index for verification status filtering
CREATE INDEX IF NOT EXISTS idx_reports_verification ON reports(verification_status);
CREATE INDEX IF NOT EXISTS idx_reports_lga ON reports(lga);

-- ============================================
-- 3. STATE-WIDE ALERTS (OPTIONAL)
-- ============================================

-- For major incidents, users can opt-in to state-wide alerts
CREATE TABLE IF NOT EXISTS user_state_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    state VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, state)
);

CREATE INDEX IF NOT EXISTS idx_user_state_alerts_state ON user_state_alerts(state) WHERE enabled = TRUE;

-- ============================================
-- 4. HELPER FUNCTION: DISTANCE CALCULATION
-- ============================================

-- Haversine distance function (returns kilometers)
CREATE OR REPLACE FUNCTION haversine_distance(
    lat1 DECIMAL(10, 8),
    lng1 DECIMAL(11, 8),
    lat2 DECIMAL(10, 8),
    lng2 DECIMAL(11, 8)
) RETURNS DECIMAL AS $$
DECLARE
    R CONSTANT DECIMAL := 6371; -- Earth's radius in km
    dlat DECIMAL;
    dlng DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    -- Handle NULL values
    IF lat1 IS NULL OR lng1 IS NULL OR lat2 IS NULL OR lng2 IS NULL THEN
        RETURN NULL;
    END IF;

    dlat := RADIANS(lat2 - lat1);
    dlng := RADIANS(lng2 - lng1);

    a := SIN(dlat/2) * SIN(dlat/2) +
         COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
         SIN(dlng/2) * SIN(dlng/2);

    c := 2 * ATAN2(SQRT(a), SQRT(1-a));

    RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 5. FUNCTION: FIND USERS TO ALERT
-- ============================================

-- This function finds all users who should be alerted about an incident
-- Used by the notification system
CREATE OR REPLACE FUNCTION find_users_to_alert(
    incident_lat DECIMAL(10, 8),
    incident_lng DECIMAL(11, 8),
    incident_lga VARCHAR(100),
    incident_state VARCHAR(100),
    is_major_incident BOOLEAN DEFAULT FALSE
) RETURNS TABLE(user_id UUID, distance_km DECIMAL, match_type VARCHAR(20)) AS $$
BEGIN
    RETURN QUERY

    -- Distance-based matches (within user's alert radius)
    SELECT DISTINCT ON (ul.user_id)
        ul.user_id,
        haversine_distance(ul.latitude, ul.longitude, incident_lat, incident_lng) as distance_km,
        'distance'::VARCHAR(20) as match_type
    FROM user_locations ul
    WHERE ul.alerts_enabled = TRUE
      AND ul.latitude IS NOT NULL
      AND ul.longitude IS NOT NULL
      AND haversine_distance(ul.latitude, ul.longitude, incident_lat, incident_lng) <= ul.alert_radius_km

    UNION

    -- LGA-based matches (same LGA)
    SELECT DISTINCT ON (ul.user_id)
        ul.user_id,
        haversine_distance(ul.latitude, ul.longitude, incident_lat, incident_lng) as distance_km,
        'lga'::VARCHAR(20) as match_type
    FROM user_locations ul
    WHERE ul.alerts_enabled = TRUE
      AND ul.lga IS NOT NULL
      AND ul.lga = incident_lga
      AND NOT EXISTS (
          -- Don't duplicate if already matched by distance
          SELECT 1 FROM user_locations ul2
          WHERE ul2.user_id = ul.user_id
            AND ul2.alerts_enabled = TRUE
            AND haversine_distance(ul2.latitude, ul2.longitude, incident_lat, incident_lng) <= ul2.alert_radius_km
      )

    UNION

    -- State-wide matches (for major incidents only)
    SELECT DISTINCT ON (usa.user_id)
        usa.user_id,
        NULL::DECIMAL as distance_km,
        'state'::VARCHAR(20) as match_type
    FROM user_state_alerts usa
    WHERE usa.enabled = TRUE
      AND usa.state = incident_state
      AND is_major_incident = TRUE
      AND NOT EXISTS (
          -- Don't duplicate if already matched by distance or LGA
          SELECT 1 FROM user_locations ul
          WHERE ul.user_id = usa.user_id
            AND ul.alerts_enabled = TRUE
            AND (
                haversine_distance(ul.latitude, ul.longitude, incident_lat, incident_lng) <= ul.alert_radius_km
                OR ul.lga = incident_lga
            )
      );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. FUNCTION: COUNT USERS IN AREA
-- ============================================

-- Returns approximate count of users who would be alerted
-- Used for "This will alert ~X users" preview
CREATE OR REPLACE FUNCTION count_users_in_area(
    incident_lat DECIMAL(10, 8),
    incident_lng DECIMAL(11, 8),
    incident_lga VARCHAR(100),
    radius_km DECIMAL DEFAULT 5.0
) RETURNS INTEGER AS $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(DISTINCT ul.user_id) INTO user_count
    FROM user_locations ul
    WHERE ul.alerts_enabled = TRUE
      AND (
          (ul.latitude IS NOT NULL AND ul.longitude IS NOT NULL AND
           haversine_distance(ul.latitude, ul.longitude, incident_lat, incident_lng) <= radius_km)
          OR
          (ul.lga IS NOT NULL AND ul.lga = incident_lga)
      );

    RETURN COALESCE(user_count, 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. RLS POLICIES
-- ============================================

-- Enable RLS on user_locations
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own locations
DROP POLICY IF EXISTS user_locations_select_own ON user_locations;
CREATE POLICY user_locations_select_own ON user_locations
    FOR SELECT USING (auth.uid()::text = user_id::text OR user_id::text = current_setting('app.current_user_id', true));

-- Users can only insert their own locations
DROP POLICY IF EXISTS user_locations_insert_own ON user_locations;
CREATE POLICY user_locations_insert_own ON user_locations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text OR user_id::text = current_setting('app.current_user_id', true));

-- Users can only update their own locations
DROP POLICY IF EXISTS user_locations_update_own ON user_locations;
CREATE POLICY user_locations_update_own ON user_locations
    FOR UPDATE USING (auth.uid()::text = user_id::text OR user_id::text = current_setting('app.current_user_id', true));

-- Users can only delete their own locations
DROP POLICY IF EXISTS user_locations_delete_own ON user_locations;
CREATE POLICY user_locations_delete_own ON user_locations
    FOR DELETE USING (auth.uid()::text = user_id::text OR user_id::text = current_setting('app.current_user_id', true));

-- Service role can do anything (for API routes)
DROP POLICY IF EXISTS user_locations_service ON user_locations;
CREATE POLICY user_locations_service ON user_locations
    FOR ALL USING (current_setting('role', true) = 'service_role');

-- Enable RLS on user_state_alerts
ALTER TABLE user_state_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_state_alerts_select_own ON user_state_alerts;
CREATE POLICY user_state_alerts_select_own ON user_state_alerts
    FOR SELECT USING (auth.uid()::text = user_id::text OR user_id::text = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS user_state_alerts_insert_own ON user_state_alerts;
CREATE POLICY user_state_alerts_insert_own ON user_state_alerts
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text OR user_id::text = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS user_state_alerts_update_own ON user_state_alerts;
CREATE POLICY user_state_alerts_update_own ON user_state_alerts
    FOR UPDATE USING (auth.uid()::text = user_id::text OR user_id::text = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS user_state_alerts_delete_own ON user_state_alerts;
CREATE POLICY user_state_alerts_delete_own ON user_state_alerts
    FOR DELETE USING (auth.uid()::text = user_id::text OR user_id::text = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS user_state_alerts_service ON user_state_alerts;
CREATE POLICY user_state_alerts_service ON user_state_alerts
    FOR ALL USING (current_setting('role', true) = 'service_role');

-- ============================================
-- 8. GRANT PERMISSIONS
-- ============================================

-- Grant execute on functions to authenticated users
GRANT EXECUTE ON FUNCTION haversine_distance TO authenticated;
GRANT EXECUTE ON FUNCTION haversine_distance TO anon;
GRANT EXECUTE ON FUNCTION count_users_in_area TO authenticated;
GRANT EXECUTE ON FUNCTION count_users_in_area TO anon;

-- Service role needs access to find_users_to_alert
GRANT EXECUTE ON FUNCTION find_users_to_alert TO service_role;

-- ============================================
-- DONE!
-- ============================================
-- Summary of what was created:
-- 1. user_locations table with coordinates and alert_radius
-- 2. reports table additions for device location and verification
-- 3. user_state_alerts table for state-wide alerts
-- 4. haversine_distance() function for distance calculations
-- 5. find_users_to_alert() function for notification matching
-- 6. count_users_in_area() function for alert preview count
-- 7. RLS policies for security
