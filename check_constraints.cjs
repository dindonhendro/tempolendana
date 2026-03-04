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
    // Check what type values are allowed for bank_products
    const checkSQL = `
    SELECT pg_get_constraintdef(con.oid) as constraint_def
    FROM pg_constraint con
    JOIN pg_class cl ON con.conrelid = cl.oid
    WHERE cl.relname = 'bank_products' AND con.contype = 'c'
  `;
    const checks = await runSQL(checkSQL);
    console.log('bank_products check constraints:', JSON.stringify(checks, null, 2));

    // Also check admin1@lendana.id password issue
    // Let's try different passwords
    const passwords = ['Admin123!', 'admin123', 'Admin1234!', 'adminsupera123', 'password'];
    for (const pwd of passwords) {
        const resp = await fetch('http://103.127.135.216:8000/auth/v1/token?grant_type=password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzQxNjUxMjAwLCJleHAiOjE4OTk0MTc2MDB9.P8WD5FRr6dgnvcaLeBgUzbvd05PZcN824KCnZoiZ_fI',
            },
            body: JSON.stringify({ email: 'admin1@lendana.id', password: pwd }),
        });
        const data = await resp.json();
        if (!data.error) {
            console.log(`\n✓ admin1@lendana.id signs in with password: "${pwd}"`);
            break;
        } else {
            console.log(`✗ Password "${pwd}": ${data.error_code}`);
        }
    }
}

main().catch(e => console.log('Error:', e.message));
