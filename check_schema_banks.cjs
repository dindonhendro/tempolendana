const fs = require('fs');

const dotenvLines = fs.readFileSync('.env', 'utf8').split('\n');
const SERVICE_LINE = dotenvLines.find(l => l.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY='));
const SERVICE = SERVICE_LINE ? SERVICE_LINE.split('=')[1].trim() : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const URL_LINE = dotenvLines.find(l => /^VITE_SUPABASE_URL=/.test(l));
const URL = URL_LINE ? URL_LINE.split('=')[1].trim() : 'http://103.127.135.216:8000';

async function checkSchema() {
    const sql = `
        SELECT 
            column_name, 
            data_type,
            is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'bank_products';

        SELECT 
            conname AS constraint_name,
            conrelid::regclass AS table_name,
            a.attname AS column_name,
            confrelid::regclass AS foreign_table_name,
            af.attname AS foreign_column_name
        FROM pg_constraint c
        JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
        JOIN pg_attribute af ON af.attrelid = c.confrelid AND af.attnum = ANY(c.confkey)
        WHERE c.contype = 'f' AND c.conrelid = 'bank_products'::regclass;
    `;

    const resp = await fetch(`${URL}/pg/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SERVICE, 'Authorization': 'Bearer ' + SERVICE },
        body: JSON.stringify({ query: sql }),
    });

    const d = await resp.json();
    console.log(JSON.stringify(d, null, 2));
}

checkSchema().catch(console.error);
