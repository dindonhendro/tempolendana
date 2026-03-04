require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
    console.log('Testing update...');

    // 1. Get a test application that is Validated
    const { data: apps, error: fetchError } = await supabase
        .from('loan_applications')
        .select('id')
        .eq('status', 'Validated')
        .limit(1);

    if (fetchError) {
        console.error('Fetch error:', fetchError);
        return;
    }

    if (!apps || apps.length === 0) {
        console.log('No validated apps found to test');
        // Just show the policies
        return checkPolicies();
    }

    const appId = apps[0].id;
    console.log('Found app:', appId);

    return checkPolicies();
}

async function checkPolicies() {
    console.log('Checking policies...');
    const { data, error } = await supabase.rpc('execute_sql', { sql: "SELECT * FROM pg_policies WHERE tablename = 'loan_applications'" });
    if (error) {
        console.log('RPC execute_sql failed, trying direct query if possible or just logging error', error);
    } else {
        console.log('Policies:', data);
    }
}

testUpdate();
