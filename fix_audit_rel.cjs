const fs = require('fs');

const dotenvLines = fs.readFileSync('.env', 'utf8').split('\n');
const SERVICE_LINE = dotenvLines.find(l => l.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY='));
const SERVICE = SERVICE_LINE ? SERVICE_LINE.split('=')[1].trim() : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const URL_LINE = dotenvLines.find(l => /^VITE_SUPABASE_URL=/.test(l));
const URL = URL_LINE ? URL_LINE.split('=')[1].trim() : 'http://103.127.135.216:8000';

const sql = `
-- 1. Ensure foreign key exists for audit_logs
-- First, drop if exists to avoid duplication
ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_changed_by_fkey;

-- 2. Add explicit foreign key to public.users (not auth.users) for Supabase client joins
ALTER TABLE public.audit_logs 
ADD CONSTRAINT audit_logs_changed_by_fkey 
FOREIGN KEY (changed_by) REFERENCES public.users(id) 
ON DELETE SET NULL;

-- 3. Reload schema cache
NOTIFY pgrst, 'reload schema';
`;

async function fixAuditRelationship() {
    if (!SERVICE) { console.error("No service key found"); return; }
    const resp = await fetch(`${URL}/pg/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SERVICE, 'Authorization': 'Bearer ' + SERVICE },
        body: JSON.stringify({ query: sql }),
    });

    if (!resp.ok) {
        const t = await resp.text();
        console.log('Error fixing audit rel:', t);
    } else {
        console.log('Audit relationship (Foreign Key) fixed and cache reloaded.');
    }
}

fixAuditRelationship().catch(console.error);
