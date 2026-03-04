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
    const tables = ['banks', 'bank_branches', 'bank_products', 'bank_staff'];

    for (const table of tables) {
        const sql = `SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = '${table}' AND table_schema = 'public' ORDER BY ordinal_position`;
        const result = await runSQL(sql);
        console.log(`\n=== ${table} ===`);
        result.forEach(col => {
            console.log(`  ${col.column_name}: ${col.data_type}, nullable=${col.is_nullable}, default=${col.column_default}`);
        });
    }

    // Also check if the admin insert/update for bank_branches works now
    const { createClient } = require('@supabase/supabase-js');
    const c = createClient('http://103.127.135.216:8000', SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });

    console.log('\n=== Testing bank_branches insert (admin) ===');
    const testInsert = await c.from('bank_branches').insert([{
        bank_id: 'eb075e4f-98eb-4b91-b18c-08da703adac8',
        name: 'Test Branch',
        address: 'Jl. Test 123',
        city: 'Jakarta',
        province: 'DKI Jakarta',
    }]).select();

    if (testInsert.error) {
        console.log('Insert error:', testInsert.error.message, '| Code:', testInsert.error.code);
    } else {
        console.log('Insert success:', JSON.stringify(testInsert.data));
        // Clean up
        if (testInsert.data && testInsert.data[0]) {
            await c.from('bank_branches').delete().eq('id', testInsert.data[0].id);
            console.log('Cleaned up test row');
        }
    }
}

main().catch(e => console.log('Error:', e.message));
