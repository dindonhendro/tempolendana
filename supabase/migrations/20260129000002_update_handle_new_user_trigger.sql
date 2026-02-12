-- Migration: Update handle_new_user trigger to handle staff tables and avoid RLS issues
-- Purpose: Automatically create entries in agent_staff, bank_staff, etc. based on user metadata during signup

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role text;
  v_company_id uuid;
  v_bank_id uuid;
  v_branch_id uuid;
BEGIN
  -- Extract role
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'user');

  -- Insert/Update public.users
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    v_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    role = COALESCE(EXCLUDED.role, users.role);

  -- Extract metadata safely
  BEGIN
    v_company_id := NULLIF(new.raw_user_meta_data->>'company_id', '')::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_company_id := NULL;
  END;

  BEGIN
    v_bank_id := NULLIF(new.raw_user_meta_data->>'bank_id', '')::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_bank_id := NULL;
  END;

  BEGIN
    v_branch_id := NULLIF(new.raw_user_meta_data->>'branch_id', '')::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_branch_id := NULL;
  END;

  -- Create staff records based on role
  IF v_role IN ('agent', 'checker_agent') AND v_company_id IS NOT NULL THEN
    INSERT INTO public.agent_staff (user_id, agent_company_id, position)
    VALUES (new.id, v_company_id, CASE WHEN v_role = 'checker_agent' THEN 'Checker Agent' ELSE 'Agent' END)
    ON CONFLICT (user_id) DO UPDATE SET
      agent_company_id = EXCLUDED.agent_company_id,
      position = EXCLUDED.position;
  ELSIF v_role = 'bank_staff' AND v_bank_id IS NOT NULL AND v_branch_id IS NOT NULL THEN
    INSERT INTO public.bank_staff (user_id, bank_id, branch_id, position)
    VALUES (new.id, v_bank_id, v_branch_id, 'Staff')
    ON CONFLICT (user_id) DO UPDATE SET
      bank_id = EXCLUDED.bank_id,
      branch_id = EXCLUDED.branch_id;
  ELSIF v_role = 'insurance' AND v_company_id IS NOT NULL THEN
    INSERT INTO public.insurance_staff (user_id, insurance_company_id, position)
    VALUES (new.id, v_company_id, 'Staff')
    ON CONFLICT (user_id) DO UPDATE SET
      insurance_company_id = EXCLUDED.insurance_company_id;
  ELSIF v_role = 'collector' AND v_company_id IS NOT NULL THEN
    INSERT INTO public.collector_staff (user_id, collector_company_id, position)
    VALUES (new.id, v_company_id, 'Staff')
    ON CONFLICT (user_id) DO UPDATE SET
      collector_company_id = EXCLUDED.collector_company_id;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
