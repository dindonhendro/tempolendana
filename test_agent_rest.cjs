// Direct REST API test (no Supabase client) to verify agent can INSERT branch_applications
const URL = 'http://103.127.135.216:8000';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzQxNjUxMjAwLCJleHAiOjE4OTk0MTc2MDB9.P8WD5FRr6dgnvcaLeBgUzbvd05PZcN824KCnZoiZ_fI';
const SERVICE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NDE2NTEyMDAsImV4cCI6MTg5OTQxNzYwMH0.GZ2PhVcPZX_vUjykPDTj8RpfWHWtx0hpFkEQvTeQwGU';

async function restRequest(method, path, token, body = null) {
    const headers = {
        'Content-Type': 'application/json',
        'apikey': ANON,
        'Authorization': 'Bearer ' + token,
        'Prefer': 'return=representation',
    };
    const resp = await fetch(`${URL}/rest/v1${path}`, { method, headers, body: body ? JSON.stringify(body) : null });
    if (resp.status === 204) return { data: null };
    const text = await resp.text();
    try { return { status: resp.status, data: JSON.parse(text) }; }
    catch { return { status: resp.status, data: text }; }
}

async function runSQL(sql) {
    const resp = await fetch(`${URL}/pg/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SERVICE, 'Authorization': 'Bearer ' + SERVICE },
        body: JSON.stringify({ query: sql }),
    });
    return resp.json();
}

async function main() {
    // Sign in as agent bijak@lendana.id
    const loginResp = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': ANON },
        body: JSON.stringify({ email: 'bijak@lendana.id', password: 'Agent123!' }),
    });
    const loginData = await loginResp.json();
    if (loginData.error) { console.log('Login failed:', JSON.stringify(loginData)); return; }

    const agentToken = loginData.access_token;
    console.log('✓ Logged in as bijak@lendana.id (agent)');

    // Get product ID
    const products = await runSQL("SELECT id FROM public.bank_products LIMIT 1");
    const branches = await runSQL("SELECT id FROM public.bank_branches LIMIT 1");
    const apps = await runSQL("SELECT id FROM public.loan_applications WHERE assigned_agent_id IS NOT NULL AND status != 'Checked' LIMIT 1");

    if (!products[0] || !branches[0]) {
        console.log('No products or branches to test with');
        console.log('Products:', JSON.stringify(products));
        console.log('Branches:', JSON.stringify(branches));

        // Just test READ permission
        const readResult = await restRequest('GET', '/branch_applications?select=id&limit=1', agentToken);
        console.log('\nAgent READ branch_applications:', readResult.status, JSON.stringify(readResult.data));
        return;
    }

    if (!apps[0]) {
        console.log('No loan applications available for testing. Creating a mock test...');
        // Just test READ
        const readResult = await restRequest('GET', '/branch_applications?select=id&limit=1', agentToken);
        console.log('Agent READ branch_applications:', readResult.status, JSON.stringify(readResult.data));

        // Test INSERT with a fake loan_application_id to check if the policy allows it  
        console.log('\nTesting INSERT policy (will fail due to FK constraint, not RLS):');
        const insertResult = await restRequest('POST', '/branch_applications', agentToken, {
            loan_application_id: '00000000-0000-0000-0000-000000000000',
            bank_product_id: products[0].id,
            branch_id: branches[0].id,
            assigned_at: new Date().toISOString(),
        });
        // If error is FK violation (not RLS violation), policy is working correctly
        console.log('INSERT test status:', insertResult.status, JSON.stringify(insertResult.data).substring(0, 200));
        return;
    }

    const appId = apps[0].id;
    const productId = products[0].id;
    const branchId = branches[0].id;

    console.log('\nTesting agent INSERT into branch_applications...');
    const insertResult = await restRequest('POST', '/branch_applications', agentToken, {
        loan_application_id: appId,
        bank_product_id: productId,
        branch_id: branchId,
        assigned_at: new Date().toISOString(),
    });

    console.log('INSERT status:', insertResult.status);
    if (insertResult.status === 201) {
        console.log('✓ Agent INSERT SUCCEEDED!', JSON.stringify(insertResult.data[0]));
        // Cleanup
        const cleanupResult = await restRequest('DELETE', `/branch_applications?id=eq.${insertResult.data[0].id}`, SERVICE);
        console.log('Cleanup done');
    } else {
        const errMsg = typeof insertResult.data === 'object' ? insertResult.data.message || insertResult.data.msg || JSON.stringify(insertResult.data) : insertResult.data;
        if (errMsg && errMsg.includes('security policy')) {
            console.log('✗ STILL blocked by RLS! Error:', errMsg);
        } else {
            console.log('Result:', errMsg);
            console.log('(If FK error → policy is OK, just test data issue)');
        }
    }
}

main().catch(e => console.log('Error:', e.message));
