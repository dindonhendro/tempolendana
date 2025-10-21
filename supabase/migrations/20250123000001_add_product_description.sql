ALTER TABLE public.bank_products 
ADD COLUMN IF NOT EXISTS product_description TEXT;

COMMENT ON COLUMN public.bank_products.product_description IS 'Detailed description of the bank product including features, benefits, and requirements';
