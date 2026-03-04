const URL = 'http://103.127.135.216:8000';
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
    const cols = await runSQL("SELECT column_name FROM information_schema.columns WHERE table_name = 'loan_applications'");
    console.log('loan_applications columns:', cols.map(c => c.column_name).join(', '));

    if (!cols.find(c => c.column_name === 'validated_by_lendana')) {
        console.log('Adding missing columns...');
        await runSQL(`
      ALTER TABLE public.loan_applications
      ADD COLUMN IF NOT EXISTS validated_by_lendana UUID REFERENCES public.users(id),
      ADD COLUMN IF NOT EXISTS validated_by_lendana_at TIMESTAMP WITH TIME ZONE;
      
      NOTIFY pgrst, 'reload schema';
    `);
        console.log('Added missing columns.');
    } else {
        console.log('Column exists, maybe just reloading schema cache...');
        await runSQL(`NOTIFY pgrst, 'reload schema';`);
    }
}

main().catch(console.error);
