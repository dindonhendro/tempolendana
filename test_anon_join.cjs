const fs = require('fs');

const dotenvLines = fs.readFileSync('.env', 'utf8').split('\n');
const ANON_LINE = dotenvLines.find(l => l.startsWith('VITE_SUPABASE_ANON_KEY='));
const ANON = ANON_LINE ? ANON_LINE.split('=')[1].trim() : process.env.VITE_SUPABASE_ANON_KEY;
const URL_LINE = dotenvLines.find(l => /^VITE_SUPABASE_URL=/.test(l));
const URL = URL_LINE ? URL_LINE.split('=')[1].trim() : 'http://103.127.135.216:8000';

async function testAnonJoin() {
    if (!ANON) { console.error("No anon key found"); return; }

    const resp = await fetch(`${URL}/rest/v1/bank_products?select=*,banks(name,logo_url)`, {
        method: 'GET',
        headers: {
            'apikey': ANON,
            'Authorization': 'Bearer ' + ANON
        }
    });

    if (!resp.ok) {
        console.error("Fetch failed:", await resp.text());
        return;
    }

    const data = await resp.json();
    console.log("Joined data for ANON:");
    console.log(JSON.stringify(data, null, 2));
}

testAnonJoin().catch(console.error);
