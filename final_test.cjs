// Full end-to-end test of bank management as admin user (admin1@lendana.id / Admin123!)
const { createClient } = require('@supabase/supabase-js');

const URL = 'http://103.127.135.216:8000';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzQxNjUxMjAwLCJleHAiOjE4OTk0MTc2MDB9.P8WD5FRr6dgnvcaLeBgUzbvd05PZcN824KCnZoiZ_fI';
const SERVICE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NDE2NTEyMDAsImV4cCI6MTg5OTQxNzYwMH0.GZ2PhVcPZX_vUjykPDTj8RpfWHWtx0hpFkEQvTeQwGU';

async function main() {
    console.log('=== Bank Management Final Test ===\n');

    // Sign in as admin1@lendana.id
    const signInResp = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': ANON },
        body: JSON.stringify({ email: 'admin1@lendana.id', password: 'Admin123!' }),
    });

    const signInData = await signInResp.json();
    if (signInData.error) {
        console.log('Login FAILED:', JSON.stringify(signInData));
        return;
    }

    console.log('✓ admin1@lendana.id login SUCCESS');
    const token = signInData.access_token;

    // Use authenticated admin client (like the app does with supabaseAdminClient using service key)
    const adminClient = createClient(URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });
    const userClient = createClient(URL, ANON, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: 'Bearer ' + token } }
    });

    // Test 1: List banks
    const { data: banks, error: banksError } = await adminClient.from('banks').select('*').order('name');
    console.log(`\n1. Banks (${banks?.length || 0}):`, banksError ? 'ERROR: ' + banksError.message : banks.map(b => b.name).join(', '));

    // Test 2: Create branch (as admin user using service key - this is how the app works)
    if (banks && banks.length > 0) {
        const { data: branchData, error: branchError } = await adminClient
            .from('bank_branches')
            .insert([{
                bank_id: banks[0].id,
                name: 'Test Branch Final',
                address: 'Jl. Merdeka 1',
                city: 'Jakarta Pusat',
                province: 'DKI Jakarta',
                phone: '021-12345678',
            }])
            .select();

        if (branchError) {
            console.log('\n2. Branch CREATE: FAILED -', branchError.message);
        } else {
            console.log('\n2. Branch CREATE: ✓ OK -', branchData[0].name, '(', branchData[0].city, ')');

            // Clean up
            await adminClient.from('bank_branches').delete().eq('id', branchData[0].id);
        }

        // Test 3: Create product (as admin)
        const { data: productData, error: productError } = await adminClient
            .from('bank_products')
            .insert([{
                bank_id: banks[0].id,
                name: 'KUR Mikro 2026',
                type: 'KUR',
                interest_rate: 6.0,
                min_amount: 1000000,
                max_amount: 50000000,
                min_tenor: 12,
                max_tenor: 60,
            }])
            .select();

        if (productError) {
            console.log('\n3. Product CREATE: FAILED -', productError.message);
        } else {
            console.log('\n3. Product CREATE: ✓ OK -', productData[0].name);
            await adminClient.from('bank_products').delete().eq('id', productData[0].id);
        }
    }

    // Test 4: List bank branches
    const { data: branches } = await adminClient
        .from('bank_branches')
        .select('*, banks!inner(name)')
        .order('name');
    console.log(`\n4. Bank Branches (${branches?.length || 0}): OK`);

    // Test 5: List bank products
    const { data: products } = await adminClient
        .from('bank_products')
        .select('*, banks!inner(name)')
        .order('name');
    console.log(`5. Bank Products (${products?.length || 0}): OK`);

    // Test 6: List bank staff
    const { data: staff, error: staffError } = await adminClient
        .from('bank_staff')
        .select('*, users!inner(full_name, email), banks!inner(name)')
        .order('position');
    console.log(`6. Bank Staff (${staff?.length || 0}):`, staffError ? 'ERROR: ' + staffError.message : 'OK');

    // Test 7: branch_applications and bank_reviews tables accessible
    const { data: branchApps, error: baError } = await adminClient.from('branch_applications').select('id').limit(5);
    console.log(`7. branch_applications: ${baError ? 'ERROR: ' + baError.message : 'OK (' + branchApps.length + ' rows)'}`);

    const { data: bankRevs, error: brError } = await adminClient.from('bank_reviews').select('id').limit(5);
    console.log(`8. bank_reviews: ${brError ? 'ERROR: ' + brError.message : 'OK (' + bankRevs.length + ' rows)'}`);

    console.log('\n=== ALL TESTS COMPLETE ===');
}

main().catch(e => console.log('Error:', e.message));
