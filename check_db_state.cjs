const fs = require('fs');
const dotenv = fs.readFileSync('.env', 'utf8').split('\n').find(l => l.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY='));
const SERVICE = dotenv ? dotenv.split('=')[1].trim() : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const URL = 'http://103.127.135.216:8000';

async function checkRows() {
    const req1 = await fetch(`${URL}/rest/v1/bank_reviews?select=*&order=created_at.desc&limit=5`, {
        headers: { 'apikey': SERVICE, 'Authorization': 'Bearer ' + SERVICE }
    });
    console.log('Recent bank_reviews:');
    console.log(await req1.json());

    const req2 = await fetch(`${URL}/rest/v1/loan_applications?select=id,status,bank_approved_at&order=updated_at.desc&limit=5`, {
        headers: { 'apikey': SERVICE, 'Authorization': 'Bearer ' + SERVICE }
    });
    console.log('Recent loan_applications:');
    console.log(await req2.json());
}

checkRows().catch(console.error);
