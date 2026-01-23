-- Helper function to check user roles without recursion
-- SECURITY DEFINER allows this function to bypass RLS and read the users table
CREATE OR REPLACE FUNCTION public.has_role(target_role text)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = target_role
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Helper function for multiple roles
CREATE OR REPLACE FUNCTION public.has_any_role(target_roles text[])
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = ANY(target_roles)
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 1. Fix public.users policies
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (public.has_role('admin'));

DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
CREATE POLICY "Admins can manage all users" ON public.users
    FOR ALL USING (public.has_role('admin'));

-- 2. Fix public.banks policies
DROP POLICY IF EXISTS "Admins can manage banks" ON public.banks;
CREATE POLICY "Admins can manage banks" ON public.banks
    FOR ALL USING (public.has_role('admin'));

-- 3. Fix public.bank_branches policies
DROP POLICY IF EXISTS "Admins can manage bank branches" ON public.bank_branches;
CREATE POLICY "Admins can manage bank branches" ON public.bank_branches
    FOR ALL USING (public.has_role('admin'));

-- 4. Fix public.bank_products policies
DROP POLICY IF EXISTS "Admins can manage bank products" ON public.bank_products;
CREATE POLICY "Admins can manage bank products" ON public.bank_products
    FOR ALL USING (public.has_role('admin'));

-- 5. Fix public.bank_staff policies
DROP POLICY IF EXISTS "Admins can manage bank staff" ON public.bank_staff;
CREATE POLICY "Admins can manage bank staff" ON public.bank_staff
    FOR ALL USING (public.has_role('admin'));

-- 6. Fix public.agent_companies policies
DROP POLICY IF EXISTS "Admins can manage agent companies" ON public.agent_companies;
CREATE POLICY "Admins can manage agent companies" ON public.agent_companies
    FOR ALL USING (public.has_role('admin'));

-- 7. Fix public.agent_staff policies
DROP POLICY IF EXISTS "Admins can manage agent staff" ON public.agent_staff;
CREATE POLICY "Admins can manage agent staff" ON public.agent_staff
    FOR ALL USING (public.has_role('admin'));

-- 8. Fix public.insurance_companies policies
DROP POLICY IF EXISTS "Admins can manage insurance companies" ON public.insurance_companies;
CREATE POLICY "Admins can manage insurance companies" ON public.insurance_companies
    FOR ALL USING (public.has_role('admin'));

-- 9. Fix public.insurance_staff policies
DROP POLICY IF EXISTS "Admins can manage insurance staff" ON public.insurance_staff;
CREATE POLICY "Admins can manage insurance staff" ON public.insurance_staff
    FOR ALL USING (public.has_role('admin'));

-- 10. Fix public.collector_companies policies
DROP POLICY IF EXISTS "Admins can manage collector companies" ON public.collector_companies;
CREATE POLICY "Admins can manage collector companies" ON public.collector_companies
    FOR ALL USING (public.has_role('admin'));

-- 11. Fix public.collector_staff policies
DROP POLICY IF EXISTS "Admins can manage collector staff" ON public.collector_staff;
CREATE POLICY "Admins can manage collector staff" ON public.collector_staff
    FOR ALL USING (public.has_role('admin'));

-- 12. Fix public.loan_applications policies
DROP POLICY IF EXISTS "Agents can view assigned applications" ON public.loan_applications;
CREATE POLICY "Agents can view assigned applications" ON public.loan_applications
    FOR SELECT USING (
        public.has_any_role(ARRAY['agent', 'checker_agent']) AND
        EXISTS (
            SELECT 1 FROM public.agent_staff ast 
            WHERE ast.user_id = auth.uid() 
            AND ast.agent_company_id = loan_applications.assigned_agent_id
        )
    );

DROP POLICY IF EXISTS "Validators can view all applications" ON public.loan_applications;
CREATE POLICY "Validators can view all applications" ON public.loan_applications
    FOR SELECT USING (public.has_role('validator'));

DROP POLICY IF EXISTS "Validators can update applications" ON public.loan_applications;
CREATE POLICY "Validators can update applications" ON public.loan_applications
    FOR UPDATE USING (public.has_role('validator'));

DROP POLICY IF EXISTS "Bank staff can view applications for their bank" ON public.loan_applications;
CREATE POLICY "Bank staff can view applications for their bank" ON public.loan_applications
    FOR SELECT USING (public.has_role('bank_staff'));

DROP POLICY IF EXISTS "Bank staff can update applications" ON public.loan_applications;
CREATE POLICY "Bank staff can update applications" ON public.loan_applications
    FOR UPDATE USING (public.has_role('bank_staff'));

DROP POLICY IF EXISTS "Admins can manage all loan applications" ON public.loan_applications;
CREATE POLICY "Admins can manage all loan applications" ON public.loan_applications
    FOR ALL USING (public.has_role('admin'));

-- 13. Fix branch_applications policies
DROP POLICY IF EXISTS "Branch applications viewable by relevant users" ON public.branch_applications;
CREATE POLICY "Branch applications viewable by relevant users" ON public.branch_applications
    FOR SELECT USING (public.has_any_role(ARRAY['admin', 'validator', 'bank_staff']));

DROP POLICY IF EXISTS "Admins can manage branch applications" ON public.branch_applications;
CREATE POLICY "Admins can manage branch applications" ON public.branch_applications
    FOR ALL USING (public.has_role('admin'));

-- 14. Fix bank_reviews policies
DROP POLICY IF EXISTS "Bank reviews viewable by relevant users" ON public.bank_reviews;
CREATE POLICY "Bank reviews viewable by relevant users" ON public.bank_reviews
    FOR SELECT USING (public.has_any_role(ARRAY['admin', 'validator', 'bank_staff']));

DROP POLICY IF EXISTS "Bank staff can create reviews" ON public.bank_reviews;
CREATE POLICY "Bank staff can create reviews" ON public.bank_reviews
    FOR INSERT WITH CHECK (public.has_role('bank_staff'));

DROP POLICY IF EXISTS "Admins can manage bank reviews" ON public.bank_reviews;
CREATE POLICY "Admins can manage bank reviews" ON public.bank_reviews
    FOR ALL USING (public.has_role('admin'));

-- 15. Fix insurance_assignments policies
DROP POLICY IF EXISTS "Insurance assignments viewable by relevant users" ON public.insurance_assignments;
CREATE POLICY "Insurance assignments viewable by relevant users" ON public.insurance_assignments
    FOR SELECT USING (public.has_any_role(ARRAY['admin', 'insurance', 'bank_staff']));

DROP POLICY IF EXISTS "Insurance staff can manage assignments" ON public.insurance_assignments;
CREATE POLICY "Insurance staff can manage assignments" ON public.insurance_assignments
    FOR ALL USING (public.has_any_role(ARRAY['admin', 'insurance']));

-- 16. Fix collector_assignments policies
DROP POLICY IF EXISTS "Collector assignments viewable by relevant users" ON public.collector_assignments;
CREATE POLICY "Collector assignments viewable by relevant users" ON public.collector_assignments
    FOR SELECT USING (public.has_any_role(ARRAY['admin', 'collector', 'bank_staff']));

DROP POLICY IF EXISTS "Collectors can manage assignments" ON public.collector_assignments;
CREATE POLICY "Collectors can manage assignments" ON public.collector_assignments
    FOR ALL USING (public.has_any_role(ARRAY['admin', 'collector']));
