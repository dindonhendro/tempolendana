const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: allStaff, error: err2 } = await supabase.from('agent_staff').select('*');

    if (err2) {
        console.error('Error:', err2);
        return;
    }

    const counts = {};
    allStaff.forEach(s => {
        counts[s.user_id] = (counts[s.user_id] || 0) + 1;
    });

    console.log('User staff counts:');
    let duplicates = false;
    for (const id in counts) {
        if (counts[id] > 1) {
            console.log(`- UserID: ${id}, Count: ${counts[id]} (DUPLICATE DETECTED!)`);
            duplicates = true;
        }
    }
    if (!duplicates) console.log('No duplicates found.');
}

check();
