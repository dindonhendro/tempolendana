-- Migration: Add RPC function for users to delete their own account safely
-- Purpose: Deletes the authenticated user's record from auth.users, which cascades to delete all related data in public tables.

CREATE OR REPLACE FUNCTION public.delete_own_user()
RETURNS void AS $$
BEGIN
  -- Delete the authenticated user from auth.users
  -- Relational constraints (ON DELETE CASCADE) will handle public.users, loan_applications, etc.
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.delete_own_user() IS 'RPC function for a user to delete their own account and all associated profile/application data via cascade.';
