
const { createClient } = require('@supabase/supabase-js');

async function checkAllUsers() {
    const url = 'http://103.127.135.216:8000';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzQxNjUxMjAwLCJleHAiOjE4OTk0MTc2MDB9.P8WD5FRr6dgnvcaLeBgUzbvd05PZcN824KCnZoiZ_fI';
    const supabase = createClient(url, key);

    console.log('Fetching all users from public.users on self-hosted...');
    const { data, error } = await supabase.from('users').select('id, email, role');

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Users in public.users:');
        data.forEach(u => console.log(`- ${u.email} (${u.id}) [${u.role}]`));
    }
}

checkAllUsers();
