const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: policies, error } = await supabase.rpc('get_policies', { table_name: 'loan_applications' });

    if (error) {
        // If rpc fail, maybe it doesn't exist. Try another way.
        console.error('Error fetching policies via RPC:', error);

        // Attempting to read migrations to see policies
        console.log('Checking migrations for policies...');
    } else {
        console.log('Policies for loan_applications:');
        console.table(policies);
    }
}

check();
