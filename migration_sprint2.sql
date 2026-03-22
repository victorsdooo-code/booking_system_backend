-- ============================================================
-- Sprint 2 Migration (v0.3.0)
-- ============================================================
-- Date: 2026-03-12
-- Features: SMS Verification, Audit Trail, Enhanced Admin
-- ============================================================

-- ============================================================
-- SMS Verifications Table
-- ============================================================

CREATE TABLE IF NOT EXISTS sms_verifications (
  id SERIAL PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP NULL,
  CONSTRAINT sms_verifications_phone_unique UNIQUE (phone, created_at)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sms_phone ON sms_verifications(phone);
CREATE INDEX IF NOT EXISTS idx_sms_expires ON sms_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_sms_verified ON sms_verifications(verified);

-- ============================================================
-- Audit Logs Table
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  details JSONB,
  admin_id TEXT DEFAULT 'system',
  CONSTRAINT audit_logs_entity_check CHECK (entity_type IN ('appointment', 'sms_verification', 'user', 'doctor', 'clinic'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_admin ON audit_logs(admin_id);

-- ============================================================
-- Appointments Table Enhancements
-- ============================================================

-- Add audit fields to appointments (if not exists)
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS status_changed_by TEXT NULL,
ADD COLUMN IF NOT EXISTS schedule_warning TEXT NULL;

-- Add status history as JSONB array
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb;

-- ============================================================
-- Seed Data (Optional - for testing)
-- ============================================================

-- Sample SMS verification (for testing)
-- INSERT INTO sms_verifications (phone, code, expires_at, verified)
-- VALUES ('91234567', '123456', NOW() + INTERVAL '5 minutes', FALSE);

-- ============================================================
-- Comments
-- ============================================================

COMMENT ON TABLE sms_verifications IS 'Stores SMS verification codes for phone verification';
COMMENT ON COLUMN sms_verifications.phone IS 'Phone number (8 digits, no formatting)';
COMMENT ON COLUMN sms_verifications.code IS '6-digit verification code';
COMMENT ON COLUMN sms_verifications.expires_at IS 'Code expiry time (5 minutes from creation)';
COMMENT ON COLUMN sms_verifications.verified IS 'Whether code has been successfully verified';

COMMENT ON TABLE audit_logs IS 'Audit trail for all system actions';
COMMENT ON COLUMN audit_logs.action IS 'Action performed (e.g., appointment_created, sms_sent)';
COMMENT ON COLUMN audit_logs.entity_type IS 'Type of entity affected';
COMMENT ON COLUMN audit_logs.entity_id IS 'ID of the entity';
COMMENT ON COLUMN audit_logs.details IS 'Additional details in JSON format';
COMMENT ON COLUMN audit_logs.admin_id IS 'Admin/user who performed the action';

-- ============================================================
-- Migration Complete
-- ============================================================
