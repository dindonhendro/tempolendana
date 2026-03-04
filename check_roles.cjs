const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: users, error } = await supabase
        .from('users')
        .select('email, role');

    const targets = ['p3mi10@lendana.id', 'bijak10@lendana.id', 'blackdramon@gmail.com', 'hersu10@lendana.id', 'admin_p3mi@lendana.id'];

    if (error) {
        console.error('Error fetching users:', error);
    } else {
        console.log('Target Users:');
        users.filter(u => targets.includes(u.email)).forEach(u => {
            console.log(`- Email: ${u.email}, Role: ${u.role}`);
        });
    }
}

check();
