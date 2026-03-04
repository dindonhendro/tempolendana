
const { createClient } = require('@supabase/supabase-js');

async function testUser() {
    const url = 'http://103.127.135.216:8000';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzQxNjUxMjAwLCJleHAiOjE4OTk0MTc2MDB9.P8WD5FRr6dgnvcaLeBgUzbvd05PZcN824KCnZoiZ_fI';
    const supabase = createClient(url, key);

    const testEmails = ['userx1@lendana.id', 'userx5@lendana.id', 'userx6@lendana.id'];

    for (const email of testEmails) {
        console.log(`Testing sign in for ${email}...`);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: 'wrongpassword'
            });

            if (error) {
                console.log(`[${email}] Error message:`, error.message);
                console.log(`[${email}] Error status:`, error.status);
            } else {
                console.log(`[${email}] Sign in response:`, data);
            }
        } catch (e) {
            console.error(`[${email}] Exception:`, e.message);
        }
    }
}

testUser();
