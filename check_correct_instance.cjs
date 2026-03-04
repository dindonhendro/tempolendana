const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
// Only match lines that start with VITE_SUPABASE_URL (no #)
const urlMatch = env.match(/^VITE_SUPABASE_URL=(.*)/m);
const keyMatch = env.match(/^VITE_SUPABASE_ANON_KEY=(.*)/m);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log(`Checking instance: ${supabaseUrl}`);

    // Check all tables for UID
    const uid = 'f2e73cee-3078-47d4-8f97-c97dd22c9ee0';
    console.log(`Searching for: ${uid}`);

    // First check userx1
    const { data: userx1 } = await supabase.from('users').select('*').eq('email', 'userx1@lendana.id');
    console.log('UserX1:', userx1);

    const tables = [
        'users', 'loan_applications', 'branch_applications', 'agent_staff',
        'bank_staff', 'insurance_staff', 'collector_staff', 'user_registration_logs',
        'user_consent_logs', 'loan_applications_audit'
    ];

    for (const table of tables) {
        try {
            // Find by ID, user_id, or string in JSON
            const { data, error } = await supabase.from(table).select('*').limit(200);
            if (error) {
                console.log(`Table ${table} error: ${error.message}`);
                continue;
            }

            const matches = data.filter(row => JSON.stringify(row).includes(uid));
            if (matches.length > 0) {
                console.log(`FOUND in table: ${table}`);
                console.log(JSON.stringify(matches, null, 2));
            }
        } catch (e) {
            console.log(`Failed table ${table}: ${e.message}`);
        }
    }
}

check();
