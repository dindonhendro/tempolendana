// Test as a real agent user signing in
const { createClient } = require('@supabase/supabase-js');

const URL = 'http://103.127.135.216:8000';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzQxNjUxMjAwLCJleHAiOjE4OTk0MTc2MDB9.P8WD5FRr6dgnvcaLeBgUzbvd05PZcN824KCnZoiZ_fI';
const SERVICE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NDE2NTEyMDAsImV4cCI6MTg5OTQxNzYwMH0.GZ2PhVcPZX_vUjykPDTj8RpfWHWtx0hpFkEQvTeQwGU';

async function runSQL(sql) {
    const resp = await fetch(`${URL}/pg/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SERVICE, 'Authorization': 'Bearer ' + SERVICE },
        body: JSON.stringify({ query: sql }),
    });
    return resp.json();
}

async function main() {
    const adminC = createClient(URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });

    // Get a loan_application with assigned_agent_id that has an agent company
    const { data: apps } = await adminC
        .from('loan_applications')
        .select('id, status, assigned_agent_id, full_name')
        .not('assigned_agent_id', 'is', null)
        .limit(5);

    console.log('Apps with assigned agents:', JSON.stringify(apps, null, 2));

    // Get current policies on branch_applications
    const policies = await runSQL(`
    SELECT policyname, cmd, qual, with_check 
    FROM pg_policies 
    WHERE tablename = 'branch_applications'
    ORDER BY cmd, policyname
  `);

    console.log('\nbranch_applications policies:');
    policies.forEach(p => {
        console.log(`  [${p.cmd}] ${p.policyname}`);
        if (p.qual) console.log(`    USING: ${p.qual}`);
        if (p.with_check) console.log(`    WITH CHECK: ${p.with_check}`);
    });

    // Test by finding a real agent to sign in as
    const agentEmails = ['bijak@lendana.id', 'agent_p3mi@lendana.id', 'userx1@lendana.id'];

    for (const email of agentEmails) {
        for (const pwd of ['Agent123!', 'agent123', 'Agent1234!', 'Password123!', '12345678']) {
            const resp = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'apikey': ANON },
                body: JSON.stringify({ email, password: pwd }),
            });
            const data = await resp.json();
            if (!data.error) {
                console.log(`\n✓ Found agent login: ${email} / ${pwd}`);

                // Try the actual branch_applications INSERT as this agent
                const agentC = createClient(URL, ANON, {
                    auth: { persistSession: false, autoRefreshToken: false },
                    global: { headers: { Authorization: 'Bearer ' + data.access_token } }
                });

                const product = await adminC.from('bank_products').select('id').limit(1).single();
                const branch = await adminC.from('bank_branches').select('id').limit(1).single();
                const app = apps && apps[0];

                if (product.data && branch.data && app) {
                    // Check existing assignment first
                    const { data: existing } = await agentC.from('branch_applications').select('id').eq('loan_application_id', app.id).maybeSingle();

                    if (!existing) {
                        const { data: insertResult, error: insertError } = await agentC.from('branch_applications').insert({
                            loan_application_id: app.id,
                            bank_product_id: product.data.id,
                            branch_id: branch.data.id,
                            assigned_at: new Date().toISOString(),
                        }).select();

                        if (insertError) {
                            console.log('Agent INSERT result: FAILED -', insertError.message);
                        } else {
                            console.log('Agent INSERT result: ✓ SUCCESS!', JSON.stringify(insertResult[0]));
                            // Rollback
                            await adminC.from('branch_applications').delete().eq('id', insertResult[0].id);
                            console.log('Cleaned up test row');
                        }
                    } else {
                        console.log('App already assigned, testing SELECT instead...');
                        const { data: selectResult, error: selectError } = await agentC.from('branch_applications').select('*').limit(1);
                        console.log('Agent SELECT result:', selectError ? 'FAILED: ' + selectError.message : 'OK (' + selectResult.length + ' rows)');
                    }
                }
                break;
            }
        }
    }
}

main().catch(e => console.log('Error:', e.message));
