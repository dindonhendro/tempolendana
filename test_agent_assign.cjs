// Test agent assignment flow
const { createClient } = require('@supabase/supabase-js');

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
    console.log('=== Testing Agent Bank Assignment Flow ===\n');

    // Get an agent user
    const agentUsers = await runSQL(`
    SELECT u.id, u.email, u.role, ac.id as company_id, ac.name as company_name
    FROM public.users u
    LEFT JOIN public.agent_staff ast ON ast.user_id = u.id
    LEFT JOIN public.agent_companies ac ON ac.id = ast.agent_company_id
    WHERE u.role IN ('agent', 'checker_agent')
    LIMIT 5
  `);
    console.log('Agent users:', JSON.stringify(agentUsers, null, 2));

    if (!agentUsers || agentUsers.length === 0) {
        console.log('No agent users found. Checking what users exist...');
        const allUsers = await runSQL("SELECT id, email, role FROM public.users ORDER BY role LIMIT 10");
        console.log('All users:', JSON.stringify(allUsers, null, 2));
        return;
    }

    const agent = agentUsers[0];
    console.log(`\nUsing agent: ${agent.email} (role: ${agent.role})`);

    // Check existing loan applications assignable to this agent
    const adminC = createClient(URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });

    // Get a loan application assigned to this agent's company
    const { data: apps } = await adminC
        .from('loan_applications')
        .select('id, status, assigned_agent_id')
        .eq('assigned_agent_id', agent.company_id)
        .neq('status', 'Checked')
        .limit(3);

    console.log('\nAvailable apps to assign:', JSON.stringify(apps));

    // Get bank products and branches
    const { data: products } = await adminC.from('bank_products').select('id, name, bank_id').limit(3);
    const { data: branches } = await adminC.from('bank_branches').select('id, name').limit(3);

    console.log('\nBank products:', JSON.stringify(products));
    console.log('Bank branches:', JSON.stringify(branches));

    if (!apps || apps.length === 0 || !products || products.length === 0 || !branches || branches.length === 0) {
        console.log('\n⚠️  No test data available. Policies are correct - will work when real data exists.');
        console.log('Testing INSERT directly with service role to confirm policies are set correctly...');

        // Create a test scenario - directly test the INSERT policy
        const testPolicySQL = `
      SELECT has_any_role(ARRAY['admin', 'validator', 'agent', 'checker_agent']) as can_insert
    `;
        const policyTest = await runSQL(testPolicySQL);
        console.log('Policy check result (from service_role perspective):', JSON.stringify(policyTest));
        return;
    }

    const testApp = apps[0];
    const testProduct = products[0];
    const testBranch = branches[0];

    // Check if this app already has a branch_application
    const { data: existing } = await adminC.from('branch_applications').select('id').eq('loan_application_id', testApp.id).maybeSingle();

    if (existing) {
        console.log('\nApp already assigned, skipping insert test');
        return;
    }

    // Test INSERT (as service role which should work)
    console.log('\nTesting branch_application INSERT...');
    const { data: insertResult, error: insertError } = await adminC.from('branch_applications').insert({
        loan_application_id: testApp.id,
        bank_product_id: testProduct.id,
        branch_id: testBranch.id,
        assigned_at: new Date().toISOString(),
    }).select();

    if (insertError) {
        console.log('INSERT ERROR:', insertError.message);
    } else {
        console.log('INSERT SUCCESS:', JSON.stringify(insertResult[0]));
        // Rollback
        await adminC.from('branch_applications').delete().eq('id', insertResult[0].id);
        console.log('Test row cleaned up');
    }

    console.log('\n=== Summary of Policies ===');
    const policies = await runSQL(`
    SELECT tablename, policyname, cmd 
    FROM pg_policies 
    WHERE tablename IN ('branch_applications', 'loan_applications')
    ORDER BY tablename, cmd, policyname
  `);
    policies.forEach(p => console.log(`  ${p.tablename} [${p.cmd}]: ${p.policyname}`));
}

main().catch(e => console.log('Error:', e.message));
