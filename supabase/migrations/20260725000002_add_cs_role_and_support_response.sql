-- Migration: Add CS role support and response fields to support_tickets
-- Purpose: Support CS Dashboard and OJK auditing for complaint handling.

-- 1. Update users role check constraint to include 'cs' and existing roles
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (
  role IN ('user', 'agent', 'validator', 'bank_staff', 'insurance', 'collector', 'admin', 'cs', 'wirausaha', 'checker_agent', 'perusahaan')
);

-- 2. Add response fields to support_tickets
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS response_details TEXT;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS responded_by UUID REFERENCES public.users(id);

COMMENT ON COLUMN public.support_tickets.response_details IS 'Jawaban/tindak lanjut tertulis dari Customer Service untuk keluhan ini.';
COMMENT ON COLUMN public.support_tickets.responded_at IS 'Waktu saat CS menyimpan jawaban keluhan.';
COMMENT ON COLUMN public.support_tickets.responded_by IS 'ID User staff CS yang menindaklanjuti keluhan.';

-- 3. Set up RLS policies for CS role
DROP POLICY IF EXISTS "CS can manage all support tickets" ON public.support_tickets;
CREATE POLICY "CS can manage all support tickets" ON public.support_tickets
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'cs')
    );

DROP POLICY IF EXISTS "CS can view all consent logs" ON public.user_consent_logs;
CREATE POLICY "CS can view all consent logs" ON public.user_consent_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'cs')
    );

DROP POLICY IF EXISTS "CS can view all users" ON public.users;
CREATE POLICY "CS can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'cs')
    );

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
