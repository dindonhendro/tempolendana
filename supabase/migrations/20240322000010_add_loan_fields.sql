ALTER TABLE public.loan_applications 
ADD COLUMN IF NOT EXISTS negara_penempatan TEXT,
ADD COLUMN IF NOT EXISTS bunga_bank DECIMAL(5,2) DEFAULT 6.00,
ADD COLUMN IF NOT EXISTS grace_period INTEGER;

COMMENT ON COLUMN public.loan_applications.negara_penempatan IS 'Country of placement for PMI';
COMMENT ON COLUMN public.loan_applications.bunga_bank IS 'Bank interest rate percentage';
COMMENT ON COLUMN public.loan_applications.grace_period IS 'Grace period in months';
