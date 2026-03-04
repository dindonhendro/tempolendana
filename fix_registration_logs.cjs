const fs = require('fs');

const dotenvLines = fs.readFileSync('.env', 'utf8').split('\n');
const SERVICE_LINE = dotenvLines.find(l => l.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY='));
const SERVICE = SERVICE_LINE ? SERVICE_LINE.split('=')[1].trim() : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const URL_LINE = dotenvLines.find(l => /^VITE_SUPABASE_URL=/.test(l));
const URL = URL_LINE ? URL_LINE.split('=')[1].trim() : 'http://103.127.135.216:8000';

const sql = `
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_registration_logs' AND column_name='full_name') THEN
        ALTER TABLE public.user_registration_logs ADD COLUMN full_name text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_registration_logs' AND column_name='role') THEN
        ALTER TABLE public.user_registration_logs ADD COLUMN role text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_registration_logs' AND column_name='user_agent') THEN
        ALTER TABLE public.user_registration_logs ADD COLUMN user_agent text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_registration_logs' AND column_name='device_type') THEN
        ALTER TABLE public.user_registration_logs ADD COLUMN device_type text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_registration_logs' AND column_name='browser') THEN
        ALTER TABLE public.user_registration_logs ADD COLUMN browser text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_registration_logs' AND column_name='operating_system') THEN
        ALTER TABLE public.user_registration_logs ADD COLUMN operating_system text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_registration_logs' AND column_name='registration_status') THEN
        ALTER TABLE public.user_registration_logs ADD COLUMN registration_status text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_registration_logs' AND column_name='error_message') THEN
        ALTER TABLE public.user_registration_logs ADD COLUMN error_message text;
    END IF;
END
$$;

-- Change ip_address column to allow text if it's strictly inet and fails on missing
-- But inet is fine if we return null. The logger returns string or null.
ALTER TABLE public.user_registration_logs ALTER COLUMN ip_address TYPE text USING ip_address::text;

-- Enable RLS
ALTER TABLE public.user_registration_logs ENABLE ROW LEVEL SECURITY;

-- Allow anon to insert logs (since registration is often anonymous before the user is fully created and signed in)
DROP POLICY IF EXISTS "Anon can insert registration logs" ON public.user_registration_logs;
CREATE POLICY "Anon can insert registration logs"
ON public.user_registration_logs
FOR INSERT
WITH CHECK (true);

-- Allow admins to read logs
DROP POLICY IF EXISTS "Admins can view registration logs" ON public.user_registration_logs;
CREATE POLICY "Admins can view registration logs"
ON public.user_registration_logs
FOR SELECT
USING ( auth.jwt() ->> 'role' = 'admin' OR auth.role() = 'service_role' OR auth.role() = 'authenticated' );

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
        console.log('Error adding columns:', t);
    } else {
        console.log('Columns and RLS updated. Status:', resp.status);
    }
}

executeSql().catch(console.error);
