-- Fix: Grant missing permissions and add missing policies for branch_applications, bank_reviews,
-- bank_branches, bank_products, and bank_staff tables
-- Also adds missing tenor columns to bank_products and fixes type constraint

-- 1. Grant table permissions
GRANT SELECT ON public.branch_applications TO anon, authenticated;
GRANT INSERT, UPDATE ON public.branch_applications TO authenticated;
GRANT SELECT ON public.bank_reviews TO anon, authenticated;
GRANT INSERT, UPDATE ON public.bank_reviews TO authenticated;
GRANT ALL ON public.branch_applications TO service_role;
GRANT ALL ON public.bank_reviews TO service_role;

-- 2. Fix branch_applications policies
DROP POLICY IF EXISTS "Branch applications viewable by relevant users" ON public.branch_applications;
CREATE POLICY "Branch applications viewable by relevant users" ON public.branch_applications
    FOR SELECT USING (public.has_any_role(ARRAY['admin', 'validator', 'bank_staff']));

DROP POLICY IF EXISTS "Admins can manage branch applications" ON public.branch_applications;
CREATE POLICY "Admins can manage branch applications" ON public.branch_applications
    FOR ALL USING (public.has_role('admin'));

DROP POLICY IF EXISTS "Validators can insert branch applications" ON public.branch_applications;
CREATE POLICY "Validators can insert branch applications" ON public.branch_applications
    FOR INSERT WITH CHECK (public.has_role('validator'));

DROP POLICY IF EXISTS "Staff can manage branch applications" ON public.branch_applications;
CREATE POLICY "Staff can manage branch applications" ON public.branch_applications
    FOR ALL USING (public.has_any_role(ARRAY['admin', 'validator', 'bank_staff']))
    WITH CHECK (public.has_any_role(ARRAY['admin', 'validator']));

-- 3. Fix bank_reviews policies
DROP POLICY IF EXISTS "Bank reviews viewable by relevant users" ON public.bank_reviews;
CREATE POLICY "Bank reviews viewable by relevant users" ON public.bank_reviews
    FOR SELECT USING (public.has_any_role(ARRAY['admin', 'validator', 'bank_staff']));

DROP POLICY IF EXISTS "Bank staff can create reviews" ON public.bank_reviews;
CREATE POLICY "Bank staff can create reviews" ON public.bank_reviews
    FOR INSERT WITH CHECK (public.has_role('bank_staff'));

DROP POLICY IF EXISTS "Admins can manage bank reviews" ON public.bank_reviews;
CREATE POLICY "Admins can manage bank reviews" ON public.bank_reviews
    FOR ALL USING (public.has_role('admin'));

DROP POLICY IF EXISTS "Bank staff can manage reviews" ON public.bank_reviews;
CREATE POLICY "Bank staff can manage reviews" ON public.bank_reviews
    FOR ALL USING (public.has_any_role(ARRAY['admin', 'bank_staff']))
    WITH CHECK (public.has_any_role(ARRAY['admin', 'bank_staff']));

-- 4. Fix bank_branches - add admin management policy
DROP POLICY IF EXISTS "Admins can manage bank branches" ON public.bank_branches;
CREATE POLICY "Admins can manage bank branches" ON public.bank_branches
    FOR ALL USING (public.has_role('admin'));

DROP POLICY IF EXISTS "Bank branches are viewable by everyone" ON public.bank_branches;
DROP POLICY IF EXISTS "Bank branches are viewable by all authenticated" ON public.bank_branches;
CREATE POLICY "Bank branches are viewable by all authenticated" ON public.bank_branches
    FOR SELECT USING (true);

-- 5. Fix bank_products - add admin management policy  
DROP POLICY IF EXISTS "Admins can manage bank products" ON public.bank_products;
CREATE POLICY "Admins can manage bank products" ON public.bank_products
    FOR ALL USING (public.has_role('admin'));

DROP POLICY IF EXISTS "Bank products are viewable by everyone" ON public.bank_products;
DROP POLICY IF EXISTS "Bank products are viewable by all authenticated" ON public.bank_products;
CREATE POLICY "Bank products are viewable by all authenticated" ON public.bank_products
    FOR SELECT USING (true);

-- 6. Fix bank_staff - add admin management policy
DROP POLICY IF EXISTS "Admins can manage bank staff" ON public.bank_staff;
CREATE POLICY "Admins can manage bank staff" ON public.bank_staff
    FOR ALL USING (public.has_role('admin'));

DROP POLICY IF EXISTS "Bank staff can view their own record" ON public.bank_staff;
CREATE POLICY "Bank staff can view their own record" ON public.bank_staff
    FOR SELECT USING (user_id = auth.uid() OR public.has_role('admin'));

-- 7. Add missing columns to bank_products
ALTER TABLE public.bank_products 
    ADD COLUMN IF NOT EXISTS min_tenor INTEGER,
    ADD COLUMN IF NOT EXISTS max_tenor INTEGER,
    ADD COLUMN IF NOT EXISTS description TEXT;

-- 8. Add missing phone column to bank_branches
ALTER TABLE public.bank_branches
    ADD COLUMN IF NOT EXISTS phone TEXT;

-- 9. Fix bank_products type constraint to allow all expected loan types
ALTER TABLE public.bank_products 
    DROP CONSTRAINT IF EXISTS bank_products_type_check;

ALTER TABLE public.bank_products
    ADD CONSTRAINT bank_products_type_check 
    CHECK (type = ANY(ARRAY[
        'PMI'::text, 'Livestock'::text, 'Farmers'::text, 'SME'::text, 'Housing'::text,
        'KUR'::text, 'Personal Loan'::text, 'Business Loan'::text, 'Mortgage'::text
    ]));

-- 10. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
