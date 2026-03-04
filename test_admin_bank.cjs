// Test as admin user (admin1@lendana.id) - simulate what the app does
const { createClient } = require('@supabase/supabase-js');

const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzQxNjUxMjAwLCJleHAiOjE4OTk0MTc2MDB9.P8WD5FRr6dgnvcaLeBgUzbvd05PZcN824KCnZoiZ_fI';
const SERVICE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NDE2NTEyMDAsImV4cCI6MTg5OTQxNzYwMH0.GZ2PhVcPZX_vUjykPDTj8RpfWHWtx0hpFkEQvTeQwGU';

async function main() {
    // Sign in as admin1@lendana.id to get a real JWT
    const signInResp = await fetch('http://103.127.135.216:8000/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': ANON,
        },
        body: JSON.stringify({ email: 'admin1@lendana.id', password: 'Admin123!' }),
    });

    const signInData = await signInResp.json();
    if (signInData.error || !signInData.access_token) {
        console.log('Sign-in failed:', JSON.stringify(signInData));
        // Try with service role directly (admin client pattern)
        console.log('\nTrying with service_role (supabaseAdminClient pattern)...');
        const c = createClient('http://103.127.135.216:8000', SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });

        const bankTest = await c.from('banks').insert([{ name: 'Test Admin Bank', code: 'TADMIN' }]).select();
        const branchTest = await c.from('bank_branches').insert([{ bank_id: 'eb075e4f-98eb-4b91-b18c-08da703adac8', name: 'Test Admin Branch', city: 'Test City' }]).select();
        const productTest = await c.from('bank_products').insert([{ bank_id: 'eb075e4f-98eb-4b91-b18c-08da703adac8', name: 'Test Product', type: 'KUR', interest_rate: 6.0, min_amount: 1000000, max_amount: 50000000, min_tenor: 12, max_tenor: 60 }]).select();

        console.log('bank INSERT:', bankTest.error ? 'ERROR: ' + bankTest.error.message : 'OK');
        console.log('branch INSERT:', branchTest.error ? 'ERROR: ' + branchTest.error.message : 'OK');
        console.log('product INSERT:', productTest.error ? 'ERROR: ' + productTest.error.message : 'OK');

        // Cleanup
        if (bankTest.data) await c.from('banks').delete().eq('id', bankTest.data[0].id);
        if (branchTest.data) await c.from('bank_branches').delete().eq('id', branchTest.data[0].id);
        if (productTest.data) await c.from('bank_products').delete().eq('id', productTest.data[0].id);
        return;
    }

    console.log('Signed in as admin1@lendana.id successfully!');
    const adminToken = signInData.access_token;

    // Use the admin token (authenticated role in Supabase)
    const c = createClient('http://103.127.135.216:8000', ANON, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: 'Bearer ' + adminToken } }
    });

    console.log('\n=== Testing Bank Management Operations (as admin user) ===');

    // List banks
    const { data: banks } = await c.from('banks').select('id, name, code').limit(3);
    console.log('Banks:', JSON.stringify(banks));

    // Test insert bank_branches
    const branchInsert = await c.from('bank_branches').insert([{
        bank_id: banks[0].id,
        name: 'Test Branch Insert',
        address: 'Jl. Test 123',
        city: 'Jakarta',
        province: 'DKI Jakarta',
    }]).select();
    console.log('\nbranch INSERT:', branchInsert.error ? 'ERROR: ' + branchInsert.error.message : 'OK - id:' + branchInsert.data[0].id);

    // Test insert bank_products
    const productInsert = await c.from('bank_products').insert([{
        bank_id: banks[0].id,
        name: 'Test Product',
        type: 'KUR',
        interest_rate: 6.5,
        min_amount: 5000000,
        max_amount: 50000000,
        min_tenor: 12,
        max_tenor: 60,
    }]).select();
    console.log('product INSERT:', productInsert.error ? 'ERROR: ' + productInsert.error.message : 'OK - id:' + productInsert.data[0].id);

    // Cleanup
    if (branchInsert.data) await c.from('bank_branches').delete().eq('id', branchInsert.data[0].id);
    if (productInsert.data) await c.from('bank_products').delete().eq('id', productInsert.data[0].id);
    console.log('\nCleanup complete!');
}

main().catch(e => console.log('Error:', e.message));
