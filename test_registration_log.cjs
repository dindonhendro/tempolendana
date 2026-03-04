const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envVars = {};
fs.readFileSync('.env', 'utf-8').split('\n').forEach((line) => {
    const t = line.trim();
    if (t && !t.startsWith('#')) {
        const m = t.match(/^([^=]+)=(.*)$/);
        if (m) envVars[m[1]] = m[2];
    }
});

const supabase = createClient(envVars['VITE_SUPABASE_URL'], envVars['VITE_SUPABASE_ANON_KEY']);

async function run() {
    const logEntry = {
        user_id: null,
        email: "test@example.com",
        full_name: "Test Name",
        role: "user",
        ip_address: "127.0.0.1",
        user_agent: "Node.js Test",
        device_type: "desktop",
        browser: "Unknown",
        operating_system: "Linux",
        registration_status: "success",
        error_message: null,
        created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('user_registration_logs').insert(logEntry);

    if (error) console.error('Error:', error);
    else console.log('Success!', data);
}
run();
