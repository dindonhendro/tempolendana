const fs = require('fs');

const dotenvLines = fs.readFileSync('.env', 'utf8').split('\n');
const SERVICE_LINE = dotenvLines.find(l => l.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY='));
const SERVICE = SERVICE_LINE ? SERVICE_LINE.split('=')[1].trim() : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const URL_LINE = dotenvLines.find(l => /^VITE_SUPABASE_URL=/.test(l));
const URL = URL_LINE ? URL_LINE.split('=')[1].trim() : 'http://103.127.135.216:8000';

const sql = `
-- 1. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID,
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id),
    client_ip TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create generic audit trigger function
CREATE OR REPLACE FUNCTION public.process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Try to get current user ID from Supabase auth settings
    current_user_id := (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid;

    IF (TG_OP = 'DELETE') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), current_user_id);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), current_user_id);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), current_user_id);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Apply triggers to sensitive tables
-- Loan Applications
DROP TRIGGER IF EXISTS audit_loan_applications ON public.loan_applications;
CREATE TRIGGER audit_loan_applications
AFTER INSERT OR UPDATE OR DELETE ON public.loan_applications
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

-- Banks
DROP TRIGGER IF EXISTS audit_banks ON public.banks;
CREATE TRIGGER audit_banks
AFTER INSERT OR UPDATE OR DELETE ON public.banks
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

-- Bank Products
DROP TRIGGER IF EXISTS audit_bank_products ON public.bank_products;
CREATE TRIGGER audit_bank_products
AFTER INSERT OR UPDATE OR DELETE ON public.bank_products
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

-- Users Table
DROP TRIGGER IF EXISTS audit_users ON public.users;
CREATE TRIGGER audit_users
AFTER INSERT OR UPDATE OR DELETE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

-- 4. Enable RLS and set policies
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 5. Permissions
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

NOTIFY pgrst, 'reload schema';
`;

async function setupAuditTrail() {
    if (!SERVICE) { console.error("No service key found"); return; }
    const resp = await fetch(`${URL}/pg/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SERVICE, 'Authorization': 'Bearer ' + SERVICE },
        body: JSON.stringify({ query: sql }),
    });

    if (!resp.ok) {
        const t = await resp.text();
        console.log('Error setting up audit trail:', t);
    } else {
        console.log('Audit Trail system (Database Triggers) implemented successfully.');
    }
}

setupAuditTrail().catch(console.error);
