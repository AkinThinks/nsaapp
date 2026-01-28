-- Add vibration_enabled column to push_subscriptions table
-- Run this in Supabase SQL Editor

ALTER TABLE push_subscriptions
ADD COLUMN IF NOT EXISTS vibration_enabled BOOLEAN DEFAULT true;
