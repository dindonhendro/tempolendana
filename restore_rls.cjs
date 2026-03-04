const fs = require('fs');

const dotenvLines = fs.readFileSync('.env', 'utf8').split('\n');
const SERVICE_LINE = dotenvLines.find(l => l.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY='));
const SERVICE = SERVICE_LINE ? SERVICE_LINE.split('=')[1].trim() : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const URL_LINE = dotenvLines.find(l => /^VITE_SUPABASE_URL=/.test(l));
const URL = URL_LINE ? URL_LINE.split('=')[1].trim() : 'http://103.127.135.216:8000';

const sql = `
-- Remove test permissive policies
DROP POLICY IF EXISTS "Public Read Access" ON public.user_consent_logs;
DROP POLICY IF EXISTS "Public Insert Access" ON public.user_consent_logs;

-- Re-implement proper OJK Secure RLS
-- 1. Anyone can INSERT (needed for sign-up)
CREATE POLICY "Anyone can insert consent"
ON public.user_consent_logs
FOR INSERT
WITH CHECK (true);

-- 2. SELECT: Owner OR Admin
CREATE POLICY "Select policy for owner and admin"
ON public.user_consent_logs
FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
);

GRANT ALL ON public.user_consent_logs TO authenticated, anon, service_role;

NOTIFY pgrst, 'reload schema';
`;

async function restoreRls() {
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
        console.log('RLS restored with proper owner/admin logic.');
    }
}

restoreRls().catch(console.error);
