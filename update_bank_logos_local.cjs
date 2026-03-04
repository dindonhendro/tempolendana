const fs = require('fs');

const dotenvLines = fs.readFileSync('.env', 'utf8').split('\n');
const SERVICE_LINE = dotenvLines.find(l => l.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY='));
const SERVICE = SERVICE_LINE ? SERVICE_LINE.split('=')[1].trim() : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const URL_LINE = dotenvLines.find(l => /^VITE_SUPABASE_URL=/.test(l));
const URL = URL_LINE ? URL_LINE.split('=')[1].trim() : 'http://103.127.135.216:8000';

const bniLocal = "/images/banks/bni.png";
const nanoLocal = "/images/banks/nanobank.png";

async function updateBankLogosLocal() {
    const sql = `
        UPDATE banks SET logo_url = '${bniLocal}' WHERE name ILIKE '%BNI%' OR name ILIKE '%Negara Indonesia%';
        UPDATE banks SET logo_url = '${nanoLocal}', name = 'Nanobank Syariah' WHERE name ILIKE '%Nano%';
    `;

    const resp = await fetch(`${URL}/pg/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SERVICE, 'Authorization': 'Bearer ' + SERVICE },
        body: JSON.stringify({ query: sql }),
    });

    if (!resp.ok) {
        console.error(await resp.text());
    } else {
        console.log("Bank logos updated to LOCAL paths for stability.");
    }
}

updateBankLogosLocal().catch(console.error);
