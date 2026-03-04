const fs = require('fs');

const dotenvLines = fs.readFileSync('.env', 'utf8').split('\n');
const SERVICE_LINE = dotenvLines.find(l => l.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY='));
const SERVICE = SERVICE_LINE ? SERVICE_LINE.split('=')[1].trim() : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const URL_LINE = dotenvLines.find(l => /^VITE_SUPABASE_URL=/.test(l));
const URL = URL_LINE ? URL_LINE.split('=')[1].trim() : 'http://103.127.135.216:8000';

const sqlCheck = `
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' AND table_name = 'v_registration_logs_summary';
`;

async function checkView() {
    if (!SERVICE) { console.error("No service key found"); return; }
    const resp = await fetch(`${URL}/pg/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SERVICE, 'Authorization': 'Bearer ' + SERVICE },
        body: JSON.stringify({ query: sqlCheck }),
    });
    const data = await resp.json();
    console.log("View check:", data);

    // Let's create it if it doesn't exist
    if (!data.length || data.error) {
        const sqlCreateView = `
        CREATE OR REPLACE VIEW public.v_registration_logs_summary AS
        SELECT 
            DATE(created_at) as registration_date,
            role,
            registration_status,
            COUNT(*) as total_registrations
        FROM public.user_registration_logs
        GROUP BY DATE(created_at), role, registration_status;

        -- Grant access
        GRANT SELECT ON public.v_registration_logs_summary TO authenticated, service_role, anon;
        NOTIFY pgrst, 'reload schema';
        `;
        const resp2 = await fetch(`${URL}/pg/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': SERVICE, 'Authorization': 'Bearer ' + SERVICE },
            body: JSON.stringify({ query: sqlCreateView }),
        });
        console.log("Create view status:", resp2.status);
    }
}
checkView();
