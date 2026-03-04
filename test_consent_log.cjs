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
        user_id: "00000000-0000-0000-0000-000000000000",
        document_type: "privacy_policy",
        document_version: "1.0",
        consent_given: true,
        consent_at: new Date().toISOString(),
        ip_address: "127.0.0.1",
        user_agent: "Node.js Test",
        source: "web"
    };

    const { data, error } = await supabase.from('user_consent_logs').insert(logEntry);

    if (error) console.error('Error:', error);
    else console.log('Successfully inserted consent entry:', data);
}
run();
