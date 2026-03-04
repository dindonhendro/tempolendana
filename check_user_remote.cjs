
const { createClient } = require('@supabase/supabase-js');

async function searchUser() {
    const url = 'http://103.127.135.216:8000';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzQxNjUxMjAwLCJleHAiOjE4OTk0MTc2MDB9.P8WD5FRr6dgnvcaLeBgUzbvd05PZcN824KCnZoiZ_fI';
    const supabase = createClient(url, key);

    const email = 'userx1@lendana.id';
    console.log(`Searching for ${email} in public.users...`);

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email);

    if (error) {
        console.error('Error:', error.message);
    } else if (data && data.length > 0) {
        console.log('Found user:', data[0]);
    } else {
        console.log('User not found in public.users');
    }
}

searchUser();
