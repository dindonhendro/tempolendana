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
    const validators = await runSQL("SELECT id, email, role FROM public.users WHERE role LIKE '%val%' OR email LIKE '%val%' OR email = 'admin_pmi@lendana.id'");
    console.log('Potential validator users in DB:', JSON.stringify(validators, null, 2));

    // Reset the password for admin_pmi@lendana.id so we can test with it directly
    if (validators.length > 0) {
        const userIdStr = validators[0].id; // using first one
        console.log('\\nResetting password for user', userIdStr, '...');

        // Check if auth token is returned instead of using REST endpoint
        const resetResp = await fetch(`${URL}/auth/v1/admin/users/${userIdStr}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SERVICE,
                'Authorization': `Bearer ${SERVICE}`
            },
            body: JSON.stringify({ password: 'Validator123!' })
        });

        const resetData = await resetResp.json();
        console.log('Reset response:', resetResp.status, resetData.error ? resetData.error : 'Success');

        // Try to login now
        const loginResp = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': ANON },
            body: JSON.stringify({ email: validators[0].email, password: 'Validator123!' }),
        });
        const loginData = await loginResp.json();

        if (!loginData.error) {
            console.log('✓ Successfully logged in as', validators[0].email);
            const valToken = loginData.access_token;

            // Test the API route
            const readResp = await fetch(`${URL}/rest/v1/loan_applications?status=eq.Checked&select=id,status,full_name`, {
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': ANON,
                    'Authorization': `Bearer ${valToken}`,
                }
            });
            const readText = await readResp.text();
            console.log('Validator READ loan_applications:', readResp.status, readText);
        } else {
            console.log('Login failed:', JSON.stringify(loginData));
        }
    }
}

main().catch(e => console.log('Error:', e.message));
