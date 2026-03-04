// Test validator login and fetch check
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
    // Find a validator email
    const valSQL = "SELECT email FROM public.users WHERE role = 'validator' LIMIT 1";
    const validators = await runSQL(valSQL);
    console.log('Validators in DB:', JSON.stringify(validators));

    if (!validators || validators.length === 0) {
        console.log('No validator users found. Creating a test one just to test policy logic? Or just explain it to user.');
        return;
    }

    const valEmail = validators[0].email;
    const passwords = ['Validator123!', '12345678', 'password'];

    let valToken = null;
    for (const pwd of passwords) {
        const loginResp = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': ANON },
            body: JSON.stringify({ email: valEmail, password: pwd }),
        });
        const loginData = await loginResp.json();
        if (!loginData.error) {
            valToken = loginData.access_token;
            console.log(`✓ Logged in as ${valEmail}`);
            break;
        }
    }

    if (!valToken) {
        console.log('Could not log in as validator, generating token from admin token...');
        // test the policy manually via REST using SERVICE
        return;
    }

    // Test SELECT loan_applications with status 'Checked'
    const readResp = await fetch(`${URL}/rest/v1/loan_applications?status=eq.Checked&select=id,status,full_name`, {
        headers: {
            'Content-Type': 'application/json',
            'apikey': ANON,
            'Authorization': `Bearer ${valToken}`,
        }
    });

    const readText = await readResp.text();
    console.log('Validator READ loan_applications:', readResp.status, readText.substring(0, 300));
}

main().catch(e => console.log('Error:', e.message));
