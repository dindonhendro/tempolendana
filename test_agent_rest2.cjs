// Test using the exact same approach as the Supabase JS client
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
    // Sign in as agent
    const loginResp = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': ANON },
        body: JSON.stringify({ email: 'bijak@lendana.id', password: 'Agent123!' }),
    });
    const loginData = await loginResp.json();
    if (loginData.error) { console.log('Login failed:', JSON.stringify(loginData)); return; }

    console.log('✓ Logged in as bijak@lendana.id (agent)');
    const agentToken = loginData.access_token;

    // Use exact same header pattern as Supabase JS client
    const headers = {
        'Content-Type': 'application/json',
        'apikey': ANON,                    // ANON key as apikey
        'Authorization': `Bearer ${agentToken}`,  // user token as Authorization
        'Prefer': 'return=representation',
    };

    // Get IDs from DB
    const products = await runSQL("SELECT id, name FROM public.bank_products LIMIT 1");
    const branches = await runSQL("SELECT id, name FROM public.bank_branches LIMIT 1");
    const apps = await runSQL("SELECT id, status, assigned_agent_id FROM public.loan_applications LIMIT 1");

    if (!products[0] || !branches[0] || !apps[0]) {
        // Test READ access
        const readResp = await fetch(`${URL}/rest/v1/branch_applications?select=id&limit=1`, { headers });
        const readData = await readResp.json();
        console.log('\nAgent READ branch_applications:', readResp.status, JSON.stringify(readData));
        return;
    }

    // Test INSERT
    const body = {
        loan_application_id: apps[0].id,
        bank_product_id: products[0].id,
        branch_id: branches[0].id,
        assigned_at: new Date().toISOString(),
    };

    console.log('\nTesting INSERT as agent:{', JSON.stringify(body), '}');
    const insertResp = await fetch(`${URL}/rest/v1/branch_applications`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });

    const insertText = await insertResp.text();
    console.log('INSERT status:', insertResp.status, insertText.substring(0, 300));

    if (insertResp.status === 201) {
        const inserted = JSON.parse(insertText);
        console.log('✓ Agent INSERT SUCCEEDED!');
        // Cleanup via service role
        await fetch(`${URL}/rest/v1/branch_applications?id=eq.${inserted[0].id}`, {
            method: 'DELETE',
            headers: {
                'apikey': SERVICE,
                'Authorization': `Bearer ${SERVICE}`,
            },
        });
        console.log('Test data cleaned up');
    } else if (insertText.includes('security policy')) {
        console.log('✗ STILL BLOCKED BY RLS!');
    } else if (insertText.includes('foreign key') || insertText.includes('violates')) {
        console.log('✓ Policy OK (FK constraint prevents duplicate - not RLS)');
    }
}

main().catch(e => console.log('Error:', e.message));
