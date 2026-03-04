const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log(`Checking instance: ${supabaseUrl}`);

    // Check userx1@lendana.id
    const { data: userx1, error: u1Error } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'userx1@lendana.id');

    console.log('UserX1 details:', userx1);
    if (u1Error) console.error('Error fetching userx1:', u1Error);

    const uid = 'f2e73cee-3078-47d4-8f97-c97dd22c9ee0';
    console.log(`Searching for UID: ${uid}`);

    // Fetch ALL tables to be sure
    const tables = [
        'users', 'loan_applications', 'branch_applications', 'agent_staff',
        'bank_staff', 'insurance_staff', 'collector_staff', 'user_registration_logs',
        'user_consent_logs', 'loan_applications_audit'
    ];

    for (const table of tables) {
        try {
            // First check if columns exist by selecting 1 row
            const { data: cols, error: colError } = await supabase.from(table).select('*').limit(1);
            if (colError) {
                console.log(`Table ${table} error or not found: ${colError.message}`);
                continue;
            }

            // Search by ID or user_id
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .or(`id.eq.${uid},user_id.eq.${uid}`);

            if (data && data.length > 0) {
                console.log(`FOUND in table: ${table}`);
                console.log(JSON.stringify(data, null, 2));
            } else {
                // Also search in any JSONB columns if they exist
                // Some tables like loan_applications_audit have new_data
                if (table === 'loan_applications_audit') {
                    const { data: auditData } = await supabase
                        .from(table)
                        .select('*');
                    const match = auditData?.find(d => JSON.stringify(d).includes(uid));
                    if (match) {
                        console.log(`FOUND in audit log JSON:`);
                        console.log(JSON.stringify(match, null, 2));
                    }
                }
            }
        } catch (e) {
            console.log(`Table ${table} search failed: ${e.message}`);
        }
    }

    // Also try searching for the UID in loan_applications by other fields?
    // Maybe the user provided a different ID type?
}

check();
