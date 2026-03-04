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
    // Sign in as validator
    const loginResp = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': ANON },
        body: JSON.stringify({ email: 'admin_pmi@lendana.id', password: 'Validator123!' }),
    });
    const loginData = await loginResp.json();
    if (loginData.error) { console.log('Login fail', loginData); return; }
    const token = loginData.access_token;
    const valId = loginData.user.id;

    console.log('✓ Logged in as validator', valId);

    // Find an app in "Checked" status
    const apps = await runSQL("SELECT id FROM public.loan_applications WHERE status = 'Checked' LIMIT 1");
    if (!apps || apps.length === 0) { console.log('No checked apps'); return; }
    const appId = apps[0].id;

    console.log('Testing update on app:', appId);

    // Attempt the update directly via REST API as validator
    const updateData = {
        status: 'Validated',
        updated_at: new Date().toISOString(),
        validated_by_lendana: valId,
        validated_by_lendana_at: new Date().toISOString()
    };

    const updateResp = await fetch(`${URL}/rest/v1/loan_applications?id=eq.${appId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'apikey': ANON,
            'Authorization': `Bearer ${token}`,
            'Prefer': 'return=representation',
        },
        body: JSON.stringify(updateData)
    });

    if (updateResp.status === 204) {
        console.log('✓ Update succeeded (204)');
    } else {
        const errorText = await updateResp.text();
        console.log(`Update failed with status ${updateResp.status}:`, errorText);
    }
}

main().catch(console.error);
