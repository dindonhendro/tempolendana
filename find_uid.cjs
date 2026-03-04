const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

const uid = 'f2e73cee-3078-47d4-8f97-c97dd22c9ee0';

async function findUID() {
    const tables = [
        'users', 'loan_applications', 'branch_applications', 'agent_staff',
        'bank_staff', 'insurance_staff', 'collector_staff', 'user_registration_logs',
        'user_consent_logs', 'loan_applications_audit'
    ];

    for (const table of tables) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .or(`id.eq.${uid},user_id.eq.${uid}`);

            if (data && data.length > 0) {
                console.log(`Found in table: ${table}`);
                console.log(data);
            }
        } catch (e) {
            // Probably column doesn't exist
        }
    }
}

findUID();
