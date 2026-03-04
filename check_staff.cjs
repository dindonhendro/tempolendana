const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: staff, error } = await supabase
        .from('agent_staff')
        .select('user_id, agent_company_id');

    if (error) {
        console.error('Error fetching staff:', error);
    } else {
        console.log('Agent Staff:');
        for (const s of staff) {
            const { data: user } = await supabase.from('users').select('email').eq('id', s.user_id).single();
            console.log(`- User: ${user?.email || s.user_id}, AgentID: ${s.agent_company_id}`);
        }
    }
}

check();
