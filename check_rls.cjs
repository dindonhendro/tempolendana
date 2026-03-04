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
    // Check RLS policies for all bank-related tables
    const policiesSQL = `
    SELECT tablename, policyname, cmd, roles, qual, with_check 
    FROM pg_policies 
    WHERE tablename IN ('banks', 'bank_branches', 'bank_products', 'bank_staff')
    ORDER BY tablename, policyname
  `;
    const policies = await runSQL(policiesSQL);
    console.log('Policies:', JSON.stringify(policies, null, 2));

    // Check if banks, bank_branches, bank_products RLS is enabled
    const rlsSQL = `
    SELECT relname, relrowsecurity 
    FROM pg_class 
    WHERE relname IN ('banks', 'bank_branches', 'bank_products', 'bank_staff', 'bank_reviews', 'branch_applications')
    ORDER BY relname
  `;
    const rls = await runSQL(rlsSQL);
    console.log('\nRLS enabled:', JSON.stringify(rls, null, 2));

    // Check grants for banks
    const grantsSQL = `
    SELECT grantee, table_name, privilege_type 
    FROM information_schema.role_table_grants 
    WHERE table_name IN ('banks', 'bank_branches', 'bank_products', 'bank_staff')
    AND grantee IN ('anon', 'authenticated', 'service_role')
    ORDER BY table_name, grantee, privilege_type
  `;
    const grants = await runSQL(grantsSQL);
    console.log('\nGrants:', JSON.stringify(grants, null, 2));
}

main().catch(e => console.log('Error:', e.message));
