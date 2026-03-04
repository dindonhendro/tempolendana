const fs = require('fs');

const dotenvLines = fs.readFileSync('.env', 'utf8').split('\n');
const SERVICE_LINE = dotenvLines.find(l => l.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY='));
const SERVICE = SERVICE_LINE ? SERVICE_LINE.split('=')[1].trim() : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const URL_LINE = dotenvLines.find(l => /^VITE_SUPABASE_URL=/.test(l));
const URL = URL_LINE ? URL_LINE.split('=')[1].trim() : 'http://103.127.135.216:8000';

const sql = `
-- 1. Disable RLS temporarily to confirm data is visible without restrictions
ALTER TABLE public.user_consent_logs DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies to clear any conflicts
DROP POLICY IF EXISTS "Users can read own consent" ON public.user_consent_logs;
DROP POLICY IF EXISTS "Admin can read all consent logs" ON public.user_consent_logs;
DROP POLICY IF EXISTS "Anyone can insert consent" ON public.user_consent_logs;
DROP POLICY IF EXISTS "Public can read consent logs" ON public.user_consent_logs;

-- 3. Create a very simple "Permissive" policy for testing
CREATE POLICY "Public Read Access" ON public.user_consent_logs FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON public.user_consent_logs FOR INSERT WITH CHECK (true);

-- 4. Re-enable RLS
ALTER TABLE public.user_consent_logs ENABLE ROW LEVEL SECURITY;

-- 5. Final check on permissions
GRANT ALL ON public.user_consent_logs TO authenticated, anon, service_role;

NOTIFY pgrst, 'reload schema';
`;

async function fixRlsBruteForce() {
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
        console.log('RLS brute-force fix applied. RLS is now permissive for testing.');
    }
}

fixRlsBruteForce().catch(console.error);
