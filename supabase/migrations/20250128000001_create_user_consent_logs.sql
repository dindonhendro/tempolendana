-- Migration: Create user_consent_logs table for OJK compliance
-- Purpose: Log all user consent activities for privacy policy and other documents

CREATE TABLE IF NOT EXISTS user_consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('privacy_policy', 'terms_of_service', 'data_processing')),
  document_version TEXT DEFAULT '1.0',
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ip_address INET,
  user_agent TEXT,
  source TEXT DEFAULT 'web' CHECK (source IN ('web', 'mobile', 'api')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_user_consent_logs_user_id ON user_consent_logs(user_id);
CREATE INDEX idx_user_consent_logs_document_type ON user_consent_logs(document_type);
CREATE INDEX idx_user_consent_logs_consent_at ON user_consent_logs(consent_at);

COMMENT ON TABLE user_consent_logs IS 'Log semua persetujuan user untuk keperluan audit OJK';
COMMENT ON COLUMN user_consent_logs.user_id IS 'Reference ke auth.users.id';
COMMENT ON COLUMN user_consent_logs.document_type IS 'Jenis dokumen: privacy_policy, terms_of_service, data_processing';
COMMENT ON COLUMN user_consent_logs.document_version IS 'Versi dokumen yang disetujui';
COMMENT ON COLUMN user_consent_logs.consent_given IS 'Status persetujuan user';
COMMENT ON COLUMN user_consent_logs.consent_at IS 'Timestamp saat user memberikan persetujuan';
COMMENT ON COLUMN user_consent_logs.ip_address IS 'IP address user saat memberikan persetujuan';
COMMENT ON COLUMN user_consent_logs.user_agent IS 'User agent browser saat memberikan persetujuan';
COMMENT ON COLUMN user_consent_logs.source IS 'Sumber persetujuan: web, mobile, api';

-- Enable RLS
ALTER TABLE user_consent_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own consent logs
DROP POLICY IF EXISTS "Users can read own consent logs" ON user_consent_logs;
CREATE POLICY "Users can read own consent logs" ON user_consent_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can read all consent logs (for admin/audit)
DROP POLICY IF EXISTS "Service role can read all consent logs" ON user_consent_logs;
CREATE POLICY "Service role can read all consent logs" ON user_consent_logs
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Policy: Allow insert for authenticated users (their own consent)
DROP POLICY IF EXISTS "Users can insert own consent logs" ON user_consent_logs;
CREATE POLICY "Users can insert own consent logs" ON user_consent_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admin can read all consent logs
DROP POLICY IF EXISTS "Admin can read all consent logs" ON user_consent_logs;
CREATE POLICY "Admin can read all consent logs" ON user_consent_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create view for consent summary reporting
CREATE OR REPLACE VIEW v_consent_logs_summary AS
SELECT 
  DATE(consent_at) as consent_date,
  document_type,
  COUNT(*) as total_consents,
  COUNT(DISTINCT user_id) as unique_users,
  SUM(CASE WHEN consent_given THEN 1 ELSE 0 END) as consents_given,
  SUM(CASE WHEN NOT consent_given THEN 1 ELSE 0 END) as consents_denied
FROM user_consent_logs
GROUP BY DATE(consent_at), document_type
ORDER BY consent_date DESC, document_type;

COMMENT ON VIEW v_consent_logs_summary IS 'Summary persetujuan user per hari untuk monitoring dan reporting ke OJK';
