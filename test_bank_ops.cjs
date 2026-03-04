const { createClient } = require('@supabase/supabase-js');
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
    // Get current policies
    const policiesSQL = `
    SELECT tablename, policyname, cmd, roles, qual, with_check 
    FROM pg_policies 
    WHERE tablename IN ('banks', 'bank_branches', 'bank_products', 'bank_staff')
    ORDER BY tablename, policyname
  `;
    const policies = await runSQL(policiesSQL);
    console.log('Current policies:');
    policies.forEach(p => {
        console.log(`  ${p.tablename}.${p.policyname}: cmd=${p.cmd}, qual=${p.qual}, with_check=${p.with_check}`);
    });

    // Now test with the actual admin user  
    // First get admin1@lendana.id user
    const adminUserSQL = "SELECT id, email, role FROM public.users WHERE role='admin' LIMIT 5";
    const admins = await runSQL(adminUserSQL);
    console.log('\nAdmin users:', JSON.stringify(admins));

    // The issue was the admin user logged into the app doesn't have the token with 'admin' role in users table
    // Let's check what role admin1@lendana.id has
    const user1SQL = "SELECT id, email, role FROM public.users WHERE email = 'admin1@lendana.id'";
    const user1 = await runSQL(user1SQL);
    console.log('\nadmin1@lendana.id:', JSON.stringify(user1));

    const c = createClient('http://103.127.135.216:8000', SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });

    // Test INSERT for banks  
    console.log('\n=== Testing bank INSERT ===');
    const bankTest = await c.from('banks').insert([{ name: 'Test Bank', code: 'TEST' }]).select();
    if (bankTest.error) {
        console.log('Bank insert error:', bankTest.error.message);
    } else {
        console.log('Bank insert OK:', JSON.stringify(bankTest.data));
        await c.from('banks').delete().eq('id', bankTest.data[0].id);
        console.log('Cleaned up test bank');
    }

    // Test INSERT for bank_branches
    console.log('\n=== Testing bank_branches INSERT (with city) ===');
    const branchTest = await c.from('bank_branches').insert([{
        bank_id: 'eb075e4f-98eb-4b91-b18c-08da703adac8',
        name: 'Test Branch',
        city: 'Test City',
    }]).select();
    if (branchTest.error) {
        console.log('Branch insert error:', branchTest.error.message);
    } else {
        console.log('Branch insert OK:', JSON.stringify(branchTest.data));
        await c.from('bank_branches').delete().eq('id', branchTest.data[0].id);
        console.log('Cleaned up test branch');
    }
}

main().catch(e => console.log('Error:', e.message));
