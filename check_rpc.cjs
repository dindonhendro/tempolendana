const URL = 'http://103.127.135.216:8000';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzQxNjUxMjAwLCJleHAiOjE4OTk0MTc2MDB9.P8WD5FRr6dgnvcaLeBgUzbvd05PZcN824KCnZoiZ_fI';
const SERVICE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NDE2NTEyMDAsImV4cCI6MTg5OTQxNzYwMH0.GZ2PhVcPZX_vUjykPDTj8RpfWHWtx0hpFkEQvTeQwGU';

async function main() {
    const checkRpc = await fetch(`${URL}/rest/v1/rpc/compute_loan_application_hash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SERVICE, 'Authorization': `Bearer ${SERVICE}` },
        body: JSON.stringify({ p_loan_application_id: '79caca07-35ec-4ef7-9fc2-cf151d177f49' })
    });

    if (checkRpc.status === 200) {
        const data = await checkRpc.json();
        console.log('RPC succeeded:', data);
    } else {
        console.log('RPC failed:', checkRpc.status, await checkRpc.text());
    }
}

main().catch(console.error);
