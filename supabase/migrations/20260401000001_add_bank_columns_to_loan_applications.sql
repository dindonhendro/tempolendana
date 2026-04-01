-- Migration to add bank selection columns directly to the loan_applications table

ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS bank_id UUID REFERENCES public.banks(id),
ADD COLUMN IF NOT EXISTS bank_product_id UUID REFERENCES public.bank_products(id),
ADD COLUMN IF NOT EXISTS bank_branch_id UUID REFERENCES public.bank_branches(id);

-- Add helpful comments for these columns
COMMENT ON COLUMN public.loan_applications.bank_id IS 'Selected partner bank for the loan';
COMMENT ON COLUMN public.loan_applications.bank_product_id IS 'Selected loan product';
COMMENT ON COLUMN public.loan_applications.bank_branch_id IS 'Selected bank branch';

-- Create an index to improve query performance for these columns
CREATE INDEX IF NOT EXISTS idx_loan_applications_bank_id ON public.loan_applications(bank_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_bank_product_id ON public.loan_applications(bank_product_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_bank_branch_id ON public.loan_applications(bank_branch_id);

-- Force PostgREST to reload the schema cache so the API immediately recognizes the new columns
NOTIFY pgrst, 'reload schema';
