const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/^VITE_SUPABASE_URL=(.*)/m);
const keyMatch = env.match(/^VITE_SUPABASE_ANON_KEY=(.*)/m);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: apps, error } = await supabase.from('loan_applications').select('*');
    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`Found ${apps.length} applications`);
        const target = apps.find(a => JSON.stringify(a).includes('f2e73cee-3078-47d4-8f97-c97dd22c9ee0'));
        if (target) {
            console.log('Match found in loan_applications:');
            console.log(JSON.stringify(target, null, 2));
        } else {
            console.log('No match found in loan_applications IDs or content.');
            console.log('First 5 IDs:', apps.slice(0, 5).map(a => a.id));
        }
    }
}

check();
