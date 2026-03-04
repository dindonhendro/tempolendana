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
    // Make policies more permissive so admin can insert/update/delete branch_applications
    console.log('Fixing INSERT/UPDATE/DELETE for branch_applications...');

    const sql = `
    -- Allow admins and validators to fully manage branch_applications
    DROP POLICY IF EXISTS "Staff can manage branch applications" ON public.branch_applications;
    CREATE POLICY "Staff can manage branch applications" ON public.branch_applications
    FOR ALL USING (public.has_any_role(ARRAY['admin', 'validator', 'bank_staff']))
    WITH CHECK (public.has_any_role(ARRAY['admin', 'validator']));

    -- Allow bank staff to insert bank_reviews  
    DROP POLICY IF EXISTS "Bank staff can manage reviews" ON public.bank_reviews;
    CREATE POLICY "Bank staff can manage reviews" ON public.bank_reviews
    FOR ALL USING (public.has_any_role(ARRAY['admin', 'bank_staff']))
    WITH CHECK (public.has_any_role(ARRAY['admin', 'bank_staff']));
    
    -- Notify PostgREST to reload schema
    NOTIFY pgrst, 'reload schema';
  `;

    const result = await runSQL(sql);
    console.log('Result:', JSON.stringify(result));

    // Test save of a bank - the actual "Error saving branch" issue
    // Let's check what exactly happens when saving a branch
    const testInsertSQL = "SELECT id, name FROM public.banks LIMIT 2";
    const banks = await runSQL(testInsertSQL);
    console.log('\nAvailable banks:', JSON.stringify(banks));

    // Check bank_branches structure
    const structSQL = "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'bank_branches' AND table_schema = 'public' ORDER BY ordinal_position";
    const struct = await runSQL(structSQL);
    console.log('\nbank_branches columns:', JSON.stringify(struct, null, 2));
}

main().catch(e => console.log('Error:', e.message));
