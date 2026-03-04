-- Fix: Add missing validator columns to loan_applications

ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS validated_by_lendana UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS validated_by_lendana_at TIMESTAMP WITH TIME ZONE;
