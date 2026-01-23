-- ----------------------------------------------------------------------------
-- GLOBAL SYSTEM AUDIT TRAIL (OJK Compliance)
-- ----------------------------------------------------------------------------
-- Version: 1.0.0
-- Description: Unified logging for all critical system activities.
-- Features: Immutable (Insert-only), SHA-256 Hashing, User context tracking.

-- 1. Create Global Audit Table
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    actor_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL, -- INSERT, UPDATE, DELETE, LOGIN, DOWNLOAD, etc.
    table_name TEXT,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    client_info JSONB, -- IP, User-Agent, Device info
    severity TEXT DEFAULT 'INFO', -- INFO, WARN, CRITICAL
    log_hash TEXT, -- SHA-256 integrity hash
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Prevent Tampering (Immutability)
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Audit logs are append-only" ON public.system_audit_logs;
CREATE POLICY "Audit logs are append-only" ON public.system_audit_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'validator'))
    );

DROP POLICY IF EXISTS "System can insert logs" ON public.system_audit_logs;
CREATE POLICY "System can insert logs" ON public.system_audit_logs
    FOR INSERT WITH CHECK (true);

-- Prevent Updates or Deletes on Audit Logs
CREATE OR REPLACE FUNCTION public.prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit trail records are immutable and cannot be modified or deleted.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_audit_modification
BEFORE UPDATE OR DELETE ON public.system_audit_logs
FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_modification();

-- 3. Integrity Hashing Function
CREATE OR REPLACE FUNCTION public.compute_audit_log_hash()
RETURNS TRIGGER AS $$
BEGIN
    NEW.log_hash := encode(digest(
        concat(
            NEW.id, 
            NEW.event_timestamp, 
            NEW.actor_id, 
            NEW.action_type, 
            NEW.table_name, 
            NEW.old_data::text, 
            NEW.new_data::text
        ), 'sha256'
    ), 'hex');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_compute_audit_log_hash
BEFORE INSERT ON public.system_audit_logs
FOR EACH ROW EXECUTE FUNCTION public.compute_audit_log_hash();

-- 4. Generic Trigger Function for All Tables
CREATE OR REPLACE FUNCTION public.global_track_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_actor_id UUID;
    v_action TEXT;
    v_old JSONB := NULL;
    v_new JSONB := NULL;
BEGIN
    -- Get User ID from Supabase Auth context
    v_actor_id := auth.uid();
    v_action := TG_OP;

    IF (TG_OP = 'UPDATE') THEN
        v_old := to_jsonb(OLD);
        v_new := to_jsonb(NEW);
    ELSIF (TG_OP = 'DELETE') THEN
        v_old := to_jsonb(OLD);
    ELSIF (TG_OP = 'INSERT') THEN
        v_new := to_jsonb(NEW);
    END IF;

    INSERT INTO public.system_audit_logs (
        actor_id,
        action_type,
        table_name,
        record_id,
        old_data,
        new_data,
        severity
    ) VALUES (
        v_actor_id,
        v_action,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        v_old,
        v_new,
        CASE WHEN v_action = 'DELETE' THEN 'WARN' ELSE 'INFO' END
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Apply to Critical Tables
-- Apply to Users
DROP TRIGGER IF EXISTS trg_audit_users ON public.users;
CREATE TRIGGER trg_audit_users
AFTER INSERT OR UPDATE OR DELETE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.global_track_changes();

-- Apply to Loan Applications
DROP TRIGGER IF EXISTS trg_audit_loan_applications ON public.loan_applications;
CREATE TRIGGER trg_audit_loan_applications
AFTER INSERT OR UPDATE OR DELETE ON public.loan_applications
FOR EACH ROW EXECUTE FUNCTION public.global_track_changes();

-- Apply to Support Tickets
DROP TRIGGER IF EXISTS trg_audit_support_tickets ON public.support_tickets;
CREATE TRIGGER trg_audit_support_tickets
AFTER INSERT OR UPDATE OR DELETE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.global_track_changes();

COMMENT ON TABLE public.system_audit_logs IS 'Global immutable audit trail for OJK compliance requirements';
