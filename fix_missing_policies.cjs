const SERVICE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NDE2NTEyMDAsImV4cCI6MTg5OTQxNzYwMH0.GZ2PhVcPZX_vUjykPDTj8RpfWHWtx0hpFkEQvTeQwGU';

async function runSQL(sql) {
    const resp = await fetch('http://103.127.135.216:8000/pg/query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE,
            'Authorization': 'Bearer ' + SERVICE,
        },
        body: JSON.stringify({ query: sql }),
    });
    return resp.json();
}

async function main() {
    console.log('=== Fixing missing RLS policies for bank_branches, bank_products, bank_staff ===\n');

    const fixSQL = `
    -- Fix bank_branches: add INSERT/UPDATE/DELETE for admins
    DROP POLICY IF EXISTS "Admins can manage bank branches" ON public.bank_branches;
    CREATE POLICY "Admins can manage bank branches" ON public.bank_branches
    FOR ALL USING (public.has_role('admin'));

    -- Fix bank_products: add INSERT/UPDATE/DELETE for admins
    DROP POLICY IF EXISTS "Admins can manage bank products" ON public.bank_products;
    CREATE POLICY "Admins can manage bank products" ON public.bank_products
    FOR ALL USING (public.has_role('admin'));

    -- Fix bank_staff: add admin management policy
    DROP POLICY IF EXISTS "Admins can manage bank staff" ON public.bank_staff;
    CREATE POLICY "Admins can manage bank staff" ON public.bank_staff
    FOR ALL USING (public.has_role('admin'));

    -- Bank staff can view their own record
    DROP POLICY IF EXISTS "Bank staff can view their own record" ON public.bank_staff;
    CREATE POLICY "Bank staff can view their own record" ON public.bank_staff
    FOR SELECT USING (user_id = auth.uid() OR public.has_role('admin'));

    -- Make sure bank_branches has public read and admin write
    DROP POLICY IF EXISTS "Bank branches are viewable by everyone" ON public.bank_branches;
    CREATE POLICY "Bank branches are viewable by all authenticated" ON public.bank_branches
    FOR SELECT USING (true);

    -- Make sure bank_products has public read
    DROP POLICY IF EXISTS "Bank products are viewable by everyone" ON public.bank_products;
    CREATE POLICY "Bank products are viewable by all authenticated" ON public.bank_products
    FOR SELECT USING (true);

    -- Reload PostgREST schema cache
    NOTIFY pgrst, 'reload schema';
  `;

    const result = await runSQL(fixSQL);
    console.log('Fix applied:', JSON.stringify(result));

    // Verify
    const checkSQL = `
    SELECT tablename, policyname, cmd, qual, with_check 
    FROM pg_policies 
    WHERE tablename IN ('banks', 'bank_branches', 'bank_products', 'bank_staff')
    ORDER BY tablename, policyname
  `;
    const policies = await runSQL(checkSQL);
    console.log('\nUpdated policies:');
    policies.forEach(p => {
        console.log(`  ${p.tablename}.${p.policyname}: cmd=${p.cmd}, has_check=${p.with_check ? 'YES' : 'NO'}`);
    });
}

main().catch(e => console.log('Error:', e.message));
