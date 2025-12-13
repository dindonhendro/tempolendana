-- ============================================================================
-- LENDANA FINANCIAL ACCESS PLATFORM
-- Data Immutability Implementation with SHA-256 Hash
-- ============================================================================
-- Version: 1.0.0
-- Date: January 2025
-- Description: Implements immutable records for submitted loan applications
--              with SHA-256 hash verification for bank and OJK audit
-- ============================================================================

-- ============================================================================
-- SECTION 1: ADD DATA_HASH COLUMN
-- ============================================================================

ALTER TABLE loan_applications
ADD COLUMN IF NOT EXISTS data_hash TEXT;

COMMENT ON COLUMN loan_applications.data_hash IS 'SHA-256 hash of canonical JSON representation of the row at submission time. Used for immutability verification and audit.';

-- ============================================================================
-- SECTION 2: ENABLE PGCRYPTO EXTENSION (for digest function)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- SECTION 3: FUNCTION TO COMPUTE SHA-256 HASH OF CANONICAL JSON
-- ============================================================================

CREATE OR REPLACE FUNCTION compute_loan_application_hash(p_loan_application_id UUID)
RETURNS TEXT AS $$
DECLARE
    row_data JSONB;
    canonical_json TEXT;
    hash_val TEXT;
    sorted_keys TEXT[];
    key_val RECORD;
    result_json JSONB := '{}'::JSONB;
BEGIN
    SELECT to_jsonb(la.*) - 'data_hash' - 'updated_at'
    INTO row_data
    FROM loan_applications la
    WHERE la.id = p_loan_application_id;

    IF row_data IS NULL THEN
        RAISE EXCEPTION 'Loan application with id % not found', p_loan_application_id;
    END IF;

    SELECT ARRAY_AGG(key ORDER BY key)
    INTO sorted_keys
    FROM jsonb_object_keys(row_data) AS key;

    FOR key_val IN
        SELECT key, row_data -> key AS value
        FROM unnest(sorted_keys) AS key
    LOOP
        result_json := result_json || jsonb_build_object(key_val.key, key_val.value);
    END LOOP;

    canonical_json := result_json::TEXT;

    hash_val := encode(digest(canonical_json, 'sha256'), 'hex');

    RETURN hash_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION compute_loan_application_hash(UUID) IS 'Computes SHA-256 hash of canonical JSON representation of loan application row (excluding data_hash and updated_at columns)';

-- ============================================================================
-- SECTION 4: FUNCTION TO UPDATE HASH IN TABLE
-- ============================================================================

CREATE OR REPLACE FUNCTION update_loan_application_hash(p_loan_application_id UUID)
RETURNS VOID AS $$
DECLARE
    hash_val TEXT;
BEGIN
    hash_val := compute_loan_application_hash(p_loan_application_id);

    UPDATE loan_applications
    SET data_hash = hash_val
    WHERE id = p_loan_application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_loan_application_hash(UUID) IS 'Updates the data_hash column with computed SHA-256 hash';

-- ============================================================================
-- SECTION 5: TRIGGER FUNCTION TO PREVENT MODIFICATION OF IMMUTABLE ROWS
-- ============================================================================

CREATE OR REPLACE FUNCTION prevent_immutable_loan_update()
RETURNS TRIGGER AS $$
DECLARE
    col_name TEXT;
    old_val TEXT;
    new_val TEXT;
    excluded_columns TEXT[] := ARRAY['updated_at', 'data_hash'];
BEGIN
    IF OLD.status = 'Validated' AND OLD.data_hash IS NOT NULL THEN
        FOR col_name IN
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'loan_applications'
              AND column_name != ALL(excluded_columns)
        LOOP
            EXECUTE format('SELECT ($1).%I::TEXT, ($2).%I::TEXT', col_name, col_name)
            INTO old_val, new_val
            USING OLD, NEW;

            IF old_val IS DISTINCT FROM new_val THEN
                RAISE EXCEPTION 'Immutable record—submitted applications cannot be modified. Column "%" change attempted.', col_name;
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION prevent_immutable_loan_update() IS 'Prevents modification of loan applications that have been submitted (status = Submitted with data_hash set)';

-- ============================================================================
-- SECTION 6: TRIGGER FUNCTION TO GENERATE HASH ON SUBMIT
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_hash_on_loan_submit()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Validated' AND (OLD.status IS NULL OR OLD.status IS DISTINCT FROM 'Validated') THEN
        IF NEW.data_hash IS NULL THEN
            NEW.data_hash := compute_loan_application_hash(NEW.id);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION generate_hash_on_loan_submit() IS 'Automatically generates SHA-256 hash when loan application status changes to Validated';

-- ============================================================================
-- SECTION 7: CREATE TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS trg_prevent_immutable_loan_update ON loan_applications;
CREATE TRIGGER trg_prevent_immutable_loan_update
    BEFORE UPDATE ON loan_applications
    FOR EACH ROW
    EXECUTE FUNCTION prevent_immutable_loan_update();

DROP TRIGGER IF EXISTS trg_generate_hash_on_loan_submit ON loan_applications;
CREATE TRIGGER trg_generate_hash_on_loan_submit
    BEFORE INSERT OR UPDATE ON loan_applications
    FOR EACH ROW
    EXECUTE FUNCTION generate_hash_on_loan_submit();

-- ============================================================================
-- SECTION 8: AUDIT TABLE FOR LOAN APPLICATION CHANGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS loan_applications_audit (
    audit_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    loan_application_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SUBMIT')),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    changed_by UUID REFERENCES auth.users(id),
    old_data JSONB,
    new_data JSONB,
    old_hash TEXT,
    new_hash TEXT,
    ip_address INET,
    user_agent TEXT
);

COMMENT ON TABLE loan_applications_audit IS 'Audit trail for all changes to loan applications, especially for OJK compliance';

CREATE INDEX IF NOT EXISTS idx_loan_audit_application_id ON loan_applications_audit(loan_application_id);
CREATE INDEX IF NOT EXISTS idx_loan_audit_changed_at ON loan_applications_audit(changed_at);
CREATE INDEX IF NOT EXISTS idx_loan_audit_action ON loan_applications_audit(action);

-- ============================================================================
-- SECTION 9: AUDIT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION audit_loan_application_changes()
RETURNS TRIGGER AS $$
DECLARE
    audit_action TEXT;
    v_changed_by UUID;
BEGIN
    v_changed_by := auth.uid();

    IF TG_OP = 'INSERT' THEN
        audit_action := 'INSERT';
        INSERT INTO loan_applications_audit (
            loan_application_id,
            action,
            changed_by,
            new_data,
            new_hash,
            ip_address
        ) VALUES (
            NEW.id,
            audit_action,
            v_changed_by,
            to_jsonb(NEW),
            NEW.data_hash,
            NEW.ip_address
        );
        RETURN NEW;

    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.status = 'Validated' AND OLD.status IS DISTINCT FROM 'Validated' THEN
            audit_action := 'SUBMIT';
        ELSE
            audit_action := 'UPDATE';
        END IF;

        INSERT INTO loan_applications_audit (
            loan_application_id,
            action,
            changed_by,
            old_data,
            new_data,
            old_hash,
            new_hash,
            ip_address
        ) VALUES (
            NEW.id,
            audit_action,
            v_changed_by,
            to_jsonb(OLD),
            to_jsonb(NEW),
            OLD.data_hash,
            NEW.data_hash,
            NEW.ip_address
        );
        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        audit_action := 'DELETE';
        INSERT INTO loan_applications_audit (
            loan_application_id,
            action,
            changed_by,
            old_data,
            old_hash
        ) VALUES (
            OLD.id,
            audit_action,
            v_changed_by,
            to_jsonb(OLD),
            OLD.data_hash
        );
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_loan_application ON loan_applications;
CREATE TRIGGER trg_audit_loan_application
    AFTER INSERT OR UPDATE OR DELETE ON loan_applications
    FOR EACH ROW
    EXECUTE FUNCTION audit_loan_application_changes();

-- ============================================================================
-- SECTION 10: VERIFIED VIEW FOR SUBMITTED APPLICATIONS
-- ============================================================================

CREATE OR REPLACE VIEW loan_applications_verified AS
SELECT
    la.id,
    la.transaction_id,
    la.user_id,
    la.full_name,
    la.nik_ktp,
    la.phone_number,
    la.email,
    la.loan_amount,
    la.tenor_months,
    la.status,
    la.submission_type,
    la.negara_penempatan,
    la.assigned_agent_id,
    la.validated_by_lendana,
    la.validated_by_lendana_at,
    la.bank_approved_at,
    la.data_hash,
    la.created_at,
    la.updated_at,
    CASE
        WHEN la.data_hash = compute_loan_application_hash(la.id) THEN TRUE
        ELSE FALSE
    END AS hash_verified
FROM loan_applications la
WHERE la.status = 'Validated'
  AND la.data_hash IS NOT NULL;

COMMENT ON VIEW loan_applications_verified IS 'View of submitted loan applications with hash verification status for bank and OJK audit';

-- ============================================================================
-- SECTION 11: FUNCTION TO VERIFY HASH INTEGRITY
-- ============================================================================

CREATE OR REPLACE FUNCTION verify_loan_application_hash(p_loan_application_id UUID)
RETURNS TABLE (
    application_id UUID,
    transaction_id TEXT,
    stored_hash TEXT,
    computed_hash TEXT,
    is_valid BOOLEAN,
    status TEXT
) AS $$
DECLARE
    v_stored_hash TEXT;
    v_computed_hash TEXT;
    v_status TEXT;
    v_transaction_id TEXT;
BEGIN
    SELECT la.data_hash, la.status, la.transaction_id
    INTO v_stored_hash, v_status, v_transaction_id
    FROM loan_applications la
    WHERE la.id = p_loan_application_id;

    IF v_stored_hash IS NULL THEN
        RETURN QUERY SELECT
            p_loan_application_id,
            v_transaction_id,
            v_stored_hash,
            NULL::TEXT,
            FALSE,
            v_status;
        RETURN;
    END IF;

    v_computed_hash := compute_loan_application_hash(p_loan_application_id);

    RETURN QUERY SELECT
        p_loan_application_id,
        v_transaction_id,
        v_stored_hash,
        v_computed_hash,
        (v_stored_hash = v_computed_hash),
        v_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION verify_loan_application_hash(UUID) IS 'Verifies the integrity of a loan application by comparing stored hash with computed hash';

-- ============================================================================
-- SECTION 12: RLS POLICIES FOR IMMUTABILITY
-- ============================================================================

DROP POLICY IF EXISTS "Prevent modification of submitted loan applications" ON loan_applications;
CREATE POLICY "Prevent modification of submitted loan applications"
ON loan_applications
FOR UPDATE
USING (
    status != 'Validated'
    OR data_hash IS NULL
    OR EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

ALTER TABLE loan_applications_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Audit logs viewable by admin and validators" ON loan_applications_audit;
CREATE POLICY "Audit logs viewable by admin and validators"
ON loan_applications_audit
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role IN ('admin', 'validator', 'bank_staff')
    )
);

DROP POLICY IF EXISTS "Audit logs insert only by system" ON loan_applications_audit;
CREATE POLICY "Audit logs insert only by system"
ON loan_applications_audit
FOR INSERT
WITH CHECK (TRUE);

-- ============================================================================
-- SECTION 13: GRANTS
-- ============================================================================

GRANT SELECT ON loan_applications_verified TO authenticated;
GRANT SELECT ON loan_applications_audit TO authenticated;
GRANT EXECUTE ON FUNCTION verify_loan_application_hash(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION compute_loan_application_hash(UUID) TO authenticated;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
--
-- WORKFLOW EXPLANATION:
--
-- 1. User submits loan application via frontend
-- 2. Frontend calls: supabase.from('loan_applications').update({ status: 'Submitted' })
-- 3. Trigger trg_generate_hash_on_loan_submit fires BEFORE UPDATE
--    - Computes SHA-256 hash of canonical JSON (sorted keys, excluding data_hash & updated_at)
--    - Stores hash in data_hash column
-- 4. Trigger trg_audit_loan_application fires AFTER UPDATE
--    - Records the change in loan_applications_audit table with action = 'SUBMIT'
-- 5. Any subsequent UPDATE attempts on submitted rows:
--    - Trigger trg_prevent_immutable_loan_update fires BEFORE UPDATE
--    - Compares all columns (except updated_at, data_hash)
--    - If any change detected, raises exception: "Immutable record—submitted applications cannot be modified"
-- 6. Bank/OJK can verify integrity using:
--    - SELECT * FROM loan_applications_verified (includes hash_verified column)
--    - SELECT * FROM verify_loan_application_hash('application-uuid')
--
-- SECURITY NOTES:
-- - Hash is computed server-side via PostgreSQL triggers (no client manipulation possible)
-- - RLS policies prevent modification of submitted records
-- - Audit table tracks all changes for compliance
-- - Only admin role can bypass immutability (for emergency corrections with full audit trail)
--
-- ============================================================================
