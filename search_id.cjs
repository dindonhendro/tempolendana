
const { createClient } = require('@supabase/supabase-js');

async function searchAllTables() {
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
    const targetId = 'f2e73cee-3078-47d4-8f97-c97dd22c9ee0';

    const { data: tables, error: tablesError } = await supabase.rpc('get_tables'); // This might not work if RPC doesn't exist

    // Alternative: manually list tables we know
    const tablesToSearch = [
        'users', 'loan_applications', 'branch_applications', 'loan_applications_audit',
        'bank_staff', 'agent_staff', 'insurance_staff', 'collector_staff',
        'user_registration_logs', 'user_consent_logs', 'komponen_biaya'
    ];

    for (const table of tablesToSearch) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .or(`id.eq.${targetId},user_id.eq.${targetId}`)
                .limit(1);

            if (data && data.length > 0) {
                console.log(`Found in table: ${table}`);
                console.log(data[0]);
            }
        } catch (e) {
            // console.error(`Error searching table ${table}:`, e.message);
        }
    }
}

// searchAllTables();
