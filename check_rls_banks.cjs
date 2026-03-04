const fs = require('fs');

const dotenvLines = fs.readFileSync('.env', 'utf8').split('\n');
const SERVICE_LINE = dotenvLines.find(l => l.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY='));
const SERVICE = SERVICE_LINE ? SERVICE_LINE.split('=')[1].trim() : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const URL_LINE = dotenvLines.find(l => /^VITE_SUPABASE_URL=/.test(l));
const URL = URL_LINE ? URL_LINE.split('=')[1].trim() : 'http://103.127.135.216:8000';

async function checkRLS() {
    const sql = `
        SELECT tablename, rowsecurity 
        FROM pg_tables 
        WHERE tablename IN ('banks', 'bank_products') AND schemaname = 'public';

        SELECT 
            policyname, 
            tablename, 
            cmd, 
            qual, 
            with_check 
        FROM pg_policies 
        WHERE tablename IN ('banks', 'bank_products');
    `;

    const resp = await fetch(`${URL}/pg/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SERVICE, 'Authorization': 'Bearer ' + SERVICE },
        body: JSON.stringify({ query: sql }),
    });

    const d = await resp.json();
    console.log(JSON.stringify(d, null, 2));
}

checkRLS().catch(console.error);
