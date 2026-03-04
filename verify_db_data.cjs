const fs = require('fs');

const dotenvLines = fs.readFileSync('.env', 'utf8').split('\n');
const SERVICE_LINE = dotenvLines.find(l => l.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY='));
const SERVICE = SERVICE_LINE ? SERVICE_LINE.split('=')[1].trim() : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const URL_LINE = dotenvLines.find(l => /^VITE_SUPABASE_URL=/.test(l));
const URL = URL_LINE ? URL_LINE.split('=')[1].trim() : 'http://103.127.135.216:8000';

const sql = `
-- 1. Create a log explicitly to verify the table works via PG query
INSERT INTO public.user_consent_logs (
    user_id, 
    document_type, 
    document_version, 
    consent_given, 
    consent_at, 
    ip_address, 
    user_agent, 
    source
) VALUES (
    'a2c03408-a80a-4112-8564-54111e671e98', -- admin1
    'privacy_policy', 
    '1.0', 
    true, 
    NOW(), 
    '127.0.0.1', 
    'DB-Direct-Insert', 
    'web'
);

-- 2. List everything and count
SELECT count(*) FROM public.user_consent_logs;
`;

async function verifyTableData() {
    if (!SERVICE) { console.error("No service key found"); return; }
    const resp = await fetch(`${URL}/pg/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SERVICE, 'Authorization': 'Bearer ' + SERVICE },
        body: JSON.stringify({ query: sql }),
    });

    const data = await resp.json();
    console.log("DB Content Check:", JSON.stringify(data, null, 2));
}

verifyTableData().catch(console.error);
