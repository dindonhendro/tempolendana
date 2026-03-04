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
    // Check bank_products columns in DB
    const colSQL = `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'bank_products' AND table_schema = 'public' ORDER BY ordinal_position`;
    const cols = await runSQL(colSQL);
    console.log('bank_products columns in DB:');
    cols.forEach(c => console.log(`  ${c.column_name}: ${c.data_type}, nullable=${c.is_nullable}`));

    // Check if tenor columns exist
    const tenorCheck = cols.filter(c => c.column_name.includes('tenor'));
    console.log('\nTenor columns:', JSON.stringify(tenorCheck));

    if (tenorCheck.length === 0) {
        console.log('\nTenor columns missing! Adding them...');
        const addTenorSQL = `
      ALTER TABLE public.bank_products 
      ADD COLUMN IF NOT EXISTS min_tenor INTEGER,
      ADD COLUMN IF NOT EXISTS max_tenor INTEGER,
      ADD COLUMN IF NOT EXISTS min_amount BIGINT,
      ADD COLUMN IF NOT EXISTS max_amount BIGINT,
      ADD COLUMN IF NOT EXISTS interest_rate NUMERIC(5,2),
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
    `;
        const addResult = await runSQL(addTenorSQL);
        console.log('Add columns result:', JSON.stringify(addResult));
    }

    // Reload PostgREST
    const reloadResult = await runSQL("NOTIFY pgrst, 'reload schema'");
    console.log('\nReload result:', JSON.stringify(reloadResult));

    // Re-check columns
    const colsAfter = await runSQL(colSQL);
    console.log('\nColumns after fix:');
    colsAfter.forEach(c => console.log(`  ${c.column_name}: ${c.data_type}`));

    // Reset admin1@lendana.id password  
    console.log('\n=== Resetting admin1@lendana.id password ===');
    const authUser = await runSQL("SELECT id FROM auth.users WHERE email = 'admin1@lendana.id'");
    console.log('Auth user:', JSON.stringify(authUser));

    if (authUser && authUser[0]) {
        const userId = authUser[0].id;
        // Use Supabase admin API to reset password
        const resetResp = await fetch(`http://103.127.135.216:8000/auth/v1/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SERVICE,
                'Authorization': 'Bearer ' + SERVICE,
            },
            body: JSON.stringify({ password: 'Admin1234!' }),
        });
        const resetData = await resetResp.json();
        if (resetData.error) {
            console.log('Reset error:', JSON.stringify(resetData.error));
        } else {
            console.log('Password reset success for admin1@lendana.id -> Admin1234!');
        }
    }
}

main().catch(e => console.log('Error:', e.message));
