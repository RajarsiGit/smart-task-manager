-- Add profile_picture column to users table
-- This column stores profile pictures as base64 encoded strings

ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_picture TEXT;
