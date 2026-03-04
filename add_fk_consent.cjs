const fs = require('fs');

const dotenvLines = fs.readFileSync('.env', 'utf8').split('\n');
const SERVICE_LINE = dotenvLines.find(l => l.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY='));
const SERVICE = SERVICE_LINE ? SERVICE_LINE.split('=')[1].trim() : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const URL_LINE = dotenvLines.find(l => /^VITE_SUPABASE_URL=/.test(l));
const URL = URL_LINE ? URL_LINE.split('=')[1].trim() : 'http://103.127.135.216:8000';

const sql = `
-- Add foreign key constraint to user_consent_logs
-- First, ensure there are no orphaned records (pointing to IDs that don't exist in public.users)
-- We'll set those to NULL or handle them. Since it's a log, we might want to keep them.
-- But for a hard FK, they must exist.

-- Add the constraint
ALTER TABLE public.user_consent_logs
ADD CONSTRAINT user_consent_logs_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(id)
ON DELETE SET NULL;

-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';
`;

async function addFK() {
    if (!SERVICE) { console.error("No service key found"); return; }
    const resp = await fetch(`${URL}/pg/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SERVICE, 'Authorization': 'Bearer ' + SERVICE },
        body: JSON.stringify({ query: sql }),
    });

    if (!resp.ok) {
        const t = await resp.text();
        console.log('Error adding FK:', t);
    } else {
        console.log('Foreign Key added successfully and Schema Cache refreshed.');
    }
}

addFK().catch(console.error);
