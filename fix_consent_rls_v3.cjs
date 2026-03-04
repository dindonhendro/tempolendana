const fs = require('fs');

const dotenvLines = fs.readFileSync('.env', 'utf8').split('\n');
const SERVICE_LINE = dotenvLines.find(l => l.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY='));
const SERVICE = SERVICE_LINE ? SERVICE_LINE.split('=')[1].trim() : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const URL_LINE = dotenvLines.find(l => /^VITE_SUPABASE_URL=/.test(l));
const URL = URL_LINE ? URL_LINE.split('=')[1].trim() : 'http://103.127.135.216:8000';

const sql = `
-- Drop existing select policy
DROP POLICY IF EXISTS "Users can read own consent" ON public.user_consent_logs;
DROP POLICY IF EXISTS "Admin can read all consent logs" ON public.user_consent_logs;

-- Simplified policy that only checks the 'users' table which we confirmed has the 'role' column
CREATE POLICY "Admin can read all consent logs"
ON public.user_consent_logs
FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
);

-- Ensure authenticated and anon can insert
DROP POLICY IF EXISTS "Anyone can insert consent" ON public.user_consent_logs;
CREATE POLICY "Anyone can insert consent"
ON public.user_consent_logs
FOR INSERT
WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.user_consent_logs TO authenticated, anon, service_role;

NOTIFY pgrst, 'reload schema';
`;

async function executeSql() {
    if (!SERVICE) { console.error("No service key found"); return; }
    const resp = await fetch(`${URL}/pg/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SERVICE, 'Authorization': 'Bearer ' + SERVICE },
        body: JSON.stringify({ query: sql }),
    });

    if (!resp.ok) {
        const t = await resp.text();
        console.log('Error updating RLS:', t);
    } else {
        console.log('RLS updated successfully (v3). Status:', resp.status);
    }
}

executeSql().catch(console.error);
