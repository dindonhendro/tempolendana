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
    // Check what roles exist in the DB related to supabase
    const rolesSQL = "SELECT rolname FROM pg_roles WHERE rolname IN ('anon', 'authenticated', 'service_role', 'postgres', 'supabase_admin', 'authenticator') ORDER BY rolname";
    const roles = await runSQL(rolesSQL);
    console.log('Available roles:', JSON.stringify(roles));

    // Check current RLS policies on branch_applications
    const policySQL = "SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename IN ('branch_applications', 'bank_reviews') ORDER BY tablename, policyname";
    const policies = await runSQL(policySQL);
    console.log('\nCurrent policies:', JSON.stringify(policies, null, 2));

    // Grant to service_role and postgres too
    console.log('\nGranting to service_role and postgres...');
    const grantSQL = `
    GRANT ALL ON public.branch_applications TO service_role;
    GRANT ALL ON public.bank_reviews TO service_role;
    GRANT ALL ON public.branch_applications TO postgres;
    GRANT ALL ON public.bank_reviews TO postgres;
  `;
    const grantResult = await runSQL(grantSQL);
    console.log('Grant result:', JSON.stringify(grantResult));

    // Also try to reload PostgREST schema cache via NOTIFY
    const notifySQL = "NOTIFY pgrst, 'reload schema'";
    const notifyResult = await runSQL(notifySQL);
    console.log('Notify result:', JSON.stringify(notifyResult));
}

main().catch(e => console.log('Error:', e.message));
