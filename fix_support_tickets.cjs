const fs = require('fs');
const dotenvLines = fs.readFileSync('.env', 'utf8').split('\n');
const SERVICE_LINE = dotenvLines.find(l => l.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY='));
const SERVICE = SERVICE_LINE ? SERVICE_LINE.split('=')[1].trim() : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const URL_LINE = dotenvLines.find(l => /^VITE_SUPABASE_URL=/.test(l));
const URL = URL_LINE ? URL_LINE.split('=')[1].trim() : 'http://103.127.135.216:8000';

const sql = `
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='support_tickets' AND column_name='email') THEN
        ALTER TABLE public.support_tickets ADD COLUMN email text NOT NULL DEFAULT '';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='support_tickets' AND column_name='application_id') THEN
        ALTER TABLE public.support_tickets ADD COLUMN application_id uuid;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='support_tickets' AND column_name='updated_at') THEN
        ALTER TABLE public.support_tickets ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
END
$$;
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
        console.log('Error adding column:', t);
    } else {
        console.log('Columns email, application_id, updated_at added successfully. Status:', resp.status);
    }
}

executeSql().catch(console.error);
