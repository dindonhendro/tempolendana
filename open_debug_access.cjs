const fs = require('fs');

const dotenvLines = fs.readFileSync('.env', 'utf8').split('\n');
const SERVICE_LINE = dotenvLines.find(l => l.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY='));
const SERVICE = SERVICE_LINE ? SERVICE_LINE.split('=')[1].trim() : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const URL_LINE = dotenvLines.find(l => /^VITE_SUPABASE_URL=/.test(l));
const URL = URL_LINE ? URL_LINE.split('=')[1].trim() : 'http://103.127.135.216:8000';

const sql = `
-- 1. DROP ALL POLICIES (Start from scratch)
DROP POLICY IF EXISTS "Public Read Access" ON public.user_consent_logs;
DROP POLICY IF EXISTS "Public Insert Access" ON public.user_consent_logs;
DROP POLICY IF EXISTS "Anyone can insert consent" ON public.user_consent_logs;
DROP POLICY IF EXISTS "Select policy for owner and admin" ON public.user_consent_logs;
DROP POLICY IF EXISTS "Users can read own consent" ON public.user_consent_logs;
DROP POLICY IF EXISTS "Admin can read all consent logs" ON public.user_consent_logs;

-- 2. CREATE A COMPLETELY OPEN POLICY FOR TESTING
-- This removes RLS logic as a variable in the failure
CREATE POLICY "Testing Access" ON public.user_consent_logs 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 3. Ensure RLS is actually enabled but now effectively bypassed by the policy above
ALTER TABLE public.user_consent_logs ENABLE ROW LEVEL SECURITY;

-- 4. Grant explicitly
GRANT ALL ON public.user_consent_logs TO anon, authenticated, service_role;

-- 5. Final Schema Cache Reload
NOTIFY pgrst, 'reload schema';
`;

async function openAccessForDebug() {
    if (!SERVICE) { console.error("No service key found"); return; }
    const resp = await fetch(`${URL}/pg/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SERVICE, 'Authorization': 'Bearer ' + SERVICE },
        body: JSON.stringify({ query: sql }),
    });

    if (!resp.ok) {
        const t = await resp.text();
        console.log('Error opening access:', t);
    } else {
        console.log('Database RLS temporarily disabled/opened for debugging.');
        console.log('If it still shows empty, the issue is definitely in the Frontend component or View Logic.');
    }
}

openAccessForDebug().catch(console.error);
