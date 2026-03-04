const fs = require('fs');

const dotenvLines = fs.readFileSync('.env', 'utf8').split('\n');
const SERVICE_LINE = dotenvLines.find(l => l.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY='));
const SERVICE = SERVICE_LINE ? SERVICE_LINE.split('=')[1].trim() : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const URL_LINE = dotenvLines.find(l => /^VITE_SUPABASE_URL=/.test(l));
const URL = URL_LINE ? URL_LINE.split('=')[1].trim() : 'http://103.127.135.216:8000';

async function fixBanksRLS() {
    if (!SERVICE) { console.error("No service key found"); return; }

    // Explicitly grant select on public schema to public role (which anon/authenticated inherit)
    const sql = `
        -- Ensure roles have usage on schema
        GRANT USAGE ON SCHEMA public TO anon;
        GRANT USAGE ON SCHEMA public TO authenticated;

        -- Ensure roles have select on banks
        GRANT SELECT ON public.banks TO anon;
        GRANT SELECT ON public.banks TO authenticated;

        -- Fix RLS: Drop any existing policy and part and replace with a universal select one
        DROP POLICY IF EXISTS "Banks are viewable by everyone" ON public.banks;
        CREATE POLICY "Banks are viewable by everyone" ON public.banks FOR SELECT USING (true);

        -- Ensure RLS is actually ON
        ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;

        -- Force schema reload to pick up new fk/relationships
        NOTIFY pgrst, 'reload schema';
    `;

    const resp = await fetch(`${URL}/pg/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SERVICE, 'Authorization': 'Bearer ' + SERVICE },
        body: JSON.stringify({ query: sql }),
    });

    if (!resp.ok) {
        console.error("Fix failed:", await resp.text());
        return;
    }

    console.log("Banks RLS and Permissions fixed and cache reloaded.");
}

fixBanksRLS().catch(console.error);
