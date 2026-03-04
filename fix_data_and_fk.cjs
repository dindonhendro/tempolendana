const fs = require('fs');

const dotenvLines = fs.readFileSync('.env', 'utf8').split('\n');
const SERVICE_LINE = dotenvLines.find(l => l.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY='));
const SERVICE = SERVICE_LINE ? SERVICE_LINE.split('=')[1].trim() : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const URL_LINE = dotenvLines.find(l => /^VITE_SUPABASE_URL=/.test(l));
const URL = URL_LINE ? URL_LINE.split('=')[1].trim() : 'http://103.127.135.216:8000';

const sql = `
-- 1. Update records with invalid user_id to NULL so FK can be created
UPDATE public.user_consent_logs 
SET user_id = NULL 
WHERE user_id NOT IN (SELECT id FROM public.users);

-- 2. Add the constraint
ALTER TABLE public.user_consent_logs
ADD CONSTRAINT user_consent_logs_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(id)
ON DELETE SET NULL;

-- 3. Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';
`;

async function fixDataAndAddFK() {
    if (!SERVICE) { console.error("No service key found"); return; }
    const resp = await fetch(`${URL}/pg/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SERVICE, 'Authorization': 'Bearer ' + SERVICE },
        body: JSON.stringify({ query: sql }),
    });

    if (!resp.ok) {
        const t = await resp.text();
        console.log('Error:', t);
    } else {
        console.log('Orphaned records cleaned and Foreign Key added successfully.');
    }
}

fixDataAndAddFK().catch(console.error);
