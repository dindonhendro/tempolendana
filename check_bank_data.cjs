const fs = require('fs');

const dotenvLines = fs.readFileSync('.env', 'utf8').split('\n');
const SERVICE_LINE = dotenvLines.find(l => l.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY='));
const SERVICE = SERVICE_LINE ? SERVICE_LINE.split('=')[1].trim() : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const URL_LINE = dotenvLines.find(l => /^VITE_SUPABASE_URL=/.test(l));
const URL = URL_LINE ? URL_LINE.split('=')[1].trim() : 'http://103.127.135.216:8000';

async function checkData() {
    // Check if bank_id matches banks.id
    const sql = `
        SELECT 
            bp.id as product_id,
            bp.name as product_name,
            bp.bank_id,
            b.id as bank_table_id,
            b.name as bank_name,
            b.logo_url
        FROM bank_products bp
        LEFT JOIN banks b ON bp.bank_id = b.id;
    `;

    const resp = await fetch(`${URL}/pg/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SERVICE, 'Authorization': 'Bearer ' + SERVICE },
        body: JSON.stringify({ query: sql }),
    });

    const d = await resp.json();
    console.log(JSON.stringify(d, null, 2));
}

checkData().catch(console.error);
