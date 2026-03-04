const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Simple parser for .env
function parseEnv(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const envVars = {};
    content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const match = trimmed.match(/^([^=]+)=(.*)$/);
            if (match) {
                envVars[match[1]] = match[2];
            }
        }
    });
    return envVars;
}

const envVars = parseEnv('.env');
const supabaseUrl = envVars['VITE_SUPABASE_URL'];
const supabaseKey = envVars['VITE_SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Checking bank_products table...');

    // Execute raw SQL using rpc if we have one, or rest if we can just test an insert/update
    const { data, error } = await supabase
        .from('bank_products')
        .select('product_description')
        .limit(1);

    if (error) {
        console.error('Error fetching product_description:', error.message);
        if (error.message.includes('Could not find the \'product_description\' column')) {
            console.log('product_description column is missing. Adding it now...');
            // We don't have direct SQL execution, let's use the REST API via a dummy RPC or something.
            // Wait, we can't reliably execute arbitrary SQL without an RPC endpoint. 
            // But maybe we have the 'execute_sql' function we created before?
            // No, let's check if there's any RPC that allows execution, or we need to advise the user to run it from Supabase Dashboard.
        }
    } else {
        console.log('product_description column exists:', data);
    }
}

run();
