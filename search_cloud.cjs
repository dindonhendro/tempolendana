const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Use the CLOUD URL/Key which are often in comments or I can reconstruct them
const supabaseUrl = 'https://ptdjmsekjzkmmyrxfkgm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0ZGptc2VranprbW15cnhma2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMzA4NDIsImV4cCI6MjA2NzcwNjg0Mn0.0sJDeFJl5OJV2dpMY8UVRQSxOgUjj0RPUvpkM5i6Pjo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log(`Checking CLOUD instance: ${supabaseUrl}`);
    const uid = 'f2e73cee-3078-47d4-8f97-c97dd22c9ee0';

    const { data: apps, error } = await supabase.from('loan_applications').select('*');
    if (error) {
        console.error('Error:', error);
        return;
    }

    const match = apps.find(a => JSON.stringify(a).includes(uid));
    if (match) {
        console.log('FOUND MATCH:');
        console.log(JSON.stringify(match, null, 2));
    } else {
        console.log('No match found in loan_applications.');
        // Check users too
        const { data: users } = await supabase.from('users').select('*');
        const userMatch = users.find(u => JSON.stringify(u).includes(uid));
        if (userMatch) {
            console.log('FOUND MATCH IN USERS:');
            console.log(JSON.stringify(userMatch, null, 2));
        } else {
            console.log('No match found in users.');
        }
    }
}

check();
