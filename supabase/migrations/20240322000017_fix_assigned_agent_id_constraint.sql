-- Fix assigned_agent_id constraint for P3MI Business Loan applications
-- P3MI Business Loan applications should not require an agent assignment

-- First, create a default "LENDANA_DIRECT" agent company for direct applications
INSERT INTO public.agent_companies (id, name, code, address, phone, email, license_number)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Lendana Direct',
  'LENDANA_DIRECT',
  'Lendana Head Office',
  '+62-21-12345678',
  'direct@lendana.com',
  'DIRECT-001'
) ON CONFLICT (id) DO NOTHING;

-- Update the constraint to allow the default agent for direct applications
-- This ensures P3MI Business Loan applications can use the default agent
UPDATE public.loan_applications 
SET assigned_agent_id = '00000000-0000-0000-0000-000000000001'
WHERE assigned_agent_id IS NULL AND submission_type = 'P3MI_BUSINESS_LOAN';

-- Enable realtime for agent_companies if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'agent_companies'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE agent_companies;
    END IF;
END $$;
