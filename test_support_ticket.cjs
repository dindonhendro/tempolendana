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
    const { data, error } = await supabase.from('support_tickets').insert({
        ticket_id: "TL-TEST-2",
        full_name: "Test Name",
        email: "test@example.com",
        whatsapp: "1234567890",
        application_id: "", // testing empty string
        complaint_details: "Test detail",
        status: 'Open'
    });

    if (error) console.error('Error:', error);
    else console.log('Success!', data);
}
run();
