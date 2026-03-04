const fs = require('fs');

const dotenvLines = fs.readFileSync('.env', 'utf8').split('\n');
const SERVICE_LINE = dotenvLines.find(l => l.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY='));
const SERVICE = SERVICE_LINE ? SERVICE_LINE.split('=')[1].trim() : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const URL_LINE = dotenvLines.find(l => /^VITE_SUPABASE_URL=/.test(l));
const URL = URL_LINE ? URL_LINE.split('=')[1].trim() : 'http://103.127.135.216:8000';

const sqlCreate = `
CREATE TABLE IF NOT EXISTS public.user_consent_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid, -- Assuming user UUID, but won't strictly enforce if anonymous is allowed
    document_type text NOT NULL,
    document_version text,
    consent_given boolean NOT NULL,
    consent_at timestamptz DEFAULT now(),
    ip_address text,
    user_agent text,
    source text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_consent_logs ENABLE ROW LEVEL SECURITY;

-- Allow user to insert their own consent, or anon for public
DROP POLICY IF EXISTS "Anon can insert consent logs" ON public.user_consent_logs;
CREATE POLICY "Anon can insert consent logs"
ON public.user_consent_logs
FOR INSERT
WITH CHECK (true);

-- Allow users to read their own
DROP POLICY IF EXISTS "Users can read own consent" ON public.user_consent_logs;
CREATE POLICY "Users can read own consent"
ON public.user_consent_logs
FOR SELECT
USING (auth.uid() = user_id OR auth.role() = 'admin' OR auth.role() = 'service_role');

-- Create summary view
CREATE OR REPLACE VIEW public.v_consent_logs_summary AS
SELECT 
    DATE(consent_at) as consent_date,
    document_type,
    consent_given,
    COUNT(*) as total_consents
FROM public.user_consent_logs
GROUP BY DATE(consent_at), document_type, consent_given;

GRANT SELECT ON public.v_consent_logs_summary TO authenticated, service_role, anon;

NOTIFY pgrst, 'reload schema';
`;

async function executeSql() {
    if (!SERVICE) { console.error("No service key found"); return; }
    const resp = await fetch(`${URL}/pg/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SERVICE, 'Authorization': 'Bearer ' + SERVICE },
        body: JSON.stringify({ query: sqlCreate }),
    });

    if (!resp.ok) {
        const t = await resp.text();
        console.log('Error creating table and view:', t);
    } else {
        console.log('Tables, Views, and RLS updated. Status:', resp.status);
    }
}

executeSql().catch(console.error);
