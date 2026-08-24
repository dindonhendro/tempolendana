-- Migration: Fix bank deletion foreign key constraints on loan_applications table
-- Purpose: Change foreign keys on loan_applications to ON DELETE SET NULL so deleting a bank does not fail

-- 1. Drop existing foreign key constraints
ALTER TABLE public.loan_applications
DROP CONSTRAINT IF EXISTS loan_applications_bank_id_fkey,
DROP CONSTRAINT IF EXISTS loan_applications_bank_product_id_fkey,
DROP CONSTRAINT IF EXISTS loan_applications_bank_branch_id_fkey;

-- 2. Add new foreign key constraints with ON DELETE SET NULL
ALTER TABLE public.loan_applications
ADD CONSTRAINT loan_applications_bank_id_fkey 
  FOREIGN KEY (bank_id) REFERENCES public.banks(id) ON DELETE SET NULL,
ADD CONSTRAINT loan_applications_bank_product_id_fkey 
  FOREIGN KEY (bank_product_id) REFERENCES public.bank_products(id) ON DELETE SET NULL,
ADD CONSTRAINT loan_applications_bank_branch_id_fkey 
  FOREIGN KEY (bank_branch_id) REFERENCES public.bank_branches(id) ON DELETE SET NULL;

-- 3. Notify PostgREST to reload the schema cache so the API immediately recognizes the changes
NOTIFY pgrst, 'reload schema';
