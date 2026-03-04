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
    // Check grants on branch_applications and bank_reviews
    const grantsSQL = "SELECT grantee, table_name, privilege_type FROM information_schema.role_table_grants WHERE table_name IN ('branch_applications', 'bank_reviews') AND table_schema = 'public' ORDER BY table_name, grantee";
    const grants = await runSQL(grantsSQL);
    console.log('Current grants:', JSON.stringify(grants, null, 2));

    // Grant permissions to anon and authenticated roles
    console.log('\nGranting permissions...');

    const grantSQL = `
    GRANT SELECT ON public.branch_applications TO anon, authenticated;
    GRANT INSERT, UPDATE ON public.branch_applications TO authenticated;
    GRANT SELECT ON public.bank_reviews TO anon, authenticated;
    GRANT INSERT, UPDATE ON public.bank_reviews TO authenticated;
  `;

    const grantResult = await runSQL(grantSQL);
    console.log('Grant result:', JSON.stringify(grantResult));

    // Verify
    const verify = await runSQL(grantsSQL);
    console.log('\nGrants after fix:', JSON.stringify(verify, null, 2));
}

main().catch(e => console.log('Error:', e.message));
