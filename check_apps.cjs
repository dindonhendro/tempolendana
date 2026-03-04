const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: apps, error } = await supabase
        .from('loan_applications')
        .select('id, full_name, status, assigned_agent_id')
        .eq('status', 'Submitted');

    if (error) {
        console.error('Error fetching apps:', error);
    } else {
        console.log('Submitted Applications:');
        apps.forEach(app => {
            console.log(`- ID: ${app.id}, Name: ${app.full_name}, AgentID: ${app.assigned_agent_id}`);
        });
    }
}

check();
