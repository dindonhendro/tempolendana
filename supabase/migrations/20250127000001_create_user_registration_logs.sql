-- Migration: Create user_registration_logs table for OJK compliance
-- Purpose: Log all user registration activities including IP address and device information

CREATE TABLE IF NOT EXISTS user_registration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  operating_system TEXT,
  country TEXT,
  city TEXT,
  registration_status TEXT DEFAULT 'success' CHECK (registration_status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_user_registration_logs_user_id ON user_registration_logs(user_id);
CREATE INDEX idx_user_registration_logs_email ON user_registration_logs(email);
CREATE INDEX idx_user_registration_logs_ip_address ON user_registration_logs(ip_address);
CREATE INDEX idx_user_registration_logs_created_at ON user_registration_logs(created_at);

COMMENT ON TABLE user_registration_logs IS 'Log semua aktivitas registrasi user untuk keperluan audit OJK';
COMMENT ON COLUMN user_registration_logs.user_id IS 'Reference ke auth.users.id';
COMMENT ON COLUMN user_registration_logs.email IS 'Email user yang mendaftar';
COMMENT ON COLUMN user_registration_logs.ip_address IS 'IP address user saat registrasi';
COMMENT ON COLUMN user_registration_logs.user_agent IS 'Full user agent string dari browser';
COMMENT ON COLUMN user_registration_logs.device_type IS 'Tipe device: mobile, tablet, desktop';
COMMENT ON COLUMN user_registration_logs.registration_status IS 'Status registrasi: success, failed, pending';

-- Create view untuk monitoring registrasi
CREATE OR REPLACE VIEW v_registration_logs_summary AS
SELECT 
  DATE(created_at) as registration_date,
  role,
  registration_status,
  COUNT(*) as total_registrations,
  COUNT(DISTINCT ip_address) as unique_ips,
  COUNT(DISTINCT email) as unique_emails
FROM user_registration_logs
GROUP BY DATE(created_at), role, registration_status
ORDER BY registration_date DESC, role;

COMMENT ON VIEW v_registration_logs_summary IS 'Summary registrasi user per hari untuk monitoring dan reporting ke OJK';
