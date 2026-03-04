
const { createClient } = require('@supabase/supabase-js');

async function testSignUp() {
    const url = 'http://103.127.135.216:8000';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzQxNjUxMjAwLCJleHAiOjE4OTk0MTc2MDB9.P8WD5FRr6dgnvcaLeBgUzbvd05PZcN824KCnZoiZ_fI';
    const supabase = createClient(url, key);

    const email = 'userx1@lendana.id';
    console.log(`Attempting to sign up ${email}...`);
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: 'somepassword123'
        });

        if (error) {
            console.log('Error message:', error.message);
            console.log('Error status:', error.status);
        } else {
            console.log('Sign up response:', data);
        }
    } catch (e) {
        console.error('Exception:', e.message);
    }
}

testSignUp();
