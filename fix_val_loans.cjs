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
    const fixSQL = `
    -- Fix loan_applications policies

    -- 1. Create policy for general viewing by privileged roles
    DROP POLICY IF EXISTS "Staff can view all applications" ON public.loan_applications;
    CREATE POLICY "Staff can view all applications" ON public.loan_applications
    FOR SELECT USING (
      public.has_any_role(ARRAY['admin', 'validator', 'bank_staff'])
    );

    -- 2. Create policy for validators to update applications
    DROP POLICY IF EXISTS "Validators can update applications" ON public.loan_applications;
    CREATE POLICY "Validators can update applications" ON public.loan_applications
    FOR UPDATE USING (
      public.has_role('validator')
    );

    -- 3. Admins can manage everything in loan_applications
    DROP POLICY IF EXISTS "Admins can manage loan_applications" ON public.loan_applications;
    CREATE POLICY "Admins can manage loan_applications" ON public.loan_applications
    FOR ALL USING (
      public.has_role('admin')
    );

    -- Reload PostgREST
    NOTIFY pgrst, 'reload schema';
  `;

    const result = await runSQL(fixSQL);
    console.log('loan_applications policies fix result:', JSON.stringify(result));

    const checkLoanPoliciesSQL = `
    SELECT policyname, cmd, roles, qual, with_check 
    FROM pg_policies 
    WHERE tablename = 'loan_applications'
    ORDER BY cmd, policyname
  `;
    const loanPolicies = await runSQL(checkLoanPoliciesSQL);
    console.log('\nUpdated loan_applications policies:');
    loanPolicies.forEach(p => console.log(`  [${p.cmd}] ${p.policyname}`));
}

main().catch(e => console.log('Error:', e.message));
