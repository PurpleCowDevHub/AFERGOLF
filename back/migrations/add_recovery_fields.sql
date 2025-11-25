-- ============================================================================
-- Migration: Add recovery token fields to usuarios table
-- ============================================================================
-- This migration adds fields for password recovery functionality

-- Add recovery token columns if they don't exist
ALTER TABLE usuarios 
ADD COLUMN recovery_token VARCHAR(64) DEFAULT NULL,
ADD COLUMN token_expires_at TIMESTAMP DEFAULT NULL;

-- Add index for faster token lookups
ALTER TABLE usuarios 
ADD INDEX idx_recovery_token (recovery_token);
