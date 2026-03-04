
const { createClient } = require('@supabase/supabase-js');

async function checkRemoteLoans() {
    const url = 'http://103.127.135.216:8000';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzQxNjUxMjAwLCJleHAiOjE4OTk0MTc2MDB9.P8WD5FRr6dgnvcaLeBgUzbvd05PZcN824KCnZoiZ_fI';
    const supabase = createClient(url, key);

    const uid = 'f2e73cee-3078-47d4-8f97-c97dd22c9ee0';
    console.log(`Checking remote loans for ${uid}...`);

    const { data, error } = await supabase
        .from('loan_applications')
        .select('*');

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log(`Found ${data.length} loans on remote.`);
        const match = data.find(l => JSON.stringify(l).includes(uid));
        if (match) {
            console.log('MATCH FOUND:', match);
        } else {
            console.log('No match found.');
        }
    }
}

checkRemoteLoans();
