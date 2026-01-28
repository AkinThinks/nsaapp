-- =============================================
-- Media System Migration
-- Nigeria Security Alert
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Add thumbnail URL columns to reports table
ALTER TABLE reports ADD COLUMN IF NOT EXISTS photo_thumb_url VARCHAR(500);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS photo_preview_url VARCHAR(500);

-- 2. Add content moderation status columns
ALTER TABLE reports ADD COLUMN IF NOT EXISTS image_moderation_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE reports ADD COLUMN IF NOT EXISTS text_moderation_status VARCHAR(20) DEFAULT 'approved';
ALTER TABLE reports ADD COLUMN IF NOT EXISTS moderation_notes TEXT;

-- 3. Create indexes for admin moderation queue
CREATE INDEX IF NOT EXISTS idx_reports_image_mod_status ON reports(image_moderation_status);
CREATE INDEX IF NOT EXISTS idx_reports_text_mod_status ON reports(text_moderation_status);

-- 4. Update storage bucket to allow HEIC/HEIF formats (for iPhone)
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
WHERE id = 'report-images';

-- 5. Add comment for documentation
COMMENT ON COLUMN reports.image_moderation_status IS 'pending, approved, flagged, removed';
COMMENT ON COLUMN reports.text_moderation_status IS 'pending, approved, flagged, removed';
COMMENT ON COLUMN reports.photo_thumb_url IS '300x300 thumbnail for feed cards';
COMMENT ON COLUMN reports.photo_preview_url IS '600x600 preview for detail page';

-- =============================================
-- DONE - Run this migration before deploying code changes
-- =============================================
