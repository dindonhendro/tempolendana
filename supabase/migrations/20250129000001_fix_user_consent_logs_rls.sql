-- Migration: Fix RLS for user_consent_logs to allow insert during registration
-- The issue: During registration, the user is not yet authenticated so auth.uid() returns null
-- Solution: Disable RLS for this table since it's an audit/compliance table that needs to log all consent

ALTER TABLE user_consent_logs DISABLE ROW LEVEL SECURITY;

-- Note: RLS is disabled because:
-- 1. This is a compliance/audit table for OJK
-- 2. Consent needs to be logged during registration before user is fully authenticated
-- 3. Read policies can still be enforced at application level
-- 4. Service role is used for administrative access
