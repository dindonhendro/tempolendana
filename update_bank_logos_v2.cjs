const fs = require('fs');

const dotenvLines = fs.readFileSync('.env', 'utf8').split('\n');
const SERVICE_LINE = dotenvLines.find(l => l.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY='));
const SERVICE = SERVICE_LINE ? SERVICE_LINE.split('=')[1].trim() : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const URL_LINE = dotenvLines.find(l => /^VITE_SUPABASE_URL=/.test(l));
const URL = URL_LINE ? URL_LINE.split('=')[1].trim() : 'http://103.127.135.216:8000';

const bniLogo = "https://upload.wikimedia.org/wikipedia/id/thumb/5/55/BNI_logo.svg/1200px-BNI_logo.svg.png";
const nanoLogo = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/NanoBanksyariah-Logo.png/1629px-NanoBanksyariah-Logo.png";

async function updateBankLogos() {
    const sql = `
        UPDATE banks SET logo_url = '${bniLogo}' WHERE name ILIKE '%BNI%' OR name ILIKE '%Negara Indonesia%';
        UPDATE banks SET logo_url = '${nanoLogo}', name = 'Nanobank Syariah' WHERE name ILIKE '%Nano%';
    `;

    const resp = await fetch(`${URL}/pg/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SERVICE, 'Authorization': 'Bearer ' + SERVICE },
        body: JSON.stringify({ query: sql }),
    });

    if (!resp.ok) {
        console.error(await resp.text());
    } else {
        console.log("Bank logos and names updated with official high-quality assets.");
    }
}

updateBankLogos().catch(console.error);
