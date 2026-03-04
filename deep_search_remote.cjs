
const { createClient } = require('@supabase/supabase-js');

async function deepSearch() {
    const url = 'http://103.127.135.216:8000';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NDE2NTEyMDAsImV4cCI6MTg5OTQxNzYwMH0.GZ2PhVcPZX_vUjykPDTj8RpfWHWtx0hpFkEQvTeQwGU';

    const supabase = createClient(url, serviceRoleKey);
    const uid = 'f2e73cee-3078-47d4-8f97-c97dd22c9ee0';

    const tables = [
        'users', 'loan_applications', 'branch_applications', 'agent_staff',
        'bank_staff', 'insurance_staff', 'collector_staff', 'user_registration_logs',
        'user_consent_logs', 'loan_applications_audit'
    ];

    console.log(`Searching for ${uid} across all tables...`);

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(100);
        if (error) {
            console.log(`Table ${table} error: ${error.message}`);
            continue;
        }

        const match = data?.find(row => JSON.stringify(row).includes(uid));
        if (match) {
            console.log(`FOUND MATCH in table [${table}]:`);
            console.log(match);
        }
    }
}

deepSearch();
