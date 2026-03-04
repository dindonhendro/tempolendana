const fs = require('fs');

const dotenvLines = fs.readFileSync('.env', 'utf8').split('\n');
const SERVICE_LINE = dotenvLines.find(l => l.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY='));
const SERVICE = SERVICE_LINE ? SERVICE_LINE.split('=')[1].trim() : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const URL_LINE = dotenvLines.find(l => /^VITE_SUPABASE_URL=/.test(l));
const URL = URL_LINE ? URL_LINE.split('=')[1].trim() : 'http://103.127.135.216:8000';
const ANON_LINE = dotenvLines.find(l => /^VITE_SUPABASE_ANON_KEY=/.test(l));
const ANON = ANON_LINE ? ANON_LINE.split('=')[1].trim() : '';

const ADMIN_ID = 'a2c03408-a80a-4112-8564-54111e671e98'; // admin1@lendana.id

async function testSelectAsAdmin() {
    if (!SERVICE) { console.error("No service key found"); return; }

    // We want to simulate a request from an authenticated admin1
    // We can't easily get a JWT here without signing in, but we can check if RLS works by using a query that joins with users

    const sql = `
    SET ROLE authenticated;
    SET request.jwt.claims = '{"sub": "${ADMIN_ID}", "role": "authenticated"}';
    SELECT * FROM public.user_consent_logs;
    `;

    const resp = await fetch(`${URL}/pg/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SERVICE, 'Authorization': 'Bearer ' + SERVICE },
        body: JSON.stringify({ query: sql }),
    });

    const data = await resp.json();
    console.log("Select as Admin Results:", data);
}

testSelectAsAdmin().catch(console.error);
