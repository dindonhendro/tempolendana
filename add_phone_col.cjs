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
    // Add phone column to bank_branches if missing
    const addPhoneSQL = `
    ALTER TABLE public.bank_branches 
    ADD COLUMN IF NOT EXISTS phone TEXT;
    NOTIFY pgrst, 'reload schema';
  `;
    const result = await runSQL(addPhoneSQL);
    console.log('Added phone column:', JSON.stringify(result));

    // Verify columns
    const cols = await runSQL("SELECT column_name FROM information_schema.columns WHERE table_name = 'bank_branches' AND table_schema = 'public' ORDER BY ordinal_position");
    console.log('bank_branches columns:', cols.map(c => c.column_name).join(', '));

    // Wait a moment for PostgREST to reload
    await new Promise(r => setTimeout(r, 2000));

    // Test insert with phone
    const { createClient } = require('@supabase/supabase-js');
    const c = createClient('http://103.127.135.216:8000', SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });

    const test = await c.from('bank_branches').insert([{
        bank_id: 'eb075e4f-98eb-4b91-b18c-08da703adac8',
        name: 'Test Branch with Phone',
        city: 'Jakarta',
        phone: '021-12345678',
    }]).select();

    if (test.error) {
        console.log('\nBranch with phone INSERT: ERROR -', test.error.message);
    } else {
        console.log('\nBranch with phone INSERT: OK -', JSON.stringify(test.data[0]));
        await c.from('bank_branches').delete().eq('id', test.data[0].id);
        console.log('Cleaned up');
    }
}

main().catch(e => console.log('Error:', e.message));
