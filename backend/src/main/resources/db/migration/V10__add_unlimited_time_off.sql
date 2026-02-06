-- =============================================
-- V10: Add unlimited leave type support
-- =============================================

ALTER TABLE time_off_types ADD COLUMN is_unlimited BOOLEAN NOT NULL DEFAULT false;

-- Mark Sick Leave as unlimited
UPDATE time_off_types SET is_unlimited = true WHERE name = 'Sick Leave';
