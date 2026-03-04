const fs = require('fs');
const dotenv = fs.readFileSync('.env', 'utf8').split('\n').find(l => l.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY='));
const SERVICE = dotenv ? dotenv.split('=')[1].trim() : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const URL = 'http://103.127.135.216:8000';

const sql = `
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='loan_applications' AND column_name='bank_approved_at') THEN
        ALTER TABLE public.loan_applications ADD COLUMN bank_approved_at timestamptz;
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
        console.log('Column bank_approved_at added successfully. Status:', resp.status);
    }
}

executeSql().catch(console.error);
